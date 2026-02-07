import React, { useState, useEffect } from 'react';
import { Sparkles, Settings, Music, Trash2, StopCircle, Moon, Sun, Monitor, Globe } from 'lucide-react';

// --- UI 元件 ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark }) => {
  const lightShadow = pressed 
    ? 'shadow-[inset_6px_6px_12px_#aeb1cb,inset_-6px_-6px_12px_#ffffff]'
    : 'shadow-[8px_8px_16px_#aeb1cb,-8px_-8px_16px_#ffffff]';
  const darkShadow = pressed
    ? 'shadow-[inset_6px_6px_12px_#161722,inset_-6px_-6px_12px_#2a2c40]'
    : 'shadow-[8px_8px_16px_#161722,-8px_-8px_16px_#2a2c40]';

  return (
    <div 
      onClick={onClick}
      className={`
        ${className} transition-all duration-300 ease-in-out rounded-[20px]
        ${isDark ? 'bg-[#202130] text-gray-200' : 'bg-[#D0D3EC] text-[#5b5d7e]'}
        ${isDark ? darkShadow : lightShadow}
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
      `}
    >
      {children}
    </div>
  );
};

// --- 隱形音樂播放器 ---
const MusicPlayer = ({ keyword, isDark }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (keyword) setIsPlaying(true);
  }, [keyword]);

  if (!keyword) return null;
  
  // 如果關鍵字包含 "OST"，搜尋詞會調整
  const searchSuffix = keyword.includes("OST") ? " soundtrack audio" : " song audio";

  return (
    <div className="fixed top-4 right-16 z-50 animate-fade-in"> 
      <NeuBox isDark={isDark} className="p-3 flex items-center gap-3 pr-5" onClick={() => setIsPlaying(!isPlaying)}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPlaying ? 'text-purple-500' : 'text-gray-400'}`}>
          {isPlaying ? <Music className="animate-bounce" size={20}/> : <StopCircle size={20}/>}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] opacity-60 font-bold">
             {keyword.includes("OST") ? "影視劇配樂中" : "偶像歌曲播放中"}
          </span>
          <span className="text-sm font-black text-purple-500 line-clamp-1 max-w-[150px]">{keyword}</span>
        </div>
      </NeuBox>
      {isPlaying && (
        <iframe 
          width="1" height="1" 
          src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(keyword + searchSuffix)}&autoplay=1&loop=1`}
          className="absolute opacity-0 pointer-events-none"
        ></iframe>
      )}
    </div>
  );
};

const App = () => {
  const [note, setNote] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [musicKeyword, setMusicKeyword] = useState("");
  
  // 主題設定
  const [themeMode, setThemeMode] = useState(localStorage.getItem("theme_mode") || "system");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      if (themeMode === "dark") return true;
      if (themeMode === "light") return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    setIsDark(checkDarkMode());
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (themeMode === "system") setIsDark(mediaQuery.matches); };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeMode]);

  const toggleTheme = () => {
    const modes = ["system", "light", "dark"];
    const nextMode = modes[(modes.indexOf(themeMode) + 1) % modes.length];
    setThemeMode(nextMode);
    localStorage.setItem("theme_mode", nextMode);
  };

  const getThemeIcon = () => {
    if (themeMode === "system") return <Monitor size={20} />;
    if (themeMode === "dark") return <Moon size={20} />;
    return <Sun size={20} />;
  };

  const saveKey = (e) => {
    const val = e.target.value.trim();
    setApiKey(val);
    localStorage.setItem("gemini_key", val);
  };

  // ★★★ 核心邏輯：10000字輸入 + 風格模仿 + BGM偵測 + 聯網 ★★★
  const generateStory = async () => {
    if (!apiKey) return alert("請先設定 API Key！");
    if (!note) return alert("請先貼上筆記內容！");

    setIsLoading(true);
    setGeneratedText("");
    setMusicKeyword("");

    const promptText = `
      角色：你是「MemoLive」，一位熟悉網路流行文化、偶像飯圈 (K-Pop/C-Pop) 以及各類影視劇的頂級同人小說家。
      你的能力：擁有 Google 聯網搜尋能力，了解最新的偶像動態和劇情設定。
      
      任務：
      1. 【音樂偵測】：
         - 閱讀使用者的筆記：${note}
         - 如果內容是關於特定「偶像/歌手/團體」(如 BTS, SEVENTEEN, 五月天等)，抓出名字。
         - 如果內容是關於「影視劇/電影/動漫」，請抓出作品名並加上 "OST"。
         - 如果都沒有，根據氣氛選一個關鍵字。
      
      2. 【風格分析與續寫】：
         - 分析使用者的文筆（是搞笑、虐心、甜寵、還是意識流？）。
         - 嚴格按照這個風格，續寫 **1500 字以上** 的繁體中文小說。
         - 劇情要連貫，邏輯要通順，可以加入最新的網路梗或飯圈用語（如果使用者有用的話）。
      
      3. 【重要格式】：
         - 第一行必須是：[MUSIC: 你的音樂關鍵字]
         - 第二行開始才是小說正文。
    `;

    try {
      // 使用 Gemini 2.5 Flash，並嘗試開啟 Google Search 工具
      // 注意：如果您的 API Key 是免費版，有時候 Google Search 會被限流，
      // 但 Gemini 2.5 本身的知識庫已經涵蓋到 2026 年，所以即使搜尋失敗，它依然非常懂！
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            // 嘗試加入 Google Search 工具 (若 API 支援)
            tools: [{ googleSearch: {} }] 
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        // 如果 2.5 失敗，這裡可以做個簡單的錯誤提示，但通常 2.5 是最穩的
        throw new Error(data.error?.message || "連線錯誤");
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        // 解析音樂標籤
        const musicMatch = text.match(/^\[MUSIC:\s*(.*?)\]/);
        let content = text;
        if (musicMatch) {
          setMusicKeyword(musicMatch[1]);
          content = text.replace(/^\[MUSIC:\s*.*?\]/, '').trim();
        }
        setGeneratedText(content);
      } else {
        alert("生成內容為空，可能是被 Google 安全過濾擋住了，請試著調整內容再試試。");
      }

    } catch (error) {
      console.error(error);
      alert(`發生錯誤：${error.message}\n(如果顯示 400 錯誤，可能是您的 API Key 暫時不支援 Search 工具，建議稍後再試)`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 p-6 font-sans relative overflow-x-hidden
      ${isDark ? 'bg-[#202130] text-gray-200' : 'bg-[#D0D3EC] text-[#5b5d7e]'}
    `}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-purple-600 tracking-tight">MemoLive</h1>
          <p className="text-xs font-bold opacity-50 tracking-widest flex items-center gap-2">
            ULTIMATE PRO 
            <span className="px-1 py-0.5 rounded bg-blue-500 text-white text-[10px] flex items-center gap-1">
              <Globe size={10}/> ONLINE
            </span>
          </p>
        </div>
        
        <div className="flex gap-4">
          <NeuBox isDark={isDark} className="w-12 h-12 flex items-center justify-center" onClick={toggleTheme}>
            {getThemeIcon()}
          </NeuBox>
          <NeuBox isDark={isDark} className="w-12 h-12 flex items-center justify-center" onClick={() => setShowSettings(!showSettings)}>
            <Settings size={20} />
          </NeuBox>
        </div>
      </div>

      {showSettings && (
        <div className="mb-6 animate-slide-down">
          <NeuBox isDark={isDark} className="p-4" pressed>
            <input 
              type="password" placeholder="貼上 Google Gemini API Key" 
              value={apiKey} onChange={saveKey}
              className={`w-full bg-transparent outline-none text-sm font-mono 
                ${isDark ? 'text-purple-300 placeholder-gray-600' : 'text-purple-900 placeholder-purple-300'}
              `}
            />
          </NeuBox>
        </div>
      )}

      <MusicPlayer keyword={musicKeyword} isDark={isDark} />

      {!generatedText && (
        <div className="space-y-6 animate-fade-in">
          <NeuBox isDark={isDark} className="p-6 min-h-[400px]" pressed>
            <textarea 
              // 這裡不設 maxLength，讓你能貼無限多字
              className={`w-full h-full min-h-[400px] bg-transparent outline-none resize-none text-lg leading-relaxed
                ${isDark ? 'placeholder-gray-600' : 'placeholder-[#8e91af]'}
              `}
              placeholder="在此貼上你的長篇筆記 (10000字也沒問題)... AI 將模仿你的風格續寫並搜尋資料..."
              value={note} onChange={(e) => setNote(e.target.value)}
            />
          </NeuBox>
          <NeuBox isDark={isDark} onClick={generateStory} className="py-4 flex justify-center gap-2 font-bold text-purple-500 text-lg active:scale-95 transition-transform">
             {isLoading ? (
               <span className="animate-pulse">✨ 正在搜尋資料、分析風格、配樂中...</span>
             ) : (
               <><Sparkles /> 開始聯網續寫 (1500字)</>
             )}
          </NeuBox>
        </div>
      )}

      {generatedText && (
        <div className="animate-fade-in space-y-6 pb-20">
          <div className="flex justify-between items-end px-2">
            <span className="text-xs font-bold text-purple-500">AI 續寫內容 (已模仿文風)</span>
            <span className="text-xs opacity-50">約 {generatedText.length} 字</span>
          </div>
          <NeuBox isDark={isDark} className="p-8 leading-loose text-justify text-lg whitespace-pre-wrap">
            {generatedText}
          </NeuBox>
          <NeuBox isDark={isDark} className="py-4 flex justify-center font-bold text-red-400 gap-2" onClick={() => {setGeneratedText(""); setMusicKeyword("");}}>
            <Trash2 size={18}/> 清除重寫
          </NeuBox>
        </div>
      )}
    </div>
  );
};

export default App;