import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Edit3, User, Search, List, Table, Key, MessageCircle, Trash2, Package, Plus, X, ChevronLeft, Share2, MoreHorizontal, Send, Copy, Settings } from 'lucide-react';

// --- CSS 重點：玻璃擬態圖示 & 動畫 ---
const styles = `
  @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
  
  /* 3D 玻璃/果凍質感圖示 */
  .glass-icon {
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.3);
    box-shadow: 
      inset 0 1px 1px rgba(255,255,255,0.5),
      inset 0 -1px 4px rgba(0,0,0,0.1),
      0 4px 8px rgba(0,0,0,0.1);
    position: relative;
    overflow: hidden;
  }
  /* 內部的高光反射，模擬 3D 感 */
  .glass-icon::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 50%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent);
    border-radius: 99px;
    opacity: 0.6;
  }
  
  /* 啟動狀態的發光 */
  .glass-icon.active {
    background: linear-gradient(135deg, rgba(167, 139, 250, 0.6) 0%, rgba(139, 92, 246, 0.3) 100%);
    border-color: rgba(167, 139, 250, 0.5);
    box-shadow: 
      inset 0 1px 1px rgba(255,255,255,0.6),
      0 0 15px rgba(139, 92, 246, 0.4);
  }
`;

// --- 基礎元件 ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false }) => {
  return (
    <div onClick={onClick} className={`${className} transition-all duration-200 ease-out rounded-[20px] 
      ${isDark ? 'bg-[#202130] shadow-[4px_4px_10px_#161722,-4px_-4px_10px_#2a2c40]' : 'bg-[#D0D3EC] shadow-[5px_5px_10px_#aeb1cb,-5px_-5px_10px_#ffffff]'} 
      ${pressed ? 'scale-[0.98] !shadow-none' : ''} 
      ${onClick ? 'cursor-pointer' : ''}`}>
      {children}
    </div>
  );
};

// --- 全域播放器 (不做任何假按鈕，直接給一個漂亮的容器放 iframe) ---
const GlobalPlayer = ({ isDark, show, videoId, setVideoId, input, setInput }) => {
  const handleLoad = () => {
    let id = "";
    if (input.includes("v=")) id = input.split("v=")[1].split("&")[0];
    else if (input.includes("youtu.be")) id = input.split("/").pop();
    else id = `?listType=search&list=${encodeURIComponent(input + " audio")}`;
    
    // 這裡我們只存 ID，iframe 會自動更新
    if(id) setVideoId(id);
  };

  // ★★★ 核心邏輯：即使 show=false，我們也不要 unmount iframe，而是把它藏起來 ★★★
  // 這樣音樂才不會斷！
  const containerStyle = show 
    ? "relative w-full h-auto opacity-100 transition-opacity duration-300" 
    : "fixed top-[200vh] left-0 opacity-0 pointer-events-none"; // 推到外太空去

  return (
    <div className={containerStyle}>
      <NeuBox isDark={isDark} className="p-4 mb-6 border border-white/5 relative overflow-hidden">
         <div className="flex flex-col gap-3">
            {/* 輸入區 */}
            <div className={`flex items-center gap-2 p-2 rounded-xl ${isDark ? 'bg-black/20' : 'bg-white/40'}`}>
              <Search size={16} className="opacity-50"/>
              <input 
                className="bg-transparent w-full outline-none text-sm font-bold opacity-80"
                placeholder="貼上 YouTube 網址 (100% 有聲)"
                value={input}
                onChange={e=>setInput(e.target.value)}
              />
              <button onClick={handleLoad} className="text-xs font-bold bg-purple-500 text-white px-3 py-1.5 rounded-lg active:scale-95">載入</button>
            </div>

            {/* 播放器本體 (直接顯示，不偽裝) */}
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative shadow-inner">
               {videoId ? (
                 <iframe 
                   width="100%" height="100%" 
                   src={`https://www.youtube.com/embed/${videoId.startsWith('?') ? '' : videoId}${videoId.startsWith('?') ? videoId : '?'}playsinline=1&controls=1`} 
                   title="YouTube video player" 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                 ></iframe>
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 gap-2">
                    <span className="text-4xl">🎵</span>
                    <span className="text-xs font-bold">等待載入音樂...</span>
                 </div>
               )}
            </div>
            <p className="text-[10px] text-center opacity-40">切換頁面音樂將保持背景播放</p>
         </div>
      </NeuBox>
    </div>
  );
};

// --- 迷你狀態條 (當播放器被隱藏時顯示) ---
const MiniStatus = ({ isDark, onClick, hasMusic }) => {
  if (!hasMusic) return null;
  return (
    <div onClick={onClick} className={`fixed top-12 right-4 z-50 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-2 cursor-pointer active:scale-90 transition-all ${isDark ? 'bg-black/40 text-white' : 'bg-white/40 text-black'}`}>
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      <span className="text-[10px] font-bold">背景播放中</span>
    </div>
  );
};

// --- 導航列 (長方形、懸浮、不圓、不寬) ---
const Navigation = ({ activeTab, setActiveTab, isDark }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-[380px]">
    <div className={`flex justify-between items-center px-6 py-3 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl border ${isDark ? 'bg-[#18181b]/85 border-white/10' : 'bg-[#eef2ff]/85 border-white/40'}`}>
      <NavIcon icon={Edit3} label="續寫" active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} isDark={isDark} />
      <NavIcon icon={Sparkles} label="生成器" active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} isDark={isDark} />
      <NavIcon icon={Package} label="靈感庫" active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} isDark={isDark} />
      <NavIcon icon={User} label="我" active={activeTab === 'me'} onClick={() => setActiveTab('me')} isDark={isDark} />
    </div>
  </div>
);

const NavIcon = ({ icon: Icon, label, active, onClick, isDark }) => {
  return (
    <div onClick={onClick} className="flex flex-col items-center gap-1.5 cursor-pointer group">
      {/* 玻璃擬態圖示 */}
      <div className={`glass-icon w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-300 ${active ? 'active scale-110' : 'scale-100'}`}>
        <Icon size={20} className={`transition-colors ${active ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'}`} strokeWidth={2.5} />
      </div>
      {/* 標籤 (選中時才顯示顏色) */}
      <span className={`text-[9px] font-bold tracking-wide transition-colors ${active ? 'text-purple-400' : 'text-transparent'}`}>{label}</span>
    </div>
  );
};

// --- 全螢幕對話模式 (Image 7) ---
const ChatInterface = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#121318] flex flex-col animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 pt-12 border-b border-white/5 bg-[#1a1b23]">
        <button onClick={onClose} className="flex items-center gap-1 text-gray-400 text-sm font-bold active:scale-95"><ChevronLeft size={20}/> 返回</button>
        <span className="text-white font-bold text-sm tracking-wider">角色實時互動空間</span>
        <div className="flex gap-3 text-gray-400"><Share2 size={20}/><MoreHorizontal size={20}/></div>
      </div>
      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
         <div className="w-24 h-24 rounded-[24px] bg-[#1e1f29] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex items-center justify-center border border-white/5">
            <MessageCircle size={40} className="text-white/20"/>
         </div>
         <p className="text-white/30 font-bold tracking-widest text-xs">開始與你的角色進行第一場對話</p>
      </div>
      {/* Input */}
      <div className="p-4 pb-10 bg-[#1a1b23]">
         <div className="bg-[#252630] rounded-[20px] p-1.5 pl-5 flex items-center shadow-lg border border-white/5">
            <input className="flex-1 bg-transparent outline-none text-white text-sm h-10 placeholder-gray-600" placeholder="輸入你想說的話..." />
            <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"><Send size={18} className="ml-0.5"/></button>
         </div>
      </div>
    </div>
  );
};

// --- 頁面: 續寫 (大框框) ---
const PageMemo = ({ isDark, apiKey, setShowChat }) => {
  const [note, setNote] = useState("");
  const [res, setRes] = useState("");
  const [loading, setLoading] = useState(false);

  const gen = async () => {
    if (!apiKey) return alert("請設定 API Key");
    setLoading(true);
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: `續寫：${note}` }] }] }) });
      const d = await r.json();
      setRes(d.candidates?.[0]?.content?.parts?.[0]?.text || "失敗");
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60 px-1"><Edit3 size={18}/> <h2 className="text-lg font-bold">筆記續寫</h2></div>
       <NeuBox isDark={isDark} className="p-4 h-[25vh]" pressed><textarea className="w-full h-full bg-transparent outline-none resize-none text-base leading-relaxed opacity-80" placeholder="貼上你的文章..." value={note} onChange={e=>setNote(e.target.value)}/></NeuBox>
       <div className="flex gap-3">
         <NeuBox isDark={isDark} onClick={gen} className="flex-1 py-3 flex justify-center gap-2 font-bold text-purple-500 active:scale-95 text-sm">{loading ? "..." : <><Zap size={18}/> 續寫</>}</NeuBox>
         <NeuBox isDark={isDark} onClick={() => setShowChat(true)} className="flex-1 py-3 flex justify-center gap-2 font-bold text-pink-500 active:scale-95 text-sm"><MessageCircle size={18}/> 對話</NeuBox>
       </div>
       {/* 結果大框框 */}
       <div className="flex flex-col gap-2">
          <div className="flex justify-between px-2 opacity-50"><span className="text-xs font-bold">AI 產出結果</span>{res && <Copy size={12}/>}</div>
          <NeuBox isDark={isDark} className="p-5 min-h-[200px] bg-black/5 border border-white/5 text-sm whitespace-pre-wrap leading-relaxed">{res || <span className="opacity-20 text-xs flex items-center justify-center h-full">等待生成...</span>}</NeuBox>
       </div>
    </div>
  );
};

// --- 頁面: 生成器 (多個大框框) ---
const PageGenerator = ({ isDark, apiKey }) => {
  const [config, setConfig] = useState({ genre: "現代言情", tone: "甜寵", world: "", cp: "", trope: "" });
  const [frag, setFrag] = useState("");
  const [sheet, setSheet] = useState("");
  const [res1, setRes1] = useState("");
  const [res2, setRes2] = useState("");
  const [res3, setRes3] = useState("");
  const [loading, setLoading] = useState("");

  const run = async (id, prompt, setter) => {
    if (!apiKey) return alert("API Key?");
    setLoading(id);
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const d = await r.json();
      setter(d.candidates?.[0]?.content?.parts?.[0]?.text || "失敗");
    } catch (e) { alert(e.message); } finally { setLoading(""); }
  };

  const inputClass = "w-full bg-transparent border-b border-white/10 p-2 text-sm outline-none focus:border-purple-500 transition-colors";

  return (
    <div className="space-y-12 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><Sparkles size={18}/> <h2 className="text-lg font-bold">萬能生成中心</h2></div>
       
       {/* 1. 小說開頭 */}
       <section className="space-y-3">
         <span className="text-xs font-bold opacity-50 ml-2">萬能小說開頭</span>
         <NeuBox isDark={isDark} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="類型 (如: 現代)" value={config.genre} onChange={e=>setConfig({...config, genre:e.target.value})} className={inputClass}/>
              <input placeholder="基調 (如: 甜寵)" value={config.tone} onChange={e=>setConfig({...config, tone:e.target.value})} className={inputClass}/>
            </div>
            <input placeholder="世界觀" value={config.world} onChange={e=>setConfig({...config, world:e.target.value})} className={inputClass}/>
            <input placeholder="CP" value={config.cp} onChange={e=>setConfig({...config, cp:e.target.value})} className={inputClass}/>
            <input placeholder="核心梗" value={config.trope} onChange={e=>setConfig({...config, trope:e.target.value})} className={inputClass}/>
            <button onClick={()=>run('1', `寫開頭:${JSON.stringify(config)}`, setRes1)} className="w-full py-3 mt-2 bg-purple-500/10 text-purple-500 font-bold rounded-xl active:scale-95">{loading==='1'?"...":"⚡ 創作"}</button>
         </NeuBox>
         {/* 結果框 1 */}
         <NeuBox isDark={isDark} className="p-5 min-h-[150px] bg-black/5 border border-white/5 text-sm whitespace-pre-wrap">{res1 || <span className="opacity-20">結果顯示於此...</span>}</NeuBox>
       </section>

       {/* 2. 碎片 */}
       <section className="space-y-3">
         <span className="text-xs font-bold opacity-50 ml-2">靈感碎片</span>
         <NeuBox isDark={isDark} className="p-4"><textarea className="w-full h-20 bg-transparent outline-none text-sm resize-none" placeholder="輸入..." value={frag} onChange={e=>setFrag(e.target.value)}/></NeuBox>
         <button onClick={()=>run('2', `聯想:${frag}`, setRes2)} className="w-full py-3 bg-blue-500/10 text-blue-500 font-bold rounded-xl active:scale-95">{loading==='2'?"...":"≡ 聯想"}</button>
         {/* 結果框 2 */}
         <NeuBox isDark={isDark} className="p-5 min-h-[150px] bg-black/5 border border-white/5 text-sm whitespace-pre-wrap">{res2 || <span className="opacity-20">聯想結果...</span>}</NeuBox>
       </section>

       {/* 3. 人設 */}
       <section className="space-y-3">
         <span className="text-xs font-bold opacity-50 ml-2">人設表</span>
         <NeuBox isDark={isDark} className="p-4"><textarea className="w-full h-20 bg-transparent outline-none text-sm resize-none" placeholder="想法..." value={sheet} onChange={e=>setSheet(e.target.value)}/></NeuBox>
         <button onClick={()=>run('3', `表格:${sheet}`, setRes3)} className="w-full py-3 bg-green-500/10 text-green-500 font-bold rounded-xl active:scale-95">{loading==='3'?"...":"田 表格"}</button>
         {/* 結果框 3 */}
         <NeuBox isDark={isDark} className="p-5 min-h-[150px] bg-black/5 border border-white/5 text-sm whitespace-pre-wrap">{res3 || <span className="opacity-20">表格結果...</span>}</NeuBox>
       </section>
    </div>
  );
};

// --- 頁面: 靈感庫 ---
const PageVault = ({ isDark }) => {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  return (
    <div className="space-y-6 animate-fade-in pb-32">
      <div className="flex items-center gap-2 opacity-60 px-1"><Package size={18}/> <h2 className="text-lg font-bold">靈感庫</h2></div>
      <NeuBox isDark={isDark} className="p-4"><textarea className="w-full h-20 bg-transparent outline-none text-sm" placeholder="隨手記..." value={input} onChange={e=>setInput(e.target.value)}/><div className="flex justify-end mt-2"><button onClick={()=>{if(input){setItems([...items,input]);setInput("")}}} className="px-4 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-lg">儲存</button></div></NeuBox>
      <div className="space-y-3">{items.map((t,i)=><NeuBox key={i} isDark={isDark} className="p-4 text-sm relative group">{t}<button onClick={()=>setItems(items.filter((_,idx)=>idx!==i))} className="absolute top-2 right-2 text-red-400 opacity-50"><Trash2 size={12}/></button></NeuBox>)}</div>
    </div>
  );
};

// --- 頁面: 我 (單純設定) ---
const PageMe = ({ isDark, apiKey, setApiKey, themeMode, toggleTheme }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><User size={18}/> <h2 className="text-lg font-bold">我的</h2></div>
       <NeuBox isDark={isDark} className="p-4 flex justify-between items-center"><span className="font-bold text-sm">外觀主題</span><button onClick={toggleTheme}>{themeMode==='dark'?<Moon size={18}/>:<Sun size={18}/>}</button></NeuBox>
       <NeuBox isDark={isDark} className="p-4"><div onClick={()=>setShow(!show)} className="flex justify-between items-center"><span className="font-bold text-sm">API Key</span><Settings size={18}/></div>{show && <input type="password" value={apiKey} onChange={e=>{setApiKey(e.target.value);localStorage.setItem("gemini_key",e.target.value)}} className="w-full mt-3 bg-transparent border-b border-white/20 p-1 text-sm"/>}</NeuBox>
    </div>
  );
};

// --- 主程式 ---
const App = () => {
  const [activeTab, setActiveTab] = useState("memo");
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
  const [themeMode, setThemeMode] = useState(localStorage.getItem("theme_mode") || "system");
  const [isDark, setIsDark] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // 音樂狀態
  const [videoId, setVideoId] = useState("");
  const [musicInput, setMusicInput] = useState("");

  useEffect(() => { const check = () => (themeMode === "system" ? window.matchMedia('(prefers-color-scheme: dark)').matches : themeMode === "dark"); setIsDark(check()); }, [themeMode]);
  const toggleTheme = () => { const next = ["system", "light", "dark"][(["system", "light", "dark"].indexOf(themeMode) + 1) % 3]; setThemeMode(next); localStorage.setItem("theme_mode", next); };

  if (showChat) return <ChatInterface onClose={() => setShowChat(false)} />;

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans relative overflow-x-hidden ${isDark ? 'bg-[#121212] text-gray-200' : 'bg-[#eef2ff] text-[#5b5d7e]'}`}>
      <style>{styles}</style>
      <div className="pt-10 pb-2 text-center px-4"><h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 tracking-tight">MemoLive</h1><p className="text-[10px] font-bold opacity-30 tracking-[0.3em] mt-1">ULTIMATE</p></div>
      
      <div className="max-w-md mx-auto h-full px-5">
        {/* 全域播放器：只在「我」的頁面展開，其他頁面隱藏 (CSS控制) */}
        {/* 這保證了 iframe 永遠存在於 DOM 中，不會斷線 */}
        <GlobalPlayer 
           isDark={isDark} 
           show={activeTab === 'me'} 
           videoId={videoId} 
           setVideoId={setVideoId} 
           input={musicInput} 
           setInput={setMusicInput} 
        />

        {activeTab === 'memo' && <PageMemo isDark={isDark} apiKey={apiKey} setShowChat={setShowChat} />}
        {activeTab === 'generator' && <PageGenerator isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'vault' && <PageVault isDark={isDark} />}
        {activeTab === 'me' && <PageMe isDark={isDark} apiKey={apiKey} setApiKey={setApiKey} themeMode={themeMode} toggleTheme={toggleTheme} />}
      </div>
      
      {/* 迷你狀態提示：當不在「我」頁面且有音樂時顯示 */}
      {activeTab !== 'me' && <MiniStatus isDark={isDark} onClick={()=>setActiveTab('me')} hasMusic={!!videoId} />}
      
      {/* 導航列 */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
    </div>
  );
};
export default App;