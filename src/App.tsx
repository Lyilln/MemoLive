import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, Monitor, Zap, Edit3, User, Play, Pause, SkipBack, SkipForward, Search, List, Table, Key, MessageCircle, Trash2 } from 'lucide-react';

// --- 動畫樣式 ---
const styles = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .vinyl-spin { animation: spin 6s linear infinite; }
  .vinyl-spin-paused { animation-play-state: paused; }
  /* 唱針動畫：中心點調整為唱臂底座 */
  .tone-arm { transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: 16px 16px; z-index: 20; }
  .tone-arm.playing { transform: rotate(35deg); }
  .tone-arm.paused { transform: rotate(0deg); }
`;

// --- 通用按鈕組件 (NeuBox) ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false }) => {
  const lightShadow = pressed || active ? 'shadow-[inset_2px_2px_5px_#aeb1cb,inset_-2px_-2px_5px_#ffffff] scale-[0.99]' : 'shadow-[5px_5px_10px_#aeb1cb,-5px_-5px_10px_#ffffff] hover:scale-[1.005]';
  const darkShadow = pressed || active ? 'shadow-[inset_2px_2px_5px_#161722,inset_-2px_-2px_5px_#2a2c40] scale-[0.99]' : 'shadow-[5px_5px_10px_#161722,-5px_-5px_10px_#2a2c40] hover:scale-[1.005]';
  return (
    <div onClick={onClick} className={`${className} transition-all duration-200 ease-out rounded-[24px] ${isDark ? 'bg-[#202130]' : 'bg-[#D0D3EC]'} ${active ? (isDark ? 'text-purple-400' : 'text-purple-600') : (isDark ? 'text-gray-400' : 'text-gray-500')} ${isDark ? darkShadow : lightShadow} ${onClick ? 'cursor-pointer' : ''}`}>
      {children}
    </div>
  );
};

// --- 黑膠唱片組件 (1:1 還原你的藍色參考圖) ---
const VinylWidget = ({ isDark }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicInput, setMusicInput] = useState("");
  const [videoId, setVideoId] = useState("");
  const [currentTitle, setCurrentTitle] = useState("未播放");

  const handlePlay = () => {
    const keyword = musicInput || "aespa Drama";
    setCurrentTitle(keyword);
    // 加上 sp=EgIQAQ%253D%253D 強制搜尋影片，lyrics 避開鎖區
    setVideoId(`searchbox?listType=search&list=${encodeURIComponent(keyword + " lyrics audio")}&sp=EgIQAQ%253D%253D`);
    setIsPlaying(true);
  };

  return (
    <div className="w-full relative select-none">
      <style>{styles}</style>
      {/* 藍色漸層卡片背景 */}
      <div className={`relative h-44 w-full rounded-[30px] overflow-hidden flex shadow-xl ${isDark ? 'bg-gradient-to-r from-[#4b5563] to-[#1f2937]' : 'bg-gradient-to-r from-[#93C5FD] to-[#A5B4FC]'}`}>
        
        {/* 左側：控制區 */}
        <div className="w-[55%] h-full p-4 flex flex-col justify-between z-10 pl-5">
           <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 border-b border-white/30 pb-1 mb-1 w-full">
                <Search size={14} className="text-white/70"/>
                <input type="text" placeholder="輸入歌名..." value={musicInput} onChange={e=>setMusicInput(e.target.value)} className="bg-transparent outline-none text-sm font-bold text-white placeholder-white/50 w-full"/>
             </div>
             <h2 className="text-lg font-black text-white leading-tight line-clamp-2 drop-shadow-md">{currentTitle}</h2>
             <p className="text-[10px] text-white/80 font-bold tracking-wider">{isPlaying ? "NOW PLAYING" : "PAUSED"}</p>
           </div>
           <div className="flex items-center gap-3">
             <SkipBack size={20} className="text-white cursor-pointer active:scale-90" fill="currentColor"/>
             {isPlaying ? <Pause size={32} onClick={()=>setIsPlaying(false)} className="text-white cursor-pointer active:scale-90 drop-shadow-lg" fill="currentColor"/> : <Play size={32} onClick={handlePlay} className="text-white cursor-pointer active:scale-90 drop-shadow-lg" fill="currentColor"/>}
             <SkipForward size={20} className="text-white cursor-pointer active:scale-90" fill="currentColor"/>
           </div>
        </div>

        {/* 右側：黑膠與唱針 */}
        <div className="w-[45%] h-full relative flex items-center justify-center">
           {/* 黑膠本體 */}
           <div className={`w-32 h-32 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/10 ${isPlaying ? 'vinyl-spin' : 'vinyl-spin-paused'} relative z-0 mr-2`}>
              <div className="absolute inset-0 rounded-full bg-slate-900" style={{background: 'radial-gradient(circle, #222 0%, #111 100%)'}}></div>
              <div className="absolute inset-0 rounded-full opacity-30" style={{background: 'repeating-radial-gradient(transparent 0, transparent 2px, #fff 3px)'}}></div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 shadow-inner flex items-center justify-center z-10 relative"><div className="w-2 h-2 bg-black rounded-full"></div></div>
           </div>
           {/* 唱針 */}
           <div className={`absolute top-[10px] right-[15px] w-8 h-24 z-20 pointer-events-none tone-arm ${isPlaying ? 'playing' : 'paused'}`}>
              <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-[#111] border-2 border-[#444] shadow-xl flex items-center justify-center"><div className="w-3 h-3 bg-[#666] rounded-full"></div></div>
              <div className="absolute top-4 left-3 w-2 h-16 bg-gradient-to-b from-[#888] to-[#444] rounded-full shadow-lg"></div>
              <div className="absolute bottom-0 left-2 w-5 h-7 bg-black rounded shadow-md border-b-2 border-white/20"></div>
           </div>
        </div>

        {/* 隱藏播放器 */}
        {isPlaying && videoId && <div className="absolute bottom-0 right-0 w-[1px] h-[1px] opacity-10 pointer-events-none"><iframe width="100%" height="100%" src={`https://www.youtube.com/embed?listType=search&list=${videoId.split("list=")[1]}&autoplay=1&playsinline=1&controls=0`} allow="autoplay; encrypted-media"></iframe></div>}
      </div>
    </div>
  );
};

// --- 底部導航 ---
const Navigation = ({ activeTab, setActiveTab, isDark }) => (
  <div className={`fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-4 backdrop-blur-xl border-t shadow-[0_-5px_20px_rgba(0,0,0,0.1)] ${isDark ? 'bg-[#202130]/90 border-white/5' : 'bg-[#D0D3EC]/90 border-white/20'}`}>
    <div className="flex justify-around items-center max-w-lg mx-auto">
      <NavIcon icon={Edit3} label="續寫" active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} />
      <NavIcon icon={Sparkles} label="生成器" active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} />
      <NavIcon icon={User} label="我" active={activeTab === 'me'} onClick={() => setActiveTab('me')} />
    </div>
  </div>
);
const NavIcon = ({ icon: Icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 ${active ? 'scale-105' : 'opacity-40 hover:opacity-70'}`}>
    <div className={`p-2.5 rounded-2xl transition-colors ${active ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-transparent text-gray-500'}`}><Icon size={24} strokeWidth={2.5} /></div>
    <span className={`text-[10px] font-bold ${active ? 'text-purple-500' : 'text-gray-500'}`}>{label}</span>
  </div>
);

// --- 頁面 1: 續寫 (輸入框巨大化) ---
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
      {/* 這裡設定 h-[40vh] 確保它佔據螢幕 40% 的高度 */}
      <NeuBox isDark={isDark} className="p-4 h-[40vh] flex-shrink-0" pressed>
        <textarea className={`w-full h-full bg-transparent outline-none resize-none text-base leading-relaxed ${isDark ? 'placeholder-gray-600' : 'placeholder-[#8e91af]'}`} placeholder="貼上你的文章 (輸入框已加大)..." value={note} onChange={(e) => setNote(e.target.value)}/>
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

// --- 頁面 2: 生成器 ---
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

// --- Page: Me ---
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

// --- App ---
const App = () => {
  const [activeTab, setActiveTab] = useState("memo");
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