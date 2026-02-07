import React, { useState, useEffect } from 'react';
import { Sparkles, Settings, Music, Trash2, StopCircle, Moon, Sun, Monitor, Globe, ChevronDown, ChevronUp, Play, Zap } from 'lucide-react';

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

// --- iPhone 專用：穩健型音樂播放器 ---
const MusicPlayer = ({ keyword, isDark }) => {
  const [isExpanded, setIsExpanded] = useState(false); 

  // 當偵測到新歌時，自動展開提醒使用者
  useEffect(() => {
    if (keyword) {
      setIsExpanded(true);
    }
  }, [keyword]);

  if (!keyword) return null;
  
  // 優化搜尋關鍵字，並強制加上 "video only" 參數避免搜到不可播放的清單
  // sp=EgIQAQ%253D%253D 是 YouTube 的 "Type: Video" 篩選器編碼
  const searchSuffix = keyword.includes("OST") ? " soundtrack" : " audio";
  const searchUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(keyword + searchSuffix)}&sp=EgIQAQ%253D%253D`;

  return (
    <div className="fixed top-24 right-6 z-50 animate-fade-in flex flex-col items-end gap-2"> 
      
      {/* 1. 控制條 (顯示歌名) */}
      <NeuBox isDark={isDark} className="p-3 flex items-center gap-3 pr-4" onClick={() => setIsExpanded(!isExpanded)}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isExpanded ? 'text-purple-500' : 'text-gray-400'}`}>
          {isExpanded ? <Music className="animate-bounce" size={20}/> : <Play size={20}/>}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] opacity-60 font-bold">
             {keyword.includes("OST") ? "影視劇配樂" : "偶像歌曲"}
          </span>
          <span className="text-sm font-black text-purple-500 line-clamp-1 max-w-[120px]">{keyword}</span>
        </div>
        {isExpanded ? <ChevronUp size={16} className="opacity-50"/> : <ChevronDown size={16} className="opacity-50"/>}
      </NeuBox>

      {/* 2. 播放器容器 (移除自動播放，改為手動點擊以確保相容性) */}
      {isExpanded && (
        <div className={`
          overflow-hidden rounded-xl transition-all duration-500 relative
          ${isDark ? 'bg-black border border-gray-800' : 'bg-black border-4 border-white'}
        `}
          style={{ width: '220px', height: '140px' }}
        >
          <iframe 
            width="100%" 
            height="100%" 
            src={searchUrl}
            title="YouTube Music"
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" // 移除 autoplay
            allowFullScreen
          ></iframe>
        </div>
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

  const generateStory = async () => {
    if (!apiKey) return alert("請先設定 API Key！");
    if (!note) return alert("請先貼上筆記內容！");

    setIsLoading(true);
    setGeneratedText("");
    setMusicKeyword("");

    // 針對 Gemini 3 調整的 Prompt
    const promptText = `
      角色：你是「MemoLive」，一位深諳網路飯圈文化、擅長描寫偶像 (K-Pop/C-Pop) 互動與影視劇氛圍的頂級同人小說家。
      你的風格：文字要有畫面感，情感細膩，該甜的時候甜，該虐的時候虐。
      
      任務：
      1. 【音樂偵測 (精準版)】：
         - 閱讀筆記：${note}
         - 若提及特定「偶像/歌手」，請抓出最具代表性的歌名或團名。
         - 若為「影視劇」，請抓出作品名並加上 "OST"。
         - 輸出格式為：[MUSIC: 關鍵字]
      
      2. 【Gemini 3 深度續寫】：
         - 這是最重要的！請發揮 Gemini 3 的強大創作力。
         - 分析使用者的文筆，完美模仿其語氣。
         - 續寫 1500 字以上繁體中文小說，劇情要流暢且吸引人。
      
      3. 【回覆格式】：
         第一行：[MUSIC: 關鍵字]
         第二行：(空行)
         第三行：(小說正文開始)
    `;

    try {
      // ★★★ 核心升級：Gemini 3 Flash Preview ★★★
      // 注意：根據您的截圖，ID 是 models/gemini-3-flash-preview
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            // Gemini 3 支援更強的工具，這裡保持 Google Search
            tools: [{ googleSearch: {} }] 
          })
        }
      );

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error?.message || "連線錯誤");

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const musicMatch = text.match(/^\[MUSIC:\s*(.*?)\]/);
        let content = text;
        if (musicMatch) {
          setMusicKeyword(musicMatch[1]);
          content = text.replace(/^\[MUSIC:\s*.*?\]/, '').trim();
        }
        setGeneratedText(content);
      } else {
        alert("AI 生成內容為空，可能被過濾或失敗，請重試。");
      }
    } catch (error) {
      console.error(error);
      alert(`發生錯誤：${error.message}`);
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
            <span className="px-1 py-0.5 rounded bg-pink-500 text-white text-[10px] flex items-center gap-1">
              <Zap size={10}/> GEMINI 3.0
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

      {/* 音樂播放器 */}
      <MusicPlayer keyword={musicKeyword} isDark={isDark} />

      {!generatedText && (
        <div className="space-y-6 animate-fade-in">
          <NeuBox isDark={isDark} className="p-6 min-h-[400px]" pressed>
            <textarea 
              className={`w-full h-full min-h-[400px] bg-transparent outline-none resize-none text-lg leading-relaxed
                ${isDark ? 'placeholder-gray-600' : 'placeholder-[#8e91af]'}
              `}
              placeholder="貼上你的筆記 (支援萬字輸入)... 讓我們看看 Gemini 3 的實力..."
              value={note} onChange={(e) => setNote(e.target.value)}
            />
          </NeuBox>
          <NeuBox isDark={isDark} onClick={generateStory} className="py-4 flex justify-center gap-2 font-bold text-purple-500 text-lg active:scale-95 transition-transform">
             {isLoading ? (
               <span className="animate-pulse">✨ Gemini 3 正在燃燒運算中...</span>
             ) : (
               <><Zap /> 啟動 Gemini 3 續寫</>
             )}
          </NeuBox>
        </div>
      )}

      {generatedText && (
        <div className="animate-fade-in space-y-6 pb-20">
          <div className="flex justify-between items-end px-2">
            <span className="text-xs font-bold text-purple-500">GEMINI 3 生成內容</span>
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