import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Settings, Music, Trash2, Moon, Sun, Monitor, Zap, Edit3, User, Play, Pause, SkipBack, SkipForward, Search, List, Table, Key, MessageCircle, ArrowRight } from 'lucide-react';

// --- CSS for Vinyl & Tone Arm ---
const styles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .vinyl-spin {
    animation: spin 6s linear infinite;
  }
  .vinyl-spin-paused {
    animation-play-state: paused;
  }
  
  /* 唱針動畫 */
  .tone-arm {
    transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: 16px 16px; /* 旋轉軸心調整到唱臂底座中心 */
    z-index: 20;
  }
  .tone-arm.playing {
    transform: rotate(35deg); /* 移到唱片上 */
  }
  .tone-arm.paused {
    transform: rotate(0deg); /* 回歸原位 */
  }
`;

// --- UI Component: NeuBox ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false }) => {
  const lightShadow = pressed || active
    ? 'shadow-[inset_2px_2px_5px_#aeb1cb,inset_-2px_-2px_5px_#ffffff] scale-[0.99]'
    : 'shadow-[6px_6px_12px_#aeb1cb,-6px_-6px_12px_#ffffff] hover:scale-[1.005]';
  const darkShadow = pressed || active
    ? 'shadow-[inset_2px_2px_5px_#161722,inset_-2px_-2px_5px_#2a2c40] scale-[0.99]'
    : 'shadow-[6px_6px_12px_#161722,-6px_-6px_12px_#2a2c40] hover:scale-[1.005]';

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
// 🎵 黑膠唱片機 (1:1 復刻參考圖佈局)
// ==========================================
const VinylWidget = ({ isDark }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicInput, setMusicInput] = useState("");
  const [videoId, setVideoId] = useState("");
  const [currentTitle, setCurrentTitle] = useState("未播放");

  const handlePlay = () => {
    if (!musicInput) {
       // 預設演示
       setMusicInput("aespa Drama");
       handleSearchAndPlay("aespa Drama");
       return;
    }
    handleSearchAndPlay(musicInput);
  };

  const handleSearchAndPlay = (keyword) => {
    setCurrentTitle(keyword);
    // 自動加 lyrics audio
    const query = encodeURIComponent(keyword + " lyrics audio");
    // 強制 autoplay
    const id = `searchbox?listType=search&list=${query}`;
    setVideoId(id);
    setIsPlaying(true);
  };

  const handleToggle = () => setIsPlaying(!isPlaying);

  return (
    <div className="w-full relative select-none">
      <style>{styles}</style>
      
      {/* 藍色漸層卡片背景 */}
      <div className={`relative h-44 w-full rounded-[30px] overflow-hidden flex shadow-xl
        ${isDark ? 'bg-gradient-to-r from-[#4b5563] to-[#1f2937]' : 'bg-gradient-to-r from-[#93C5FD] to-[#A5B4FC]'}
      `}>
        
        {/* 左側：控制區 (文字上，按鈕下) */}
        <div className="w-[55%] h-full p-5 flex flex-col justify-between z-10 pl-6">
           
           {/* 上半部：文字輸入 */}
           <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2 border-b border-white/30 pb-1 mb-1 w-full">
                <Search size={14} className="text-white/70"/>
                <input 
                  type="text" 
                  placeholder="輸入歌名..." 
                  value={musicInput} 
                  onChange={e=>setMusicInput(e.target.value)} 
                  className="bg-transparent outline-none text-sm font-bold text-white placeholder-white/50 w-full"
                />
             </div>
             <h2 className="text-xl font-black text-white leading-tight line-clamp-2 drop-shadow-md">
               {currentTitle}
             </h2>
             <p className="text-[10px] text-white/80 font-bold tracking-wider">
               {isPlaying ? "NOW PLAYING" : "PAUSED"}
             </p>
           </div>

           {/* 下半部：播放按鈕組 (靠左下) */}
           <div className="flex items-center gap-4">
             <SkipBack size={24} className="text-white cursor-pointer active:scale-90 transition drop-shadow" fill="currentColor"/>
             {isPlaying ? (
                <Pause size={36} onClick={handleToggle} className="text-white cursor-pointer active:scale-90 transition drop-shadow-lg" fill="currentColor"/>
             ) : (
                <Play size={36} onClick={handlePlay} className="text-white cursor-pointer active:scale-90 transition drop-shadow-lg" fill="currentColor"/>
             )}
             <SkipForward size={24} className="text-white cursor-pointer active:scale-90 transition drop-shadow" fill="currentColor"/>
           </div>
        </div>

        {/* 右側：黑膠與唱針 */}
        <div className="w-[45%] h-full relative flex items-center justify-center">
           
           {/* 黑膠唱片 (稍微超出右邊界一點點，更有張力) */}
           <div className={`
              w-36 h-36 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/10
              ${isPlaying ? 'vinyl-spin' : 'vinyl-spin-paused'}
              relative z-0 mr-4
           `}>
              {/* 唱片本體：深藍色大理石紋 */}
              <div className="absolute inset-0 rounded-full bg-slate-900" 
                   style={{background: 'radial-gradient(circle, #222 0%, #111 100%)'}}></div>
              {/* 紋路 */}
              <div className="absolute inset-0 rounded-full opacity-30" 
                   style={{background: 'repeating-radial-gradient(transparent 0, transparent 2px, #fff 3px)'}}></div>
              {/* 封面貼紙 */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 shadow-inner flex items-center justify-center z-10 relative">
                 <div className="w-2 h-2 bg-black rounded-full"></div>
              </div>
           </div>

           {/* 唱針 (Tone Arm) - 錨點在右上角 */}
           <div className={`absolute top-[10px] right-[20px] w-8 h-28 z-20 pointer-events-none tone-arm ${isPlaying ? 'playing' : 'paused'}`}>
              {/* 底座 */}
              <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-[#111] border-2 border-[#444] shadow-xl flex items-center justify-center">
                 <div className="w-3 h-3 bg-[#666] rounded-full"></div>
              </div>
              {/* 臂桿 */}
              <div className="absolute top-4 left-3 w-2 h-20 bg-gradient-to-b from-[#888] to-[#444] rounded-full shadow-lg"></div>
              {/* 唱頭 */}
              <div className="absolute bottom-0 left-2 w-5 h-8 bg-black rounded shadow-md border-b-2 border-white/20"></div>
           </div>
        </div>

        {/* 隱形播放器 */}
        {isPlaying && videoId && (
           <div className="absolute bottom-0 right-0 w-[1px] h-[1px] opacity-10 pointer-events-none">
             <iframe 
               width="100%" height="100%" 
               src={`https://www.youtube.com/embed?listType=search&list=${videoId.split("list=")[1]}&autoplay=1&playsinline=1&controls=0`}
               allow="autoplay; encrypted-media"
               title="Audio"
             ></iframe>
           </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 🧭 導航列
// ==========================================
const Navigation = ({ activeTab, setActiveTab, isDark }) => {
  return (
    <div className={`fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-4 backdrop-blur-xl border-t shadow-[0_-5px_20px_rgba(0,0,0,0.1)] ${isDark ? 'bg-[#202130]/90 border-white/5' : 'bg-[#D0D3EC]/90 border-white/20'}`}>
      <div className="flex justify-around items-center max-w-lg mx-auto">
        <NavIcon icon={Edit3} label="續寫" active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} />
        <NavIcon icon={Sparkles} label="生成器" active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} />
        <NavIcon icon={User} label="我" active={activeTab === 'me'} onClick={() => setActiveTab('me')} />
      </div>
    </div>
  );
};

const NavIcon = ({ icon: Icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 ${active ? 'scale-105' : 'opacity-40 hover:opacity-70'}`}>
    <div className={`p-2.5 rounded-2xl transition-colors ${active ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-transparent text-gray-500'}`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <span className={`text-[10px] font-bold ${active ? 'text-purple-500' : 'text-gray-500'}`}>{label}</span>
  </div>
);

// ==========================================
// 📝 頁面：續寫 (修復版：巨大化輸入框)
// ==========================================
const PageMemo = ({ isDark, apiKey }) => {
  const [note, setNote] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (mode) => {
    if (!apiKey) return alert("請先到「我」設定 API Key！");
    if (!note) return alert("請輸入內容！");
    setIsLoading(true);

    let promptText = "";
    if (mode === "story") promptText = `角色：小說家。任務：續寫以下內容，模仿文風，1500字以上。內容：${note}`;
    else promptText = `角色：編劇。任務：將以下內容改成角色對話劇本。內容：${note}`;

    try {
      // 使用 Gemini 2.5 Flash
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }) }
      );
      const data = await response.json();
      setGeneratedText(data.candidates?.[0]?.content?.parts?.[0]?.text || "生成失敗");
    } catch (error) { alert(`錯誤：${error.message}`); } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-32 h-full flex flex-col">
       <div className="flex items-center gap-2 opacity-60 px-1"><Edit3 size={18}/> <h2 className="text-lg font-bold">筆記續寫</h2></div>
      
      {/* 1. 巨大化輸入框 (佔據 40% 螢幕高度) */}
      <NeuBox isDark={isDark} className="p-4 h-[40vh] flex-shrink-0" pressed>
        <textarea 
          className={`w-full h-full bg-transparent outline-none resize-none text-base leading-relaxed ${isDark ? 'placeholder-gray-600' : 'placeholder-[#8e91af]'}`} 
          placeholder="貼上你的文章 (輸入框已加大，不會再縮成一團了)..." 
          value={note} 
          onChange={(e) => setNote(e.target.value)}
        />
      </NeuBox>

      {/* 2. 操作按鈕 */}
      <div className="flex gap-3 flex-shrink-0">
        <NeuBox isDark={isDark} onClick={() => handleGenerate('story')} className="flex-1 py-4 flex justify-center gap-2 font-bold text-purple-500 active:scale-95 text-sm">
           {isLoading ? <span className="animate-pulse">✨ 運算中...</span> : <><Zap size={18}/> 開始續寫</>}
        </NeuBox>
        <NeuBox isDark={isDark} onClick={() => handleGenerate('dialogue')} className="flex-1 py-4 flex justify-center gap-2 font-bold text-pink-500 active:scale-95 text-sm">
           {isLoading ? <span className="animate-pulse">💬 轉換中...</span> : <><MessageCircle size={18}/> 生成對話</>}
        </NeuBox>
      </div>

      {/* 3. 輸出框 (自動填滿剩餘空間) */}
      {generatedText && (
        <div className="flex-grow animate-slide-up">
           <div className="flex justify-between items-center mb-2 px-2">
             <label className="text-xs font-bold opacity-50">AI 生成結果</label>
             <button onClick={() => setGeneratedText("")} className="text-xs text-red-400 font-bold flex items-center gap-1"><Trash2 size={12}/> 清除</button>
           </div>
           <NeuBox isDark={isDark} className="p-6 min-h-[300px] leading-loose text-justify text-lg whitespace-pre-wrap border-2 border-purple-500/20">
             {generatedText}
           </NeuBox>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 🧠 頁面：萬能生成器 (三區塊版)
// ==========================================
const PageGenerator = ({ isDark, apiKey }) => {
  const [config, setConfig] = useState({ genre: "現代言情", tone: "甜寵輕鬆", world: "", character: "", trope: "", other: "" });
  const [fragment, setFragment] = useState("");
  const [sheetInput, setSheetInput] = useState("");
  const [result, setResult] = useState("");
  const [activeGen, setActiveGen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runGen = async (type, prompt) => {
    if (!apiKey) return alert("請先設定 API Key！");
    setIsLoading(true);
    setActiveGen(type);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
      );
      const data = await response.json();
      setResult(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
    } catch (e) { alert(e.message); } finally { setIsLoading(false); }
  };

  const inputStyle = `w-full bg-transparent outline-none p-2 text-sm border-b ${isDark ? 'border-gray-700 placeholder-gray-600' : 'border-gray-300 placeholder-gray-400'}`;

  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><Sparkles size={18}/> <h2 className="text-lg font-bold">萬能生成中心</h2></div>

       {/* 1. 主生成器 */}
       <section>
         <h3 className="text-xs font-bold opacity-50 mb-2 ml-2">萬能小說開頭生成</h3>
         <NeuBox isDark={isDark} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select value={config.genre} onChange={e=>setConfig({...config, genre:e.target.value})} className={inputStyle}><option>現代言情</option><option>古代架空</option><option>懸疑</option><option>奇幻</option><option>同人</option></select>
              <select value={config.tone} onChange={e=>setConfig({...config, tone:e.target.value})} className={inputStyle}><option>甜寵</option><option>虐心</option><option>搞笑</option><option>正劇</option></select>
            </div>
            <input placeholder="世界觀 (如: ABO, 末世)" value={config.world} onChange={e=>setConfig({...config, world:e.target.value})} className={inputStyle}/>
            <input placeholder="主角 CP (如: 霸總 x 小白兔)" value={config.character} onChange={e=>setConfig({...config, character:e.target.value})} className={inputStyle}/>
            <input placeholder="核心梗 (如: 破鏡重圓)" value={config.trope} onChange={e=>setConfig({...config, trope:e.target.value})} className={inputStyle}/>
            <NeuBox isDark={isDark} onClick={() => runGen('main', `生成小說開頭：${JSON.stringify(config)}`)} className="mt-4 py-3 flex justify-center font-bold text-purple-500 active:scale-95">
              {isLoading && activeGen==='main' ? "生成中..." : <><Zap size={16} className="mr-1"/> 開始創作</>}
            </NeuBox>
         </NeuBox>
       </section>

       {/* 2. 靈感碎片 */}
       <section>
         <h3 className="text-xs font-bold opacity-50 mb-2 ml-2">靈感碎片擴充</h3>
         <NeuBox isDark={isDark} className="p-4" pressed>
            <textarea className="w-full h-24 bg-transparent outline-none resize-none text-sm" placeholder="丟入一些很碎的設定或想法..." value={fragment} onChange={e=>setFragment(e.target.value)}/>
         </NeuBox>
         <NeuBox isDark={isDark} onClick={() => runGen('fragment', `聯想擴充：${fragment}`)} className="mt-2 py-3 flex justify-center font-bold text-blue-500 active:scale-95">
            {isLoading && activeGen==='fragment' ? "聯想中..." : <><List size={16} className="mr-1"/> 幫我聯想設定</>}
         </NeuBox>
       </section>

       {/* 3. 人設表 */}
       <section>
         <h3 className="text-xs font-bold opacity-50 mb-2 ml-2">人設/設定表生成器</h3>
         <NeuBox isDark={isDark} className="p-4" pressed>
            <textarea className="w-full h-24 bg-transparent outline-none resize-none text-sm" placeholder="輸入模糊的想法，整理成表格..." value={sheetInput} onChange={e=>setSheetInput(e.target.value)}/>
         </NeuBox>
         <NeuBox isDark={isDark} onClick={() => runGen('sheet', `整理成Markdown設定表：${sheetInput}`)} className="mt-2 py-3 flex justify-center font-bold text-green-500 active:scale-95">
            {isLoading && activeGen==='sheet' ? "整理中..." : <><Table size={16} className="mr-1"/> 生成設定表</>}
         </NeuBox>
       </section>

       {result && (
         <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           <NeuBox isDark={isDark} className="w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 relative shadow-2xl">
             <button onClick={()=>setResult("")} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full"><Trash2 size={16}/></button>
             <h3 className="font-bold mb-4 text-purple-500">生成結果</h3>
             <div className="whitespace-pre-wrap leading-relaxed">{result}</div>
           </NeuBox>
         </div>
       )}
    </div>
  );
};

// ==========================================
// 頁面：我
// ==========================================
const PageMe = ({ isDark, apiKey, setApiKey, themeMode, toggleTheme }) => {
  const [showInput, setShowInput] = useState(false);
  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><User size={18}/> <h2 className="text-lg font-bold">我的</h2></div>
       
       <VinylWidget isDark={isDark} />

       <div className="space-y-4">
          <NeuBox isDark={isDark} className="p-4 flex justify-between" onClick={toggleTheme}>
            <span className="font-bold text-sm">外觀主題 ({themeMode})</span>
            {themeMode==='dark' ? <Moon size={18}/> : <Sun size={18}/>}
          </NeuBox>
          <NeuBox isDark={isDark} className="p-4" onClick={() => setShowInput(!showInput)}>
            <div className="flex justify-between"><span className="font-bold text-sm">API Key 設定</span><Key size={18}/></div>
            {showInput && <input type="password" value={apiKey} onChange={e=>{setApiKey(e.target.value);localStorage.setItem("gemini_key",e.target.value)}} className="w-full mt-2 bg-transparent border-b outline-none text-sm font-mono"/>}
          </NeuBox>
       </div>
    </div>
  );
};

// ==========================================
// Main App
// ==========================================
const App = () => {
  const [activeTab, setActiveTab] = useState("memo");
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
  const [themeMode, setThemeMode] = useState(localStorage.getItem("theme_mode") || "system");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => (themeMode === "system" ? window.matchMedia('(prefers-color-scheme: dark)').matches : themeMode === "dark");
    setIsDark(check());
    const q = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if(themeMode==="system") setIsDark(q.matches); };
    q.addEventListener('change', handler); return () => q.removeEventListener('change', handler);
  }, [themeMode]);

  const toggleTheme = () => {
    const modes = ["system", "light", "dark"];
    const next = modes[(modes.indexOf(themeMode) + 1) % modes.length];
    setThemeMode(next); localStorage.setItem("theme_mode", next);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 p-6 font-sans relative overflow-x-hidden ${isDark ? 'bg-[#202130] text-gray-200' : 'bg-[#D0D3EC] text-[#5b5d7e]'}`}>
      <div className="mb-4 text-center mt-2">
          <h1 className="text-2xl font-black text-purple-600 tracking-tight">MemoLive</h1>
          <p className="text-[10px] font-bold opacity-40 tracking-[0.2em]">ULTIMATE PRO</p>
      </div>

      <div className="max-w-md mx-auto h-full">
        {activeTab === 'memo' && <PageMemo isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'generator' && <PageGenerator isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'me' && <PageMe isDark={isDark} apiKey={apiKey} setApiKey={setApiKey} themeMode={themeMode} toggleTheme={toggleTheme} />}
      </div>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
    </div>
  );
};

export default App;