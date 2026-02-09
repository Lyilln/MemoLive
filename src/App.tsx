import React, { useState, useEffect, useRef } from 'react';
// ★★★ 1. 確保所有圖示引入完整 (無遺漏) ★★★
import { 
  Sparkles, Zap, Edit3, User, List, Package, Plus, X, 
  ChevronLeft, Share2, MoreHorizontal, Send, Copy, Settings, 
  Dice5, Save, LayoutTemplate, Moon, Sun, Globe, MessageCircle, 
  Monitor, Wand2, Eye, Footprints, Smile, PenTool, Trash2, 
  Search, Download, Upload, FolderOpen, FileText, FilePlus, 
  ChevronRight, Menu 
} from 'lucide-react';

// --- 2. 全局樣式區塊 (包含所有動畫與 iPhone 適配) ---
const styles = `
  /* 基礎淡入動畫 */
  @keyframes fade-in { 
    from { opacity: 0; transform: translateY(10px); } 
    to { opacity: 1; transform: translateY(0); } 
  }
  .animate-fade-in { 
    animation: fade-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
  }
  
  /* 左側邊欄滑入動畫 (檔案櫃用) */
  @keyframes slide-in-left { 
    from { transform: translateX(-100%); } 
    to { transform: translateX(0); } 
  }
  .animate-slide-in-left { 
    animation: slide-in-left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
  }

  /* 右側邊欄滑入動畫 (角色設定用) */
  @keyframes slide-in-right { 
    from { transform: translateX(100%); } 
    to { transform: translateX(0); } 
  }
  .animate-slide-in-right { 
    animation: slide-in-right 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
  }

  /* 呼吸燈效果 (Logo用) */
  @keyframes pulse-glow { 
    0%, 100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 10px rgba(168,85,247,0.4)); } 
    50% { opacity: 0.7; transform: scale(0.95); filter: drop-shadow(0 0 20px rgba(168,85,247,0.8)); } 
  }
  .animate-pulse-glow { 
    animation: pulse-glow 2.5s infinite ease-in-out; 
  }

  /* 開場動畫退場 */
  @keyframes splash-out { 
    from { opacity: 1; transform: translateY(0); } 
    to { opacity: 0; transform: translateY(-20px); pointer-events: none; } 
  }
  .animate-splash-out { 
    animation: splash-out 0.6s ease-in-out forwards; 
  }

  /* 禁止橡皮筋回彈 & 點擊高亮 (App 質感關鍵) */
  body { 
    overscroll-behavior-y: none; 
    -webkit-tap-highlight-color: transparent; 
  }

  /* 隱藏捲軸但保留滾動功能 */
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* 允許選取文字 (對寫作 App 很重要) */
  .allow-select { user-select: text; -webkit-user-select: text; }
  
  /* 適配 iPhone 瀏海與 Home Bar (安全區域) */
  .safe-top { padding-top: env(safe-area-inset-top); }
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
`;

// --- 3. 核心元件：新擬態盒子 (NeuBox) ---
const NeuBox = ({ children, className = '', pressed = false, onClick, isDark, active = false, border = false }) => {
  const darkShadow = active || pressed 
    ? 'shadow-[inset_4px_4px_8px_#161722,inset_-4px_-4px_8px_#2a2c40] bg-[#202130]' 
    : 'shadow-[5px_5px_10px_#151620,-5px_-5px_10px_#2b2c40] bg-[#202130]';

  const lightShadow = active || pressed
    ? 'shadow-[inset_5px_5px_10px_#b8b9be,inset_-5px_-5px_10px_#ffffff] bg-[#E0E5EC]'
    : 'shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] bg-[#E0E5EC]';

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

// --- 4. 導航列 (具備自動隱藏功能) ---
const Navigation = ({ activeTab, setActiveTab, isDark, forceHide }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 偵測是否正在輸入 (鍵盤彈出)
    const handleFocus = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        setIsVisible(false);
      }
    };

    const handleBlur = (e) => {
      // 延遲顯示，避免鍵盤收起時閃爍
      setTimeout(() => {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          setIsVisible(true);
        }
      }, 100);
    };

    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);

    return () => {
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
    };
  }, []);

  // 如果 forceHide (側邊欄打開) 為 true，強制隱藏導航列
  const shouldShow = isVisible && !forceHide;

  return (
    <div 
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[380px] safe-bottom
        transition-all duration-500 ease-in-out
        ${shouldShow ? 'translate-y-0 opacity-100' : 'translate-y-[200%] opacity-0'} 
      `}
    >
      <div className={`flex justify-between items-center px-6 py-4 rounded-[28px] shadow-2xl backdrop-blur-md ${isDark ? 'bg-[#202130]/90 shadow-black/40' : 'bg-[#E0E5EC]/90 shadow-gray-400/40'}`}>
        <NavIcon icon={Edit3} label="續寫" active={activeTab === 'memo'} onClick={() => setActiveTab('memo')} isDark={isDark} />
        <NavIcon icon={Sparkles} label="生成器" active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} isDark={isDark} />
        <NavIcon icon={Package} label="靈感庫" active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} isDark={isDark} />
        <NavIcon icon={User} label="我" active={activeTab === 'me'} onClick={() => setActiveTab('me')} isDark={isDark} />
      </div>
    </div>
  );
};

const NavIcon = ({ icon: Icon, label, active, onClick, isDark }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-1.5 cursor-pointer group">
    <NeuBox isDark={isDark} active={active} className={`w-12 h-12 flex items-center justify-center rounded-[18px] transition-all duration-300`}>
      <Icon size={22} strokeWidth={2.5} className={active ? 'drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]' : ''} />
    </NeuBox>
    <span className={`text-[10px] font-bold tracking-wide transition-colors ${active ? 'text-purple-500' : 'text-transparent scale-0 h-0'}`}>{label}</span>
  </div>
);

// --- 5. API 核心 (保留你指定的 Gemini 2.5 版本) ---
const callGemini = async (apiKey, prompt, useWeb = false) => {
  const tools = useWeb ? [{ googleSearch: {} }] : [];
  
  // 🔴 這裡遵照指示，保留 gemini-2.5-flash-preview-09-2025
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

// --- 6. 對話介面 (升級版：含右側設定欄 + 雙重分享功能) ---
const ChatInterface = ({ onClose }) => {
  // 角色設定狀態 (預設值)
  const [charConfig, setCharConfig] = useState(() => {
    try { 
        return JSON.parse(localStorage.getItem('chat_config') || '{"name":"神秘角色","setting":"你是一個神祕的小說角色，語氣要稍微高冷但帶點關心。"}'); 
    } catch { 
        return {name:"神秘角色", setting:"你是一個神祕的小說角色。"}; 
    }
  });
  
  const [messages, setMessages] = useState([{role: 'ai', text: `（看著你）我是 ${charConfig.name}。找我... 有事嗎？`}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // 控制右側設定欄
  const bottomRef = useRef(null);
  const apiKey = localStorage.getItem("gemini_key");

  // 自動捲動到底部
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  
  // 自動儲存角色設定
  useEffect(() => { localStorage.setItem('chat_config', JSON.stringify(charConfig)); }, [charConfig]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!apiKey) return alert("請先去「我」的頁面設定 API Key 喔！");
    if (loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      // 🔴 關鍵升級：將角色設定注入 Prompt，讓 AI 知道它是誰
      const prompt = `System: 你現在正在進行角色扮演 (Roleplay)。
      你的角色名稱：${charConfig.name}
      你的詳細設定/人設：${charConfig.setting}
      
      請完全沉浸在角色中，用該角色的口吻、語氣、性格與使用者對話。絕對不要跳出角色，也不要承認自己是 AI。
      
      User: ${userMsg}`;
      
      const reply = await callGemini(apiKey, prompt, false);
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (e) { 
      setMessages(prev => [...prev, { role: 'ai', text: "😵 訊號中斷... (" + e.message + ")" }]);
    } finally { 
      setLoading(false); 
    }
  };

  // ★★★ 雙重分享功能：同時存入靈感庫 & 續寫 ★★★
  const handleShare = () => {
    if(messages.length < 2) return alert("還沒開始聊天呢！");
    
    const chatContent = messages.map(m => `[${m.role === 'user' ? '我' : charConfig.name}]: ${m.text}`).join('\n\n');
    const timestamp = new Date().toLocaleString();

    // 1. 存入靈感庫 (Vault) - Type: world (設定)
    try {
        const vault = JSON.parse(localStorage.getItem('memo_vault') || '[]');
        vault.unshift({ 
            id: Date.now(), 
            type: 'world', // 存到設定分類
            content: `【對話紀錄：${charConfig.name}】\n${chatContent}`, 
            date: new Date().toLocaleDateString() 
        });
        localStorage.setItem('memo_vault', JSON.stringify(vault));
    } catch(e) { console.error("Vault save failed", e); }

    // 2. 存入續寫 (Memo) - 建立新檔案
    try {
        const files = JSON.parse(localStorage.getItem('memo_files') || '[]');
        // 確保 files 是一個陣列 (全域防護的一部分)
        const validFiles = Array.isArray(files) ? files : [];
        
        validFiles.unshift({
            id: Date.now() + 1, // 確保 ID 不重複
            title: `與 ${charConfig.name} 的對話`, 
            content: chatContent,
            lastModified: timestamp
        });
        localStorage.setItem('memo_files', JSON.stringify(validFiles));
    } catch(e) { console.error("Memo save failed", e); }

    alert(`✅ 已成功分享！\n1. 已存入「靈感庫-設定」\n2. 已建立新檔案在「續寫」頁面`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#1a1b23] flex flex-col animate-fade-in">
      {/* 頂部導航 (Safe Area) */}
      <div className="safe-top bg-[#1a1b23] z-30 relative">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
            <button onClick={onClose} className="flex items-center gap-1 text-gray-400 text-sm font-bold active:scale-95"><ChevronLeft size={20}/> 返回</button>
            <div className="flex flex-col items-center">
                <span className="text-white font-bold text-sm tracking-wider">{charConfig.name}</span>
                <span className="text-[10px] text-green-400 font-mono">Online</span>
            </div>
            <div className="flex gap-4 text-gray-400">
                {/* 分享按鈕 (圖一圈選處) */}
                <button onClick={handleShare} className="active:scale-90 active:text-purple-500 transition-transform"><Share2 size={20}/></button>
                {/* 設定選單按鈕 (圖一圈選處，開啟右側欄) */}
                <button onClick={() => setShowSidebar(true)} className="active:scale-90 active:text-purple-500 transition-transform"><MoreHorizontal size={20}/></button>
            </div>
        </div>
      </div>

      {/* ★★★ 右側角色設定側邊欄 (Sidebar) ★★★ */}
      {showSidebar && (
        <div className="fixed inset-0 z-[200] flex justify-end safe-top safe-bottom">
            {/* 背景遮罩 (點擊關閉) */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSidebar(false)}></div>
            
            {/* 側邊欄本體 */}
            <div className="w-[85%] max-w-[320px] h-full bg-[#1e1f29] shadow-2xl p-6 flex flex-col gap-6 animate-slide-in-right relative border-l border-white/10">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-white font-bold text-lg flex items-center gap-2"><Settings size={18}/> 角色設定</span>
                    <button onClick={() => setShowSidebar(false)}><X size={20} className="text-gray-400"/></button>
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
                    <div className="space-y-2">
                        <label className="text-xs text-purple-400 font-bold uppercase tracking-wider">角色名稱</label>
                        <input 
                            className="w-full bg-[#2a2b36] text-white p-3 rounded-xl outline-none border border-white/5 focus:border-purple-500 transition-colors text-sm font-bold"
                            value={charConfig.name}
                            onChange={e => setCharConfig({...charConfig, name: e.target.value})}
                            placeholder="例如：霸道總裁"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-purple-400 font-bold uppercase tracking-wider">詳細人設 & 背景</label>
                        <textarea 
                            className="w-full h-48 bg-[#2a2b36] text-white p-3 rounded-xl outline-none border border-white/5 focus:border-purple-500 transition-colors text-sm leading-relaxed resize-none"
                            value={charConfig.setting}
                            onChange={e => setCharConfig({...charConfig, setting: e.target.value})}
                            placeholder="輸入角色的性格、語氣、背景故事... (越詳細 AI 演得越像！)"
                        />
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-xl text-xs text-purple-300 leading-relaxed border border-purple-500/20">
                        💡 提示：設定完後，下一句對話 AI 就會切換成這個角色囉！
                    </div>
                </div>

                <button 
                    onClick={() => { setMessages([]); setShowSidebar(false); }}
                    className="w-full py-3 bg-red-500/10 text-red-400 font-bold rounded-xl border border-red-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    <Trash2 size={16}/> 重置對話紀錄
                </button>
            </div>
        </div>
      )}

      {/* 聊天內容區 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
         {messages.map((m, i) => (
           <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
             <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed allow-select shadow-lg ${m.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-[#252630] text-gray-200 rounded-bl-none border border-white/5'}`}>
               <div className="font-bold text-[10px] mb-1 opacity-50">{m.role === 'user' ? '你' : charConfig.name}</div>
               {m.text}
             </div>
           </div>
         ))}
         {loading && <div className="text-xs text-gray-500 animate-pulse ml-2 flex items-center gap-1"><Sparkles size={12}/> {charConfig.name} 正在輸入...</div>}
         <div ref={bottomRef} />
      </div>

      {/* 輸入區 (Sticky + Safe Area) */}
      <div className="p-4 pb-10 bg-[#1a1b23] sticky bottom-0 z-20 border-t border-white/5 safe-bottom">
         <div className="bg-[#252630] rounded-[24px] p-1.5 pl-5 flex items-center shadow-lg border border-white/5">
            <input 
                className="flex-1 bg-transparent outline-none text-white text-sm h-10 placeholder-gray-500" 
                placeholder={`跟 ${charConfig.name} 說點什麼...`} 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} disabled={loading} className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform ${loading?'bg-gray-600':'bg-purple-600 active:scale-90'}`}>
                <Send size={18} className="ml-0.5"/>
            </button>
         </div>
      </div>
    </div>
  );
};

// --- 7. 拉霸機元件 ---
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

// --- 8. 靈感庫頁面 (含搜尋、編輯、刪除確認) ---
const PageVault = ({ isDark, apiKey }) => {
  const [tab, setTab] = useState('snippet'); 
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('memo_vault') || '[]'); } catch { return []; } }); 
  const [newItemContent, setNewItemContent] = useState(''); 
  const [isAdding, setIsAdding] = useState(false); 
  const [slotResult, setSlotResult] = useState("");
  const [editingId, setEditingId] = useState(null); 
  const [editContent, setEditContent] = useState(""); 
  
  // ★★★ 新增：搜尋關鍵字狀態 ★★★
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { localStorage.setItem('memo_vault', JSON.stringify(items)); }, [items]); 
  
  const addItem = (content = newItemContent, type = tab) => { 
      if (!content.trim()) return; 
      setItems([{ id: Date.now(), type: type, content: content, date: new Date().toLocaleDateString() }, ...items]); 
      setNewItemContent(''); 
      setIsAdding(false); 
      setSlotResult(""); 
  }; 

  const updateItem = (id) => {
    if (!editContent.trim()) return;
    setItems(items.map(item => item.id === id ? { ...item, content: editContent } : item));
    setEditingId(null); 
    setEditContent("");
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  const confirmDelete = (id) => {
      if(window.confirm("確定要將這條靈感丟進垃圾桶嗎？")) {
          setItems(items.filter(i => i.id !== id));
      }
  };
  
  // ★★★ 搜尋過濾邏輯 ★★★
  const filteredItems = items.filter(i => {
    const matchTab = i.type === tab;
    // 防呆：確保 i.content 存在
    const matchSearch = (i.content || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  const TabBtn = ({ id, label, icon: Icon }) => ( <NeuBox isDark={isDark} active={tab === id} onClick={() => setTab(id)} className="flex-1 py-3 flex justify-center items-center gap-2 text-xs font-bold"><Icon size={16}/> {label} </NeuBox> );

  return (
    <div className="space-y-4 animate-fade-in pb-32 h-full flex flex-col">
       <div className="flex items-center gap-2 opacity-60 px-2 mt-2"><Package size={20}/> <h2 className="text-xl font-bold">靈感庫</h2></div>
       
       {/* ★★★ 搜尋列 ★★★ */}
       <div className="px-1">
         <div className={`flex items-center px-3 py-2 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-white/40 border-black/5'}`}>
            <Search size={14} className="opacity-50 mr-2"/>
            <input 
              className="bg-transparent outline-none text-xs w-full placeholder-opacity-50" 
              placeholder="搜尋靈感..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <button onClick={()=>setSearchTerm("")}><X size={14} className="opacity-50"/></button>}
         </div>
       </div>

       <SlotMachine isDark={isDark} apiKey={apiKey} onResult={setSlotResult} />
       
       {slotResult && ( 
         <div className="animate-fade-in mb-2">
            <div className="flex justify-between items-center px-2 mb-2 opacity-70"><span className="text-xs font-bold text-purple-400">🎉 生成結果</span></div>
            <NeuBox isDark={isDark} className="p-4 relative border border-purple-500/30">
               <div className="text-sm whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar allow-select">{slotResult}</div>
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
              <textarea autoFocus className="w-full h-24 bg-transparent outline-none resize-none text-sm placeholder-opacity-50 allow-select" placeholder="輸入靈感..." value={newItemContent} onChange={e=>setNewItemContent(e.target.value)}/>
            </NeuBox>
            <div className="flex gap-3">
              <NeuBox isDark={isDark} onClick={() => addItem()} className="flex-1 py-3 text-purple-500 text-sm font-bold flex justify-center bg-purple-500/10">確認儲存</NeuBox>
              <NeuBox isDark={isDark} onClick={()=>setIsAdding(false)} className="py-3 px-6 text-gray-500 flex justify-center"><X size={20}/></NeuBox>
            </div>
          </div> 
       ) : ( 
         <NeuBox isDark={isDark} onClick={()=>setIsAdding(true)} className="py-3 flex justify-center items-center gap-2 text-purple-500 opacity-80 text-sm font-bold border border-dashed border-purple-500/30 active:scale-95"><Plus size={16}/> 新增項目</NeuBox> 
       )}
       
       <div className={`flex-grow overflow-hidden rounded-[24px] p-1 ${isDark ? 'bg-[#161722]/50 shadow-[inset_2px_2px_6px_#0b0c15,inset_-2px_-2px_6px_#2a2c38]' : 'bg-[#D1D9E6] shadow-[inset_2px_2px_6px_#b8b9be,inset_-2px_-2px_6px_#ffffff]'}`}>
         <div className="h-full overflow-y-auto p-3 space-y-3 no-scrollbar">
            {filteredItems.length === 0 && !isAdding && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-2">
                    {searchTerm ? <span className="text-xs">找不到 "{searchTerm}"</span> : <><Package size={40} strokeWidth={1}/><span className="text-xs">這裡還沒有資料...</span></>}
                </div>
            )}
            {filteredItems.map(item => (
              <NeuBox key={item.id} isDark={isDark} className="p-4 relative group animate-fade-in border border-white/5">
                {editingId === item.id ? (
                    <div className="space-y-3 animate-fade-in">
                        <textarea autoFocus className="w-full h-32 bg-black/20 rounded-lg p-2 text-sm outline-none resize-none text-gray-200 allow-select" value={editContent} onChange={e => setEditContent(e.target.value)}/>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-gray-400 font-bold active:scale-95">取消</button>
                            <button onClick={() => updateItem(item.id)} className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg shadow-lg font-bold active:scale-95">保存</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed opacity-90 allow-select">{item.content}</div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5 opacity-50">
                            <span className="text-[10px] font-bold tracking-wider">{item.date}</span>
                            <div className="flex gap-3">
                                <button onClick={(e)=>{e.stopPropagation(); startEditing(item)}} className="p-2 text-blue-400 hover:text-blue-500 active:scale-90 transition-transform"><Edit3 size={16}/></button>
                                <button onClick={(e)=>{e.stopPropagation(); confirmDelete(item.id)}} className="p-2 text-red-400 hover:text-red-500 active:scale-90 transition-transform"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </>
                )}
              </NeuBox>
            ))}
         </div>
       </div>
    </div>
  );
};

// --- 9. 續寫頁面 (終極防護修復版：三道防護網 + 暴力考據 Prompt) ---
const PageMemo = ({ isDark, apiKey, setShowChat, files, setFiles, activeFileId, setActiveFileId }) => {
  const [res, setRes] = useState("");
  const [loading, setLoading] = useState(false);
  const textAreaRef = useRef(null);

  // ★★★ 防護：取得 activeFile 時，如果找不到，回傳一個安全的空物件 ★★★
  const activeFile = files.find(f => f.id === activeFileId) || { title: "Error", content: "", lastModified: new Date().toLocaleString() };

  const updateContent = (newContent) => {
    setFiles(files.map(f => f.id === activeFileId ? { ...f, content: newContent, lastModified: new Date().toLocaleString() } : f));
  };

  const updateTitle = (newTitle) => {
    setFiles(files.map(f => f.id === activeFileId ? { ...f, title: newTitle } : f));
  };

  const gen = async () => {
    if (!apiKey) return alert("請設定 API Key");
    if (!activeFile.content) return alert("內容不能為空");
    setLoading(true);
    try {
      // 🔴 這裡就是你的要求：禁止廢話、強制搜尋、禁止OOC、平行時空
      const prompt = `
        角色：頂尖同人小說家。
        任務：續寫這篇小說。
        
        【極重要指令 - 絕對遵守】：
        1. ⛔ **絕對禁止輸出前言/後語**：直接從小說內文開始寫，不要說「好的」、「以下是續寫」等廢話。我只要內文。
        2. 🔍 **強制聯網考據**：請仔細偵測原文中的人名與團體。如果是現實存在的偶像(如 TripleS, LOONA, ARTMS 等)，**必須使用 Google Search 驗證**成員名單、正確設定與現實背景。**嚴禁**捏造假團名(如 S*TARS)或錯誤設定，除非原文已明確建立完全架空的世界觀。
        3. 🚫 **OOC 禁止**：嚴格遵守人物原本的說話語氣與性格，捕捉人物神韻。
        4. 🌌 **世界觀偵測**：如果原文提及「平行時空」或特定設定，請嚴格遵循該設定進行續寫。
        5. 📏 **長度**：請寫出 1500 字以上的高質量內容。
        
        【原文】：
        ${activeFile.content}
      `;
      const text = await callGemini(apiKey, prompt, true);
      setRes(text);
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  };

  const expandSentence = async () => {
    const textarea = textAreaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = activeFile.content.substring(start, end);

    if (!selectedText || selectedText.trim().length === 0) return alert("請先選取您想要擴寫的句子！");
    if (!apiKey) return alert("請設定 API Key");

    setLoading(true);
    try {
        const prompt = `擴寫這段文字，使其更細膩、更有畫面感：${selectedText}`;
        const expandedText = await callGemini(apiKey, prompt, false);
        const newText = activeFile.content.substring(0, start) + expandedText + activeFile.content.substring(end);
        updateContent(newText);
    } catch(e) { alert(e.message); } finally { setLoading(false); }
  };

  const insertText = () => {
    if(!res) return;
    updateContent(activeFile.content + "\n\n" + res);
    setRes("");
    alert("✅ 已插入文章末尾！");
  };

  return (
    <div className="space-y-5 animate-fade-in pb-32 relative">
       {/* 標題與檔案切換區 */}
       <div className="flex items-center gap-3 mt-2">
          <div className="flex-1">
            <input 
              className="w-full bg-transparent text-xl font-bold outline-none placeholder-opacity-50 text-purple-400" 
              value={activeFile.title || ""} 
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="輸入標題..."
            />
            <p className="text-[10px] opacity-40 font-mono mt-0.5">最後編輯: {activeFile.lastModified || "剛剛"}</p>
          </div>
       </div>

       {/* 主要編輯區 */}
       <NeuBox isDark={isDark} pressed className="p-5 h-[40vh] relative transition-all">
         <textarea 
            ref={textAreaRef} 
            className="w-full h-full bg-transparent outline-none resize-none text-base leading-relaxed opacity-80 placeholder-opacity-40 allow-select" 
            placeholder="開始你的創作..." 
            value={activeFile.content || ""} 
            onChange={e=>updateContent(e.target.value)} 
            maxLength={50000} 
         />
         <button onClick={expandSentence} className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg text-white active:scale-90 transition-transform flex items-center justify-center" title="✨ 擴寫"><Wand2 size={20}/></button>
       </NeuBox>

       <div className="flex gap-4">
         <NeuBox isDark={isDark} onClick={gen} className="flex-1 py-4 flex justify-center gap-2 font-bold text-purple-500 text-sm">{loading ? <span className="animate-pulse">✨ 寫作中...</span> : <><Zap size={18}/> 續寫</>}</NeuBox>
         <NeuBox isDark={isDark} onClick={() => setShowChat(true)} className="flex-1 py-4 flex justify-center gap-2 font-bold text-pink-500 text-sm"><MessageCircle size={18}/> 對話</NeuBox>
       </div>

       <div className="flex flex-col gap-3">
          <div className="flex justify-between px-2 opacity-50"><span className="text-xs font-bold">AI 結果</span>{res && <Copy size={14}/>}</div>
          
          <div className="relative group">
             <NeuBox isDark={isDark} className="p-6 min-h-[250px] text-sm whitespace-pre-wrap leading-relaxed allow-select">
                {res || <span className="opacity-20 text-xs flex items-center justify-center h-full">等待生成...</span>}
             </NeuBox>
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

// --- 10. 生成器頁面 ---
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

// --- 11. 我的頁面 (修復：淺/深/系統 模式切換 + 備份還原) ---
const PageMe = ({ isDark, apiKey, setApiKey, themeMode, setThemeMode, files }) => {
  const [show, setShow] = useState(false);

  // ★★★ 匯出資料功能 ★★★
  const exportData = () => {
    const data = {
      memo_draft: localStorage.getItem('memo_draft'),
      memo_vault: localStorage.getItem('memo_vault'),
      gemini_key: localStorage.getItem('gemini_key'),
      theme_mode: localStorage.getItem('theme_mode'),
      memo_files: JSON.stringify(files) // 使用 App 傳來的最新 files
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MemoLive_Backup_${new Date().toLocaleDateString()}.json`;
    a.click();
    alert("✅ 資料備份已下載！");
  };

  // ★★★ 匯入資料功能 ★★★
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if(data.memo_files) localStorage.setItem('memo_files', data.memo_files);
        if(data.memo_draft) localStorage.setItem('memo_draft', data.memo_draft);
        if(data.memo_vault) localStorage.setItem('memo_vault', data.memo_vault);
        if(data.gemini_key) localStorage.setItem('gemini_key', data.gemini_key);
        if(data.theme_mode) localStorage.setItem('theme_mode', data.theme_mode);
        alert("✅ 資料還原成功！請重新整理網頁。");
        window.location.reload();
      } catch (err) {
        alert("❌ 檔案格式錯誤！");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-32">
       <div className="flex items-center gap-2 opacity-60 px-2 mt-2"><User size={20}/> <h2 className="text-xl font-bold">我的</h2></div>
       <NeuBox isDark={isDark} className="p-8 flex flex-col items-center justify-center gap-3 opacity-60"><LayoutTemplate size={40} /><span className="text-sm font-bold tracking-widest">PRO 創作模式</span></NeuBox>
       
       <div className="space-y-5">
          {/* 外觀主題 (保持不變) */}
          <div className="space-y-2">
             <span className="text-xs font-bold opacity-50 ml-2">外觀主題</span>
             <NeuBox isDark={isDark} className="p-2 flex gap-3">
                <NeuBox isDark={isDark} active={themeMode === 'light'} onClick={() => setThemeMode('light')} className="flex-1 py-3 flex flex-col items-center justify-center gap-1"><Sun size={20} /><span className="text-[10px] font-bold">淺色</span></NeuBox>
                <NeuBox isDark={isDark} active={themeMode === 'dark'} onClick={() => setThemeMode('dark')} className="flex-1 py-3 flex flex-col items-center justify-center gap-1"><Moon size={20} /><span className="text-[10px] font-bold">深色</span></NeuBox>
                <NeuBox isDark={isDark} active={themeMode === 'system'} onClick={() => setThemeMode('system')} className="flex-1 py-3 flex flex-col items-center justify-center gap-1"><Monitor size={20} /><span className="text-[10px] font-bold">系統</span></NeuBox>
             </NeuBox>
          </div>

          {/* ★★★ 新增：資料管理區塊 ★★★ */}
          <div className="space-y-2">
             <span className="text-xs font-bold opacity-50 ml-2">資料管理 (換手機必用)</span>
             <div className="flex gap-3">
                <NeuBox isDark={isDark} onClick={exportData} className="flex-1 py-4 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95">
                    <Download size={20} className="text-blue-500"/>
                    <span className="text-xs font-bold">備份資料</span>
                </NeuBox>
                <label className="flex-1 relative">
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                    <NeuBox isDark={isDark} className="h-full py-4 flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-95">
                        <Upload size={20} className="text-green-500"/>
                        <span className="text-xs font-bold">還原資料</span>
                    </NeuBox>
                </label>
             </div>
          </div>

          {/* 系統設定 (保持不變) */}
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

// --- 12. App 主程式 (全域狀態提升、解決側邊欄覆蓋問題) ---
const App = () => {
  const [showSplash, setShowSplash] = useState(true); 
  const [activeTab, setActiveTab] = useState("memo");
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
  const [themeMode, setThemeMode] = useState(localStorage.getItem("theme_mode") || "system");
  const [isDark, setIsDark] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // ★★★ 左側檔案側邊欄狀態 ★★★

  // ★★★ 全域防護：檔案管理狀態 (提升到 App 層，防止黑屏) ★★★
  const [files, setFiles] = useState(() => {
    try {
      const saved = localStorage.getItem("memo_files");
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 自動補全 lastModified 防黑屏
        return parsed.map(f => ({ ...f, lastModified: f.lastModified || new Date().toLocaleString() }));
      }
      return [{ id: Date.now(), title: "未命名檔案", content: "", lastModified: new Date().toLocaleString() }];
    } catch {
      return [{ id: Date.now(), title: "未命名檔案", content: "", lastModified: new Date().toLocaleString() }];
    }
  });
  const [activeFileId, setActiveFileId] = useState(() => files[0]?.id || Date.now());

  // 檔案存檔副作用
  useEffect(() => { if(files.length > 0) localStorage.setItem("memo_files", JSON.stringify(files)); }, [files]);

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

  // 新增檔案邏輯
  const createNewFile = () => {
    const newFile = { id: Date.now(), title: `新檔案 ${files.length + 1}`, content: "", lastModified: new Date().toLocaleString() };
    setFiles([newFile, ...files]);
    setActiveFileId(newFile.id);
    setShowSidebar(false);
  };

  // 刪除檔案邏輯
  const deleteFile = (e, id) => {
    e.stopPropagation();
    if(files.length <= 1) return alert("至少保留一個檔案");
    if(window.confirm("刪除此檔案？")) {
      const newFiles = files.filter(f => f.id !== id);
      setFiles(newFiles);
      if(activeFileId === id) setActiveFileId(newFiles[0].id);
    }
  };

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  if (showChat) return <ChatInterface onClose={() => setShowChat(false)} />;

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans relative overflow-x-hidden safe-top safe-bottom ${isDark ? 'bg-[#202130] text-gray-200' : 'bg-[#E0E5EC] text-[#5b5d7e]'}`}>
      <style>{styles}</style>
      
      {/* 頂部 Header (含漢堡選單) */}
      <div className="pt-12 pb-4 px-4 flex items-center justify-center relative">
        {/* ★★★ 左上角漢堡選單 (觸發檔案側邊欄) ★★★ */}
        <button onClick={() => setShowSidebar(true)} className="absolute left-4 p-2 rounded-full active:bg-gray-500/20 transition-colors">
            <Menu size={24} className={isDark ? "text-white" : "text-gray-700"}/>
        </button>
        
        <div className="text-center">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 tracking-tight">MemoLive</h1>
            <p className="text-[10px] font-bold opacity-30 tracking-[0.3em] mt-1">ULTIMATE</p>
        </div>
      </div>

      {/* ★★★ 全局左側邊欄 (Global Drawer - 覆蓋一切) ★★★ */}
      {showSidebar && (
        <div className="fixed inset-0 z-[100] flex safe-top safe-bottom">
            {/* 背景遮罩 */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSidebar(false)}></div>
            
            {/* 側邊欄本體 (從左側滑入) */}
            <div className={`w-[80%] max-w-[300px] h-full shadow-2xl p-6 flex flex-col gap-6 animate-slide-in-left relative ${isDark ? 'bg-[#1e1f29]' : 'bg-[#f0f2f5]'}`}>
                <div className="flex justify-between items-center pb-4 border-b border-gray-500/10">
                    <span className="font-bold text-lg flex items-center gap-2"><FolderOpen size={20}/> 我的檔案</span>
                    <button onClick={() => setShowSidebar(false)}><X size={20} className="opacity-50"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                    {files.map(file => (
                        <div 
                            key={file.id} 
                            onClick={() => { setActiveFileId(file.id); setShowSidebar(false); }}
                            className={`p-4 rounded-xl flex justify-between items-center border transition-all active:scale-95 cursor-pointer
                                ${activeFileId === file.id 
                                    ? (isDark ? 'bg-purple-600 border-purple-500 text-white' : 'bg-purple-500 border-purple-400 text-white') 
                                    : (isDark ? 'bg-[#252630] border-white/5' : 'bg-white border-gray-200')}
                            `}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <FileText size={18} className={activeFileId === file.id ? 'opacity-100' : 'opacity-50'}/>
                                <div className="flex flex-col truncate">
                                    <span className="text-sm font-bold truncate">{file.title}</span>
                                    {/* ★★★ 防呆：防止 .split() 報錯 ★★★ */}
                                    <span className="text-[10px] opacity-60">{(file.lastModified || "").split(' ')[0]}</span>
                                </div>
                            </div>
                            {files.length > 1 && (
                                <button onClick={(e) => deleteFile(e, file.id)} className="p-2 hover:bg-black/20 rounded-full transition-colors">
                                    <Trash2 size={14}/>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button onClick={createNewFile} className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95">
                    <FilePlus size={18}/> 新增檔案
                </button>
            </div>
        </div>
      )}

      <div className="max-w-md mx-auto h-full px-5">
        {activeTab === 'memo' && <PageMemo isDark={isDark} apiKey={apiKey} setShowChat={setShowChat} files={files} setFiles={setFiles} activeFileId={activeFileId} setActiveFileId={setActiveFileId} />}
        {activeTab === 'generator' && <PageGenerator isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'vault' && <PageVault isDark={isDark} apiKey={apiKey} />}
        {activeTab === 'me' && <PageMe isDark={isDark} apiKey={apiKey} setApiKey={setApiKey} themeMode={themeMode} setThemeMode={setThemeMode} files={files} />}
      </div>
      
      {/* 導航列 (forceHide: 當側邊欄打開時隱藏) */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isDark={isDark} forceHide={showSidebar} />
    </div>
  );
};
export default App;