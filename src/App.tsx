import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Settings, Music, Trash2, Moon, Sun, Monitor, Zap, Edit3, User, Play, Pause, SkipBack, SkipForward, Search, List, Table, Key, MessageCircle } from 'lucide-react';

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
    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: 12px 12px; /* 旋轉軸心 */
  }
  .tone-arm.playing {
    transform: rotate(35deg); /* 移到唱片上 */
  }
  .tone-arm.paused {
    transform: rotate(0deg); /* 回歸原位 */
  }

  /* 隱藏但技術上可見的播放器 (iOS 繞過大法) */
  .ios-hidden-player {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 1px;
    height: 1px;
    opacity: 0.01; /* 不能是 0，iOS 會擋 */
    pointer-events: none;
    z-index: -1;
  }
`;

// --- UI Component: NeuBox ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false }) => {
  const lightShadow = pressed || active
    ? 'shadow-[inset_2px_2px_5px_#aeb1cb,inset_-2px_-2px_5px_#ffffff] scale-[0.98]'
    : 'shadow-[5px_5px_10px_#aeb1cb,-5px_-5px_10px_#ffffff] hover:scale-[1.005]';
  const darkShadow = pressed || active
    ? 'shadow-[inset_2px_2px_5px_#161722,inset_-2px_-2px_5px_#2a2c40] scale-[0.98]'
    : 'shadow-[5px_5px_10px_#161722,-5px_-5px_10px_#2a2c40] hover:scale-[1.005]';

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
// 🎵 真・黑膠唱片機 (還原 Vinyl Widget 介面)
// ==========================================
const VinylWidget = ({ isDark }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicInput, setMusicInput] = useState("");
  const [videoId, setVideoId] = useState("");
  const [currentTitle, setCurrentTitle] = useState("未播放");
  const [status, setStatus] = useState("等待啟動");

  const handlePlay = () => {
    if (!musicInput) {
       // 如果沒有輸入，預設播一首 aespa (示範用)
       setMusicInput("aespa Drama");
       handleSearchAndPlay("aespa Drama");
       return;
    }
    handleSearchAndPlay(musicInput);
  };

  const handleSearchAndPlay = (keyword) => {
    setStatus("載入中...");
    setCurrentTitle(keyword);
    // 加上 lyrics audio 關鍵字避開鎖區 MV
    const query = encodeURIComponent(keyword + " lyrics audio");
    // 使用 searchbox 模式 + 強制 autoplay
    const id = `searchbox?listType=search&list=${query}`;
    setVideoId(id);
    setIsPlaying(true);
    setStatus("播放中");
  };

  const handleToggle = () => {
    setIsPlaying(!isPlaying);
    setStatus(isPlaying ? "已暫停" : "播放中");
  };

  return (
    <div className="w-full relative">
      <style>{styles}</style>
      
      {/* 卡片容器：模仿 Vinyl Widget 的寬膠囊造型 */}
      <NeuBox isDark={isDark} className={`relative h-48 w-full overflow-hidden flex ${isDark ? 'bg-gradient-to-br from-[#2b2d42] to-[#1a1b26]' : 'bg-gradient-to-br from-[#E3E6F5] to-[#C4C7E0]'}`}>
        
        {/* 左側：資訊與控制 (佔 50%) */}
        <div className="w-1/2 p-5 flex flex-col justify-between z-10">
           {/* 上方：歌名資訊 */}
           <div>
             <div className="flex items-center gap-1 opacity-50 mb-1">
               <Search size={12}/>
               <input 
                 type="text" 
                 placeholder="輸入歌名..." 
                 value={musicInput} 
                 onChange={e=>setMusicInput(e.target.value)} 
                 className="bg-transparent outline-none text-xs font-bold w-full"
               />
             </div>
             <h2 className={`text-xl font-black leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>
               {currentTitle}
             </h2>
             <p className={`text-xs font-bold mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
               {status}
             </p>
           </div>

           {/* 下方：播放控制鍵 (模仿 Widget 的三顆按鈕) */}
           <div className="flex items-center gap-4 mt-2">
             <SkipBack size={24} className="opacity-50 cursor-pointer active:scale-90 transition" fill="currentColor"/>
             {isPlaying ? (
                <Pause size={32} onClick={handleToggle} className="cursor-pointer active:scale-90 transition drop-shadow-lg" fill="currentColor"/>
             ) : (
                <Play size={32} onClick={handlePlay} className="cursor-pointer active:scale-90 transition drop-shadow-lg" fill="currentColor"/>
             )}
             <SkipForward size={24} className="opacity-50 cursor-pointer active:scale-90 transition" fill="currentColor"/>
           </div>
        </div>

        {/* 右側：黑膠與唱針 (佔 50%) */}
        <div className="w-1/2 relative flex items-center justify-center">
           
           {/* 1. 黑膠唱片 (部分超出邊界是特色，但這裡我們先置中) */}
           {/* 使用 CSS 漸層模擬大理石紋路 */}
           <div className={`
              w-40 h-40 rounded-full shadow-2xl flex items-center justify-center border-[6px] 
              ${isDark ? 'border-[#1a1b26] bg-[#333]' : 'border-[#D0D3EC] bg-[#333]'}
              ${isPlaying ? 'vinyl-spin' : 'vinyl-spin-paused'}
           `}>
              {/* 唱片紋路 */}
              <div className="absolute inset-0 rounded-full opacity-40" 
                   style={{background: `repeating-radial-gradient(#111 0, #111 2px, #222 3px, #222 4px)`}}></div>
              
              {/* 唱片貼紙 (漸層色) */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 shadow-inner flex items-center justify-center z-10">
                 <Music size={20} className="text-white opacity-80"/>
              </div>
           </div>

           {/* 2. 唱針 (Tone Arm) - 放在右上角 */}
           <div className={`absolute top-[-10px] right-[10px] w-8 h-24 z-20 pointer-events-none tone-arm ${isPlaying ? 'playing' : 'paused'}`}>
              {/* 軸心 */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-400 shadow-lg flex items-center justify-center border-2 border-gray-500">
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </div>
              {/* 臂桿 */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full shadow-md"></div>
              {/* 唱頭 */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-7 bg-black rounded shadow-md"></div>
           </div>

        </div>

        {/* 3. 隱形播放器 (iOS 破解關鍵) */}
        {/* 必須是 opacity > 0 (0.01) 且有尺寸 (1px)，iOS 才不會擋 */}
        {isPlaying && videoId && (
          <div className="ios-hidden-player">
             <iframe 
               width="100%" height="100%" 
               src={`https://www.youtube.com/embed?listType=search&list=${videoId.split("list=")[1]}&autoplay=1&playsinline=1&controls=0`}
               allow="autoplay; encrypted-media"
               title="Audio Engine"
             ></iframe>
          </div>
        )}

      </NeuBox>
    </div>
  );
};

// ==========================================
// 🧭 導航列 (經典版)
// ==========================================
const Navigation = ({ activeTab, setActiveTab, isDark }) => {
  return (
    <div className={`fixed bottom-0 left-0 w-full z-50 px-4 pb-6 pt-2 backdrop-blur-xl border-t ${isDark ? 'bg-[#202130]/90 border-white/5' : 'bg-[#D0D3EC]/90 border-white/20'}`}>
      <div className="flex justify-around items-center max-w-md mx-auto">
        <NavIcon icon={Edit3} label="續寫" active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} />
        <NavIcon icon={Sparkles} label="生成器" active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} />
        <NavIcon icon={User} label="我" active={activeTab === 'me'} onClick={() => setActiveTab('me')} />
      </div>
    </div>
  );
};

const NavIcon = ({ icon: Icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 ${active ? 'scale-105' : 'opacity-40 hover:opacity-70'}`}>
    <div className={`p-2 rounded-xl ${active ? 'bg-purple-500/10' : ''}`}>
      <Icon size={24} className={active ? 'text-purple-500' : 'text-gray-500'} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className={`text-[10px] font-bold ${active ? 'text-purple-500' : 'text-gray-500'}`}>{label}</span>
  </div>
);

// ==========================================
// 📝 頁面：續寫 (分離視窗 + 對話模式)
// ==========================================
const PageMemo = ({ isDark, apiKey }) => {
  const [note, setNote] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (mode) => {
    if (!apiKey) return alert("請先在「我」的頁面設定 API Key！");
    if (!note) return alert("請先輸入內容！");
    setIsLoading(true);

    let promptText = "";
    if (mode === "story") {
      promptText = `角色：頂級小說家。任務：續寫以下內容，模仿其文風，續寫1500字以上。內容：${note}`;
    } else {
      promptText = `角色：劇本對話大師。任務：將以下內容發展成一段精彩的「角色對話劇本」，包含動作描寫與神態。內容：${note}`;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }) }
      );
      const data = await response.json();
      setGeneratedText(data.candidates?.[0]?.content?.parts?.[0]?.text || "生成失敗");
    } catch (error) { alert(`錯誤：${error.message}`); } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><Edit3 size={18}/> <h2 className="text-lg font-bold">筆記續寫</h2></div>
      
      {/* 上方：輸入框 */}
      <NeuBox isDark={isDark} className="p-4 h-[180px]" pressed>
        <textarea className={`w-full h-full bg-transparent outline-none resize-none text-base leading-relaxed ${isDark ? 'placeholder-gray-600' : 'placeholder-[#8e91af]'}`} 
          placeholder="在這裡貼上你的文章..." value={note} onChange={(e) => setNote(e.target.value)}/>
      </NeuBox>

      {/* 中間：按鈕 */}
      <div className="flex gap-3">
        <NeuBox isDark={isDark} onClick={() => handleGenerate('story')} className="flex-1 py-3 flex justify-center gap-2 font-bold text-purple-500 active:scale-95">
           {isLoading ? <span className="animate-pulse">✨ 運算中...</span> : <><Zap size={18}/> 開始續寫</>}
        </NeuBox>
        <NeuBox isDark={isDark} onClick={() => handleGenerate('dialogue')} className="flex-1 py-3 flex justify-center gap-2 font-bold text-pink-500 active:scale-95">
           {isLoading ? <span className="animate-pulse">💬 轉換中...</span> : <><MessageCircle size={18}/> 生成對話</>}
        </NeuBox>
      </div>

      {/* 下方：輸出框 */}
      {generatedText && (
        <div className="animate-slide-up">
           <div className="flex justify-between items-center mb-2 px-2">
             <label className="text-xs font-bold opacity-50">AI 生成結果</label>
             <button onClick={() => setGeneratedText("")} className="text-xs text-red-400 font-bold flex items-center gap-1"><Trash2 size={10}/> 清除</button>
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

       {/* 2. 靈感碎片 (大框框 1) */}
       <section>
         <h3 className="text-xs font-bold opacity-50 mb-2 ml-2">靈感碎片擴充</h3>
         <NeuBox isDark={isDark} className="p-4" pressed>
            <textarea className="w-full h-24 bg-transparent outline-none resize-none text-sm" placeholder="丟入一些很碎的設定或想法..." value={fragment} onChange={e=>setFragment(e.target.value)}/>
         </NeuBox>
         <NeuBox isDark={isDark} onClick={() => runGen('fragment', `聯想擴充：${fragment}`)} className="mt-2 py-3 flex justify-center font-bold text-blue-500 active:scale-95">
            {isLoading && activeGen==='fragment' ? "聯想中..." : <><List size={16} className="mr-1"/> 幫我聯想設定</>}
         </NeuBox>
       </section>

       {/* 3. 人設表 (大框框 2) */}
       <section>
         <h3 className="text-xs font-bold opacity-50 mb-2 ml-2">人設/設定表生成器</h3>
         <NeuBox isDark={isDark} className="p-4" pressed>
            <textarea className="w-full h-24 bg-transparent outline-none resize-none text-sm" placeholder="輸入模糊的想法，整理成表格..." value={sheetInput} onChange={e=>setSheetInput(e.target.value)}/>
         </NeuBox>
         <NeuBox isDark={isDark} onClick={() => runGen('sheet', `整理成Markdown設定表：${sheetInput}`)} className="mt-2 py-3 flex justify-center font-bold text-green-500 active:scale-95">
            {isLoading && activeGen==='sheet' ? "整理中..." : <><Table size={16} className="mr-1"/> 生成設定表</>}
         </NeuBox>
       </section>

       {/* 結果彈窗 */}
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
       
       {/* 全新還原版 Vinyl Widget */}
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
  const [activeTab, setActiveTab] = useState("me"); // 預設先看「我」頁面的新播放器
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
      <div className="mb-6 text-center mt-2">
          <h1 className="text-2xl font-black text-purple-600 tracking-tight">MemoLive</h1>
          <p className="text-[10px] font-bold opacity-40 tracking-[0.2em]">ULTIMATE GENERATOR</p>
      </div>

      <div className="max-w-md mx-auto">
        {activeTab === 'memo' && <PageMemo isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'generator' && <PageGenerator isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'me' && <PageMe isDark={isDark} apiKey={apiKey} setApiKey={setApiKey} themeMode={themeMode} toggleTheme={toggleTheme} />}
      </div>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
    </div>
  );
};

export default App;