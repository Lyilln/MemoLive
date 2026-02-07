import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Settings, Music, Trash2, Moon, Sun, Monitor, Zap, Edit3, User, Disc, Play, Pause, Search, Link as LinkIcon } from 'lucide-react';

// --- CSS for Vinyl Spin Animation ---
const vinylStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .vinyl-spin {
    animation: spin 4s linear infinite;
  }
  .vinyl-paused {
    animation-play-state: paused;
  }
`;

// --- UI 元件：具有「開關感」的 NeuBox ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false }) => {
  const lightShadow = pressed || active
    ? 'shadow-[inset_4px_4px_8px_#aeb1cb,inset_-4px_-4px_8px_#ffffff] scale-[0.98]' // 按下時更深、縮小
    : 'shadow-[8px_8px_16px_#aeb1cb,-8px_-8px_16px_#ffffff] hover:scale-[1.01]'; // 浮起
  const darkShadow = pressed || active
    ? 'shadow-[inset_4px_4px_8px_#161722,inset_-4px_-4px_8px_#2a2c40] scale-[0.98]'
    : 'shadow-[8px_8px_16px_#161722,-8px_-8px_16px_#2a2c40] hover:scale-[1.01]';

  const activeColor = isDark ? 'text-purple-400' : 'text-purple-600';
  const normalColor = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div 
      onClick={onClick}
      // transition-all duration-150 讓按鈕反應更快，更有「開關感」
      className={`
        ${className} transition-all duration-150 ease-out rounded-[20px]
        ${isDark ? 'bg-[#202130]' : 'bg-[#D0D3EC]'}
        ${active ? activeColor : normalColor}
        ${isDark ? darkShadow : lightShadow}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {children}
    </div>
  );
};

// ==========================================
// 頁面組件：左側 - 續寫 (原功能，移除舊音樂)
// ==========================================
const PageMemo = ({ isDark, apiKey }) => {
  const [note, setNote] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateStory = async () => {
    if (!apiKey) return alert("請先到「我」的頁面設定 API Key！");
    if (!note) return alert("請先貼上筆記內容！");
    setIsLoading(true);
    const promptText = `角色：頂級同人小說家。任務：續寫以下筆記，模仿其文風，續寫1500字以上繁體中文小說。筆記內容：${note}`;
    try {
      // 核心升級：鎖定 Gemini 2.5 Flash
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "連線錯誤");
      setGeneratedText(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
    } catch (error) {
      alert(`錯誤：${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex items-center gap-2 opacity-60">
         <Edit3 size={18}/> <h2 className="text-lg font-bold">筆記續寫</h2>
       </div>
      {!generatedText ? (
        <>
          <NeuBox isDark={isDark} className="p-6 min-h-[400px]" pressed>
            <textarea 
              className={`w-full h-full min-h-[400px] bg-transparent outline-none resize-none text-lg leading-relaxed ${isDark ? 'placeholder-gray-600' : 'placeholder-[#8e91af]'}`}
              placeholder="貼上你的筆記... AI 將模仿你的風格續寫 (Gemini 2.5)..."
              value={note} onChange={(e) => setNote(e.target.value)}
            />
          </NeuBox>
          <NeuBox isDark={isDark} onClick={generateStory} className="py-4 flex justify-center gap-2 font-bold text-purple-500 text-lg active:scale-95">
             {isLoading ? <span className="animate-pulse">✨ 正在運算中...</span> : <><Zap /> 開始續寫</>}
          </NeuBox>
        </>
      ) : (
        <>
          <NeuBox isDark={isDark} className="p-8 leading-loose text-justify text-lg whitespace-pre-wrap">
            {generatedText}
          </NeuBox>
          <NeuBox isDark={isDark} className="py-4 flex justify-center font-bold text-red-400 gap-2" onClick={() => setGeneratedText("")}>
            <Trash2 size={18}/> 清除重寫
          </NeuBox>
        </>
      )}
    </div>
  );
};

// ==========================================
// 頁面組件：中間 - 萬能生成器 (更聰明)
// ==========================================
const PageGenerator = ({ isDark, apiKey }) => {
  const [genre, setGenre] = useState("現代言情");
  const [tone, setTone] = useState("甜寵輕鬆");
  const [elements, setElements] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateAdvanced = async () => {
    if (!apiKey) return alert("請先設定 API Key！");
    setIsLoading(true);
    // 更複雜的 Prompt
    const promptText = `
      你是一個包羅萬象的萬能小說生成器。請根據以下設定創作一篇小說開頭（約1000字）：
      【類型】：${genre}
      【基調】：${tone}
      【包含元素/關鍵字】：${elements || "自由發揮"}
      【要求】：劇情要有張力，文筆要好，繁體中文。
    `;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        }
      );
      const data = await response.json();
      setGeneratedText(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
    } catch (error) {
      alert(`錯誤：${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = `w-full bg-transparent outline-none p-2 ${isDark ? 'border-b border-gray-700 placeholder-gray-600' : 'border-b border-gray-300 placeholder-gray-400'}`;

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex items-center gap-2 opacity-60">
         <Sparkles size={18}/> <h2 className="text-lg font-bold">萬能小說生成器</h2>
       </div>
      {!generatedText ? (
        <>
          <NeuBox isDark={isDark} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold opacity-50">小說類型</label>
              <select value={genre} onChange={e=>setGenre(e.target.value)} className={inputStyle}>
                <option>現代言情</option><option>古代架空</option><option>懸疑推理</option><option>奇幻冒險</option><option>娛樂圈/飯圈</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold opacity-50">劇情基調</label>
              <select value={tone} onChange={e=>setTone(e.target.value)} className={inputStyle}>
                <option>甜寵輕鬆</option><option>虐心催淚</option><option>搞笑沙雕</option><option>暗黑正劇</option>
              </select>
            </div>
             <div>
              <label className="text-xs font-bold opacity-50">必要元素/關鍵字 (選填)</label>
              <input type="text" placeholder="例如：破鏡重圓、頂流偶像、金絲雀..." value={elements} onChange={e=>setElements(e.target.value)} className={inputStyle} />
            </div>
          </NeuBox>
          <NeuBox isDark={isDark} onClick={generateAdvanced} className="py-4 flex justify-center gap-2 font-bold text-purple-500 text-lg active:scale-95">
             {isLoading ? <span className="animate-pulse">✨ 萬能生成中...</span> : <><Sparkles /> 開始創作</>}
          </NeuBox>
        </>
      ) : (
         <>
          <NeuBox isDark={isDark} className="p-8 leading-loose text-justify text-lg whitespace-pre-wrap">{generatedText}</NeuBox>
          <NeuBox isDark={isDark} className="py-4 flex justify-center font-bold text-red-400 gap-2" onClick={() => setGeneratedText("")}><Trash2 size={18}/> 重置設定</NeuBox>
        </>
      )}
    </div>
  );
};

// ==========================================
// 組件：黑膠唱片機 (視覺 + YouTube 隱藏播放)
// ==========================================
const VinylPlayer = ({ isDark }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicInput, setMusicInput] = useState("");
  const [videoId, setVideoId] = useState(""); // 實際播放的 ID

  const handlePlay = () => {
    if (!musicInput) return alert("請先輸入歌曲關鍵字或 YouTube 連結！");
    
    let id = "";
    // 簡單判斷是網址還是關鍵字
    if (musicInput.includes("youtube.com") || musicInput.includes("youtu.be")) {
       const url = new URL(musicInput);
       id = url.searchParams.get("v") || url.pathname.split("/").pop();
    } else {
       // 如果是關鍵字，用 embed list search 模式
       id = `searchbox?listType=search&list=${encodeURIComponent(musicInput + " audio")}`;
    }

    setVideoId(id);
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setVideoId(""); // 清空 ID 以停止播放
  };

  return (
    <div className="flex flex-col items-center gap-6 my-8">
      <style>{vinylStyle}</style>
      {/* 黑膠本體 */}
      <div className={`relative w-64 h-64 rounded-full flex items-center justify-center shadow-xl overflow-hidden
          ${isDark ? 'bg-gray-900' : 'bg-gray-200'} 
          ${isPlaying ? 'vinyl-spin' : ''} transition-all duration-1000`
      }>
        {/* 唱片紋路 */}
        <div className="absolute inset-0 rounded-full opacity-20" 
             style={{background: 'repeating-radial-gradient(circle, #000, #000 2px, transparent 2px, transparent 4px)'}}></div>
        {/* 中心貼紙 */}
        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 ${isDark ? 'bg-purple-900 border-gray-800' : 'bg-purple-200 border-gray-300'}`}>
           <Disc size={40} className={isDark ? 'text-purple-300' : 'text-purple-600'}/>
        </div>
      </div>

      {/* 控制區 */}
      <div className="w-full max-w-md space-y-4">
         <NeuBox isDark={isDark} className="p-2 flex items-center">
           <Search size={18} className="opacity-50 ml-2"/>
           <input 
             type="text" 
             placeholder="輸入歌曲關鍵字或 YouTube 網址..." 
             value={musicInput} onChange={e=>setMusicInput(e.target.value)}
             className={`w-full bg-transparent outline-none p-2 font-mono text-sm ${isDark ? 'placeholder-gray-600' : 'placeholder-gray-400'}`}
           />
         </NeuBox>
         <div className="flex justify-center gap-4">
            <NeuBox isDark={isDark} onClick={handlePlay} active={isPlaying} className="w-16 h-16 flex items-center justify-center rounded-full">
              <Play size={24} fill="currentColor"/>
            </NeuBox>
            <NeuBox isDark={isDark} onClick={handleStop} className="w-16 h-16 flex items-center justify-center rounded-full text-red-400">
              <Pause size={24} fill="currentColor"/>
            </NeuBox>
         </div>
      </div>
      
      {/* 假的連接按鈕 (裝飾用) */}
      <div className="flex gap-2 opacity-50 text-xs mt-4">
        <span className="flex items-center gap-1"><LinkIcon size={10}/> Apple Music (未連接)</span>
        <span>|</span>
        <span className="flex items-center gap-1"><LinkIcon size={10}/> YouTube Music (未連接)</span>
      </div>

      {/* 隱藏的播放器 (真實聲音來源) */}
      {isPlaying && videoId && (
        <iframe 
          width="1" height="1" 
          src={videoId.startsWith("searchbox") ? `https://www.youtube.com/embed?listType=search&list=${videoId.split("list=")[1]}&autoplay=1` : `https://www.youtube.com/embed/${videoId}?autoplay=1`}
          className="absolute opacity-0 pointer-events-none"
          allow="autoplay"
        ></iframe>
      )}
    </div>
  );
};

// ==========================================
// 頁面組件：右側 - 我 (設定 + 音樂)
// ==========================================
const PageMe = ({ isDark, apiKey, setApiKey, themeMode, toggleTheme, getThemeIcon }) => {
  const [showKeyInput, setShowKeyInput] = useState(false);
  return (
    <div className="space-y-8 animate-fade-in">
       <div className="flex items-center gap-2 opacity-60 mb-4">
         <User size={18}/> <h2 className="text-lg font-bold">我的設定 & 音樂</h2>
       </div>

       {/* 黑膠唱片區 */}
       <NeuBox isDark={isDark} className="p-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
         <h3 className="text-center font-bold mb-4 flex items-center justify-center gap-2"><Music size={18}/> 背景音樂控制台</h3>
         <VinylPlayer isDark={isDark} />
       </NeuBox>

       {/* 設定區 */}
       <div className="space-y-4">
          <h3 className="font-bold opacity-60 ml-2">系統設定</h3>
          <NeuBox isDark={isDark} className="p-4 flex justify-between items-center" onClick={toggleTheme}>
            <span className="font-bold">切換主題 ({themeMode})</span>
            {getThemeIcon()}
          </NeuBox>
          <NeuBox isDark={isDark} className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center" onClick={() => setShowKeyInput(!showKeyInput)}>
               <span className="font-bold flex items-center gap-2"><Settings size={18}/> API Key 設定</span>
               <span className="text-xs opacity-50">{apiKey ? "已設定" : "未設定"}</span>
            </div>
            {showKeyInput && (
               <input 
                 type="password" placeholder="貼上 Google Gemini API Key" 
                 value={apiKey} onChange={(e) => {setApiKey(e.target.value); localStorage.setItem("gemini_key", e.target.value);}}
                 className={`w-full bg-transparent outline-none text-sm font-mono p-2 mt-2 border rounded ${isDark ? 'border-gray-700 placeholder-gray-600' : 'border-gray-300 placeholder-gray-400'}`}
               />
            )}
          </NeuBox>
       </div>
    </div>
  );
};


// ==========================================
// 主程式 App (導航與狀態管理)
// ==========================================
const App = () => {
  const [activeTab, setActiveTab] = useState("memo"); // 'memo', 'generator', 'me'
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
  
  // 主題狀態
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

  return (
    <div className={`min-h-screen transition-colors duration-300 p-6 pb-24 font-sans relative overflow-x-hidden
      ${isDark ? 'bg-[#202130] text-gray-200' : 'bg-[#D0D3EC] text-[#5b5d7e]'}
    `}>
      {/* 頁面標題 */}
      <div className="mb-8">
          <h1 className="text-3xl font-black text-purple-600 tracking-tight">MemoLive</h1>
          <p className="text-xs font-bold opacity-50 tracking-widest flex items-center gap-2">
            ULTIMATE OS <span className="px-1 py-0.5 rounded bg-blue-500 text-white text-[10px]">2.5 FLASH</span>
          </p>
      </div>

      {/* 頁面內容區 */}
      <div className="mb-10">
        {activeTab === 'memo' && <PageMemo isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'generator' && <PageGenerator isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'me' && <PageMe isDark={isDark} apiKey={apiKey} setApiKey={setApiKey} themeMode={themeMode} toggleTheme={toggleTheme} getThemeIcon={getThemeIcon} />}
      </div>

      {/* 底部導航欄 */}
      <div className="fixed bottom-0 left-0 w-full p-4 z-50">
        <NeuBox isDark={isDark} className="flex justify-around p-2 items-center">
          <NeuBox isDark={isDark} active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} className="flex-1 flex flex-col items-center py-2 rounded-xl">
            <Edit3 size={20} />
            <span className="text-[10px] font-bold mt-1">續寫</span>
          </NeuBox>
          <NeuBox isDark={isDark} active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} className="flex-1 flex flex-col items-center py-2 rounded-xl">
            <Sparkles size={20} />
            <span className="text-[10px] font-bold mt-1">生成器</span>
          </NeuBox>
          <NeuBox isDark={isDark} active={activeTab === 'me'} onClick={() => setActiveTab('me')} className="flex-1 flex flex-col items-center py-2 rounded-xl">
            <User size={20} />
            <span className="text-[10px] font-bold mt-1">我</span>
          </NeuBox>
        </NeuBox>
      </div>
    </div>
  );
};

export default App;