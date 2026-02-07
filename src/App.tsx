import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Settings, Music, Trash2, Moon, Sun, Monitor, Zap, Edit3, User, Disc, Play, Pause, Search, Link as LinkIcon, Feather, Map, UserCheck, Key, Eye, MessageCircle, List, Table } from 'lucide-react';

// --- CSS for Animations ---
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
    transform: rotate(25deg);
  }
  .tone-arm.paused {
    transform: rotate(0deg);
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
        ${className} transition-all duration-200 ease-out rounded-[20px]
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
// 🎵 黑膠唱片機 (修復聲音版)
// ==========================================
const VinylCard = ({ isDark }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicInput, setMusicInput] = useState("");
  const [videoId, setVideoId] = useState("");

  const handlePlay = () => {
    if (!musicInput) return alert("請輸入歌名！");
    
    // 自動加上 lyrics 以避免鎖區，並搜尋 video
    const query = encodeURIComponent(musicInput + " lyrics audio");
    // 使用 searchbox 模式，這是最簡單的免 API Key 播放方式
    // 強制 autoplay=1
    const id = `searchbox?listType=search&list=${query}`;
    
    setVideoId(id);
    setIsPlaying(true);
  };

  return (
    <div className="w-full">
      <style>{styles}</style>
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

        {/* 唱針 */}
        <div className={`absolute top-4 left-[110px] w-24 h-4 z-10 pointer-events-none tone-arm ${isPlaying ? 'playing' : 'paused'}`}>
           <div className="w-full h-1 bg-gray-400 rounded-full origin-right shadow-sm rotate-12"></div>
           <div className="absolute right-0 top-[-4px] w-4 h-4 rounded-full bg-gray-500 shadow-inner"></div>
           <div className="absolute left-0 top-[-2px] w-3 h-6 bg-gray-600 rounded-sm"></div>
        </div>

        {/* 右側：控制區 */}
        <div className="flex-1 flex flex-col justify-center gap-3 z-0 pl-4">
           <div className={`flex items-center gap-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-300'} pb-1`}>
             <Search size={14} className="opacity-40"/>
             <input type="text" placeholder="輸入歌名 (如: aespa Drama)" value={musicInput} onChange={e=>setMusicInput(e.target.value)} className="w-full bg-transparent outline-none text-sm font-bold opacity-80"/>
           </div>
           
           <div className="flex items-center gap-4 mt-1">
              <button onClick={handlePlay} className={`p-3 rounded-full active:scale-95 ${isDark ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'} shadow-lg`}>
                <Play size={18} fill="currentColor" />
              </button>
              <button onClick={() => setIsPlaying(false)} className={`p-3 rounded-full active:scale-95 ${isDark ? 'bg-gray-700' : 'bg-white'} shadow`}>
                <Pause size={18} fill="currentColor" />
              </button>
              {/* 這裡放一個極小的 iframe 確保聲音出來 */}
              {isPlaying && videoId && (
                <div className="w-1 h-1 overflow-hidden opacity-10 absolute bottom-2 right-2">
                   <iframe 
                    width="100%" height="100%" 
                    src={`https://www.youtube.com/embed?listType=search&list=${videoId.split("list=")[1]}&autoplay=1&playsinline=1`}
                    allow="autoplay; encrypted-media"
                    title="Music"
                  ></iframe>
                </div>
              )}
           </div>
        </div>
      </NeuBox>
      <p className="text-[10px] opacity-40 text-center mt-2">提示：若無聲音，請確認手機未靜音，或再按一次播放。</p>
    </div>
  );
};

// ==========================================
// 🧭 導航列 (回歸經典版)
// ==========================================
const Navigation = ({ activeTab, setActiveTab, isDark }) => {
  return (
    <div className={`fixed bottom-0 left-0 w-full z-50 px-4 pb-6 pt-2 backdrop-blur-xl border-t ${isDark ? 'bg-[#202130]/80 border-white/5' : 'bg-[#D0D3EC]/80 border-white/20'}`}>
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

  // 通用生成函數
  const handleGenerate = async (mode) => {
    if (!apiKey) return alert("請先設定 API Key！");
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
      setGeneratedText(data.candidates?.[0]?.content?.parts?.[0]?.text || "生成失敗，請重試。");
    } catch (error) { alert(`錯誤：${error.message}`); } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><Edit3 size={18}/> <h2 className="text-lg font-bold">筆記續寫</h2></div>
      
      {/* 1. 輸入區 */}
      <div>
        <label className="text-xs font-bold opacity-50 mb-2 block pl-2">輸入你的筆記/開頭</label>
        <NeuBox isDark={isDark} className="p-4 h-[200px]" pressed>
          <textarea className={`w-full h-full bg-transparent outline-none resize-none text-base leading-relaxed ${isDark ? 'placeholder-gray-600' : 'placeholder-[#8e91af]'}`} 
            placeholder="在這裡貼上你的文章..." value={note} onChange={(e) => setNote(e.target.value)}/>
        </NeuBox>
      </div>

      {/* 2. 操作按鈕區 */}
      <div className="flex gap-3">
        <NeuBox isDark={isDark} onClick={() => handleGenerate('story')} className="flex-1 py-3 flex justify-center gap-2 font-bold text-purple-500 active:scale-95">
           {isLoading ? <span className="animate-pulse">✨ 運算中...</span> : <><Zap size={18}/> 開始續寫</>}
        </NeuBox>
        <NeuBox isDark={isDark} onClick={() => handleGenerate('dialogue')} className="flex-1 py-3 flex justify-center gap-2 font-bold text-pink-500 active:scale-95">
           {isLoading ? <span className="animate-pulse">💬 轉換中...</span> : <><MessageCircle size={18}/> 生成對話</>}
        </NeuBox>
      </div>

      {/* 3. 輸出區 (分離) */}
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
  const [activeGen, setActiveGen] = useState(null); // 'main', 'fragment', 'sheet'
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

  const genMain = () => runGen('main', `角色：萬能小說生成器。根據設定寫開頭(1200字)：類型${config.genre}, 基調${config.tone}, 世界${config.world}, CP${config.character}, 梗${config.trope}, 要求${config.other}`);
  const genFragment = () => runGen('fragment', `角色：靈感擴充師。請根據以下碎片設定，進行腦力激盪，聯想出 5 個有趣的劇情發展或設定細節：${fragment}`);
  const genSheet = () => runGen('sheet', `角色：資深編輯。請根據以下內容，整理出一份詳細的「人設表」或「世界觀設定表」，請用 Markdown 表格格式輸出：${sheetInput}`);

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
            <NeuBox isDark={isDark} onClick={genMain} className="mt-4 py-3 flex justify-center font-bold text-purple-500 active:scale-95">
              {isLoading && activeGen==='main' ? "生成中..." : <><Zap size={16} className="mr-1"/> 開始創作</>}
            </NeuBox>
         </NeuBox>
       </section>

       {/* 2. 靈感聯想 (大框框 1) */}
       <section>
         <h3 className="text-xs font-bold opacity-50 mb-2 ml-2">靈感碎片擴充</h3>
         <NeuBox isDark={isDark} className="p-4" pressed>
            <textarea className="w-full h-24 bg-transparent outline-none resize-none text-sm" placeholder="丟入一些很碎的設定或想法..." value={fragment} onChange={e=>setFragment(e.target.value)}/>
         </NeuBox>
         <NeuBox isDark={isDark} onClick={genFragment} className="mt-2 py-3 flex justify-center font-bold text-blue-500 active:scale-95">
            {isLoading && activeGen==='fragment' ? "聯想中..." : <><List size={16} className="mr-1"/> 幫我聯想設定</>}
         </NeuBox>
       </section>

       {/* 3. 人設表生成 (大框框 2) */}
       <section>
         <h3 className="text-xs font-bold opacity-50 mb-2 ml-2">人設/設定表生成器</h3>
         <NeuBox isDark={isDark} className="p-4" pressed>
            <textarea className="w-full h-24 bg-transparent outline-none resize-none text-sm" placeholder="輸入模糊的想法，幫你整理成表格..." value={sheetInput} onChange={e=>setSheetInput(e.target.value)}/>
         </NeuBox>
         <NeuBox isDark={isDark} onClick={genSheet} className="mt-2 py-3 flex justify-center font-bold text-green-500 active:scale-95">
            {isLoading && activeGen==='sheet' ? "整理中..." : <><Table size={16} className="mr-1"/> 生成設定表</>}
         </NeuBox>
       </section>

       {/* 結果顯示 */}
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
       <VinylCard isDark={isDark} />
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