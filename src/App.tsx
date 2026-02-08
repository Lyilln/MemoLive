import React, { useState, useEffect, useRef } from 'react';
// ★★★ 確保所有圖示引入完整，絕不白畫面 ★★★
import { Sparkles, Zap, Edit3, User, List, Package, Plus, X, ChevronLeft, Share2, MoreHorizontal, Send, Copy, Settings, Dice5, Save, LayoutTemplate, Moon, Sun, Globe, MessageCircle, Monitor, Wand2, Eye, Footprints, Smile, PenTool, Trash2 } from 'lucide-react';

// --- 1. 更新樣式區塊 ---
const styles = `
  @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
  
  @keyframes pulse-glow { 0%, 100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 10px rgba(168,85,247,0.4)); } 50% { opacity: 0.7; transform: scale(0.95); filter: drop-shadow(0 0 20px rgba(168,85,247,0.8)); } }
  .animate-pulse-glow { animation: pulse-glow 2s infinite ease-in-out; }

  @keyframes splash-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); pointer-events: none; } }
  .animate-splash-out { animation: splash-out 0.6s ease-in-out forwards; }

  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* ★★★ 新增：允許選取文字的樣式 ★★★ */
  .allow-select { user-select: text; -webkit-user-select: text; }
`;

// --- 核心元件：新擬態盒子 (NeuBox) ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false, border = false }) => {
  const darkShadow = active || pressed 
    ? 'shadow-[inset_5px_5px_10px_#161722,inset_-5px_-5px_10px_#2a2c40] bg-[#202130]' 
    : 'shadow-[6px_6px_12px_#151620,-6px_-6px_12px_#2b2c40] bg-[#202130]';

  const lightShadow = active || pressed
    ? 'shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] bg-[#E0E5EC]'
    : 'shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] bg-[#E0E5EC]';

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

// --- 導航列 ---
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

const NavIcon = ({ icon: Icon, label, active, onClick, isDark }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-1.5 cursor-pointer group">
    <NeuBox isDark={isDark} active={active} className={`w-12 h-12 flex items-center justify-center rounded-[18px] transition-all duration-300`}>
      <Icon size={22} strokeWidth={2.5} className={active ? 'drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]' : ''} />
    </NeuBox>
    <span className={`text-[10px] font-bold tracking-wide transition-colors ${active ? 'text-purple-500' : 'text-transparent scale-0 h-0'}`}>{label}</span>
  </div>
);

// --- 對話介面 ---
// --- 修正後的 ChatInterface (真實串接 AI + 自動捲動) ---
const ChatInterface = ({ onClose }) => {
  const [messages, setMessages] = useState([{role: 'ai', text: '（探頭）我是你的角色靈魂... 你想跟我聊什麼劇情？'}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  
  // 直接從 localStorage 拿 API Key，確保獨立運作
  const apiKey = localStorage.getItem("gemini_key");

  // 有新訊息時自動捲動到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!apiKey) return alert("請先去「我」的頁面設定 API Key 喔！");
    if (loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      // 設定 AI 角色扮演的 Prompt
      const prompt = `System: 你現在是使用者筆下小說中的角色。請完全進入角色，用該角色的口吻、語氣、性格與作者（使用者）對話。不要跳出角色。
      
      User: ${userMsg}`;
      
      const reply = await callGemini(apiKey, prompt, false);
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "😵 訊號中斷... (" + e.message + ")" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#1a1b23] flex flex-col animate-fade-in">
      {/* 頂部導航 */}
      <div className="flex items-center justify-between p-4 pt-12 border-b border-white/5 bg-[#1a1b23]">
        <button onClick={onClose} className="flex items-center gap-1 text-gray-400 text-sm font-bold active:scale-95"><ChevronLeft size={20}/> 返回</button>
        <span className="text-white font-bold text-sm tracking-wider">角色實時互動空間</span>
        <div className="flex gap-3 text-gray-400"><Share2 size={20}/><MoreHorizontal size={20}/></div>
      </div>

      {/* 聊天內容區 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
         {messages.map((m, i) => (
           <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed allow-select ${m.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-[#252630] text-gray-200 rounded-bl-none border border-white/5'}`}>
               {m.text}
             </div>
           </div>
         ))}
         {loading && <div className="text-xs text-gray-500 animate-pulse ml-2">角色正在輸入...</div>}
         <div ref={bottomRef} />
      </div>

      {/* 輸入區 */}
      <div className="p-4 pb-10 bg-[#1a1b23]">
         <div className="bg-[#252630] rounded-[20px] p-1.5 pl-5 flex items-center shadow-lg border border-white/5">
            <input 
              className="flex-1 bg-transparent outline-none text-white text-sm h-10 placeholder-gray-600" 
              placeholder="輸入你想說的話..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button 
              onClick={sendMessage}
              disabled={loading}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform ${loading ? 'bg-gray-600' : 'bg-purple-600 active:scale-90'}`}
            >
              <Send size={18} className="ml-0.5"/>
            </button>
         </div>
      </div>
    </div>
  );
};

  return (
    <div className="fixed inset-0 z-[100] bg-[#1a1b23] flex flex-col animate-fade-in">
      {/* 頂部導航 */}
      <div className="flex items-center justify-between p-4 pt-12 border-b border-white/5 bg-[#1a1b23]">
        <button onClick={onClose} className="flex items-center gap-1 text-gray-400 text-sm font-bold active:scale-95"><ChevronLeft size={20}/> 返回</button>
        <span className="text-white font-bold text-sm tracking-wider">角色實時互動空間</span>
        <div className="flex gap-3 text-gray-400"><Share2 size={20}/><MoreHorizontal size={20}/></div>
      </div>

      {/* 聊天內容區 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
         {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
                <MessageCircle size={40} className="mb-2"/>
                <span className="text-xs">開始第一句對話...</span>
            </div>
         )}
         {messages.map((m, i) => (
           <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-[#252630] text-gray-200 rounded-bl-none border border-white/5'}`}>
               {m.text}
             </div>
           </div>
         ))}
         {loading && <div className="text-xs text-gray-500 animate-pulse ml-2">角色正在輸入...</div>}
         <div ref={bottomRef} />
      </div>

      {/* 輸入區 */}
      <div className="p-4 pb-10 bg-[#1a1b23]">
         <div className="bg-[#252630] rounded-[20px] p-1.5 pl-5 flex items-center shadow-lg border border-white/5">
            <input 
              className="flex-1 bg-transparent outline-none text-white text-sm h-10 placeholder-gray-600" 
              placeholder="輸入你想說的話..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button 
              onClick={sendMessage}
              disabled={loading}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform ${loading ? 'bg-gray-600' : 'bg-purple-600 active:scale-90'}`}
            >
              <Send size={18} className="ml-0.5"/>
            </button>
         </div>
      </div>
    </div>
  );
};

// --- API 核心 ---
const callGemini = async (apiKey, prompt, useWeb = false) => {
  const tools = useWeb ? [{ googleSearch: {} }] : [];
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { 
    method: "POST", 
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], tools: tools }) 
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  
  const candidate = data.candidates?.[0];
  if (!candidate) return "生成失敗，請重試。";
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
          const prompt = `角色：創意小說家。任務：請根據這三個隨機關鍵字 [${tags.join(', ')}]，腦力激盪出一個精彩的小說開頭（至少 500 字）。直接開始故事，不要有前言。`;
          const text = await callGemini(apiKey, prompt, false);
          onResult(text);
      } catch(e) { alert("生成失敗: " + e.message); } finally { setLoading(false); }
  };
  return (
    <NeuBox isDark={isDark} className="p-5 mb-6 flex flex-col items-center gap-5">
       <div className="flex gap-3 w-full justify-center">
          {slots.map((text, i) => (<NeuBox key={i} isDark={isDark} pressed className={`flex-1 h-16 flex items-center justify-center text-xs font-bold text-center px-1 ${spinning ? 'opacity-50 blur-[1px]' : 'text-purple-500'}`}>{text}</NeuBox>))}
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
  // 這裡就是你的「資料庫」，它會讀取手機裡的 memo_vault 存檔
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('memo_vault') || '[]'); } catch { return []; } }); 
  const [newItemContent, setNewItemContent] = useState(''); 
  const [isAdding, setIsAdding] = useState(false); 
  const [slotResult, setSlotResult] = useState("");

  // 當 items 改變時，自動存入手機資料庫
  useEffect(() => { localStorage.setItem('memo_vault', JSON.stringify(items)); }, [items]); 
  
  const addItem = (content = newItemContent, type = tab) => { 
      if (!content.trim()) return; 
      setItems([{ id: Date.now(), type: type, content: content, date: new Date().toLocaleDateString() }, ...items]); 
      setNewItemContent(''); 
      setIsAdding(false); 
      setSlotResult(""); 
  }; 
  
  const filteredItems = items.filter(i => i.type === tab); 
  const TabBtn = ({ id, label, icon: Icon }) => ( <NeuBox isDark={isDark} active={tab === id} onClick={() => setTab(id)} className="flex-1 py-3 flex justify-center items-center gap-2 text-xs font-bold"><Icon size={16}/> {label} </NeuBox> );

  return (
    <div className="space-y-4 animate-fade-in pb-32 h-full flex flex-col">
       <div className="flex items-center gap-2 opacity-60 px-2 mt-2"><Package size={20}/> <h2 className="text-xl font-bold">靈感庫</h2></div>
       
       <SlotMachine isDark={isDark} apiKey={apiKey} onResult={setSlotResult} />
       
       {/* 拉霸結果展示區 */}
       {slotResult && ( 
         <div className="animate-fade-in mb-2">
            <div className="flex justify-between items-center px-2 mb-2 opacity-70"><span className="text-xs font-bold text-purple-400">🎉 生成結果</span></div>
            <NeuBox isDark={isDark} className="p-4 relative border border-purple-500/30">
               <div className="text-sm whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar">{slotResult}</div>
               <div className="flex gap-3 mt-3 pt-3 border-t border-white/5">
                  <button onClick={() => addItem(slotResult, 'snippet')} className="flex-1 py-2 bg-purple-600 rounded-xl text-white text-xs font-bold shadow-lg active:scale-95">存入碎片</button>
                  <button onClick={() => setSlotResult("")} className="px-4 py-2 text-gray-500 text-xs font-bold active:scale-95">捨棄</button>
               </div>
            </NeuBox>
         </div> 
       )}

       <div className="flex gap-3 px-1"><TabBtn id="snippet" label="碎片" icon={List} /><TabBtn id="char" label="人設" icon={User} /><TabBtn id="world" label="設定" icon={Sparkles} /></div>
       
       {isAdding ? ( 
          <div className="animate-fade-in space-y-3 z-10">
            <NeuBox isDark={isDark} pressed className="p-4 border border-purple-500/50">
              <textarea autoFocus className="w-full h-24 bg-transparent outline-none resize-none text-sm placeholder-opacity-50" placeholder="輸入靈感..." value={newItemContent} onChange={e=>setNewItemContent(e.target.value)}/>
            </NeuBox>
            <div className="flex gap-3">
              <NeuBox isDark={isDark} onClick={() => addItem()} className="flex-1 py-3 text-purple-500 text-sm font-bold flex justify-center bg-purple-500/10">確認儲存</NeuBox>
              <NeuBox isDark={isDark} onClick={()=>setIsAdding(false)} className="py-3 px-6 text-gray-500 flex justify-center"><X size={20}/></NeuBox>
            </div>
          </div> 
       ) : ( 
         <NeuBox isDark={isDark} onClick={()=>setIsAdding(true)} className="py-3 flex justify-center items-center gap-2 text-purple-500 opacity-80 text-sm font-bold border border-dashed border-purple-500/30 active:scale-95"><Plus size={16}/> 新增項目</NeuBox> 
       )}
       
       {/* ★★★ 資料庫大框框 (Storage Box) ★★★ */}
       {/* 這裡就是你要的「大框框」，我做了凹陷效果，讓它看起來像個資料儲存區 */}
       <div className={`flex-grow overflow-hidden rounded-[24px] p-1 ${isDark ? 'bg-[#161722]/50 shadow-[inset_2px_2px_6px_#0b0c15,inset_-2px_-2px_6px_#2a2c38]' : 'bg-[#D1D9E6] shadow-[inset_2px_2px_6px_#b8b9be,inset_-2px_-2px_6px_#ffffff]'}`}>
         <div className="h-full overflow-y-auto p-3 space-y-3 no-scrollbar">
            {filteredItems.length === 0 && !isAdding && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-2">
                    <Package size={40} strokeWidth={1} />
                    <span className="text-xs">這裡還沒有資料...</span>
                </div>
            )}
            {filteredItems.map(item => (
              <NeuBox key={item.id} isDark={isDark} className="p-4 relative group animate-fade-in border border-white/5">
                <div className="whitespace-pre-wrap text-sm leading-relaxed opacity-90">{item.content}</div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5 opacity-50">
                  <span className="text-[10px] font-bold tracking-wider">{item.date}</span>
                  {/* 這就是之前導致黑屏的按鈕，現在有了 Trash2 就不會崩潰了 */}
                  <button onClick={(e)=>{e.stopPropagation(); setItems(items.filter(i=>i.id!==item.id))}} className="p-2 text-red-400 hover:text-red-500 active:scale-90 transition-transform">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </NeuBox>
            ))}
         </div>
       </div>
    </div>
  );
};

// --- 頁面: 續寫 (萬字支援 + 擴寫魔杖 + 1500字 + 聯網) ---
const PageMemo = ({ isDark, apiKey, setShowChat }) => {
  // 1. 修改：初始值從 localStorage 讀取 (解決資料遺失)
  const [note, setNote] = useState(() => localStorage.getItem("memo_draft") || "");
  const [res, setRes] = useState("");
  const [loading, setLoading] = useState(false);
  const textAreaRef = useRef(null);

  // 2. 新增：監聽 note 變化，自動存入手機 (解決資料遺失)
  useEffect(() => {
    localStorage.setItem("memo_draft", note);
  }, [note]);

  const gen = async () => {
    if (!apiKey) return alert("請設定 API Key");
    if (!note) return alert("內容不能為空");
    setLoading(true);
    try {
      const prompt = `角色：同人小說家。任務：續寫文章。步驟：1.分析原文人物性格(OOC禁止)、風格。2.聯網確認偶像/影視資訊。3.續寫長度需達【1500字以上】。原文：${note}`;
      const text = await callGemini(apiKey, prompt, true);
      setRes(text);
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  };

  const expandSentence = async () => {
    const textarea = textAreaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = note.substring(start, end);

    if (!selectedText || selectedText.trim().length === 0) return alert("請先選取您想要擴寫的句子！");
    if (!apiKey) return alert("請設定 API Key");

    setLoading(true);
    try {
        const prompt = `角色：細膩的文學家。任務：請將這句話擴寫成一段充滿畫面感、微表情、動作與環境描寫的細膩段落（約 50-100 字）。請保持原意，但大幅增加質感。原句：${selectedText}`;
        const expandedText = await callGemini(apiKey, prompt, false);
        const newText = note.substring(0, start) + expandedText + note.substring(end);
        setNote(newText);
    } catch(e) { alert(e.message); } finally { setLoading(false); }
  };

  // 3. 新增：一鍵插入功能 (解決操作不便)
  const insertText = () => {
    if(!res) return;
    setNote(prev => prev + "\n\n" + res); // 接在文章最後面 (加兩個換行)
    setRes(""); // 清空結果框，代表已處理
    alert("✅ 已插入文章末尾！");
  };

  return (
    <div className="space-y-5 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60 px-2 mt-2"><Edit3 size={20}/> <h2 className="text-xl font-bold">筆記續寫</h2></div>
       <NeuBox isDark={isDark} pressed className="p-5 h-[40vh] relative">
         <textarea 
            ref={textAreaRef} 
            className="w-full h-full bg-transparent outline-none resize-none text-base leading-relaxed opacity-80 placeholder-opacity-40 allow-select" 
            placeholder="請貼上你的文章 (支援 50,000 字以上)... 選取文字可使用魔杖擴寫" 
            value={note} 
            onChange={e=>setNote(e.target.value)} 
            maxLength={50000} 
         />
         <button onClick={expandSentence} className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg text-white active:scale-90 transition-transform flex items-center justify-center" title="✨ 擴寫選取文字"><Wand2 size={20}/></button>
       </NeuBox>
       <div className="flex gap-4">
         <NeuBox isDark={isDark} onClick={gen} className="flex-1 py-4 flex justify-center gap-2 font-bold text-purple-500 text-sm">{loading ? "..." : <><Zap size={18}/> 續寫 (聯網+長文)</>}</NeuBox>
         <NeuBox isDark={isDark} onClick={() => setShowChat(true)} className="flex-1 py-4 flex justify-center gap-2 font-bold text-pink-500 text-sm"><MessageCircle size={18}/> 對話</NeuBox>
       </div>
       <div className="flex flex-col gap-3">
          <div className="flex justify-between px-2 opacity-50"><span className="text-xs font-bold">AI 產出結果 (1500字+)</span>{res && <Copy size={14}/>}</div>
          
          <div className="relative group">
             <NeuBox isDark={isDark} className="p-6 min-h-[250px] text-sm whitespace-pre-wrap leading-relaxed allow-select">
                {res || <span className="opacity-20 text-xs flex items-center justify-center h-full">等待生成...</span>}
             </NeuBox>
             {/* 4. 按鈕：插入內文 */}
             {res && (
                <button onClick={insertText} className="absolute bottom-4 right-4 flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg active:scale-95 transition-transform">
                   <PenTool size={14}/> 插入內文
                </button>
             )}
          </div>
       </div>
    </div>
  );
};

// --- 頁面: 生成器 (包含：靈感生成(舊) + 潤色工具(新)) ---
const PageGenerator = ({ isDark, apiKey }) => {
  const [subTab, setSubTab] = useState('generate');
  const [config, setConfig] = useState({ genre: "現代言情", tone: "甜寵", world: "", cp: "", trope: "" });
  const [fragment, setFragment] = useState("");
  const [sheetInput, setSheetInput] = useState("");
  
  // 結果狀態
  const [resMain, setResMain] = useState("");
  const [resFrag, setResFrag] = useState("");
  const [resSheet, setResSheet] = useState("");
  const [resTool, setResTool] = useState("");
  
  // 工具輸入
  const [toolInput1, setToolInput1] = useState("");
  const [toolInput2, setToolInput2] = useState("");
  
  const [loading, setLoading] = useState("");

  const run = async (id, prompt, setter) => {
    if (!apiKey) return alert("API Key?");
    setLoading(id);
    try {
      const text = await callGemini(apiKey, prompt, true);
      setter(text);
    } catch (e) { alert(e.message); } finally { setLoading(""); }
  };

  // ★★★ 通用儲存功能：把任何文字存入靈感庫 ★★★
  const saveToVault = (content, type = 'snippet') => {
      if(!content) return;
      const vault = JSON.parse(localStorage.getItem('memo_vault') || '[]');
      // 這裡 type 預設存為 'snippet' (碎片)，人設表則存為 'char' (人設)
      const newItem = { id: Date.now(), type: type, content: content, date: new Date().toLocaleDateString() };
      localStorage.setItem('memo_vault', JSON.stringify([newItem, ...vault]));
      alert("✅ 已存入靈感庫！");
  };

  // ★★★ 通用複製功能 ★★★
  const copyText = (text) => {
      if(!text) return;
      navigator.clipboard.writeText(text).then(() => alert("📋 已複製到剪貼簿"));
  };

  const inputClass = "w-full bg-transparent border-b border-white/10 p-2 text-sm outline-none focus:border-purple-500 transition-colors placeholder-opacity-40";

  // 結果顯示框組件 (包含：可選取文字、儲存按鈕、複製按鈕)
  const ResultBox = ({ text, type = 'snippet', placeholder = "結果顯示於此..." }) => (
    <div className="relative group">
        <NeuBox isDark={isDark} className="p-6 min-h-[150px] text-sm whitespace-pre-wrap leading-relaxed allow-select">
            {text || <span className="opacity-20 flex items-center justify-center h-full select-none">{placeholder}</span>}
        </NeuBox>
        {text && (
            <div className="flex gap-2 mt-2 justify-end">
                <button onClick={() => copyText(text)} className="flex items-center gap-1 bg-gray-500/20 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-transform"><Copy size={14}/> 複製</button>
                <button onClick={() => saveToVault(text, type)} className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg active:scale-95 transition-transform"><Save size={14}/> 存入靈感庫</button>
            </div>
        )}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60 px-2 mt-2"><Sparkles size={20}/> <h2 className="text-xl font-bold">萬能生成中心</h2></div>
       <div className="flex gap-4 px-1 mb-2">
          <NeuBox isDark={isDark} active={subTab === 'generate'} onClick={() => setSubTab('generate')} className="flex-1 py-3 flex justify-center font-bold text-sm">靈感生成</NeuBox>
          <NeuBox isDark={isDark} active={subTab === 'tools'} onClick={() => setSubTab('tools')} className="flex-1 py-3 flex justify-center font-bold text-sm">潤色工具</NeuBox>
       </div>

       {subTab === 'generate' && (
         <div className="space-y-8 animate-fade-in">
            <section className="space-y-3">
                <span className="text-xs font-bold opacity-50 ml-2">萬能小說開頭</span>
                <NeuBox isDark={isDark} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-5"><input placeholder="類型" value={config.genre} onChange={e=>setConfig({...config, genre:e.target.value})} className={inputClass}/><input placeholder="基調" value={config.tone} onChange={e=>setConfig({...config, tone:e.target.value})} className={inputClass}/></div>
                    <input placeholder="世界觀" value={config.world} onChange={e=>setConfig({...config, world:e.target.value})} className={inputClass}/>
                    <input placeholder="CP" value={config.cp} onChange={e=>setConfig({...config, cp:e.target.value})} className={inputClass}/>
                    <input placeholder="核心梗" value={config.trope} onChange={e=>setConfig({...config, trope:e.target.value})} className={inputClass}/>
                    <NeuBox isDark={isDark} onClick={()=>run('main', `寫開頭(1500字以上)：${JSON.stringify(config)}`, setResMain)} className="w-full py-3 mt-2 flex justify-center text-purple-500 font-bold">{loading==='main'?"...":"⚡ 創作"}</NeuBox>
                </NeuBox>
                <ResultBox text={resMain} type="snippet" />
            </section>
            
            <section className="space-y-3">
                <span className="text-xs font-bold opacity-50 ml-2">靈感碎片擴充</span>
                <NeuBox isDark={isDark} pressed className="p-5"><textarea className="w-full h-20 bg-transparent outline-none text-sm resize-none placeholder-opacity-40" placeholder="輸入碎片..." value={fragment} onChange={e=>setFragment(e.target.value)}/></NeuBox>
                <NeuBox isDark={isDark} onClick={()=>run('frag', `聯想：${fragment}`, setResFrag)} className="w-full py-3 flex justify-center text-blue-500 font-bold">{loading==='frag'?"...":"≡ 聯想"}</NeuBox>
                <ResultBox text={resFrag} type="snippet" />
            </section>

            <section className="space-y-3">
                <span className="text-xs font-bold opacity-50 ml-2">人設表生成</span>
                <NeuBox isDark={isDark} pressed className="p-5"><textarea className="w-full h-20 bg-transparent outline-none text-sm resize-none placeholder-opacity-40" placeholder="輸入特徵..." value={sheetInput} onChange={e=>setSheetInput(e.target.value)}/></NeuBox>
                <NeuBox isDark={isDark} onClick={()=>run('sheet', `人設表(Markdown)：${sheetInput}`, setResSheet)} className="w-full py-3 flex justify-center text-green-500 font-bold">{loading==='sheet'?"...":"田 生成表格"}</NeuBox>
                <ResultBox text={resSheet} type="char" placeholder="表格結果..." />
            </section>
         </div>
       )}

       {subTab === 'tools' && (
         <div className="space-y-8 animate-fade-in">
            <section className="space-y-3">
                <div className="flex items-center gap-2 ml-2"><Eye size={16} className="text-blue-500"/><span className="text-xs font-bold opacity-70">五感描寫素材</span></div>
                <NeuBox isDark={isDark} pressed className="p-5"><input className="w-full bg-transparent outline-none" placeholder="輸入場景..." value={toolInput1} onChange={e=>setToolInput1(e.target.value)}/></NeuBox>
                <NeuBox isDark={isDark} onClick={()=>run('tool', `角色：編劇。針對場景「${toolInput1}」，提供五感描寫素材。`, setResTool)} className="w-full py-3 flex justify-center text-blue-500 font-bold">{loading==='tool'?"...":"👁️ 生成素材"}</NeuBox>
            </section>
            <section className="space-y-3">
                <div className="flex items-center gap-2 ml-2"><Footprints size={16} className="text-green-500"/><span className="text-xs font-bold opacity-70">劇情過渡橋樑</span></div>
                <div className="flex gap-3"><NeuBox isDark={isDark} pressed className="flex-1 p-4"><input className="w-full bg-transparent outline-none text-sm" placeholder="起點" value={toolInput1} onChange={e=>setToolInput1(e.target.value)}/></NeuBox><NeuBox isDark={isDark} pressed className="flex-1 p-4"><input className="w-full bg-transparent outline-none text-sm" placeholder="終點" value={toolInput2} onChange={e=>setToolInput2(e.target.value)}/></NeuBox></div>
                <NeuBox isDark={isDark} onClick={()=>run('tool', `角色：小說家。寫一段從「${toolInput1}」過渡到「${toolInput2}」的轉場文字。`, setResTool)} className="w-full py-3 flex justify-center text-green-500 font-bold">{loading==='tool'?"...":"🌉 生成轉場"}</NeuBox>
            </section>
            <section className="space-y-3">
                <div className="flex items-center gap-2 ml-2"><Smile size={16} className="text-pink-500"/><span className="text-xs font-bold opacity-70">情緒同義詞庫</span></div>
                <div className="flex gap-3 flex-wrap">{["生氣", "高興", "難過", "害怕", "驚訝", "害羞"].map(e => (<NeuBox key={e} isDark={isDark} onClick={()=>run('tool', `角色：辭典編撰者。列出形容「${e}」的高級詞彙。`, setResTool)} className="px-4 py-2 text-xs font-bold text-purple-500 active:scale-95">{e}</NeuBox>))}</div>
            </section>
            
            <div className="space-y-1">
                <span className="text-xs font-bold opacity-50 ml-2">工具產出結果</span>
                <ResultBox text={resTool} type="snippet" />
            </div>
         </div>
       )}
    </div>
  );
};

// --- 頁面: 我 (修復：淺/深/系統 模式切換) ---
const PageMe = ({ isDark, apiKey, setApiKey, themeMode, setThemeMode }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60 px-2 mt-2"><User size={20}/> <h2 className="text-xl font-bold">我的</h2></div>
       <NeuBox isDark={isDark} className="p-8 flex flex-col items-center justify-center gap-3 opacity-60"><LayoutTemplate size={40} /><span className="text-sm font-bold tracking-widest">PRO 創作模式</span></NeuBox>
       <div className="space-y-5">
          <div className="space-y-2">
             <span className="text-xs font-bold opacity-50 ml-2">外觀主題</span>
             <NeuBox isDark={isDark} className="p-2 flex gap-3">
                <NeuBox isDark={isDark} active={themeMode === 'light'} onClick={() => setThemeMode('light')} className="flex-1 py-3 flex flex-col items-center justify-center gap-1"><Sun size={20} /><span className="text-[10px] font-bold">淺色</span></NeuBox>
                <NeuBox isDark={isDark} active={themeMode === 'dark'} onClick={() => setThemeMode('dark')} className="flex-1 py-3 flex flex-col items-center justify-center gap-1"><Moon size={20} /><span className="text-[10px] font-bold">深色</span></NeuBox>
                <NeuBox isDark={isDark} active={themeMode === 'system'} onClick={() => setThemeMode('system')} className="flex-1 py-3 flex flex-col items-center justify-center gap-1"><Monitor size={20} /><span className="text-[10px] font-bold">系統</span></NeuBox>
             </NeuBox>
          </div>
          <div className="space-y-2">
             <span className="text-xs font-bold opacity-50 ml-2">系統設定</span>
             <NeuBox isDark={isDark} className="p-5">
                <div onClick={()=>setShow(!show)} className="flex justify-between items-center cursor-pointer"><span className="font-bold text-sm">Gemini API Key</span><Settings size={18}/></div>
                {show && <input type="password" placeholder="貼上 API Key..." value={apiKey} onChange={e=>{setApiKey(e.target.value);localStorage.setItem("gemini_key",e.target.value)}} className="w-full mt-4 bg-transparent border-b border-white/20 p-2 text-sm outline-none font-mono"/>}
             </NeuBox>
          </div>
          <div className="px-4 text-[10px] opacity-30 flex items-center gap-1 justify-center mt-4"><Globe size={12}/> <span>已啟用 Google Search Grounding (聯網模式)</span></div>
       </div>
    </div>
  );
};

// --- 2. 新增：開場動畫元件 ---
const SplashScreen = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 2秒後開始執行淡出動畫
    const timer = setTimeout(() => setFading(true), 2000); 
    // 動畫跑完(0.6秒)後，正式移除組件
    const removeTimer = setTimeout(onFinish, 2600);
    return () => { clearTimeout(timer); clearTimeout(removeTimer); };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#202130] flex flex-col items-center justify-center transition-all duration-500 ${fading ? 'animate-splash-out' : ''}`}>
       <div className="relative w-24 h-24 flex items-center justify-center animate-pulse-glow">
          <div className="absolute inset-0 bg-[#202130] rounded-[28px] shadow-[8px_8px_16px_#151620,-8px_-8px_16px_#2b2c40]"></div>
          {/* Logo */}
          <Edit3 size={40} className="text-purple-500 relative z-10" strokeWidth={2.5} />
       </div>
       <div className="mt-6 flex flex-col items-center gap-2">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 tracking-tight">MemoLive</h1>
          <p className="text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase">Ultimate</p>
       </div>
    </div>
  );
};

// --- App ---
const App = () => {
  const [showSplash, setShowSplash] = useState(true); 
  const [activeTab, setActiveTab] = useState("memo");
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
  const [themeMode, setThemeMode] = useState(localStorage.getItem("theme_mode") || "system");
  const [isDark, setIsDark] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const applyTheme = () => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDarkMode = themeMode === 'system' ? systemDark : themeMode === 'dark';
      setIsDark(isDarkMode);
    };
    applyTheme();
    localStorage.setItem("theme_mode", themeMode);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [themeMode]);

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  
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