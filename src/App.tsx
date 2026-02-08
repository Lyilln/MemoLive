import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Edit3, User, Play, Pause, SkipBack, SkipForward, Search, List, Table, Key, MessageCircle, Trash2, Package, Plus, X, ChevronLeft, Share2, MoreHorizontal, Send, Zap } from 'lucide-react';

// --- Styles ---
const styles = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .vinyl-spin { animation: spin 8s linear infinite; }
  .vinyl-spin-paused { animation-play-state: paused; }
  .tone-arm { transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: 16px 16px; z-index: 20; }
  .tone-arm.playing { transform: rotate(35deg); }
  .tone-arm.paused { transform: rotate(0deg); }
  @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
  /* 隱藏 YouTube 播放器但保持運作 */
  #youtube-player-hidden { position: absolute; top: -1000px; left: -1000px; width: 1px; height: 1px; opacity: 0.01; pointer-events: none; }
`;

// --- NeuBox ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false }) => {
  const lightShadow = pressed || active ? 'shadow-[inset_2px_2px_5px_#aeb1cb,inset_-2px_-2px_5px_#ffffff] scale-[0.99]' : 'shadow-[5px_5px_10px_#aeb1cb,-5px_-5px_10px_#ffffff] hover:scale-[1.005]';
  const darkShadow = pressed || active ? 'shadow-[inset_2px_2px_5px_#161722,inset_-2px_-2px_5px_#2a2c40] scale-[0.99]' : 'shadow-[5px_5px_10px_#161722,-5px_-5px_10px_#2a2c40] hover:scale-[1.005]';
  return (
    <div onClick={onClick} className={`${className} transition-all duration-200 ease-out rounded-[24px] ${isDark ? 'bg-[#202130]' : 'bg-[#D0D3EC]'} ${active ? (isDark ? 'text-purple-400' : 'text-purple-600') : (isDark ? 'text-gray-400' : 'text-gray-500')} ${isDark ? darkShadow : lightShadow} ${onClick ? 'cursor-pointer' : ''}`}>
      {children}
    </div>
  );
};

// --- YouTube API Hook (正規軍) ---
const useYouTubeAPI = () => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("等待播放");

  useEffect(() => {
    // 載入 YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // 定義 API Ready callback
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('youtube-player-hidden', {
        height: '1',
        width: '1',
        videoId: '', // 初始為空
        playerVars: {
          'playsinline': 1,
          'controls': 0,
        },
        events: {
          'onStateChange': (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
            if (event.data === window.YT.PlayerState.ENDED) setIsPlaying(false);
          }
        }
      });
      setPlayer(newPlayer);
    };
  }, []);

  const playVideo = (keyword) => {
    if (!player || !keyword) return;
    setCurrentTitle(keyword);
    
    // 簡單判斷 ID
    let id = "";
    if (keyword.includes("v=")) {
        id = keyword.split("v=")[1]?.split("&")[0];
    } else if (keyword.includes("youtu.be/")) {
        id = keyword.split("youtu.be/")[1]?.split("?")[0];
    } else {
        // 如果是關鍵字，正規 API 無法直接搜尋播放，需要先轉 ID。
        // 這裡為了演示，如果不是網址，我們先預設播一首 aespa (因為沒後端搜尋 API)
        // 實務上這裡需要一個 Search API，但既然你說「沒聲音」，我們先確保「能播」
        // 如果你輸入的是網址，這裡一定能播！
        alert("請盡量貼上 YouTube 網址以確保播放成功！關鍵字搜尋在無後端情況下較不穩定。");
        return; 
    }

    if(id) {
        player.loadVideoById(id);
    }
  };

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  };

  return { isPlaying, playVideo, togglePlay, currentTitle };
};

// --- Vinyl Widget (使用 API 控制) ---
const VinylWidget = ({ musicState, isDark }) => {
  const { isPlaying, playVideo, togglePlay, currentTitle } = musicState;
  const [input, setInput] = useState("");

  return (
    <div className="w-full relative select-none">
      <style>{styles}</style>
      <div className={`relative h-44 w-full rounded-[30px] overflow-hidden flex shadow-xl border border-white/5 ${isDark ? 'bg-gradient-to-br from-[#2a2b3d] to-[#1a1b26]' : 'bg-gradient-to-br from-[#8E94B6] to-[#686D8B]'}`}>
        <div className="w-[55%] h-full p-5 flex flex-col justify-between z-10 pl-6">
           <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 border-b border-white/20 pb-1 w-full">
                <Search size={14} className="text-white/50"/>
                <input 
                  type="text" 
                  placeholder="貼上 YouTube 網址..." 
                  value={input} 
                  onChange={e=>setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && playVideo(input)}
                  className="bg-transparent outline-none text-sm font-bold text-white placeholder-white/30 w-full"
                />
             </div>
             <div>
               <h2 className="text-lg font-black text-white leading-tight line-clamp-2 drop-shadow-md tracking-wide">{currentTitle}</h2>
               <p className="text-[10px] text-purple-300 font-bold tracking-widest mt-1 uppercase">{isPlaying ? "Playing" : "Ready"}</p>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <SkipBack size={24} className="text-white/70 cursor-pointer active:scale-90" fill="currentColor"/>
             <div onClick={togglePlay} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center cursor-pointer active:scale-90 shadow-lg border border-white/10">
                {isPlaying ? <Pause size={24} className="text-white" fill="currentColor"/> : <Play size={24} className="text-white ml-1" fill="currentColor"/>}
             </div>
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

// --- Chat Interface (Image 7) ---
const ChatInterface = ({ onClose, characterName = "角色" }) => (
  <div className="fixed inset-0 z-[100] bg-[#1a1b23] flex flex-col animate-fade-in">
    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1a1b23]/95 backdrop-blur">
      <button onClick={onClose} className="flex items-center gap-1 text-gray-400 text-sm font-bold"><ChevronLeft size={18}/> 返回稿紙</button>
      <span className="text-white font-bold text-sm">角色實時互動空間</span>
      <div className="flex gap-2 text-gray-400"><div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Share2 size={16}/></div><div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><MoreHorizontal size={16}/></div></div>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-40 space-y-4">
       <div className="w-20 h-20 rounded-2xl border-2 border-white/20 flex items-center justify-center"><MessageCircle size={40} className="text-white"/></div>
       <p className="text-white font-bold tracking-wider text-sm">開始與你的{characterName}進行第一場對話</p>
    </div>
    <div className="p-4 pb-8 bg-[#1a1b23]">
       <div className="bg-[#252630] rounded-3xl p-1 pl-4 flex items-center shadow-lg border border-white/5">
          <input className="flex-1 bg-transparent outline-none text-white text-sm h-12 placeholder-gray-500" placeholder={`輸入你想對${characterName}說的話...`} />
          <button className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white m-1 shadow-lg active:scale-95 transition-transform"><Send size={18} className="ml-0.5"/></button>
       </div>
    </div>
  </div>
);

// --- Navigation ---
const Navigation = ({ activeTab, setActiveTab, isDark }) => (
  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-auto">
    <div className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl border ${isDark ? 'bg-[#202130]/90 border-white/10' : 'bg-[#D0D3EC]/90 border-white/40'}`}>
      <NavIcon icon={Edit3} label="續寫" active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} isDark={isDark} />
      <div className="w-[1px] h-6 bg-gray-500/20"></div>
      <NavIcon icon={Sparkles} label="生成器" active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} isDark={isDark} />
      <div className="w-[1px] h-6 bg-gray-500/20"></div>
      <NavIcon icon={Package} label="靈感庫" active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} isDark={isDark} />
      <div className="w-[1px] h-6 bg-gray-500/20"></div>
      <NavIcon icon={User} label="我" active={activeTab === 'me'} onClick={() => setActiveTab('me')} isDark={isDark} />
    </div>
  </div>
);
const NavIcon = ({ icon: Icon, label, active, onClick, isDark }) => {
  const activeStyle = `bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-[inset_0px_2px_3px_rgba(255,255,255,0.4),inset_0px_-2px_3px_rgba(0,0,0,0.2),0px_4px_10px_rgba(139,92,246,0.5)] transform -translate-y-2 scale-110`;
  const inactiveStyle = `bg-transparent ${isDark ? 'text-gray-500' : 'text-gray-400/80'} hover:bg-gray-500/10`;
  return (
    <div onClick={onClick} className="flex flex-col items-center gap-1 cursor-pointer group w-12">
      <div className={`p-2.5 rounded-2xl transition-all duration-300 ease-out ${active ? activeStyle : inactiveStyle}`}><Icon size={22} strokeWidth={2.5} className={active ? 'drop-shadow-sm' : ''} /></div>
      <span className={`text-[9px] font-bold transition-all duration-300 ${active ? 'text-purple-500 translate-y-0 opacity-100' : 'text-transparent translate-y-2 opacity-0 h-0'}`}>{label}</span>
    </div>
  );
};

// --- Page: Memo (新增大框框) ---
const PageMemo = ({ isDark, apiKey }) => {
  const [note, setNote] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleGenerate = async () => {
    if (!apiKey) return alert("請先設定 API Key！");
    setIsLoading(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: `續寫：${note}` }] }] }) });
      const data = await res.json();
      setGeneratedText(data.candidates?.[0]?.content?.parts?.[0]?.text || "失敗");
    } catch (e) { alert(e.message); } finally { setIsLoading(false); }
  };

  if (showChat) return <ChatInterface onClose={() => setShowChat(false)} />;

  return (
    <div className="space-y-4 animate-fade-in pb-32 h-full flex flex-col">
       <div className="flex items-center gap-2 opacity-60 px-1"><Edit3 size={18}/> <h2 className="text-lg font-bold">筆記續寫</h2></div>
      
      <NeuBox isDark={isDark} className="p-4 h-[35vh] flex-shrink-0" pressed>
        <textarea className={`w-full h-full bg-transparent outline-none resize-none text-base leading-relaxed ${isDark ? 'placeholder-gray-600' : 'placeholder-[#8e91af]'}`} placeholder="貼上你的文章..." value={note} onChange={(e) => setNote(e.target.value)}/>
      </NeuBox>
      
      <div className="flex gap-3 flex-shrink-0">
        <NeuBox isDark={isDark} onClick={handleGenerate} className="flex-1 py-4 flex justify-center gap-2 font-bold text-purple-500 active:scale-95 text-sm">{isLoading ? <span className="animate-pulse">✨...</span> : <><Zap size={18}/> 續寫</>}</NeuBox>
        <NeuBox isDark={isDark} onClick={() => setShowChat(true)} className="flex-1 py-4 flex justify-center gap-2 font-bold text-pink-500 active:scale-95 text-sm"><MessageCircle size={18}/> 對話</NeuBox>
      </div>

      {/* 新增：結果大框框 */}
      <div className="flex-grow flex flex-col min-h-[200px]">
         <NeuBox isDark={isDark} className="flex-grow p-4 relative border-2 border-purple-500/10">
            {generatedText ? <div className="whitespace-pre-wrap leading-relaxed text-sm h-full overflow-y-auto">{generatedText}</div> : <div className="flex items-center justify-center h-full opacity-30 text-xs">AI 續寫內容將顯示於此...</div>}
            {generatedText && <button onClick={()=>setGeneratedText("")} className="absolute top-2 right-2 p-1 bg-red-500/20 text-red-500 rounded"><Trash2 size={12}/></button>}
         </NeuBox>
      </div>
    </div>
  );
};

// --- Page: Generator (新增各區塊結果框) ---
const PageGenerator = ({ isDark, apiKey }) => {
  const [config, setConfig] = useState({ genre: "現代言情", tone: "甜寵輕鬆", world: "", character: "", trope: "", other: "" });
  const [fragment, setFragment] = useState("");
  const [sheetInput, setSheetInput] = useState("");
  const [resMain, setResMain] = useState("");
  const [resFrag, setResFrag] = useState("");
  const [resSheet, setResSheet] = useState("");
  const [loading, setLoading] = useState(null);

  const runGen = async (type, prompt, setRes) => {
    if (!apiKey) return alert("API Key?");
    setLoading(type);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await res.json();
      setRes(data.candidates?.[0]?.content?.parts?.[0]?.text || "失敗");
    } catch (e) { alert(e.message); } finally { setLoading(null); }
  };
  const inputStyle = `w-full bg-transparent outline-none p-2 text-sm border-b ${isDark ? 'border-gray-700 placeholder-gray-600' : 'border-gray-300 placeholder-gray-400'}`;

  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><Sparkles size={18}/> <h2 className="text-lg font-bold">萬能生成中心</h2></div>
       
       <section>
         <h3 className="text-xs font-bold opacity-50 mb-2 ml-2">萬能小說開頭</h3>
         <NeuBox isDark={isDark} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select value={config.genre} onChange={e=>setConfig({...config, genre:e.target.value})} className={inputStyle}><option>現代言情</option><option>古代架空</option><option>奇幻</option></select>
              <select value={config.tone} onChange={e=>setConfig({...config, tone:e.target.value})} className={inputStyle}><option>甜寵</option><option>虐心</option><option>正劇</option></select>
            </div>
            <input placeholder="世界觀" value={config.world} onChange={e=>setConfig({...config, world:e.target.value})} className={inputStyle}/>
            <input placeholder="主角 CP" value={config.character} onChange={e=>setConfig({...config, character:e.target.value})} className={inputStyle}/>
            <input placeholder="核心梗" value={config.trope} onChange={e=>setConfig({...config, trope:e.target.value})} className={inputStyle}/>
            <NeuBox isDark={isDark} onClick={() => runGen('main', `寫開頭：${JSON.stringify(config)}`, setResMain)} className="mt-4 py-3 flex justify-center font-bold text-purple-500 active:scale-95">{loading==='main' ? "..." : <><Zap size={16} className="mr-1"/> 創作</>}</NeuBox>
         </NeuBox>
         <NeuBox isDark={isDark} className="mt-3 p-4 min-h-[150px] border border-dashed border-purple-500/20 text-sm whitespace-pre-wrap">{resMain || <span className="opacity-30">生成結果...</span>}</NeuBox>
       </section>

       <section>
         <h3 className="text-xs font-bold opacity-50 mb-2 ml-2">靈感碎片擴充</h3>
         <NeuBox isDark={isDark} className="p-4" pressed><textarea className="w-full h-24 bg-transparent outline-none resize-none text-sm" placeholder="輸入碎片..." value={fragment} onChange={e=>setFragment(e.target.value)}/></NeuBox>
         <NeuBox isDark={isDark} onClick={() => runGen('frag', `聯想：${fragment}`, setResFrag)} className="mt-2 py-3 flex justify-center font-bold text-blue-500 active:scale-95">{loading==='frag' ? "..." : <><List size={16} className="mr-1"/> 聯想</>}</NeuBox>
         <NeuBox isDark={isDark} className="mt-3 p-4 min-h-[150px] border border-dashed border-blue-500/20 text-sm whitespace-pre-wrap">{resFrag || <span className="opacity-30">聯想結果...</span>}</NeuBox>
       </section>

       <section>
         <h3 className="text-xs font-bold opacity-50 mb-2 ml-2">人設表生成</h3>
         <NeuBox isDark={isDark} className="p-4" pressed><textarea className="w-full h-24 bg-transparent outline-none resize-none text-sm" placeholder="輸入想法..." value={sheetInput} onChange={e=>setSheetInput(e.target.value)}/></NeuBox>
         <NeuBox isDark={isDark} onClick={() => runGen('sheet', `表格：${sheetInput}`, setResSheet)} className="mt-2 py-3 flex justify-center font-bold text-green-500 active:scale-95">{loading==='sheet' ? "..." : <><Table size={16} className="mr-1"/> 表格</>}</NeuBox>
         <NeuBox isDark={isDark} className="mt-3 p-4 min-h-[150px] border border-dashed border-green-500/20 text-sm whitespace-pre-wrap">{resSheet || <span className="opacity-30">表格結果...</span>}</NeuBox>
       </section>
    </div>
  );
};

// --- Page: Vault ---
const PageVault = ({ isDark }) => {
  const [tab, setTab] = useState('snippet'); const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('memo_vault') || '[]'); } catch { return []; } }); const [newItemContent, setNewItemContent] = useState(''); const [isAdding, setIsAdding] = useState(false); useEffect(() => { localStorage.setItem('memo_vault', JSON.stringify(items)); }, [items]); const addItem = () => { if (!newItemContent.trim()) return; setItems([{ id: Date.now(), type: tab, content: newItemContent, date: new Date().toLocaleDateString() }, ...items]); setNewItemContent(''); setIsAdding(false); }; const filteredItems = items.filter(i => i.type === tab); const TabBtn = ({ id, label, icon: Icon }) => ( <button onClick={() => setTab(id)} className={`flex-1 py-2 flex justify-center items-center gap-1.5 text-sm font-bold rounded-xl transition-all ${tab === id ? (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600') : 'opacity-50'}`}> <Icon size={16}/> {label} </button> );
  return (
    <div className="space-y-6 animate-fade-in pb-32 h-full flex flex-col">
       <div className="flex items-center gap-2 opacity-60 px-1"><Package size={18}/> <h2 className="text-lg font-bold">靈感庫</h2></div>
       <NeuBox isDark={isDark} className="p-2 flex gap-2"><TabBtn id="snippet" label="碎片" icon={List} /><TabBtn id="char" label="人設" icon={User} /><TabBtn id="world" label="設定" icon={Sparkles} /></NeuBox>
       {isAdding ? ( <div className="animate-fade-in"><NeuBox isDark={isDark} className="p-3 mb-3" pressed><textarea autoFocus className="w-full h-24 bg-transparent outline-none resize-none text-sm" value={newItemContent} onChange={e=>setNewItemContent(e.target.value)}/></NeuBox><div className="flex gap-2"><NeuBox isDark={isDark} onClick={addItem} className="flex-1 py-2 flex justify-center font-bold text-purple-500 active:scale-95 text-sm">儲存</NeuBox><NeuBox isDark={isDark} onClick={()=>setIsAdding(false)} className="py-2 px-4 flex justify-center font-bold text-gray-400 active:scale-95"><X size={18}/></NeuBox></div></div> ) : ( <NeuBox isDark={isDark} onClick={()=>setIsAdding(true)} className="py-3 flex justify-center items-center gap-2 font-bold text-purple-500 opacity-80 active:scale-95 text-sm border-2 border-dashed border-purple-500/30"><Plus size={18}/> 新增</NeuBox> )}
       <div className="flex-grow overflow-y-auto space-y-3 pb-4">{filteredItems.map(item => (<NeuBox key={item.id} isDark={isDark} className="p-4 relative group animate-fade-in"><div className="whitespace-pre-wrap text-sm leading-relaxed">{item.content}</div><div className="flex justify-between items-center mt-3 opacity-50"><span className="text-[10px] font-bold">{item.date}</span><button onClick={(e)=>{e.stopPropagation(); setItems(items.filter(i=>i.id!==item.id))}} className="p-1.5 bg-red-500/10 text-red-500 rounded-full"><Trash2 size={14}/></button></div></NeuBox>))}</div>
    </div>
  );
};

// --- Page: Me ---
const PageMe = ({ isDark, apiKey, setApiKey, themeMode, toggleTheme, musicState }) => {
  const [showInput, setShowInput] = useState(false);
  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><User size={18}/> <h2 className="text-lg font-bold">我的</h2></div>
       <VinylWidget musicState={musicState} isDark={isDark} />
       <div className="space-y-4">
          <NeuBox isDark={isDark} className="p-4 flex justify-between" onClick={toggleTheme}><span className="font-bold text-sm">主題 ({themeMode})</span>{themeMode==='dark' ? <Moon size={18}/> : <Sun size={18}/>}</NeuBox>
          <NeuBox isDark={isDark} className="p-4"><div className="flex justify-between"><span className="font-bold text-sm">API Key</span><Key size={18}/></div><input type="password" value={apiKey} onChange={e=>{setApiKey(e.target.value);localStorage.setItem("gemini_key",e.target.value)}} className="w-full mt-2 bg-transparent border-b outline-none text-sm font-mono"/></NeuBox>
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
  
  // Music State managed here
  const musicState = useYouTubeAPI();

  useEffect(() => { const check = () => (themeMode === "system" ? window.matchMedia('(prefers-color-scheme: dark)').matches : themeMode === "dark"); setIsDark(check()); }, [themeMode]);
  const toggleTheme = () => { const next = ["system", "light", "dark"][(["system", "light", "dark"].indexOf(themeMode) + 1) % 3]; setThemeMode(next); localStorage.setItem("theme_mode", next); };

  // Render content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'memo': return <PageMemo isDark={isDark} apiKey={apiKey} />;
      case 'generator': return <PageGenerator isDark={isDark} apiKey={apiKey} />;
      case 'vault': return <PageVault isDark={isDark} />;
      case 'me': return <PageMe isDark={isDark} apiKey={apiKey} setApiKey={setApiKey} themeMode={themeMode} toggleTheme={toggleTheme} musicState={musicState} />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans relative overflow-x-hidden ${isDark ? 'bg-[#202130] text-gray-200' : 'bg-[#D0D3EC] text-[#5b5d7e]'}`}>
      {/* 隱藏的 YouTube Iframe 容器 */}
      <div id="youtube-player-hidden"></div>
      
      <div className="pt-8 pb-4 text-center px-4"><h1 className="text-2xl font-black text-purple-600 tracking-tight">MemoLive</h1><p className="text-[10px] font-bold opacity-40 tracking-[0.2em]">ULTIMATE SUITE</p></div>
      <div className="max-w-md mx-auto h-full px-4">{renderContent()}</div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
    </div>
  );
};
export default App;