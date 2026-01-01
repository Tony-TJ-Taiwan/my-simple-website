import React, { useState, useMemo } from 'react';
import {
  Dumbbell, Utensils, Info, Trash2, PlusCircle, Coffee, Sun, Moon, Zap,
  CheckCircle2, AlertCircle, ToggleRight, ToggleLeft, Timer, Edit3, X
} from 'lucide-react';

const App = () => {
  // --- 基礎狀態 ---
  const [weight, setWeight] = useState(65);
  const [trainingType, setTrainingType] = useState('moderate');
  const [activeTab, setActiveTab] = useState('preWorkout');
  const [isDinnerRecovery, setIsDinnerRecovery] = useState(false);
  const [logs, setLogs] = useState([]);

  // --- 滑桿暫存狀態 ---
  const [bananaCount, setBananaCount] = useState(1);
  const [eggCount, setEggCount] = useState(1);
  const [riceGrams, setRiceGrams] = useState(150);
  const [chickenGrams, setChickenGrams] = useState(100);

  // --- 手動輸入狀態 ---
  const [showManual, setShowManual] = useState(false);
  const [manualFood, setManualFood] = useState({ name: '', carb: '', protein: '' });

  // --- 訓練與營養係數 ---
  const trainingConfigs = {
    easy: { carb: 3, protein: 1.2, label: '休息日', color: 'bg-green-100 text-green-700' },
    moderate: { carb: 5, protein: 1.4, label: '一般訓練日', color: 'bg-blue-100 text-blue-700' },
    hard: { carb: 7, protein: 1.6, label: '高強度/LSD', color: 'bg-red-100 text-red-700' }
  };

  const foodNutrients = {
    banana: { protein: 1, carb: 27 }, // 一根中型香蕉約 100g 
    egg: { protein: 7, carb: 1 },
    rice: { protein: 0.03, carb: 0.25 },
    chicken: { protein: 0.25, carb: 0 }
  };

  // --- 計算目標 ---
  const dailyTargets = useMemo(() => {
    const config = trainingConfigs[trainingType];
    return { carb: Math.round(weight * config.carb), protein: Math.round(weight * config.protein) };
  }, [weight, trainingType]);

  const mealTargets = useMemo(() => {
    let ratios = {
      breakfast: { c: 0.15, p: 0.20 },
      lunch: { c: 0.20, p: 0.20 },
      preWorkout: { c: 0.15, p: 0.10 },
      dinner: { c: 0.20, p: 0.25 },
      postWorkout: { c: 0.30, p: 0.25 }
    };
    if (isDinnerRecovery) {
      ratios.dinner = { c: ratios.dinner.c + ratios.postWorkout.c, p: ratios.dinner.p + ratios.postWorkout.p };
      ratios.postWorkout = { c: 0, p: 0 };
    }
    const result = {};
    Object.keys(ratios).forEach(key => {
      result[key] = { carb: Math.round(dailyTargets.carb * ratios[key].c), protein: Math.round(dailyTargets.protein * ratios[key].p) };
    });
    return result;
  }, [dailyTargets, isDinnerRecovery]);

  const mealIntakes = useMemo(() => {
    const totals = { preWorkout: { c: 0, p: 0 }, breakfast: { c: 0, p: 0 }, lunch: { c: 0, p: 0 }, dinner: { c: 0, p: 0 }, postWorkout: { c: 0, p: 0 } };
    logs.forEach(log => { if (totals[log.meal]) { totals[log.meal].c += log.carb; totals[log.meal].p += log.protein; } });
    return totals;
  }, [logs]);

  const currentDailyIntake = useMemo(() => logs.reduce((acc, log) => ({ carb: acc.carb + log.carb, protein: acc.protein + log.protein }), { carb: 0, protein: 0 }));

  // --- 紀錄動作 ---
  const addLog = (type, customData = null) => {
    let newLog = { id: Date.now(), meal: activeTab, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    if (type === 'banana') {
      newLog = { ...newLog, name: `香蕉 x${bananaCount}`, protein: bananaCount * foodNutrients.banana.protein, carb: bananaCount * foodNutrients.banana.carb };
    } else if (type === 'egg') {
      newLog = { ...newLog, name: `茶葉蛋 x${eggCount}`, protein: eggCount * foodNutrients.egg.protein, carb: eggCount * foodNutrients.egg.carb };
    } else if (type === 'rice') {
      newLog = { ...newLog, name: `糙米飯 ${riceGrams}g`, protein: Math.round(riceGrams * foodNutrients.rice.protein), carb: Math.round(riceGrams * foodNutrients.rice.carb) };
    } else if (type === 'chicken') {
      newLog = { ...newLog, name: `雞胸肉 ${chickenGrams}g`, protein: Math.round(chickenGrams * foodNutrients.chicken.protein), carb: 0 };
    } else if (type === 'manual') {
      newLog = { ...newLog, name: customData.name || '自定義食物', protein: Number(customData.protein) || 0, carb: Number(customData.carb) || 0 };
      setManualFood({ name: '', carb: '', protein: '' });
      setShowManual(false);
    }
    setLogs([newLog, ...logs]);
  };

  const removeLog = (id) => setLogs(logs.filter(l => l.id !== id));
  const activeMealTarget = mealTargets[activeTab];
  const activeMealIntake = mealIntakes[activeTab];

  const getEval = (curr, target) => {
    if (target === 0) return { label: '-', color: 'text-slate-300' };
    const r = curr / target;
    return r < 0.8 ? { label: '不足', color: 'text-orange-500' } : r <= 1.2 ? { label: '足夠', color: 'text-green-600' } : { label: '過量', color: 'text-red-500' };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800 pb-44">
      <header className="max-w-md mx-auto mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-blue-600 flex items-center gap-2">
            <Dumbbell className="w-6 h-6" /> RunNutri Elite+
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">65kg Runner Diet Planner</p>
        </div>
        <select value={trainingType} onChange={(e) => setTrainingType(e.target.value)} className="bg-white border border-slate-200 rounded-full px-3 py-1 text-[10px] font-bold shadow-sm">
          <option value="easy">休息日</option><option value="moderate">一般日</option><option value="hard">間歇/LSD</option>
        </select>
      </header>

      <main className="max-w-md mx-auto space-y-4">
        {/* 全日數據 */}
        <section className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
          <StatProgress label="全日碳水" curr={currentDailyIntake.carb} target={dailyTargets.carb} color="bg-blue-500" />
          <div className="w-[1px] h-10 bg-slate-100"></div>
          <StatProgress label="全日蛋白" curr={currentDailyIntake.protein} target={dailyTargets.protein} color="bg-indigo-500" />
        </section>

        {/* 餐次導覽 */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            {[{ id: 'preWorkout', l: '運前', i: <Timer /> }, { id: 'breakfast', l: '早餐', i: <Coffee /> }, { id: 'lunch', l: '午餐', i: <Sun /> }, { id: 'dinner', l: '晚餐', i: <Moon /> }, { id: 'postWorkout', l: '修復', i: <Zap /> }].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 py-4 flex flex-col items-center gap-1 relative ${activeTab === t.id ? 'text-blue-600 font-bold' : 'text-slate-300'}`}>
                {React.cloneElement(t.i, { className: 'w-4 h-4' })}<span className="text-[9px]">{t.l}</span>
                {activeTab === t.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>}
              </button>
            ))}
          </div>

          <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center bg-blue-50/20">
            <span className="text-[10px] font-bold text-slate-500">本餐目標判定</span>
            {activeTab === 'dinner' && (
              <button onClick={() => setIsDinnerRecovery(!isDinnerRecovery)} className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-indigo-600">晚餐合併修復？</span>
                {isDinnerRecovery ? <ToggleRight className="text-indigo-600 w-6 h-6" /> : <ToggleLeft className="text-slate-200 w-6 h-6" />}
              </button>
            )}
          </div>

          {/* 本餐評估 */}
          <div className="p-4 grid grid-cols-2 gap-6 bg-white">
            <MealGauge label="碳水" curr={activeMealIntake.c} target={activeMealTarget.carb} ev={getEval(activeMealIntake.c, activeMealTarget.carb)} color="bg-blue-500" />
            <MealGauge label="蛋白" curr={activeMealIntake.p} target={activeMealTarget.protein} ev={getEval(activeMealIntake.p, activeMealTarget.protein)} color="bg-indigo-500" />
          </div>

          {/* 常用食物 */}
          <div className="p-5 space-y-6">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">常用快速記錄</span>
              <button onClick={() => setShowManual(!showManual)} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                <Edit3 className="w-3 h-3" /> 手動輸入
              </button>
            </div>

            {showManual && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-blue-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-blue-700">輸入超商營養標示</span>
                  <X className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => setShowManual(false)} />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <input placeholder="食物名稱 (如: 御飯糰)" className="text-sm p-2 rounded-lg border-none bg-white shadow-sm" value={manualFood.name} onChange={e => setManualFood({ ...manualFood, name: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <label className="text-[9px] text-slate-400 block font-bold">碳水 (g)</label>
                      <input type="number" className="w-full border-none p-0 text-sm font-bold" value={manualFood.carb} onChange={e => setManualFood({ ...manualFood, carb: e.target.value })} />
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <label className="text-[9px] text-slate-400 block font-bold">蛋白 (g)</label>
                      <input type="number" className="w-full border-none p-0 text-sm font-bold" value={manualFood.protein} onChange={e => setManualFood({ ...manualFood, protein: e.target.value })} />
                    </div>
                  </div>
                  <button onClick={() => addLog('manual', manualFood)} className="w-full bg-blue-600 text-white font-bold text-xs py-2 rounded-xl shadow-md active:scale-95 transition">加入紀錄</button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <FoodItem label="香蕉" icon="🍌" val={bananaCount} unit="根" max={3} onChange={setBananaCount} onAdd={() => addLog('banana')} color="accent-yellow-400" />
              <FoodItem label="茶葉蛋" icon="🥚" val={eggCount} unit="顆" max={5} onChange={setEggCount} onAdd={() => addLog('egg')} color="accent-blue-600" />
              <FoodItem label="糙米飯" icon="🍚" val={riceGrams} unit="g" max={500} onChange={setRiceGrams} onAdd={() => addLog('rice')} color="accent-amber-700" />
              <FoodItem label="雞胸肉" icon="🍗" val={chickenGrams} unit="g" max={400} onChange={setChickenGrams} onAdd={() => addLog('chicken')} color="accent-orange-600" />
            </div>
          </div>
        </section>

        {/* 明細清單 */}
        <section className="space-y-2">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">本餐明細</p>
          {logs.filter(l => l.meal === activeTab).map(log => (
            <div key={log.id} className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
              <div>
                <p className="text-xs font-bold text-slate-700">{log.name}</p>
                <p className="text-[9px] text-slate-400">{log.timestamp} • C:{log.carb}g P:{log.protein}g</p>
              </div>
              <button onClick={() => removeLog(log.id)} className="text-slate-200 hover:text-red-400 p-1 transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-5 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">全日碳水</p>
              <p className="text-xl font-black text-blue-600">{Math.round((currentDailyIntake.carb / dailyTargets.carb) * 100)}%</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">全日蛋白</p>
              <p className="text-xl font-black text-indigo-600">{Math.round((currentDailyIntake.protein / dailyTargets.protein) * 100)}%</p>
            </div>
          </div>
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${(currentDailyIntake.carb >= dailyTargets.carb * 0.8 && currentDailyIntake.protein >= dailyTargets.protein * 0.8) ? 'bg-green-500 shadow-green-200' : 'bg-orange-500 shadow-orange-200'
            }`}>
            {(currentDailyIntake.carb >= dailyTargets.carb * 0.8 && currentDailyIntake.protein >= dailyTargets.protein * 0.8) ? <CheckCircle2 /> : <Info />}
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- 組件 ---
const StatProgress = ({ label, curr, target, color }) => (
  <div className="flex-1 space-y-1">
    <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 tracking-tighter"><span>{label}</span><span>{curr}/{target}g</span></div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${Math.min((curr / target) * 100, 100)}%` }}></div>
    </div>
  </div>
);

const MealGauge = ({ label, curr, target, ev, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-bold"><span className="text-slate-400">{label}</span><span className={ev.color}>{ev.label}</span></div>
    <p className="text-xs font-black">{curr} / {target}g</p>
    <div className="h-1.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${Math.min((curr / Math.max(target, 1)) * 100, 100)}%` }}></div>
    </div>
  </div>
);

const FoodItem = ({ label, icon, val, unit, max, color, onChange, onAdd }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-xs shadow-inner border border-slate-100">{icon}</span>
        <span className="text-sm font-bold text-slate-700">{label} <span className="text-blue-600 font-black">{val}{unit}</span></span>
      </div>
      <button onClick={onAdd} className="text-blue-600 active:scale-90 transition hover:scale-110 p-1"><PlusCircle className="w-7 h-7" /></button>
    </div>
    <input type="range" min="0" max={max} step={unit === 'g' ? 10 : 1} value={val} onChange={(e) => onChange(Number(e.target.value))} className={`w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer ${color}`} />
  </div>
);

export default App;