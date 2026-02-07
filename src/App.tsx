import React, { useState } from 'react';
import { Settings, Search, CheckCircle, AlertTriangle, Terminal } from 'lucide-react';

// --- UI 組件 ---
const NeuBox = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-[#D0D3EC] shadow-[8px_8px_16px_#aeb1cb,-8px_-8px_16px_#ffffff] rounded-[20px] ${className} ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
  >
    {children}
  </div>
);

const App = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_key") || "");
  const [availableModels, setAvailableModels] = useState([]); // 存活的模型清單
  const [logs, setLogs] = useState(["等待掃描..."]);
  const [note, setNote] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const saveKey = (e) => {
    const val = e.target.value.trim(); 
    setApiKey(val);
    localStorage.setItem("gemini_key", val);
  };

  const addLog = (msg) => setLogs(prev => [msg, ...prev]);

  // ★ 核心功能：叫 Google 交出模型清單 ★
  const scanModels = async () => {
    if (!apiKey) return alert("請先輸入 API Key");
    setAvailableModels([]);
    addLog("🔵 正在向 Google 查詢可用模型...");

    try {
      // 這行指令是問 Google：「我有什麼權限？」
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "無法連線到 Google");
      }

      // 過濾出「可以寫字」的模型 (排除掉只能讀圖的)
      const validModels = data.models?.filter(m => 
        m.supportedGenerationMethods.includes("generateContent")
      ) || [];

      if (validModels.length === 0) {
        addLog("❌ 掃描成功，但沒有發現可用模型 (權限不足？)");
      } else {
        addLog(`✅ 找到 ${validModels.length} 個可用模型！請點擊下方選擇：`);
        setAvailableModels(validModels);
      }

    } catch (e) {
      addLog(`❌ 掃描失敗: ${e.message}`);
      alert(`掃描失敗：${e.message}\n(請確認 API Key 是否正確)`);
    }
  };

  // ★ 寫作功能 ★
  const generateStory = async () => {
    if (!selectedModel) return alert("請先從清單中選一個模型！");
    
    addLog(`🚀 使用 ${selectedModel} 開始生成...`);
    const modelName = selectedModel.replace("models/", ""); // 去掉前綴
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `(請續寫這段筆記，並在開頭標註 [MUSIC: 關鍵字]): ${note}` }] }]
          })
        }
      );
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "生成失敗");
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        addLog("🎉 生成完成！");
        setNote(text);
      }
    } catch (e) {
      addLog(`❌ 生成錯誤: ${e.message}`);
      alert("生成失敗: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#D0D3EC] text-[#5b5d7e] p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-purple-600">API 權限掃描器</h1>
        <Settings className="cursor-pointer" onClick={() => setShowSettings(!showSettings)}/>
      </div>

      {/* 設定區 */}
      {(showSettings || !apiKey) && (
        <NeuBox className="p-4 mb-6">
          <p className="mb-2 font-bold text-sm">步驟 1: 貼上 API Key</p>
          <input 
            type="password" placeholder="貼上你的 AIza..." 
            value={apiKey} onChange={saveKey}
            className="w-full bg-white/50 p-2 rounded-lg outline-none font-mono text-sm"
          />
        </NeuBox>
      )}

      {/* 掃描按鈕 */}
      <NeuBox className="p-4 mb-6 flex justify-center text-purple-700 font-bold gap-2" onClick={scanModels}>
        <Search size={20}/> 步驟 2: 掃描我的帳號權限
      </NeuBox>

      {/* 顯示掃描到的模型清單 */}
      {availableModels.length > 0 && (
        <div className="mb-6 space-y-2 animate-fade-in">
          <p className="font-bold text-sm text-green-700">步驟 3: Google 說你可以用這些 (點擊選擇)：</p>
          <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
            {availableModels.map((m) => (
              <NeuBox 
                key={m.name} 
                className={`p-3 text-xs font-mono flex justify-between items-center ${selectedModel === m.name ? 'border-2 border-purple-500' : ''}`}
                onClick={() => {
                  setSelectedModel(m.name);
                  addLog(`已選擇: ${m.name}`);
                }}
              >
                <span>{m.displayName} ({m.name})</span>
                {selectedModel === m.name && <CheckCircle size={16} className="text-purple-600"/>}
              </NeuBox>
            ))}
          </div>
        </div>
      )}

      {/* 寫作區 */}
      <div className={`transition-all ${selectedModel ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <p className="font-bold text-sm mb-2">步驟 4: 開始測試寫作</p>
        <NeuBox className="p-4 min-h-[150px] mb-4">
          <textarea 
            className="w-full h-[120px] bg-transparent outline-none resize-none"
            placeholder="選好模型後，貼上筆記，按生成..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </NeuBox>
        <NeuBox className="p-4 flex justify-center font-bold text-purple-700" onClick={generateStory}>
          ✨ 開始生成
        </NeuBox>
      </div>

      {/* 系統日誌 */}
      <div className="mt-8 p-4 bg-black/5 rounded-xl font-mono text-[10px] h-[150px] overflow-y-auto">
        <div className="flex items-center gap-2 mb-2 opacity-50"><Terminal size={12}/> System Logs</div>
        {logs.map((log, i) => (
          <div key={i} className={`mb-1 ${log.includes('✅') ? 'text-green-700 font-bold' : log.includes('❌') ? 'text-red-600' : 'text-gray-600'}`}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
