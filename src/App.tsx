import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, Zap, Edit3, User, Play, Pause, SkipBack, SkipForward, Search, List, Table, Key, MessageCircle, Trash2, Package, Plus, X } from 'lucide-react';

// --- 動畫與樣式 ---
const styles = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .vinyl-spin { animation: spin 8s linear infinite; }
  .vinyl-spin-paused { animation-play-state: paused; }
  .tone-arm { transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: 16px 16px; z-index: 20; }
  .tone-arm.playing { transform: rotate(35deg); }
  .tone-arm.paused { transform: rotate(0deg); }
`;

// --- NeuBox (基礎風格元件) ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false }) => {
  const lightShadow = pressed || active ? 'shadow-[inset_2px_2px_5px_#aeb1cb,inset_-2px_-2px_5px_#ffffff] scale-[0.99]' : 'shadow-[5px_5px_10px_#aeb1cb,-5px_-5px_10px_#ffffff] hover:scale-[1.005]';
  const darkShadow = pressed || active ? 'shadow-[inset_2px_2px_5px_#161722,inset_-2px_-2px_5px_#2a2c40] scale-[0.99]' : 'shadow-[5px_5px_10px_#161722,-5px_-5px_10px_#2a2c40] hover:scale-[1.005]';
  return (
    <div onClick={onClick} className={`${className} transition-all duration-200 ease-out rounded-[24px] ${isDark ? 'bg-[#202130]' : 'bg-[#D0D3EC]'} ${active ? (isDark ? 'text-purple-400' : 'text-purple-600') : (isDark ? 'text-gray-400' : 'text-gray-500')} ${isDark ? darkShadow : lightShadow} ${onClick ? 'cursor-pointer' : ''}`}>
      {children}
    </div>
  );
};

// --- 全域播放器邏輯 ---
const useMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicInput, setMusicInput] = useState("");
  const [videoId, setVideoId] = useState("");
  const [currentTitle, setCurrentTitle] = useState("等待播放");

  const playMusic = (keyword) => {
    if (!keyword) return;
    setCurrentTitle(keyword);
    let id = "";
    if (keyword.includes("youtube.com") || keyword.includes("youtu.be")) {
       try { const url = new URL(keyword); id = url.searchParams.get("v") || url.pathname.split("/").pop(); } catch (e) { id = `searchbox?listType=search&list=${encodeURIComponent(keyword)}`; }
    } else {
       id = `searchbox?listType=search&list=${encodeURIComponent(keyword + " lyrics audio")}&sp=EgIQAQ%253D%253D`;
    }
    setVideoId(id);
    setIsPlaying(true);
  };
  const togglePlay = () => setIsPlaying(!isPlaying);
  return { isPlaying, setIsPlaying, musicInput, setMusicInput, videoId, currentTitle, playMusic, togglePlay };
};

// --- 黑膠唱片元件 ---
const VinylWidget = ({ player, isDark }) => {
  const { isPlaying, musicInput, setMusicInput, currentTitle, playMusic, togglePlay } = player;
  return (
    <div className="w-full relative select-none">
      <style>{styles}</style>
      <div className={`relative h-44 w-full rounded-[30px] overflow-hidden flex shadow-xl border border-white/5 ${isDark ? 'bg-gradient-to-br from-[#2a2b3d] to-[#1a1b26]' : 'bg-gradient-to-br from-[#8E94B6] to-[#686D8B]'}`}>
        <div className="w-[55%] h-full p-5 flex flex-col justify-between z-10 pl-6">
           <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 border-b border-white/20 pb-1 w-full">
                <Search size={14} className="text-white/50"/>
                <input type="text" placeholder="搜歌或是貼連結..." value={musicInput} onChange={e=>setMusicInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && playMusic(musicInput)} className="bg-transparent outline-none text-sm font-bold text-white placeholder-white/30 w-full"/>
             </div>
             <div><h2 className="text-lg font-black text-white leading-tight line-clamp-2 drop-shadow-md tracking-wide">{currentTitle}</h2><p className="text-[10px] text-purple-300 font-bold tracking-widest mt-1 uppercase">{isPlaying ? "Now Playing" : "Ready"}</p></div>
           </div>
           <div className="flex items-center gap-4">
             <SkipBack size={24} className="text-white/70 cursor-pointer active:scale-90" fill="currentColor"/>
             <div onClick={togglePlay} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center cursor-pointer active:scale-90 shadow-lg border border-white/10">{isPlaying ? <Pause size={24} className="text-white" fill="currentColor"/> : <Play size={24} className="text-white ml-1" fill="currentColor"/>}</div>
             <SkipForward size={24} className="text-white/70 cursor-pointer active:scale-90" fill="currentColor"/>
           </div>
        </div>
        <div className="w-[45%] h-full relative flex items-center justify-center">
           <div className={`w-36 h-36 rounded-full shadow-2xl flex items-center justify-center border-[4px] border-[#111] ${isPlaying ? 'vinyl-spin' : 'vinyl-spin-paused'} relative z-0 mr-4 bg-[#111]`}>
              <div className="absolute inset-0 rounded-full opacity-40" style={{background: 'repeating-radial-gradient(#222 0, #222 2px, #333 3px, #333 4px)'}}></div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-inner flex items-center justify-center z-10 relative"><div className="w-2 h-2 bg-black rounded-full"></div></div>
           </div>
           <div className={`absolute top-[10px] right-[20px] w-8 h-28 z-20 pointer-events-none tone-arm ${isPlaying ? 'playing' : 'paused'}`}>
              <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-[#333] shadow-xl flex items-center justify-center"><div className="w-2 h-2 bg-[#555] rounded-full"></div></div>
              <div className="absolute top-4 left-3 w-1.5 h-20 bg-gradient-to-b from-[#666] to-[#333] rounded-full"></div>
              <div className="absolute bottom-0 left-2 w-4 h-6 bg-black rounded shadow-md border-b border-white/20"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- 迷你播放條 ---
const MiniPlayer = ({ player, isDark, onClick }) => {
  const { isPlaying, currentTitle, togglePlay } = player;
  if (!isPlaying && currentTitle === "等待播放") return null;
  return (
    <div onClick={onClick} className={`fixed bottom-[90px] left-4 right-4 z-40 p-3 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-md border border-white/10 ${isDark ? 'bg-[#2a2b3d]/95' : 'bg-[#686D8B]/95'} animate-slide-up cursor-pointer`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0 border-2 border-purple-500/50 ${isPlaying ? 'animate-spin' : ''}`} style={{animationDuration: '3s'}}>
          <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500"></div>
        </div>
        <div className="flex flex-col overflow-hidden"><span className="text-xs font-bold text-white truncate max-w-[180px]">{currentTitle}</span><span className="text-[10px] text-purple-300 opacity-80">點擊回到播放器</span></div>
      </div>
      <div className="flex items-center gap-3 pr-2">
        <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 border border-white/10">
           {isPlaying ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor" className="ml-0.5"/>}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 🧭 新版導航列 (4個分頁 & 新材質圖示)
// ==========================================
const Navigation = ({ activeTab, setActiveTab, isDark }) => (
  <div className={`fixed bottom-0 left-0 w-full z-50 px-4 pb-6 pt-3 backdrop-blur-xl border-t shadow-[0_-5px_20px_rgba(0,0,0,0.1)] ${isDark ? 'bg-[#202130]/90 border-white/5' : 'bg-[#D0D3EC]/90 border-white/20'}`}>
    <div className="flex justify-between items-center max-w-lg mx-auto">
      <NavIcon icon={Edit3} label="續寫" active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} isDark={isDark} />
      <NavIcon icon={Sparkles} label="生成器" active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} isDark={isDark} />
      {/* 新增的靈感庫按鈕 */}
      <NavIcon icon={Package} label="靈感庫" active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} isDark={isDark} />
      <NavIcon icon={User} label="我" active={activeTab === 'me'} onClick={() => setActiveTab('me')} isDark={isDark} />
    </div>
  </div>
);

// ✨✨✨ 核心修改：全新材質的導航圖示 ✨✨✨
const NavIcon = ({ icon: Icon, label, active, onClick, isDark }) => {
  // 定義啟動時的「糖果/立體/發光」材質樣式
  // 使用多重陰影 (box-shadow) 來模擬 3D 光影和內部發光
  const activeStyle = `
    bg-gradient-to-br from-purple-400 to-indigo-500 
    text-white 
    shadow-[inset_0px_2px_3px_rgba(255,255,255,0.4),inset_0px_-2px_3px_rgba(0,0,0,0.2),0px_4px_10px_rgba(139,92,246,0.5)]
    transform -translate-y-1
  `;
  const inactiveStyle = `bg-transparent ${isDark ? 'text-gray-500' : 'text-gray-400/80'} hover:bg-gray-500/10`;

  return (
    <div onClick={onClick} className={`flex flex-col items-center gap-1 cursor-pointer group min-w-[60px]`}>
      <div className={`p-2.5 rounded-2xl transition-all duration-300 ease-out ${active ? activeStyle : inactiveStyle}`}>
        {/* 圖示本身也加上一點濾鏡，讓它看起來更融合 */}
        <Icon size={24} strokeWidth={2.5} className={active ? 'drop-shadow-sm' : ''} />
      </div>
      <span className={`text-[10px] font-bold transition-colors duration-300 ${active ? 'text-purple-500' : isDark ? 'text-gray-600' : 'text-gray-400/70'}`}>{label}</span>
    </div>
  );
};

// ==========================================
// 📦 新頁面：靈感庫 (Idea Vault)
// ==========================================
const PageVault = ({ isDark }) => {
  const [tab, setTab] = useState('snippet'); // snippet, char, world
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('memo_vault') || '[]'); } catch { return []; }
  });
  const [newItemContent, setNewItemContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { localStorage.setItem('memo_vault', JSON.stringify(items)); }, [items]);

  const addItem = () => {
    if (!newItemContent.trim()) return;
    setItems([{ id: Date.now(), type: tab, content: newItemContent, date: new Date().toLocaleDateString() }, ...items]);
    setNewItemContent(''); setIsAdding(false);
  };
  const deleteItem = (id) => setItems(items.filter(i => i.id !== id));

  const filteredItems = items.filter(i => i.type === tab);

  const TabBtn = ({ id, label, icon: Icon }) => (
    <button onClick={() => setTab(id)} className={`flex-1 py-2 flex justify-center items-center gap-1.5 text-sm font-bold rounded-xl transition-all ${tab === id ? (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600') : 'opacity-50'}`}>
      <Icon size={16}/> {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-32 h-full flex flex-col">
       <div className="flex items-center gap-2 opacity-60 px-1"><Package size={18}/> <h2 className="text-lg font-bold">靈感庫</h2></div>
       
       {/* 分類標籤 */}
       <NeuBox isDark={isDark} className="p-2 flex gap-2">
         <TabBtn id="snippet" label="碎片" icon={List} />
         <TabBtn id="char" label="人設" icon={User} />
         <TabBtn id="world" label="設定" icon={Sparkles} />
       </NeuBox>

       {/* 新增區塊 */}
       {isAdding ? (
          <div className="animate-fade-in">
            <NeuBox isDark={isDark} className="p-3 mb-3" pressed>
              <textarea autoFocus className={`w-full h-24 bg-transparent outline-none resize-none text-sm ${isDark?'placeholder-gray-600':'placeholder-[#8e91af]'}`} placeholder={`輸入新的${tab === 'snippet' ? '靈感碎片' : tab === 'char' ? '角色設定' : '世界觀'}...`} value={newItemContent} onChange={e=>setNewItemContent(e.target.value)}/>
            </NeuBox>
            <div className="flex gap-2">
               <NeuBox isDark={isDark} onClick={addItem} className="flex-1 py-2 flex justify-center font-bold text-purple-500 active:scale-95 text-sm">儲存</NeuBox>
               <NeuBox isDark={isDark} onClick={()=>setIsAdding(false)} className="py-2 px-4 flex justify-center font-bold text-gray-400 active:scale-95"><X size={18}/></NeuBox>
            </div>
          </div>
       ) : (
         <NeuBox isDark={isDark} onClick={()=>setIsAdding(true)} className="py-3 flex justify-center items-center gap-2 font-bold text-purple-500 opacity-80 active:scale-95 text-sm border-2 border-dashed border-purple-500/30">
           <Plus size={18}/> 新增{tab === 'snippet' ? '靈感' : tab === 'char' ? '人設' : '設定'}
         </NeuBox>
       )}

       {/* 列表區塊 */}
       <div className="flex-grow overflow-y-auto space-y-3 pb-4">
         {filteredItems.length === 0 && !isAdding && <div className="text-center opacity-40 text-sm mt-10 font-bold">這裡空空如也...</div>}
         {filteredItems.map(item => (
           <NeuBox key={item.id} isDark={isDark} className="p-4 relative group animate-slide-up">
             <div className="whitespace-pre-wrap text-sm leading-relaxed">{item.content}</div>
             <div className="flex justify-between items-center mt-3 opacity-50">
               <span className="text-[10px] font-bold">{item.date}</span>
               <button onClick={(e)=>{e.stopPropagation(); deleteItem(item.id)}} className="p-1.5 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"><Trash2 size={14}/></button>
             </div>
           </NeuBox>
         ))}
       </div>
    </div>
  );
};


// --- 頁面: 續寫 ---
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
        <div className="flex-grow animate-slide-up overflow-y-auto">
           <div className="flex justify-between items-center mb-2 px-2 sticky top-0 bg-inherit/80 backdrop-blur-sm py-2 z-10"><label className="text-xs font-bold opacity-50">AI 結果</label><button onClick={() => setGeneratedText("")} className="text-xs text-red-400 font-bold flex items-center gap-1"><Trash2 size={12}/> 清除</button></div>
           <NeuBox isDark={isDark} className="p-6 min-h-[300px] leading-loose text-justify text-lg whitespace-pre-wrap border-2 border-purple-500/20">{generatedText}</NeuBox>
        </div>
      )}
    </div>
  );
};

// --- 頁面: 生成器 ---
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

// --- 頁面: 我 ---
const PageMe = ({ isDark, apiKey, setApiKey, themeMode, toggleTheme, player }) => {
  const [showInput, setShowInput] = useState(false);
  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><User size={18}/> <h2 className="text-lg font-bold">我的</h2></div>
       <VinylWidget player={player} isDark={isDark} />
       <div className="space-y-4">
          <NeuBox isDark={isDark} className="p-4 flex justify-between" onClick={toggleTheme}><span className="font-bold text-sm">主題 ({themeMode})</span>{themeMode==='dark' ? <Moon size={18}/> : <Sun size={18}/>}</NeuBox>
          <NeuBox isDark={isDark} className="p-4" onClick={() => setShowInput(!showInput)}><div className="flex justify-between"><span className="font-bold text-sm">API Key</span><Key size={18}/></div>{showInput && <input type="password" value={apiKey} onChange={e=>{setApiKey(e.target.value);localStorage.setItem("gemini_key",e.target.value)}} className="w-full mt-2 bg-transparent border-b outline-none text-sm font-mono"/>}</NeuBox>
       </div>
    </div>
  );
};

// --- 主程式 ---
const App = () => {
  const [activeTab, setActiveTab] = useState("memo");
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
  const [themeMode, setThemeMode] = useState(localStorage.getItem("theme_mode") || "system");
  const [isDark, setIsDark] = useState(false);
  const player = useMusicPlayer();

  useEffect(() => { const check = () => (themeMode === "system" ? window.matchMedia('(prefers-color-scheme: dark)').matches : themeMode === "dark"); setIsDark(check()); }, [themeMode]);
  const toggleTheme = () => { const next = ["system", "light", "dark"][(["system", "light", "dark"].indexOf(themeMode) + 1) % 3]; setThemeMode(next); localStorage.setItem("theme_mode", next); };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans relative overflow-x-hidden ${isDark ? 'bg-[#202130] text-gray-200' : 'bg-[#D0D3EC] text-[#5b5d7e]'}`}>
      <div className="pt-8 pb-4 text-center px-4"><h1 className="text-2xl font-black text-purple-600 tracking-tight">MemoLive</h1><p className="text-[10px] font-bold opacity-40 tracking-[0.2em]">ULTIMATE</p></div>
      {player.isPlaying && player.videoId && (<div className="absolute bottom-0 right-0 w-[1px] h-[1px] opacity-10 pointer-events-none"><iframe width="100%" height="100%" src={`https://www.youtube.com/embed?listType=search&list=${player.videoId.split("list=")[1]}&autoplay=1&playsinline=1&controls=0`} allow="autoplay; encrypted-media"></iframe></div>)}
      <div className="max-w-md mx-auto h-full px-4">
        {activeTab === 'memo' && <PageMemo isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'generator' && <PageGenerator isDark={isDark} apiKey={apiKey} />}
        {/* 新增的頁面組件 */}
        {activeTab === 'vault' && <PageVault isDark={isDark} />}
        {activeTab === 'me' && <PageMe isDark={isDark} apiKey={apiKey} setApiKey={setApiKey} themeMode={themeMode} toggleTheme={toggleTheme} player={player} />}
      </div>
      {activeTab !== 'me' && <MiniPlayer player={player} isDark={isDark} onClick={() => setActiveTab('me')} />}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
    </div>
  );
};
export default App;