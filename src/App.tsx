import React, { useState, useEffect } from 'react';
import { Sparkles, Settings, Music, Trash2, Moon, Sun, Monitor, Zap, Edit3, User, Disc, Play, Pause, Search, Link as LinkIcon, Feather, Map, UserCheck, Key, Eye } from 'lucide-react';

// --- CSS for Vinyl & Tone Arm Animation ---
const styles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .vinyl-spin {
    animation: spin 4s linear infinite;
  }
  .tone-arm {
    transition: transform 0.5s ease-in-out;
    transform-origin: top right;
  }
  .tone-arm.playing {
    transform: rotate(25deg); /* 唱針移到唱片上 */
  }
  .tone-arm.paused {
    transform: rotate(0deg); /* 唱針移開 */
  }
`;

// --- UI 元件：具有「開關感」的 NeuBox ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false }) => {
  const lightShadow = pressed || active
    ? 'shadow-[inset_3px_3px_6px_#aeb1cb,inset_-3px_-3px_6px_#ffffff] scale-[0.98]'
    : 'shadow-[6px_6px_12px_#aeb1cb,-6px_-6px_12px_#ffffff] hover:scale-[1.01]';
  const darkShadow = pressed || active
    ? 'shadow-[inset_3px_3px_6px_#161722,inset_-3px_-3px_6px_#2a2c40] scale-[0.98]'
    : 'shadow-[6px_6px_12px_#161722,-6px_-6px_12px_#2a2c40] hover:scale-[1.01]';

  const activeColor = isDark ? 'text-purple-400' : 'text-purple-600';
  const normalColor = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div 
      onClick={onClick}
      className={`
        ${className} transition-all duration-200 ease-out rounded-[24px]
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
// 🎵 組件：橫向黑膠唱片機 (含唱針動畫)
// ==========================================
const VinylCard = ({ isDark }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicInput, setMusicInput] = useState("");
  const [videoId, setVideoId] = useState("");

  const handlePlay = () => {
    if (!musicInput) return alert("請先輸入歌名！");
    let id = "";
    if (musicInput.includes("youtube.com") || musicInput.includes("youtu.be")) {
       const url = new URL(musicInput);
       id = url.searchParams.get("v") || url.pathname.split("/").pop();
    } else {
       id = `searchbox?listType=search&list=${encodeURIComponent(musicInput + " audio")}`;
    }
    setVideoId(id);
    setIsPlaying(true);
  };

  return (
    <div className="w-full">
      <style>{styles}</style>
      
      {/* 唱片機本體 (橫向卡片) */}
      <NeuBox isDark={isDark} className="relative h-40 flex items-center overflow-hidden px-6 gap-6">
        
        {/* 左側：旋轉黑膠 */}
        <div className="relative flex-shrink-0">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-md border-4 border-gray-800 bg-black ${isPlaying ? 'vinyl-spin' : ''}`}>
             <div className="absolute inset-0 rounded-full opacity-30" style={{background: 'repeating-radial-gradient(#333, #333 2px, transparent 3px)'}}></div>
             <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-purple-900' : 'bg-purple-200'} flex items-center justify-center`}>
               <Disc size={20} className={isDark ? 'text-purple-300' : 'text-purple-600'}/>
             </div>
          </div>
        </div>

        {/* 中間：唱針 (視覺裝飾) */}
        {/* 這是一個模擬唱針的長條，定位在唱片右上方 */}
        <div className={`absolute top-4 left-[110px] w-24 h-4 z-10 pointer-events-none tone-arm ${isPlaying ? 'playing' : 'paused'}`}>
           <div className="w-full h-1 bg-gray-400 rounded-full origin-right shadow-sm rotate-12"></div>
           <div className="absolute right-0 top-[-4px] w-4 h-4 rounded-full bg-gray-500 shadow-inner"></div> {/* 軸心 */}
           <div className="absolute left-0 top-[-2px] w-3 h-6 bg-gray-600 rounded-sm"></div> {/* 唱頭 */}
        </div>

        {/* 右側：控制區 */}
        <div className="flex-1 flex flex-col justify-center gap-3 z-0 pl-4">
           {/* 輸入框 (隱藏式設計) */}
           <div className={`flex items-center gap-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-300'} pb-1`}>
             <Search size={14} className="opacity-40"/>
             <input 
               type="text" 
               placeholder="輸入歌手/歌名..." 
               value={musicInput} onChange={e=>setMusicInput(e.target.value)}
               className="w-full bg-transparent outline-none text-sm font-bold opacity-80"
             />
           </div>
           
           {/* 播放控制 */}
           <div className="flex items-center gap-4 mt-1">
              <button onClick={handlePlay} className={`p-3 rounded-full transition-all active:scale-95 ${isDark ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'} shadow-lg`}>
                <Play size={18} fill="currentColor" />
              </button>
              <button onClick={() => setIsPlaying(false)} className={`p-3 rounded-full transition-all active:scale-95 ${isDark ? 'bg-gray-700' : 'bg-white'} shadow`}>
                <Pause size={18} fill="currentColor" />
              </button>
              {/* 狀態燈 */}
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
           </div>
        </div>

        {/* 隱藏的 YouTube */}
        {isPlaying && videoId && (
        <iframe 
          width="1" height="1" 
          src={videoId.startsWith("searchbox") ? `https://www.youtube.com/embed?listType=search&list=${videoId.split("list=")[1]}&autoplay=1` : `https://www.youtube.com/embed/${videoId}?autoplay=1`}
          className="absolute opacity-0 pointer-events-none"
          allow="autoplay"
        ></iframe>
      )}
      </NeuBox>
    </div>
  );
};

// ==========================================
// 🧭 組件：懸浮導航島 (Cute & Floating)
// ==========================================
const Navigation = ({ activeTab, setActiveTab, isDark }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className={`
        flex items-center gap-6 px-8 py-4 rounded-full shadow-2xl backdrop-blur-md border
        ${isDark ? 'bg-[#202130]/90 border-white/10' : 'bg-white/80 border-white/40'}
      `}>
        <NavIcon icon={Edit3} label="續寫" active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} />
        <div className="w-[1px] h-6 bg-gray-400/20"></div> {/* 分隔線 */}
        <NavIcon icon={Sparkles} label="生成器" active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} />
        <div className="w-[1px] h-6 bg-gray-400/20"></div> {/* 分隔線 */}
        <NavIcon icon={User} label="我" active={activeTab === 'me'} onClick={() => setActiveTab('me')} />
      </div>
    </div>
  );
};

const NavIcon = ({ icon: Icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${active ? 'scale-110 -translate-y-1' : 'opacity-50 hover:opacity-80'}`}>
    <Icon size={22} className={active ? 'text-purple-500' : 'text-gray-500'} strokeWidth={2.5} />
    <span className={`text-[10px] font-bold ${active ? 'text-purple-500' : 'text-gray-500'}`}>{label}</span>
  </div>
);

// ==========================================
// 頁面：萬能生成器 (彙整網路熱門功能)
// ==========================================
const PageGenerator = ({ isDark, apiKey }) => {
  // 欄位參考自 NovelAI, Squibler, Reedsy 等工具
  const [config, setConfig] = useState({
    genre: "現代言情",      // 類型
    tone: "甜寵輕鬆",      // 基調
    world: "現實世界",      // 世界觀 (New)
    character: "霸道總裁 x 小白兔", // 主角人設 (New)
    trope: "契約婚姻",      // 核心梗 (New)
    sensory: "視覺描寫",    // 五感側重 (New)
    other: ""
  });
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  const generateAdvanced = async () => {
    if (!apiKey) return alert("請先設定 API Key！");
    setIsLoading(true);
    const promptText = `
      角色：萬能小說生成器。
      任務：根據以下詳盡設定，創作一篇小說開頭（約1200字）。
      【類型】：${config.genre}
      【基調】：${config.tone}
      【世界觀】：${config.world}
      【主角人設】：${config.character}
      【核心梗/橋段】：${config.trope}
      【五感描寫側重】：${config.sensory}
      【其他要求】：${config.other || "無"}
      
      要求：劇情要有張力，請發揮 Gemini 2.5 的創意，繁體中文寫作。
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

  const inputStyle = `w-full bg-transparent outline-none p-2 text-sm ${isDark ? 'border-b border-gray-700 placeholder-gray-600' : 'border-b border-gray-300 placeholder-gray-400'}`;
  const labelStyle = "text-xs font-bold opacity-50 flex items-center gap-1 mb-1";

  return (
    <div className="space-y-6 animate-fade-in pb-24">
       <div className="flex items-center gap-2 opacity-60">
         <Sparkles size={18}/> <h2 className="text-lg font-bold">萬能小說生成器</h2>
       </div>
      {!generatedText ? (
        <>
          <NeuBox isDark={isDark} className="p-6 grid grid-cols-1 gap-5">
            {/* 第一排 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}><Feather size={12}/> 小說類型</label>
                <select value={config.genre} onChange={e=>handleChange('genre', e.target.value)} className={inputStyle}>
                  <option>現代言情</option><option>古代架空</option><option>懸疑推理</option><option>奇幻冒險</option><option>娛樂圈/飯圈</option><option>賽博龐克</option>
                </select>
              </div>
              <div>
                <label className={labelStyle}><Eye size={12}/> 劇情基調</label>
                <select value={config.tone} onChange={e=>handleChange('tone', e.target.value)} className={inputStyle}>
                  <option>甜寵輕鬆</option><option>虐心催淚</option><option>搞笑沙雕</option><option>暗黑正劇</option><option>熱血升級</option>
                </select>
              </div>
            </div>

            {/* 第二排 (新增功能) */}
            <div>
              <label className={labelStyle}><Map size={12}/> 世界觀設定</label>
              <input type="text" placeholder="例如：ABO世界、末日廢土、魔法學院..." value={config.world} onChange={e=>handleChange('world', e.target.value)} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}><UserCheck size={12}/> 主角人設 (CP)</label>
              <input type="text" placeholder="例如：高冷學霸 x 笨蛋美人..." value={config.character} onChange={e=>handleChange('character', e.target.value)} className={inputStyle} />
            </div>
            
            {/* 第三排 */}
            <div>
               <label className={labelStyle}><Key size={12}/> 核心梗/橋段 (Trope)</label>
               <input type="text" placeholder="例如：追妻火葬場、破鏡重圓、穿越重生..." value={config.trope} onChange={e=>handleChange('trope', e.target.value)} className={inputStyle} />
            </div>
             <div>
               <label className={labelStyle}><Edit3 size={12}/> 補充要求</label>
               <input type="text" placeholder="還有什麼想加的？" value={config.other} onChange={e=>handleChange('other', e.target.value)} className={inputStyle} />
            </div>
          </NeuBox>
          <NeuBox isDark={isDark} onClick={generateAdvanced} className="py-4 flex justify-center gap-2 font-bold text-purple-500 text-lg active:scale-95">
             {isLoading ? <span className="animate-pulse">✨ 萬能生成中...</span> : <><Zap /> 開始創作</>}
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
// 頁面：續寫 (簡化版)
// ==========================================
const PageMemo = ({ isDark, apiKey }) => {
  const [note, setNote] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateStory = async () => {
    if (!apiKey) return alert("請先設定 API Key！");
    setIsLoading(true);
    const promptText = `角色：頂級同人小說家。任務：續寫以下筆記，模仿其文風，續寫1500字以上。筆記內容：${note}`;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }) }
      );
      const data = await response.json();
      setGeneratedText(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
    } catch (error) { alert(`錯誤：${error.message}`); } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
       <div className="flex items-center gap-2 opacity-60"><Edit3 size={18}/> <h2 className="text-lg font-bold">筆記續寫</h2></div>
      {!generatedText ? (
        <>
          <NeuBox isDark={isDark} className="p-6 min-h-[400px]" pressed>
            <textarea className={`w-full h-full min-h-[400px] bg-transparent outline-none resize-none text-lg leading-relaxed ${isDark ? 'placeholder-gray-600' : 'placeholder-[#8e91af]'}`} placeholder="貼上你的筆記... AI 將模仿你的風格續寫..." value={note} onChange={(e) => setNote(e.target.value)}/>
          </NeuBox>
          <NeuBox isDark={isDark} onClick={generateStory} className="py-4 flex justify-center gap-2 font-bold text-purple-500 text-lg active:scale-95">
             {isLoading ? <span className="animate-pulse">✨ 運算中...</span> : <><Edit3 /> 開始續寫</>}
          </NeuBox>
        </>
      ) : (
        <>
          <NeuBox isDark={isDark} className="p-8 leading-loose text-justify text-lg whitespace-pre-wrap">{generatedText}</NeuBox>
          <NeuBox isDark={isDark} className="py-4 flex justify-center font-bold text-red-400 gap-2" onClick={() => setGeneratedText("")}><Trash2 size={18}/> 清除重寫</NeuBox>
        </>
      )}
    </div>
  );
};

// ==========================================
// 頁面：我 (含新版黑膠 + 設定)
// ==========================================
const PageMe = ({ isDark, apiKey, setApiKey, themeMode, toggleTheme, getThemeIcon }) => {
  const [showKeyInput, setShowKeyInput] = useState(false);
  return (
    <div className="space-y-8 animate-fade-in pb-24">
       <div className="flex items-center gap-2 opacity-60 mb-4"><User size={18}/> <h2 className="text-lg font-bold">我的</h2></div>
       
       {/* 新版橫向黑膠唱片機 */}
       <VinylCard isDark={isDark} />

       <div className="space-y-4">
          <h3 className="font-bold opacity-60 ml-2 text-xs uppercase tracking-wider">Settings</h3>
          <NeuBox isDark={isDark} className="p-4 flex justify-between items-center" onClick={toggleTheme}>
            <span className="font-bold text-sm">外觀主題 ({themeMode})</span>
            {getThemeIcon()}
          </NeuBox>
          <NeuBox isDark={isDark} className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center" onClick={() => setShowKeyInput(!showKeyInput)}>
               <span className="font-bold text-sm flex items-center gap-2"><Settings size={16}/> API Key</span>
               <span className="text-xs opacity-50 bg-gray-500/10 px-2 py-1 rounded">{apiKey ? "已連接" : "未設定"}</span>
            </div>
            {showKeyInput && (
               <input type="password" placeholder="貼上 Google Gemini API Key" value={apiKey} onChange={(e) => {setApiKey(e.target.value); localStorage.setItem("gemini_key", e.target.value);}} className={`w-full bg-transparent outline-none text-sm font-mono p-2 mt-2 border rounded ${isDark ? 'border-gray-700 placeholder-gray-600' : 'border-gray-300 placeholder-gray-400'}`}/>
            )}
          </NeuBox>
       </div>
    </div>
  );
};

// ==========================================
// 主程式
// ==========================================
const App = () => {
  const [activeTab, setActiveTab] = useState("generator"); // 預設中間
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
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
    if (themeMode === "system") return <Monitor size={18} />;
    if (themeMode === "dark") return <Moon size={18} />;
    return <Sun size={18} />;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 p-6 font-sans relative overflow-x-hidden ${isDark ? 'bg-[#202130] text-gray-200' : 'bg-[#D0D3EC] text-[#5b5d7e]'}`}>
      <div className="mb-8 text-center mt-4">
          <h1 className="text-2xl font-black text-purple-600 tracking-tight">MemoLive</h1>
          <p className="text-[10px] font-bold opacity-40 tracking-[0.2em]">UNIVERSAL GENERATOR</p>
      </div>

      <div className="max-w-md mx-auto">
        {activeTab === 'memo' && <PageMemo isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'generator' && <PageGenerator isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'me' && <PageMe isDark={isDark} apiKey={apiKey} setApiKey={setApiKey} themeMode={themeMode} toggleTheme={toggleTheme} getThemeIcon={getThemeIcon} />}
      </div>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
    </div>
  );
};

export default App;