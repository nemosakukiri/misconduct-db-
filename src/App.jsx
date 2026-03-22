import React, { useState, useEffect } from 'react';
import { 
  Newspaper, Database, Search, MapPin, ChevronRight, 
  Landmark, ArrowLeft, Sparkles, ExternalLink,
  AlertCircle, BarChart3, Clock, TrendingUp
} from 'lucide-react';

// --- Firebase設定 ---
import { db } from './firebase'; 
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// --- 小型化した支援セクション ---
const SmallDonation = () => (
  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Support Mission</h4>
    <p className="text-[11px] text-slate-600 mb-4 leading-relaxed font-serif italic">
      「記録」を維持するために、コーヒー1杯のご支援をお願いします。
    </p>
    <a 
      href="https://www.buymeacoffee.com/あなたのID" 
      target="_blank" 
      className="inline-flex items-center gap-2 bg-[#FFDD00] text-black px-4 py-2 rounded-full font-bold text-[10px] hover:scale-105 transition-all shadow-sm"
    >
      ☕ Buy Me a Coffee
    </a>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('paper');
  const [selectedCase, setSelectedCase] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "misconduct_cases"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const caseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCases(caseList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A202C] font-sans flex text-left">
      {/* --- サイドバー --- */}
      <aside className="hidden lg:flex flex-col fixed h-screen w-64 bg-[#f1f4f6] border-r border-slate-200 p-8 z-50">
        <div className="mb-10">
          <h1 className="font-serif text-2xl font-black tracking-tighter">公務不正DB</h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Modern Archivist</p>
        </div>
        
        <nav className="flex-1 space-y-1 text-slate-900">
          <button onClick={() => {setActiveTab('paper'); setSelectedCase(null)}} className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase rounded-lg transition-all ${activeTab==='paper' && !selectedCase ? 'bg-white shadow-sm text-black' : 'text-slate-400 hover:text-slate-600'}`}><Newspaper className="w-4 h-4"/> 今日の表紙</button>
          <button onClick={() => {setActiveTab('database'); setSelectedCase(null)}} className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase rounded-lg transition-all ${activeTab==='database' && !selectedCase ? 'bg-white shadow-sm text-black' : 'text-slate-400 hover:text-slate-600'}`}><Database className="w-4 h-4"/> アーカイブ</button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200">
          <a href="https://fusakui-db.vercel.app/" target="_blank" className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
            <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-slate-900"><Landmark className="w-3.5 h-3.5"/></div>
            <p className="text-[10px] font-bold text-slate-500">水際作戦DBへ ➔</p>
          </a>
        </div>
      </aside>

      {/* --- メインコンテンツ --- */}
      <main className="flex-1 lg:ml-64 p-6 md:p-12 lg:p-20 flex flex-col max-w-7xl">
        {selectedCase ? (
          /* 詳細画面 */
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 space-y-10">
            <button onClick={() => setSelectedCase(null)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-black uppercase tracking-widest transition-all"><ArrowLeft className="w-4 h-4"/> Back to list</button>
            <div className="space-y-6">
              <div className="flex gap-2">
                <span className="bg-red-700 text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest">Official Record</span>
                <span className="bg-slate-200 text-slate-600 text-[9px] font-black px-2 py-1 uppercase tracking-widest">#{selectedCase.id.substring(0,6)}</span>
              </div>
              <h2 className="font-serif text-5xl font-black leading-tight border-b-2 border-black pb-8">{selectedCase.what}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-4">
                <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</p><p className="font-serif font-bold">{selectedCase.location}</p></div>
                <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p><p className="font-serif font-bold">{selectedCase.date}</p></div>
                <div className="space-y-1"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</p><p className="font-serif font-bold">{selectedCase.category}</p></div>
              </div>
              <p className="font-serif text-2xl leading-relaxed text-slate-700 text-justify first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">{selectedCase.summary}</p>
              <div className="p-8 bg-slate-900 text-white rounded-3xl space-y-2">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Final Disciplinary Action</p>
                <p className="text-2xl font-bold font-serif italic">{selectedCase.punishment}</p>
              </div>
            </div>
          </div>
        ) : (
          /* メイン画面：密度を上げた新聞レイアウト */
          <div className="animate-in fade-in duration-700 space-y-12">
            <div className="border-y-2 border-black py-6 flex justify-between items-center mb-16">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-1">Public Misconduct Archive</span>
                <h2 className="font-serif text-5xl md:text-8xl font-black tracking-tighter leading-none italic">Facts Only.</h2>
              </div>
              <div className="hidden md:block text-right font-serif opacity-40">
                <p className="text-sm italic">The Digital Broadsheet</p>
                <p className="text-xl font-bold tracking-tighter uppercase">Edition {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center font-serif italic text-slate-300 text-xl animate-pulse tracking-widest">Searching records...</div>
            ) : activeTab === 'paper' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                
                {/* 左メインカラム */}
                <div className="lg:col-span-8 space-y-12">
                  <article className="group cursor-pointer text-left" onClick={() => setSelectedCase(cases[0])}>
                    {cases[0] && (
                      <>
                        <div className="mb-8 overflow-hidden rounded-xl bg-slate-200">
                           <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200" className="w-full h-64 object-cover grayscale contrast-125 opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" alt="Court" />
                        </div>
                        <div className="flex gap-2 mb-6 text-slate-900">
                          <span className="bg-red-700 text-white text-[9px] font-black px-2 py-1 uppercase">{cases[0].punishment}</span>
                          <span className="bg-black text-white text-[9px] font-black px-2 py-1 uppercase">{cases[0].category}</span>
                        </div>
                        <h3 className="font-serif text-4xl md:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight text-slate-900 group-hover:underline">
                          {cases[0].location}にて<br/>重大な不祥事案が判明
                        </h3>
                        <p className="text-xl text-slate-600 font-serif leading-relaxed mb-8 text-justify">{cases[0].summary}</p>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-slate-900">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Published: {cases[0].date}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 group-hover:text-red-700 transition-colors">Read Report <ChevronRight className="w-3 h-3"/></span>
                        </div>
                      </>
                    )}
                  </article>
                </div>

                {/* 右サイドバー：密度アップ */}
                <aside className="lg:col-span-4 space-y-12">
                  {/* 統計ミニパネル */}
                  <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl">
                    <div className="flex items-center gap-2 mb-6 text-blue-300">
                      <BarChart3 className="w-4 h-4"/>
                      <span className="text-[9px] font-black uppercase tracking-widest">Monthly Analytics</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><p className="text-xs opacity-60">総アーカイブ数</p><p className="text-2xl font-black font-serif">{cases.length}件</p></div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden"><div className="bg-blue-400 h-full w-2/3"></div></div>
                      <p className="text-[10px] text-slate-400 leading-relaxed italic">※先週比 +12% の増加を検知。特定の自治体における報告が集中しています。</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="font-serif text-xl font-black border-b border-black pb-2 uppercase italic tracking-tighter text-slate-900">Latest Updates</h4>
                    <div className="space-y-8 text-slate-900">
                      {cases.slice(1, 6).map(c => (
                        <div key={c.id} className="group cursor-pointer border-b border-slate-100 pb-5 last:border-0 text-left" onClick={() => setSelectedCase(c)}>
                          <div className="flex justify-between text-[8px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Clock className="w-2 h-2"/> {c.date}</span>
                            <span className="text-red-700">{c.category}</span>
                          </div>
                          <h5 className="font-serif text-base font-bold group-hover:text-red-700 transition-colors leading-snug">{c.what}</h5>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <SmallDonation />
                </aside>
              </div>
            ) : (
              /* アーカイブリスト */
              <div className="space-y-8 text-slate-900">
                <div className="flex justify-between items-baseline border-b-2 border-black pb-4">
                  <h2 className="font-serif text-4xl font-extrabold">Archive Inventory</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total: {cases.length} Records</p>
                </div>
                <div className="grid gap-3">
                  {cases.map(c => (
                    <div key={c.id} onClick={() => setSelectedCase(c)} className="bg-white p-6 border border-slate-100 hover:border-slate-300 hover:shadow-md cursor-pointer flex justify-between items-center transition-all group">
                      <div className="text-left space-y-1">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.date} | {c.location}</div>
                        <div className="font-bold text-slate-800 group-hover:text-red-700 transition-colors">{c.what}</div>
                      </div>
                      <div className="text-[9px] font-black text-red-700 uppercase border border-red-100 px-2 py-1 rounded tracking-tighter">{c.punishment}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
