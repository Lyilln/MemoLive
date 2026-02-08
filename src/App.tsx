import React, { useState, useEffect } from 'react';
// ★★★ 關鍵修復：補齊了 Moon, Sun, Globe, LayoutTemplate 等圖示，防止頁面崩潰 ★★★
import { Sparkles, Zap, Edit3, User, List, Package, Plus, X, ChevronLeft, Share2, MoreHorizontal, Send, Copy, Settings, Dice5, Save, LayoutTemplate, Moon, Sun, Globe, MessageCircle } from 'lucide-react';

// --- CSS 風格 ---
const styles = `
  @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
  
  .glass-icon {
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.3);
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -1px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.1);
    position: relative;
    overflow: hidden;
  }
  .glass-icon::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 50%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent);
    border-radius: 99px; opacity: 0.6;
  }
  .glass-icon.active {
    background: linear-gradient(135deg, rgba(167, 139, 250, 0.6) 0%, rgba(139, 92, 246, 0.3) 100%);
    border-color: rgba(167, 139, 250, 0.5);
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.6), 0 0 15px rgba(139, 92, 246, 0.4);
  }
`;

// --- 基礎元件 ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false }) => (
  <div onClick={onClick} className={`${className} transition-all duration-200 ease-out rounded-[20px] ${isDark ? 'bg-[#202130] shadow-[4px_4px_10px_#161722,-4px_-4px_10px_#2a2c40]' : 'bg-[#D0D3EC] shadow-[5px_5px_10px_#aeb1cb,-5px_-5px_10px_#ffffff]'} ${pressed ? 'scale-[0.98] !shadow-none' : ''} ${onClick ? 'cursor-pointer' : ''}`}>{children}</div>
);

// --- 導航列 ---
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
const NavIcon = ({ icon: Icon, label, active, onClick, isDark }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-1.5 cursor-pointer group">
    <div className={`glass-icon w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-300 ${active ? 'active scale-110' : 'scale-100'}`}>
      <Icon size={20} className={`transition-colors ${active ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'}`} strokeWidth={2.5} />
    </div>
    <span className={`text-[9px] font-bold tracking-wide transition-colors ${active ? 'text-purple-400' : 'text-transparent'}`}>{label}</span>
  </div>
);

// --- 對話介面 ---
const ChatInterface = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] bg-[#121318] flex flex-col animate-fade-in">
    <div className="flex items-center justify-between p-4 pt-12 border-b border-white/5 bg-[#1a1b23]">
      <button onClick={onClose} className="flex items-center gap-1 text-gray-400 text-sm font-bold active:scale-95"><ChevronLeft size={20}/> 返回</button>
      <span className="text-white font-bold text-sm tracking-wider">角色實時互動空間</span>
      <div className="flex gap-3 text-gray-400"><Share2 size={20}/><MoreHorizontal size={20}/></div>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
       <div className="w-24 h-24 rounded-[24px] bg-[#1e1f29] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex items-center justify-center border border-white/5"><MessageCircle size={40} className="text-white/20"/></div>
       <p className="text-white/30 font-bold tracking-widest text-xs">開始與你的角色進行第一場對話</p>
    </div>
    <div className="p-4 pb-10 bg-[#1a1b23]">
       <div className="bg-[#252630] rounded-[20px] p-1.5 pl-5 flex items-center shadow-lg border border-white/5">
          <input className="flex-1 bg-transparent outline-none text-white text-sm h-10 placeholder-gray-600" placeholder="輸入你想說的話..." />
          <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"><Send size={18} className="ml-0.5"/></button>
       </div>
    </div>
  </div>
);

// --- API 核心 (支援 Google Search & 風格掃描) ---
const callGemini = async (apiKey, prompt, useWeb = false) => {
  // ★★★ 啟用 Google 搜尋工具，連接網路資訊 ★★★
  const tools = useWeb ? [{ googleSearch: {} }] : [];
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: prompt }] }],
      tools: tools // 注入工具
    }) 
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  
  // 處理聯網回傳的結構 (有時候結構會稍微不同)
  const candidate = data.candidates?.[0];
  if (!candidate) return "生成失敗，請重試。";
  
  // 優先取用文字內容
  const textPart = candidate.content?.parts?.find(p => p.text);
  return textPart ? textPart.text : "生成成功，但內容格式不支援顯示。";
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
          const prompt = `角色：創意小說家。任務：請根據這三個隨機關鍵字 [${tags.join(', ')}]，腦力激盪出一個精彩的小說開頭（至少 500 字）。劇情要新穎，不落俗套。`;
          // 拉霸機不需要聯網，純腦洞
          const text = await callGemini(apiKey, prompt, false);
          onResult(text);
      } catch(e) { alert("生成失敗: " + e.message); } finally { setLoading(false); }
  };
  return (
    <NeuBox isDark={isDark} className="p-4 mb-4 relative overflow-hidden flex flex-col items-center gap-4 border-2 border-purple-500/20">
       <div className="flex gap-2 w-full justify-center">
          {slots.map((text, i) => (<div key={i} className={`flex-1 h-14 rounded-xl bg-black/20 flex items-center justify-center border border-white/10 text-xs font-bold text-center ${spinning ? 'opacity-50 blur-[1px]' : 'opacity-100 text-purple-300'} transition-all`}>{text}</div>))}
       </div>
       <button onClick={handleSpin} disabled={spinning || loading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm">{spinning ? "轉動中..." : loading ? "AI 正在寫作..." : <><Dice5 size={18}/> 隨機拉霸 + 生成</>}</button>
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
  const filteredItems = items.filter(i => i.type === tab); const TabBtn = ({ id, label, icon: Icon }) => ( <button onClick={() => setTab(id)} className={`flex-1 py-2 flex justify-center items-center gap-1.5 text-sm font-bold rounded-xl transition-all ${tab === id ? (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600') : 'opacity-50'}`}> <Icon size={16}/> {label} </button> );
  return (
    <div className="space-y-6 animate-fade-in pb-32 h-full flex flex-col">
       <div className="flex items-center gap-2 opacity-60 px-1"><Package size={18}/> <h2 className="text-lg font-bold">靈感庫</h2></div>
       <SlotMachine isDark={isDark} apiKey={apiKey} onResult={setSlotResult} />
       {slotResult && ( <div className="animate-fade-in mb-4"><div className="flex justify-between items-center px-2 mb-1 opacity-70"><span className="text-xs font-bold">🎉 拉霸生成結果</span></div><NeuBox isDark={isDark} className="p-4 border-2 border-purple-500/50 relative"><div className="text-sm whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">{slotResult}</div><div className="flex gap-2 mt-3"><button onClick={() => addItem(slotResult, 'snippet')} className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold">存入碎片</button><button onClick={() => setSlotResult("")} className="px-3 py-2 bg-gray-500/20 rounded-lg text-xs">捨棄</button></div></NeuBox></div> )}
       <NeuBox isDark={isDark} className="p-2 flex gap-2"><TabBtn id="snippet" label="碎片" icon={List} /><TabBtn id="char" label="人設" icon={User} /><TabBtn id="world" label="設定" icon={Sparkles} /></NeuBox>
       {isAdding ? ( <div className="animate-fade-in"><NeuBox isDark={isDark} className="p-3 mb-3" pressed><textarea autoFocus className="w-full h-24 bg-transparent outline-none resize-none text-sm" placeholder="輸入靈感..." value={newItemContent} onChange={e=>setNewItemContent(e.target.value)}/></NeuBox><div className="flex gap-2"><NeuBox isDark={isDark} onClick={() => addItem()} className="flex-1 py-2 flex justify-center font-bold text-purple-500 active:scale-95 text-sm">儲存</NeuBox><NeuBox isDark={isDark} onClick={()=>setIsAdding(false)} className="py-2 px-4 flex justify-center font-bold text-gray-400 active:scale-95"><X size={18}/></NeuBox></div></div> ) : ( <NeuBox isDark={isDark} onClick={()=>setIsAdding(true)} className="py-3 flex justify-center items-center gap-2 font-bold text-purple-500 opacity-80 active:scale-95 text-sm border-2 border-dashed border-purple-500/30"><Plus size={18}/> 新增項目</NeuBox> )}
       <div className="flex-grow overflow-y-auto space-y-3 pb-4">{filteredItems.map(item => (<NeuBox key={item.id} isDark={isDark} className="p-4 relative group animate-fade-in"><div className="whitespace-pre-wrap text-sm leading-relaxed">{item.content}</div><div className="flex justify-between items-center mt-3 opacity-50"><span className="text-[10px] font-bold">{item.date}</span><button onClick={(e)=>{e.stopPropagation(); setItems(items.filter(i=>i.id!==item.id))}} className="p-1.5 bg-red-500/10 text-red-500 rounded-full"><Trash2 size={14}/></button></div></NeuBox>))}</div>
    </div>
  );
};

// --- 頁面: 續寫 (萬字筆記 + 防OOC + 1500字 + 聯網) ---
const PageMemo = ({ isDark, apiKey, setShowChat }) => {
  const [note, setNote] = useState("");
  const [res, setRes] = useState("");
  const [loading, setLoading] = useState(false);

  const gen = async () => {
    if (!apiKey) return alert("請設定 API Key");
    if (!note) return alert("內容不能為空");
    setLoading(true);
    try {
      // ★★★ 核心 Prompt：兩階段分析 + 風格模仿 + 聯網 + 1500字 ★★★
      const prompt = `
        角色：你是一位對流行文化、娛樂圈、影視劇如數家珍的頂級同人小說家。
        任務：續寫以下這篇文章。
        
        【重要執行步驟】
        1. 深度掃描：首先仔細閱讀我提供的文章，提取其中的【人物性格 (OOC 禁止)】、【寫作風格】、【用詞習慣】與【劇情節奏】。
        2. 聯網檢索 (Grounding)：如果文中出現現實存在的偶像、藝人、劇集或特定文化梗，請務必【使用 Google 搜尋工具】確認他們的最新動態、真實性格、身高外貌或經典梗，確保內容真實不尷尬，沒有事實錯誤。
        3. 執行續寫：
           - 嚴格模仿原作者的文風，讓人感覺是同一個人寫的。
           - 續寫內容長度必須達到【1000~1500字以上】。
           - 劇情要有實質推進，情節要豐富，拒絕流水帳。
        
        【原文內容】：
        ${note}
      `;
      // 開啟 useWeb = true (聯網)
      const text = await callGemini(apiKey, prompt, true);
      setRes(text);
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60 px-1"><Edit3 size={18}/> <h2 className="text-lg font-bold">筆記續寫</h2></div>
       <NeuBox isDark={isDark} className="p-4 h-[35vh]" pressed>
         <textarea 
            className="w-full h-full bg-transparent outline-none resize-none text-base leading-relaxed opacity-80" 
            placeholder="請貼上你的文章 (支援 50,000 字以上)..." 
            value={note} 
            onChange={e=>setNote(e.target.value)}
            maxLength={50000} // ★★★ 萬字支援 ★★★
         />
       </NeuBox>
       <div className="flex gap-3">
         <NeuBox isDark={isDark} onClick={gen} className="flex-1 py-3 flex justify-center gap-2 font-bold text-purple-500 active:scale-95 text-sm">{loading ? "..." : <><Zap size={18}/> 續寫 (聯網+長文)</>}</NeuBox>
         <NeuBox isDark={isDark} onClick={() => setShowChat(true)} className="flex-1 py-3 flex justify-center gap-2 font-bold text-pink-500 active:scale-95 text-sm"><MessageCircle size={18}/> 對話</NeuBox>
       </div>
       <div className="flex flex-col gap-2">
          <div className="flex justify-between px-2 opacity-50"><span className="text-xs font-bold">AI 產出結果 (1500字+)</span>{res && <Copy size={12}/>}</div>
          <NeuBox isDark={isDark} className="p-5 min-h-[200px] bg-black/5 border border-white/5 text-sm whitespace-pre-wrap leading-relaxed">{res || <span className="opacity-20 text-xs flex items-center justify-center h-full">等待生成...</span>}</NeuBox>
       </div>
    </div>
  );
};

// --- 頁面: 生成器 (含角色收藏) ---
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
      // 這裡也開啟聯網，防止寫到不存在的設定
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

  const inputClass = "w-full bg-transparent border-b border-white/10 p-2 text-sm outline-none focus:border-purple-500 transition-colors";

  return (
    <div className="space-y-12 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><Sparkles size={18}/> <h2 className="text-lg font-bold">萬能生成中心</h2></div>
       <section className="space-y-3"><span className="text-xs font-bold opacity-50 ml-2">萬能小說開頭</span><NeuBox isDark={isDark} className="p-5 space-y-4"><div className="grid grid-cols-2 gap-4"><input placeholder="類型" value={config.genre} onChange={e=>setConfig({...config, genre:e.target.value})} className={inputClass}/><input placeholder="基調" value={config.tone} onChange={e=>setConfig({...config, tone:e.target.value})} className={inputClass}/></div><input placeholder="世界觀 (如: 娛樂圈)" value={config.world} onChange={e=>setConfig({...config, world:e.target.value})} className={inputClass}/><input placeholder="CP (如: 頂流x新人)" value={config.cp} onChange={e=>setConfig({...config, cp:e.target.value})} className={inputClass}/><input placeholder="核心梗" value={config.trope} onChange={e=>setConfig({...config, trope:e.target.value})} className={inputClass}/><button onClick={()=>run('1', `角色：編劇。任務：利用網路搜尋確保設定合理，寫一個小說開頭(1500字以上)：${JSON.stringify(config)}`, setResMain)} className="w-full py-3 mt-2 bg-purple-500/10 text-purple-500 font-bold rounded-xl active:scale-95">{loading==='1'?"...":"⚡ 創作"}</button></NeuBox><NeuBox isDark={isDark} className="p-5 min-h-[150px] bg-black/5 border border-white/5 text-sm whitespace-pre-wrap">{resMain || <span className="opacity-20">結果顯示於此...</span>}</NeuBox></section>
       <section className="space-y-3"><span className="text-xs font-bold opacity-50 ml-2">靈感碎片擴充</span><NeuBox isDark={isDark} className="p-4"><textarea className="w-full h-20 bg-transparent outline-none text-sm resize-none" placeholder="輸入碎片..." value={fragment} onChange={e=>setFragment(e.target.value)}/></NeuBox><button onClick={()=>run('2', `角色：創意總監。任務：利用網路搜尋相關梗，對這個靈感碎片進行擴充：${fragment}`, setResFrag)} className="w-full py-3 bg-blue-500/10 text-blue-500 font-bold rounded-xl active:scale-95">{loading==='2'?"...":"≡ 聯想"}</button><NeuBox isDark={isDark} className="p-5 min-h-[150px] bg-black/5 border border-white/5 text-sm whitespace-pre-wrap">{resFrag || <span className="opacity-20">聯想結果...</span>}</NeuBox></section>
       <section className="space-y-3"><span className="text-xs font-bold opacity-50 ml-2">人設表生成</span><NeuBox isDark={isDark} className="p-4"><textarea className="w-full h-20 bg-transparent outline-none text-sm resize-none" placeholder="輸入特徵..." value={sheetInput} onChange={e=>setSheetInput(e.target.value)}/></NeuBox><button onClick={()=>run('3', `角色：人物設計師。任務：利用網路搜尋同類型角色參考，將內容整理成詳細人設表(Markdown)：${sheetInput}`, setResSheet)} className="w-full py-3 bg-green-500/10 text-green-500 font-bold rounded-xl active:scale-95">{loading==='3'?"...":"田 生成表格"}</button><div className="relative"><NeuBox isDark={isDark} className="p-5 min-h-[150px] bg-black/5 border border-white/5 text-sm whitespace-pre-wrap">{resSheet || <span className="opacity-20">表格結果...</span>}</NeuBox>{resSheet && (<button onClick={saveCharacter} className="absolute top-3 right-3 flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg active:scale-90 transition-transform"><Save size={14}/> 收藏人設</button>)}</div></section>
    </div>
  );
};

// --- 頁面: 我 (修復後：不會再白畫面了) ---
const PageMe = ({ isDark, apiKey, setApiKey, themeMode, toggleTheme }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60"><User size={18}/> <h2 className="text-lg font-bold">我的</h2></div>
       <div className="p-6 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-40"><LayoutTemplate size={32} /><span className="text-xs">純淨創作模式</span></div>
       <div className="space-y-4">
          <NeuBox isDark={isDark} className="p-4 flex justify-between items-center"><span className="font-bold text-sm">外觀主題</span><button onClick={toggleTheme}>{themeMode==='dark'?<Moon size={18}/>:<Sun size={18}/>}</button></NeuBox>
          <NeuBox isDark={isDark} className="p-4"><div onClick={()=>setShow(!show)} className="flex justify-between items-center cursor-pointer"><span className="font-bold text-sm">API Key 設定</span><Settings size={18}/></div>{show && <input type="password" placeholder="貼上 Gemini API Key" value={apiKey} onChange={e=>{setApiKey(e.target.value);localStorage.setItem("gemini_key",e.target.value)}} className="w-full mt-3 bg-transparent border-b border-white/20 p-1 text-sm outline-none"/>}</NeuBox>
          <div className="px-4 text-[10px] opacity-30 flex items-center gap-1"><Globe size={10}/> <span>已啟用 Google Search Grounding (聯網模式)</span></div>
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
  useEffect(() => { const check = () => (themeMode === "system" ? window.matchMedia('(prefers-color-scheme: dark)').matches : themeMode === "dark"); setIsDark(check()); }, [themeMode]);
  const toggleTheme = () => { const next = ["system", "light", "dark"][(["system", "light", "dark"].indexOf(themeMode) + 1) % 3]; setThemeMode(next); localStorage.setItem("theme_mode", next); };
  if (showChat) return <ChatInterface onClose={() => setShowChat(false)} />;
  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans relative overflow-x-hidden ${isDark ? 'bg-[#121212] text-gray-200' : 'bg-[#eef2ff] text-[#5b5d7e]'}`}>
      <style>{styles}</style>
      <div className="pt-10 pb-2 text-center px-4"><h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 tracking-tight">MemoLive</h1><p className="text-[10px] font-bold opacity-30 tracking-[0.3em] mt-1">ULTIMATE</p></div>
      <div className="max-w-md mx-auto h-full px-5">
        {activeTab === 'memo' && <PageMemo isDark={isDark} apiKey={apiKey} setShowChat={setShowChat} />}
        {activeTab === 'generator' && <PageGenerator isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'vault' && <PageVault isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'me' && <PageMe isDark={isDark} apiKey={apiKey} setApiKey={setApiKey} themeMode={themeMode} toggleTheme={toggleTheme} />}
      </div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} />
    </div>
  );
};
export default App;