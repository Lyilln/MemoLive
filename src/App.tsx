import React, { useState } from 'react';
import { Settings, Zap, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// --- 簡單 UI ---
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
  const [logs, setLogs] = useState<string[]>(["等待測試... 請先貼上 API Key"]);
  const [successModel, setSuccessModel] = useState("");
  const [note, setNote] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const saveKey = (e) => {
    const val = e.target.value.trim(); // 自動刪除前後空白
    setApiKey(val);
    localStorage.setItem("gemini_key", val);
  };

  const addLog = (msg) => setLogs(prev => [msg, ...prev]);

  // ★ 核心測試函數：直接用 fetch 打特定網址 ★
  const testConnection = async (modelName, version) => {
    if (!apiKey) return alert("請先輸入 API Key");
    
    addLog(`🔵 正在測試: ${modelName} (${version})...`);
    
    // 構造網址：強制指定 v1 或 v1beta
    const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "哈囉，請回傳「測試成功」四個字就好。" }] }]
        })
      });

      const data = await response.json();

      if (response.ok) {
        addLog(`✅ 成功！${modelName} 是活的！`);
        setSuccessModel(modelName); // 記住這個成功的型號
        alert(`恭喜！找到可用線路：${modelName}\n請立刻開始寫作！`);
      } else {
        addLog(`❌ 失敗 (${modelName}): ${data.error?.message || response.statusText}`);
      }
    } catch (e) {
      addLog(`❌ 連線錯誤: ${e.message}`);
    }
  };

  // ★ 最終寫作函數：只用測試成功的那個型號 ★
  const generateStory = async () => {
    if (!successModel) return alert("請先點擊上方按鈕測試，找到綠燈的線路！");
    
    addLog(`🚀 使用 ${successModel} 開始生成...`);
    const version = successModel.includes("1.5") ? "v1beta" : "v1";
    const url = `https://generativelanguage.googleapis.com/${version}/models/${successModel}:generateContent?key=${apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `(請續寫這段筆記，並在開頭標註 [MUSIC: 關鍵字]): ${note}` }] }]
        })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        addLog("🎉 生成完成！");
        setNote(text); // 直接顯示在框框裡
      }
    } catch (e) {
      alert("生成失敗");
    }
  };

  return (
    <div className="min-h-screen bg-[#D0D3EC] text-[#5b5d7e] p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-purple-600">API 線路診斷器</h1>
        <Settings className="cursor-pointer" onClick={() => setShowSettings(!showSettings)}/>
      </div>

      {/* 設定區 */}
      {(showSettings || !apiKey) && (
        <NeuBox className="p-4 mb-6">
          <p className="mb-2 font-bold text-sm">步驟 1: 貼上 API Key</p>
          <input 
            type="password" 
            placeholder="貼上你的 AIza..." 
            value={apiKey} 
            onChange={saveKey}
            className="w-full bg-white/50 p-2 rounded-lg outline-none font-mono text-sm"
          />
        </NeuBox>
      )}

      {/* 診斷按鈕區 */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <p className="font-bold text-sm">步驟 2: 點擊測試 (直到出現綠燈)</p>
        
        <NeuBox className="p-4 flex items-center gap-3" onClick={() => testConnection('gemini-1.5-flash', 'v1beta')}>
          <Zap className="text-yellow-600" /> 
          <div>
            <div className="font-bold">測試線路 A (主力)</div>
            <div className="text-xs opacity-60">Gemini 1.5 Flash (v1beta)</div>
          </div>
        </NeuBox>

        <NeuBox className="p-4 flex items-center gap-3" onClick={() => testConnection('gemini-1.5-flash-001', 'v1beta')}>
          <Shield className="text-blue-600" />
          <div>
            <div className="font-bold">測試線路 B (備用)</div>
            <div className="text-xs opacity-60">Gemini 1.5 Flash 001 (v1beta)</div>
          </div>
        </NeuBox>

        <NeuBox className="p-4 flex items-center gap-3" onClick={() => testConnection('gemini-pro', 'v1beta')}>
          <CheckCircle className="text-green-600" />
          <div>
            <div className="font-bold">測試線路 C (保底)</div>
            <div className="text-xs opacity-60">Gemini 1.0 Pro (最穩)</div>
          </div>
        </NeuBox>
      </div>

      {/* 寫作區 (只有測試成功才會解鎖) */}
      <div className={`transition-all ${successModel ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        <p className="font-bold text-sm mb-2">步驟 3: 開始寫作 ({successModel || "鎖定中"})</p>
        <NeuBox className="p-4 min-h-[200px] mb-4">
          <textarea 
            className="w-full h-[150px] bg-transparent outline-none resize-none"
            placeholder="測試成功後，在這裡貼上筆記，按下生成..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </NeuBox>
        <NeuBox className="p-4 flex justify-center font-bold text-purple-700" onClick={generateStory}>
          ✨ 開始生成
        </NeuBox>
      </div>

      {/* 診斷日誌 */}
      <div className="mt-8 p-4 bg-black/5 rounded-xl font-mono text-xs h-[150px] overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i} className={`mb-1 ${log.includes('✅') ? 'text-green-700 font-bold' : log.includes('❌') ? 'text-red-600' : 'text-gray-500'}`}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
