import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Edit3, User, List, Package, Plus, X, ChevronLeft, Share2, MoreHorizontal, Send, Copy, Settings, Dice5, Save, LayoutTemplate, Moon, Sun, Globe, MessageCircle, Monitor } from 'lucide-react';

// --- CSS 重點：新擬態陰影 (Neumorphism) ---
const styles = `
  @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
  
  /* 隱藏滾動條但保留功能 */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- 核心元件：新擬態盒子 (NeuBox) ---
// 這是整個 App 的靈魂，負責產生凸起(Out)和凹陷(Inset)的立體感
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false, border = false }) => {
  // 深色模式陰影 (紫灰調)
  const darkShadow = active || pressed 
    ? 'shadow-[inset_5px_5px_10px_#161722,inset_-5px_-5px_10px_#2a2c40] bg-[#202130]' // 凹陷
    : 'shadow-[6px_6px_12px_#151620,-6px_-6px_12px_#2b2c40] bg-[#202130]'; // 凸起

  // 淺色模式陰影 (藍灰調)
  const lightShadow = active || pressed
    ? 'shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] bg-[#E0E5EC]' // 凹陷
    : 'shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] bg-[#E0E5EC]'; // 凸起

  // 選中時的文字/圖示顏色 (紫色高亮)
  const activeText = active ? 'text-purple-500' : (isDark ? 'text-gray-400' : 'text-gray-600');
  const borderStyle = border ? (isDark ? 'border border-white/5' : 'border border-white/40') : '';

  return (
    <div 
      onClick={onClick} 
      className={`
        ${className} ${activeText} ${isDark ? darkShadow : lightShadow} ${borderStyle}
        transition-all duration-300 ease-out rounded-[24px]
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
      `}
    >
      {children}
    </div>
  );
};

// --- 導航列 (長方懸浮島 - 新擬態版) ---
const Navigation = ({ activeTab, setActiveTab, isDark }) => (
  <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[380px]">
    <div className={`flex justify-between items-center px-6 py-4 rounded-[28px] shadow-2xl backdrop-blur-md ${isDark ? 'bg-[#202130]/90 shadow-black/40' : 'bg-[#E0E5EC]/90 shadow-gray-400/40'}`}>
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
      {/* 這裡不再用 glass，而是用 NeuBox 的 active 狀態來達成「凹陷發光」 */}
      <NeuBox 
        isDark={isDark} 
        active={active} 
        className={`w-12 h-12 flex items-center justify-center rounded-[18px] transition-all duration-300`}
      >
        <Icon size={22} strokeWidth={2.5} className={active ? 'drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]' : ''} />
      </NeuBox>
      <span className={`text-[10px] font-bold tracking-wide transition-colors ${active ? 'text-purple-500' : 'text-transparent scale-0 h-0'}`}>{label}</span>
    </div>
  );
};

// --- 全螢幕對話模式 (維持深色沉浸) ---
const ChatInterface = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] bg-[#1a1b23] flex flex-col animate-fade-in">
    <div className="flex items-center justify-between p-4 pt-12 border-b border-white/5 bg-[#1a1b23]">
      <button onClick={onClose} className="flex items-center gap-1 text-gray-400 text-sm font-bold active:scale-95"><ChevronLeft size={20}/> 返回</button>
      <span className="text-white font-bold text-sm tracking-wider">角色實時互動空間</span>
      <div className="flex gap-3 text-gray-400"><Share2 size={20}/><MoreHorizontal size={20}/></div>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
       <div className="w-24 h-24 rounded-[24px] bg-[#252630] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex items-center justify-center border border-white/5"><MessageCircle size={40} className="text-white/20"/></div>
       <p className="text-white/30 font-bold tracking-widest text-xs">開始與你的角色進行第一場對話</p>
    </div>
    <div className="p-4 pb-10 bg-[#1a1b23]">
       <div className="bg-[#252630] rounded-[20px] p-1.5 pl-5 flex items-center shadow-lg border border-white/5">
          <input className="flex-1 bg-transparent outline-none text-white text-sm h-10 placeholder-gray-600" placeholder="輸入你想說的話..." />
          <button className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"><Send size={18} className="ml-0.5"/></button>
       </div>
    </div>
  </div>
);

// --- API 核心 (Google Search + Gemini 2.5) ---
const callGemini = async (apiKey, prompt, useWeb = false) => {
  const tools = useWeb ? [{ googleSearch: {} }] : [];
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: prompt }] }],
      tools: tools
    }) 
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  
  const candidate = data.candidates?.[0];
  if (!candidate) return "生成失敗，請重試。";
  
  // 處理 Grounding 資訊
  const textPart = candidate.content?.parts?.find(p => p.text);
  return textPart ? textPart.text : "生成成功 (內容包含非文字資訊)";
};

// --- 拉霸機 ---
const SlotMachine = ({ isDark, apiKey, onResult }) => {
  const [spinning, setSpinning] = useState(false);
  const [slots, setSlots] = useState(["先婚後愛", "娛樂圈", "破鏡重圓"]);
  const [loading, setLoading] = useState(false);
  const handleSpin = async () => {
    if(!apiKey) return alert("請先到「我」的頁面設定 API Key！");
    setSpinning(true);
    if(navigator.vibrate) navigator.vibrate(50);
    let count = 0;
    const interval = setInterval(() => {
        setSlots([
            ["穿越", "重生", "系統", "末世", "星際"][Math.floor(Math.random()*5)],
            ["校園", "職場", "豪門", "古代", "修仙"][Math.floor(Math.random()*5)],
            ["甜寵", "虐戀", "爽文", "懸疑", "搞笑"][Math.floor(Math.random()*5)]
        ]);
        count++;
        if(count > 15) {
            clearInterval(interval);
            const finalResult = [
                ["穿越", "重生", "系統", "末世", "星際"][Math.floor(Math.random()*5)],
                ["校園", "職場", "豪門", "古代", "修仙"][Math.floor(Math.random()*5)],
                ["甜寵", "虐戀", "爽文", "懸疑", "搞笑"][Math.floor(Math.random()*5)]
            ];
            setSlots(finalResult);
            setSpinning(false);
            if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
            generateFromSlots(finalResult);
        }
    }, 80);
  };
  const generateFromSlots = async (tags) => {
      setLoading(true);
      try {
          const prompt = `角色：創意小說家。任務：請根據這三個隨機關鍵字 [${tags.join(', ')}]，腦力激盪出一個精彩的小說開頭（至少 500 字）。直接開始故事。`;
          const text = await callGemini(apiKey, prompt, false);
          onResult(text);
      } catch(e) { alert("生成失敗: " + e.message); } finally { setLoading(false); }
  };
  return (
    <NeuBox isDark={isDark} className="p-5 mb-6 flex flex-col items-center gap-5">
       <div className="flex gap-3 w-full justify-center">
          {slots.map((text, i) => (
             <NeuBox key={i} isDark={isDark} pressed className={`flex-1 h-16 flex items-center justify-center text-xs font-bold text-center px-1 ${spinning ? 'opacity-50 blur-[1px]' : 'text-purple-500'}`}>
                {text}
             </NeuBox>
          ))}
       </div>
       <NeuBox isDark={isDark} onClick={handleSpin} className={`w-full py-4 flex items-center justify-center gap-2 font-bold text-sm ${spinning ? 'opacity-50' : 'text-purple-500'}`}>
          {spinning ? "轉動中..." : loading ? "AI 正在寫作..." : <><Dice5 size={20}/> 隨機拉霸 + 生成</>}
       </NeuBox>
    </NeuBox>
  );
};

// --- 頁面: 靈感庫 ---
const PageVault = ({ isDark, apiKey }) => {
  const [tab, setTab] = useState('snippet'); 
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('memo_vault') || '[]'); } catch { return []; } }); 
  const [newItemContent, setNewItemContent] = useState(''); const [isAdding, setIsAdding] = useState(false); const [slotResult, setSlotResult] = useState("");
  useEffect(() => { localStorage.setItem('memo_vault', JSON.stringify(items)); }, [items]); 
  const addItem = (content = newItemContent, type = tab) => { if (!content.trim()) return; setItems([{ id: Date.now(), type: type, content: content, date: new Date().toLocaleDateString() }, ...items]); setNewItemContent(''); setIsAdding(false); setSlotResult(""); }; 
  const filteredItems = items.filter(i => i.type === tab); 
  
  const TabBtn = ({ id, label, icon: Icon }) => ( 
    <NeuBox isDark={isDark} active={tab === id} onClick={() => setTab(id)} className="flex-1 py-3 flex justify-center items-center gap-2 text-xs font-bold">
      <Icon size={16}/> {label} 
    </NeuBox> 
  );

  return (
    <div className="space-y-6 animate-fade-in pb-32 h-full flex flex-col">
       <div className="flex items-center gap-2 opacity-60 px-2 mt-2"><Package size={20}/> <h2 className="text-xl font-bold">靈感庫</h2></div>
       <SlotMachine isDark={isDark} apiKey={apiKey} onResult={setSlotResult} />
       
       {slotResult && ( 
         <div className="animate-fade-in mb-4">
            <div className="flex justify-between items-center px-2 mb-2 opacity-70"><span className="text-xs font-bold">🎉 拉霸生成結果</span></div>
            <NeuBox isDark={isDark} className="p-5 relative">
               <div className="text-sm whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto pr-2">{slotResult}</div>
               <div className="flex gap-3 mt-4">
                  <NeuBox isDark={isDark} onClick={() => addItem(slotResult, 'snippet')} className="flex-1 py-2 text-purple-500 text-xs font-bold flex justify-center">存入碎片</NeuBox>
                  <NeuBox isDark={isDark} onClick={() => setSlotResult("")} className="px-4 py-2 text-gray-500 text-xs flex justify-center">捨棄</NeuBox>
               </div>
            </NeuBox>
         </div> 
       )}

       <div className="flex gap-3 px-1"><TabBtn id="snippet" label="碎片" icon={List} /><TabBtn id="char" label="人設" icon={User} /><TabBtn id="world" label="設定" icon={Sparkles} /></div>
       
       {isAdding ? ( 
          <div className="animate-fade-in space-y-3">
            <NeuBox isDark={isDark} pressed className="p-4">
              <textarea autoFocus className="w-full h-24 bg-transparent outline-none resize-none text-sm placeholder-opacity-50" placeholder="輸入靈感..." value={newItemContent} onChange={e=>setNewItemContent(e.target.value)}/>
            </NeuBox>
            <div className="flex gap-3">
              <NeuBox isDark={isDark} onClick={() => addItem()} className="flex-1 py-3 text-purple-500 text-sm font-bold flex justify-center">儲存</NeuBox>
              <NeuBox isDark={isDark} onClick={()=>setIsAdding(false)} className="py-3 px-6 text-gray-500 flex justify-center"><X size={20}/></NeuBox>
            </div>
          </div> 
       ) : ( 
         <NeuBox isDark={isDark} onClick={()=>setIsAdding(true)} className="py-4 flex justify-center items-center gap-2 text-purple-500 opacity-80 text-sm font-bold border-2 border-dashed border-purple-500/20"><Plus size={18}/> 新增項目</NeuBox> 
       )}
       
       <div className="flex-grow overflow-y-auto space-y-4 pb-4 px-1 no-scrollbar">
         {filteredItems.length === 0 && !isAdding && <div className="text-center opacity-30 text-xs mt-10">這裡空空如也...</div>}
         {filteredItems.map(item => (
           <NeuBox key={item.id} isDark={isDark} className="p-5 relative group animate-fade-in">
             <div className="whitespace-pre-wrap text-sm leading-relaxed opacity-90">{item.content}</div>
             <div className="flex justify-between items-center mt-4 opacity-40">
               <span className="text-[10px] font-bold">{item.date}</span>
               <button onClick={(e)=>{e.stopPropagation(); setItems(items.filter(i=>i.id!==item.id))}} className="p-2 bg-red-500/10 text-red-500 rounded-full active:scale-90"><Trash2 size={14}/></button>
             </div>
           </NeuBox>
         ))}
       </div>
    </div>
  );
};

// --- 頁面: 續寫 (萬字+聯網) ---
const PageMemo = ({ isDark, apiKey, setShowChat }) => {
  const [note, setNote] = useState("");
  const [res, setRes] = useState("");
  const [loading, setLoading] = useState(false);

  const gen = async () => {
    if (!apiKey) return alert("請設定 API Key");
    if (!note) return alert("內容不能為空");
    setLoading(true);
    try {
      const prompt = `
        角色：同人小說家。任務：續寫文章。
        步驟：
        1. 分析原文人物性格(OOC禁止)、風格、節奏。
        2. 若涉及現實偶像/影視，請用 Google 搜尋確認最新資訊(Grounding)。
        3. 續寫長度需達【1500字以上】。
        原文：${note}
      `;
      const text = await callGemini(apiKey, prompt, true);
      setRes(text);
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60 px-2 mt-2"><Edit3 size={20}/> <h2 className="text-xl font-bold">筆記續寫</h2></div>
       <NeuBox isDark={isDark} pressed className="p-5 h-[35vh]">
         <textarea 
            className="w-full h-full bg-transparent outline-none resize-none text-base leading-relaxed opacity-80 placeholder-opacity-40" 
            placeholder="請貼上你的文章 (支援 50,000 字以上)..." 
            value={note} 
            onChange={e=>setNote(e.target.value)}
            maxLength={50000} 
         />
       </NeuBox>
       <div className="flex gap-4">
         <NeuBox isDark={isDark} onClick={gen} className="flex-1 py-4 flex justify-center gap-2 font-bold text-purple-500 text-sm">{loading ? "..." : <><Zap size={18}/> 續寫 (聯網)</>}</NeuBox>
         <NeuBox isDark={isDark} onClick={() => setShowChat(true)} className="flex-1 py-4 flex justify-center gap-2 font-bold text-pink-500 text-sm"><MessageCircle size={18}/> 對話</NeuBox>
       </div>
       <div className="flex flex-col gap-3">
          <div className="flex justify-between px-2 opacity-50"><span className="text-xs font-bold">AI 產出結果 (1500字+)</span>{res && <Copy size={14}/>}</div>
          <NeuBox isDark={isDark} className="p-6 min-h-[250px] text-sm whitespace-pre-wrap leading-relaxed">
             {res || <span className="opacity-20 text-xs flex items-center justify-center h-full">等待生成...</span>}
          </NeuBox>
       </div>
    </div>
  );
};

// --- 頁面: 生成器 ---
const PageGenerator = ({ isDark, apiKey }) => {
  const [config, setConfig] = useState({ genre: "現代言情", tone: "甜寵", world: "", cp: "", trope: "" });
  const [fragment, setFragment] = useState("");
  const [sheetInput, setSheetInput] = useState("");
  const [resMain, setResMain] = useState("");
  const [resFrag, setResFrag] = useState("");
  const [resSheet, setResSheet] = useState("");
  const [loading, setLoading] = useState("");

  const run = async (id, prompt, setter) => {
    if (!apiKey) return alert("API Key?");
    setLoading(id);
    try {
      const text = await callGemini(apiKey, prompt, true);
      setter(text);
    } catch (e) { alert(e.message); } finally { setLoading(""); }
  };

  const saveCharacter = () => {
      if(!resSheet) return;
      const vault = JSON.parse(localStorage.getItem('memo_vault') || '[]');
      const newChar = { id: Date.now(), type: 'char', content: resSheet, date: new Date().toLocaleDateString() };
      localStorage.setItem('memo_vault', JSON.stringify([newChar, ...vault]));
      alert("✅ 人設已收藏到靈感庫！");
  };

  const inputClass = "w-full bg-transparent border-b border-white/10 p-2 text-sm outline-none focus:border-purple-500 transition-colors placeholder-opacity-40";

  return (
    <div className="space-y-10 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60 px-2 mt-2"><Sparkles size={20}/> <h2 className="text-xl font-bold">萬能生成中心</h2></div>
       
       <section className="space-y-3">
         <span className="text-xs font-bold opacity-50 ml-2">萬能小說開頭</span>
         <NeuBox isDark={isDark} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <input placeholder="類型" value={config.genre} onChange={e=>setConfig({...config, genre:e.target.value})} className={inputClass}/>
              <input placeholder="基調" value={config.tone} onChange={e=>setConfig({...config, tone:e.target.value})} className={inputClass}/>
            </div>
            <input placeholder="世界觀 (如: 娛樂圈)" value={config.world} onChange={e=>setConfig({...config, world:e.target.value})} className={inputClass}/>
            <input placeholder="CP (如: 頂流x新人)" value={config.cp} onChange={e=>setConfig({...config, cp:e.target.value})} className={inputClass}/>
            <input placeholder="核心梗" value={config.trope} onChange={e=>setConfig({...config, trope:e.target.value})} className={inputClass}/>
            <NeuBox isDark={isDark} onClick={()=>run('1', `寫開頭(1500字以上)：${JSON.stringify(config)}`, setResMain)} className="w-full py-3 mt-2 flex justify-center text-purple-500 font-bold">{loading==='1'?"...":"⚡ 創作"}</NeuBox>
         </NeuBox>
         <NeuBox isDark={isDark} className="p-6 min-h-[150px] text-sm whitespace-pre-wrap leading-relaxed">{resMain || <span className="opacity-20">結果顯示於此...</span>}</NeuBox>
       </section>

       <section className="space-y-3">
         <span className="text-xs font-bold opacity-50 ml-2">靈感碎片擴充</span>
         <NeuBox isDark={isDark} pressed className="p-5"><textarea className="w-full h-20 bg-transparent outline-none text-sm resize-none placeholder-opacity-40" placeholder="輸入碎片..." value={fragment} onChange={e=>setFragment(e.target.value)}/></NeuBox>
         <NeuBox isDark={isDark} onClick={()=>run('2', `聯想：${fragment}`, setResFrag)} className="w-full py-3 flex justify-center text-blue-500 font-bold">{loading==='2'?"...":"≡ 聯想"}</NeuBox>
         <NeuBox isDark={isDark} className="p-6 min-h-[150px] text-sm whitespace-pre-wrap leading-relaxed">{resFrag || <span className="opacity-20">聯想結果...</span>}</NeuBox>
       </section>

       <section className="space-y-3">
         <span className="text-xs font-bold opacity-50 ml-2">人設表生成</span>
         <NeuBox isDark={isDark} pressed className="p-5"><textarea className="w-full h-20 bg-transparent outline-none text-sm resize-none placeholder-opacity-40" placeholder="輸入特徵..." value={sheetInput} onChange={e=>setSheetInput(e.target.value)}/></NeuBox>
         <NeuBox isDark={isDark} onClick={()=>run('3', `人設表(Markdown)：${sheetInput}`, setResSheet)} className="w-full py-3 flex justify-center text-green-500 font-bold">{loading==='3'?"...":"田 生成表格"}</NeuBox>
         <div className="relative">
            <NeuBox isDark={isDark} className="p-6 min-h-[150px] text-sm whitespace-pre-wrap leading-relaxed">{resSheet || <span className="opacity-20">表格結果...</span>}</NeuBox>
            {resSheet && (<button onClick={saveCharacter} className="absolute top-4 right-4 flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg active:scale-90 transition-transform"><Save size={14}/> 收藏</button>)}
         </div>
       </section>
    </div>
  );
};

// --- 頁面: 我 (修復：淺/深/系統 模式切換) ---
const PageMe = ({ isDark, apiKey, setApiKey, themeMode, setThemeMode }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60 px-2 mt-2"><User size={20}/> <h2 className="text-xl font-bold">我的</h2></div>
       
       <NeuBox isDark={isDark} className="p-8 flex flex-col items-center justify-center gap-3 opacity-60">
          <LayoutTemplate size={40} />
          <span className="text-sm font-bold tracking-widest">PRO 創作模式</span>
       </NeuBox>

       <div className="space-y-5">
          {/* 主題切換器：三顆獨立按鈕 */}
          <div className="space-y-2">
             <span className="text-xs font-bold opacity-50 ml-2">外觀主題</span>
             <NeuBox isDark={isDark} className="p-2 flex gap-3">
                <NeuBox isDark={isDark} active={themeMode === 'light'} onClick={() => setThemeMode('light')} className="flex-1 py-3 flex flex-col items-center justify-center gap-1">
                   <Sun size={20} />
                   <span className="text-[10px] font-bold">淺色</span>
                </NeuBox>
                <NeuBox isDark={isDark} active={themeMode === 'dark'} onClick={() => setThemeMode('dark')} className="flex-1 py-3 flex flex-col items-center justify-center gap-1">
                   <Moon size={20} />
                   <span className="text-[10px] font-bold">深色</span>
                </NeuBox>
                <NeuBox isDark={isDark} active={themeMode === 'system'} onClick={() => setThemeMode('system')} className="flex-1 py-3 flex flex-col items-center justify-center gap-1">
                   <Monitor size={20} />
                   <span className="text-[10px] font-bold">系統</span>
                </NeuBox>
             </NeuBox>
          </div>

          <div className="space-y-2">
             <span className="text-xs font-bold opacity-50 ml-2">系統設定</span>
             <NeuBox isDark={isDark} className="p-5">
                <div onClick={()=>setShow(!show)} className="flex justify-between items-center cursor-pointer">
                  <span className="font-bold text-sm">Gemini API Key</span><Settings size={18}/>
                </div>
                {show && <input type="password" placeholder="貼上 API Key..." value={apiKey} onChange={e=>{setApiKey(e.target.value);localStorage.setItem("gemini_key",e.target.value)}} className="w-full mt-4 bg-transparent border-b border-white/20 p-2 text-sm outline-none font-mono"/>}
             </NeuBox>
          </div>
          
          <div className="px-4 text-[10px] opacity-30 flex items-center gap-1 justify-center mt-4">
             <Globe size={12}/> <span>已啟用 Google Search Grounding (聯網模式)</span>
          </div>
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
  const [showChat, setShowChat] = useState(false);

  // 監聽主題變化
  useEffect(() => {
    const applyTheme = () => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDarkMode = themeMode === 'system' ? systemDark : themeMode === 'dark';
      setIsDark(isDarkMode);
    };
    applyTheme();
    localStorage.setItem("theme_mode", themeMode);
    
    // 監聽系統變化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [themeMode]);

  if (showChat) return <ChatInterface onClose={() => setShowChat(false)} />;

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans relative overflow-x-hidden ${isDark ? 'bg-[#202130] text-gray-200' : 'bg-[#E0E5EC] text-[#5b5d7e]'}`}>
      <style>{styles}</style>
      <div className="pt-12 pb-4 text-center px-4"><h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 tracking-tight">MemoLive</h1><p className="text-[10px] font-bold opacity-30 tracking-[0.3em] mt-1">ULTIMATE</p></div>
      <div className="max-w-md mx-auto h-full px-5">
        {activeTab === 'memo' && <PageMemo isDark={isDark} apiKey={apiKey} setShowChat={setShowChat} />}
        {activeTab === 'generator' && <PageGenerator isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'vault' && <PageVault isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'me' && <PageMe isDark={isDark} apiKey={apiKey} setApiKey={setApiKey} themeMode={themeMode} setThemeMode={setThemeMode} />}
      </div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
    </div>
  );
};
export default App;