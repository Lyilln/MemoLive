import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Settings, Music, Trash2, Moon, Sun, Monitor, Zap, Edit3, User, Play, Pause, SkipBack, SkipForward, Search, List, Table, Key, MessageCircle, Link } from 'lucide-react';

// --- 核心 CSS 動畫與樣式 ---
const styles = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .vinyl-spin { animation: spin 8s linear infinite; }
  .vinyl-spin-paused { animation-play-state: paused; }

  /* 唱針動畫核心 */
  .tone-arm-container {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 120px;
    z-index: 30;
    pointer-events: none;
  }
  .tone-arm {
    width: 100%;
    height: 100%;
    transform-origin: 20px 20px; /* 旋轉軸心設定在基座中心 */
    transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .tone-arm.playing { transform: rotate(30deg); } /* 移到唱片上的角度 */
  .tone-arm.paused { transform: rotate(0deg); } /* 回歸原位 */

  /* 藍色大理石紋路模擬 */
  .marble-vinyl {
    background: 
      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 10%),
      radial-gradient(circle at 70% 60%, rgba(255,255,255,0.15) 0%, transparent 10%),
      repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 2px, transparent 3px, transparent 8px),
      linear-gradient(135deg, #4a6fa5 0%, #7a9fca 50%, #4a6fa5 100%);
    box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3);
  }
`;

// --- 通用 NeuBox 組件 ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false }) => {
  const lightShadow = pressed || active ? 'shadow-[inset_2px_2px_5px_#aeb1cb,inset_-2px_-2px_5px_#ffffff] scale-[0.99]' : 'shadow-[5px_5px_10px_#aeb1cb,-5px_-5px_10px_#ffffff] hover:scale-[1.005]';
  const darkShadow = pressed || active ? 'shadow-[inset_2px_2px_5px_#161722,inset_-2px_-2px_5px_#2a2c40] scale-[0.99]' : 'shadow-[5px_5px_10px_#161722,-5px_-5px_10px_#2a2c40] hover:scale-[1.005]';
  return (
    <div onClick={onClick} className={`${className} transition-all duration-200 ease-out rounded-[24px] ${isDark ? 'bg-[#202130]' : 'bg-[#D0D3EC]'} ${active ? (isDark ? 'text-purple-400' : 'text-purple-600') : (isDark ? 'text-gray-400' : 'text-gray-500')} ${isDark ? darkShadow : lightShadow} ${onClick ? 'cursor-pointer' : ''}`}>
      {children}
    </div>
  );
};

// ==========================================
// 🎵 真・藍色大理石黑膠播放器 (1:1 復刻圖二)
// ==========================================
const VinylWidget = ({ isDark }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [videoId, setVideoId] = useState("");
  const [status, setStatus] = useState("等待輸入網址...");

  // 從 YouTube 網址提取 Video ID
  const extractVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
  };

  const handlePlay = () => {
    if (!urlInput) return alert("請先貼上 YouTube 網址！");
    const id = extractVideoId(urlInput);
    if (id) {
      setVideoId(id);
      setIsPlaying(true);
      setStatus("播放中 (若無聲請檢查靜音鍵)");
    } else {
      alert("無效的 YouTube 網址！");
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    setStatus("已暫停");
  };

  return (
    <div className="w-full relative select-none my-4">
      <style>{styles}</style>
      
      {/* 藍色漸層大卡片背景 */}
      <div className={`relative h-56 w-full rounded-[32px] overflow-hidden flex shadow-2xl
        ${isDark ? 'bg-gradient-to-br from-[#4a6fa5] to-[#2c4f7c]' : 'bg-gradient-to-br from-[#8ab6e9] to-[#6a96c9]'}
      `}>
        
        {/* --- 左側：控制區 (佔 50%) --- */}
        <div className="w-1/2 h-full p-6 flex flex-col justify-between z-10 relative">
           
           {/* 上方：標題與網址輸入 */}
           <div>
             <h2 className="text-2xl font-black text-white leading-tight drop-shadow-md mb-1">Youtube Player</h2>
             <p className="text-sm text-blue-100 font-medium mb-3">{status}</p>
             
             <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 backdrop-blur-sm">
                <Link size={14} className="text-white/70"/>
                <input 
                  type="text" 
                  placeholder="貼上 YouTube 網址..." 
                  value={urlInput} 
                  onChange={e=>setUrlInput(e.target.value)} 
                  className="bg-transparent outline-none text-xs font-bold text-white placeholder-white/50 w-full"
                />
             </div>
           </div>

           {/* 下方：播放按鈕組 (白色大按鈕) */}
           <div className="flex items-center gap-5">
             <SkipBack size={28} className="text-white cursor-pointer active:scale-90 transition hover:text-blue-200" fill="currentColor"/>
             {isPlaying ? (
                <Pause size={42} onClick={handlePause} className="text-white cursor-pointer active:scale-90 transition drop-shadow-lg hover:text-blue-100" fill="currentColor"/>
             ) : (
                <Play size={42} onClick={handlePlay} className="text-white cursor-pointer active:scale-90 transition drop-shadow-lg hover:text-blue-100" fill="currentColor"/>
             )}
             <SkipForward size={28} className="text-white cursor-pointer active:scale-90 transition hover:text-blue-200" fill="currentColor"/>
           </div>
        </div>

        {/* --- 右側：黑膠與唱針 (佔 50%，超出邊界) --- */}
        <div className="w-1/2 h-full relative">
           
           {/* 唱針 Tone Arm (放在右上角) */}
           <div className="tone-arm-container">
             <div className={`tone-arm ${isPlaying ? 'playing' : 'paused'}`}>
               {/* 基座 */}
               <div className="absolute top-0 right-0 w-10 h-10 rounded-full bg-[#333] border-[3px] border-[#555] shadow-xl z-20 flex items-center justify-center">
                 <div className="w-3 h-3 bg-[#777] rounded-full border border-[#222]"></div>
               </div>
               {/* 臂桿 */}
               <div className="absolute top-5 right-4 w-2 h-24 bg-gradient-to-b from-[#999] to-[#444] rounded-full shadow-md z-10 origin-top"></div>
               {/* 唱頭 */}
               <div className="absolute bottom-0 right-2 w-6 h-10 bg-[#222] rounded-md shadow-lg border-b-4 border-white/30 z-20 transform rotate-12"></div>
             </div>
           </div>

           {/* 藍色大理石黑膠 (位置調整到右側並超出邊界) */}
           <div className={`
              absolute top-1/2 right-[-30px] -translate-y-1/2
              w-48 h-48 rounded-full border-[8px] border-white/10
              ${isPlaying ? 'vinyl-spin' : 'vinyl-spin-paused'}
              marble-vinyl z-0
           `}>
              {/* 中心貼紙 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-tr from-blue-300 to-purple-300 shadow-inner flex items-center justify-center z-10 border-2 border-white/30">
                 <Music size={24} className="text-white opacity-80"/>
              </div>
           </div>
        </div>

        {/* 隱形播放器 (聲音來源) */}
        {isPlaying && videoId && (
           <div className="absolute bottom-4 left-20 w-[1px] h-[1px] opacity-10 pointer-events-none overflow-hidden">
             <iframe 
               width="100%" height="100%" 
               // 使用 playsinline 和 autoplay，並關閉控制項
               src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&controls=0&enablejsapi=1`}
               allow="autoplay; encrypted-media"
               title="Audio Engine"
             ></iframe>
           </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 🧭 懸浮導航列 (Floating Pill)
// ==========================================
const Navigation = ({ activeTab, setActiveTab, isDark }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-xs w-full">
      <div className={`
        flex justify-evenly items-center px-2 py-3 rounded-full shadow-2xl backdrop-blur-md border
        ${isDark ? 'bg-[#202130]/90 border-white/10' : 'bg-[#D0D3EC]/95 border-white/40'}
      `}>
        <NavIcon icon={Edit3} label="續寫" active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} />
        <NavIcon icon={Sparkles} label="生成器" active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} />
        <NavIcon icon={User} label="我" active={activeTab === 'me'} onClick={() => setActiveTab('me')} />
      </div>
    </div>
  );
};

const NavIcon = ({ icon: Icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 px-4 ${active ? 'scale-110 -translate-y-1' : 'opacity-50 hover:opacity-80'}`}>
    <Icon size={22} className={active ? 'text-purple-500' : 'text-gray-600'} strokeWidth={2.5} />
    <span className={`text-[10px] font-bold ${active ? 'text-purple-500' : 'text-gray-600'}`}>{label}</span>
  </div>
);

// --- 頁面組件 (保持不變，僅確保高度正確) ---
const PageMemo = ({ isDark, apiKey }) => {
  const [note, setNote] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleGenerate = async (mode) => {
    if (!apiKey) return alert("請先到「我」設定 API Key！");
    setIsLoading(true);
    const prompt = mode === 'story' ? `續寫1500字以上：${note}` : `改寫為對話劇本：${note}`;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await res.json();
      setGeneratedText(data.candidates?.[0]?.content?.parts?.[0]?.text || "失敗");
    } catch (e) { alert(e.message); } finally { setIsLoading(false); }
  };
  return (
    <div className="space-y-4 animate-fade-in pb-32 h-full flex flex-col">
       <div className="flex items-center gap-2 opacity-60 px-1"><Edit3 size={18}/> <h2 className="text-lg font-bold">筆記續寫</h2></div>
      <NeuBox isDark={isDark} className="p-4 h-[40vh] flex-shrink-0" pressed>
        <textarea className={`w-full h-full bg-transparent outline-none resize-none text-base leading-relaxed ${isDark ? 'placeholder-gray-600' : 'placeholder-[#8e91af]'}`} placeholder="貼上你的文章..." value={note} onChange={(e) => setNote(e.target.value)}/>
      </NeuBox>
      <div className="flex gap-3 flex-shrink-0">
        <NeuBox isDark={isDark} onClick={() => handleGenerate('story')} className="flex-1 py-4 flex justify-center gap-2 font-bold text-purple-500 active:scale-95 text-sm">{isLoading ? <span className="animate-pulse">✨...</span> : <><Zap size={18}/> 續寫</>}</NeuBox>
        <NeuBox isDark={isDark} onClick={() => handleGenerate('dialogue')} className="flex-1 py-4 flex justify-center gap-2 font-bold text-pink-500 active:scale-95 text-sm">{isLoading ? <span className="animate-pulse">💬...</span> : <><MessageCircle size={18}/> 對話</>}</NeuBox>
      </div>
      {generatedText && (
        <div className="flex-grow animate-slide-up">
           <div className="flex justify-between items-center mb-2 px-2"><label className="text-xs font-bold opacity-50">AI 結果</label><button onClick={() => setGeneratedText("")} className="text-xs text-red-400 font-bold flex items-center gap-1"><Trash2 size={12}/> 清除</button></div>
           <NeuBox isDark={isDark} className="p-6 min-h-[300px] leading-loose text-justify text-lg whitespace-pre-wrap border-2 border-purple-500/20">{generatedText}</NeuBox>
        </div>
      )}
    </div>
  );
};

const PageGenerator = ({ isDark, apiKey }) => {
  const [config, setConfig] = useState({ genre: "現代言情", tone: "甜寵輕鬆", world: "", character: "", trope: "", other: "" });
  const [fragment, setFragment] = useState("");
  const [sheetInput, setSheetInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const runGen = async (prompt) => {
    if (!apiKey) return alert("請先設定 API Key！");
    setIsLoading(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await res.json();
      setResult(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
    } catch (e) { alert(e.message); } finally { setIsLoading(false); }
  };
  const inputStyle = `w-full bg-transparent outline-none p-2 text-sm border-b ${isDark ? 'border-gray-700 placeholder-gray-600' : 'border-gray-300 placeholder-gray-400'}`;
  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><Sparkles size={18}/> <h2 className="text-lg font-bold">萬能生成中心</h2></div>
       <section><h3 className="text-xs font-bold opacity-50 mb-2 ml-2">萬能小說開頭</h3><NeuBox isDark={isDark} className="p-5 space-y-4"><div className="grid grid-cols-2 gap-4"><select value={config.genre} onChange={e=>setConfig({...config, genre:e.target.value})} className={inputStyle}><option>現代言情</option><option>古代架空</option><option>懸疑</option><option>奇幻</option><option>同人</option></select><select value={config.tone} onChange={e=>setConfig({...config, tone:e.target.value})} className={inputStyle}><option>甜寵</option><option>虐心</option><option>搞笑</option><option>正劇</option></select></div><input placeholder="世界觀" value={config.world} onChange={e=>setConfig({...config, world:e.target.value})} className={inputStyle}/><input placeholder="主角 CP" value={config.character} onChange={e=>setConfig({...config, character:e.target.value})} className={inputStyle}/><input placeholder="核心梗" value={config.trope} onChange={e=>setConfig({...config, trope:e.target.value})} className={inputStyle}/><NeuBox isDark={isDark} onClick={() => runGen(`生成小說開頭：${JSON.stringify(config)}`)} className="mt-4 py-3 flex justify-center font-bold text-purple-500 active:scale-95">{isLoading ? "..." : <><Zap size={16} className="mr-1"/> 創作</>}</NeuBox></NeuBox></section>
       <section><h3 className="text-xs font-bold opacity-50 mb-2 ml-2">靈感碎片擴充</h3><NeuBox isDark={isDark} className="p-4" pressed><textarea className="w-full h-24 bg-transparent outline-none resize-none text-sm" placeholder="輸入碎片..." value={fragment} onChange={e=>setFragment(e.target.value)}/></NeuBox><NeuBox isDark={isDark} onClick={() => runGen(`聯想擴充：${fragment}`)} className="mt-2 py-3 flex justify-center font-bold text-blue-500 active:scale-95">{isLoading ? "..." : <><List size={16} className="mr-1"/> 聯想</>}</NeuBox></section>
       <section><h3 className="text-xs font-bold opacity-50 mb-2 ml-2">人設表生成</h3><NeuBox isDark={isDark} className="p-4" pressed><textarea className="w-full h-24 bg-transparent outline-none resize-none text-sm" placeholder="輸入想法..." value={sheetInput} onChange={e=>setSheetInput(e.target.value)}/></NeuBox><NeuBox isDark={isDark} onClick={() => runGen(`整理成表格：${sheetInput}`)} className="mt-2 py-3 flex justify-center font-bold text-green-500 active:scale-95">{isLoading ? "..." : <><Table size={16} className="mr-1"/> 表格</>}</NeuBox></section>
       {result && <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><NeuBox isDark={isDark} className="w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 relative shadow-2xl"><button onClick={()=>setResult("")} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full"><Trash2 size={16}/></button><div className="whitespace-pre-wrap leading-relaxed">{result}</div></NeuBox></div>}
    </div>
  );
};

const PageMe = ({ isDark, apiKey, setApiKey, themeMode, toggleTheme }) => {
  const [showInput, setShowInput] = useState(false);
  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><User size={18}/> <h2 className="text-lg font-bold">我的</h2></div>
       <VinylWidget isDark={isDark} />
       <div className="space-y-4">
          <NeuBox isDark={isDark} className="p-4 flex justify-between" onClick={toggleTheme}><span className="font-bold text-sm">主題 ({themeMode})</span>{themeMode==='dark' ? <Moon size={18}/> : <Sun size={18}/>}</NeuBox>
          <NeuBox isDark={isDark} className="p-4" onClick={() => setShowInput(!showInput)}><div className="flex justify-between"><span className="font-bold text-sm">API Key</span><Key size={18}/></div>{showInput && <input type="password" value={apiKey} onChange={e=>{setApiKey(e.target.value);localStorage.setItem("gemini_key",e.target.value)}} className="w-full mt-2 bg-transparent border-b outline-none text-sm font-mono"/>}</NeuBox>
       </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState("me"); // 預設在「我」頁面方便測試音樂
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
  const [themeMode, setThemeMode] = useState(localStorage.getItem("theme_mode") || "system");
  const [isDark, setIsDark] = useState(false);
  useEffect(() => { const check = () => (themeMode === "system" ? window.matchMedia('(prefers-color-scheme: dark)').matches : themeMode === "dark"); setIsDark(check()); }, [themeMode]);
  const toggleTheme = () => { const next = ["system", "light", "dark"][(["system", "light", "dark"].indexOf(themeMode) + 1) % 3]; setThemeMode(next); localStorage.setItem("theme_mode", next); };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans relative overflow-x-hidden ${isDark ? 'bg-[#202130] text-gray-200' : 'bg-[#D0D3EC] text-[#5b5d7e]'}`}>
      <div className="pt-8 pb-4 text-center px-4"><h1 className="text-2xl font-black text-purple-600 tracking-tight">MemoLive</h1><p className="text-[10px] font-bold opacity-40 tracking-[0.2em]">ULTIMATE</p></div>
      <div className="max-w-md mx-auto h-full px-4">
        {activeTab === 'memo' && <PageMemo isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'generator' && <PageGenerator isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'me' && <PageMe isDark={isDark} apiKey={apiKey} setApiKey={setApiKey} themeMode={themeMode} toggleTheme={toggleTheme} />}
      </div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
    </div>
  );
};
export default App;