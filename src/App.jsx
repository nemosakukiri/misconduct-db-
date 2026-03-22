import React, { useState, useEffect } from 'react';
import { 
  Newspaper, Database, Search, MapPin, ChevronRight, 
  Landmark, ArrowLeft, Sparkles, ExternalLink
} from 'lucide-react';

// --- Firebase設定 ---
import { db } from './firebase'; 
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// --- 小型化した支援セクション (Donation) ---
const SmallDonation = () => (
  <div className="mt-12 p-8 border border-slate-200 bg-white rounded-2xl shadow-sm text-center">
    <Sparkles className="w-6 h-6 text-blue-400 mx-auto mb-3" />
    <h4 className="text-sm font-bold text-slate-800 mb-2 font-serif italic">Support Our Archive</h4>
    <p className="text-[11px] text-slate-500 mb-5 leading-relaxed">
      AI解析とデータ維持のため、<br/>コーヒー1杯のご支援をお願いいたします。
    </p>
    <a 
      href="https://www.buymeacoffee.com/あなたのID" 
      target="_blank" 
      className="inline-flex items-center gap-2 bg-[#FFDD00] text-black px-5 py-2 rounded-full font-bold text-xs hover:scale-105 transition-all shadow-md"
    >
      <img src="https://cdn.buymeacoffee.com/widget/assets/images/bmc-btn-logo.svg" alt="BMC" className="w-4 h-4" />
      Buy Me a Coffee
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A202C] font-sans flex">
      {/* --- サイドバー：最初のレイアウトを再現 --- */}
      <aside className="hidden lg:flex flex-col fixed h-screen w-64 bg-[#f1f4f6] border-r border-[#abb3b7]/20 p-8 z-50">
        <div className="mb-10">
          <h1 className="font-serif text-2xl font-black tracking-tighter">公務不正DB</h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Modern Archivist</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => {setActiveTab('paper'); setSelectedCase(null)}} 
            className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-lg ${activeTab==='paper' && !selectedCase ? 'bg-white shadow-sm text-black' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Newspaper className="w-4 h-4"/> 今日の表紙
          </button>
          <button 
            onClick={() => {setActiveTab('database'); setSelectedCase(null)}} 
            className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-lg ${activeTab==='database' && !selectedCase ? 'bg-white shadow-sm text-black' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Database className="w-4 h-4"/> アーカイブ
          </button>
        </nav>

        {/* 姉妹サイト：控えめなデザインに変更 */}
        <div className="mt-auto pt-6 border-t border-slate-200">
          <a href="https://fusakui-db.vercel.app/" target="_blank" className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
            <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center"><Landmark className="w-3.5 h-3.5 text-slate-600"/></div>
            <p className="text-[10px] font-bold text-slate-500">水際作戦DBへ ➔</p>
          </a>
        </div>
      </aside>

      {/* --- メインコンテンツ --- */}
      <main className="flex-1 lg:ml-64 p-6 md:p-12 lg:p-20 flex flex-col">
        {selectedCase ? (
          /* 詳細画面 */
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 space-y-10">
            <button onClick={() => setSelectedCase(null)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-black uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4"/> Back to list
            </button>
            <div className="space-y-6">
              <span className="bg-red-700 text-white text-[10px] font-black px-3 py-1 uppercase tracking-[0.1em]">Official Report</span>
              <h2 className="font-serif text-5xl font-extrabold leading-tight text-slate-900 border-b-2 border-slate-100 pb-8">{selectedCase.what}</h2>
              <div className="grid grid-cols-2 gap-10 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <div><p className="mb-1">Location</p><p className="text-black text-base font-serif">{selectedCase.location}</p></div>
                <div><p className="mb-1">Date</p><p className="text-black text-base font-serif">{selectedCase.date}</p></div>
              </div>
              <p className="font-serif text-2xl leading-relaxed text-slate-700 text-justify">{selectedCase.summary}</p>
              <div className="bg-slate-50 p-6 border-l-4 border-slate-800 text-xs font-bold text-slate-500 italic">" {selectedCase.punishment} "</div>
            </div>
          </div>
        ) : (
          /* メイン画面：新聞レイアウトを完全復元 */
          <div className="animate-in fade-in duration-700">
            <div className="border-y-2 border-black py-4 flex justify-between items-end mb-16">
              <div className="max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2 block">Archive Edition: {new Date().toLocaleDateString()}</span>
                <h2 className="font-serif text-5xl md:text-7xl font-black tracking-tighter leading-none text-left">事実のみを、記録する。</h2>
              </div>
              <div className="hidden md:block text-right font-serif opacity-40">
                <p className="text-sm italic">The Digital Broadsheet</p>
                <p className="text-xl font-bold tracking-tighter uppercase">Vol. CCXLII</p>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center font-serif italic text-slate-300 text-xl animate-pulse tracking-widest">Searching for facts...</div>
            ) : activeTab === 'paper' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <article className="lg:col-span-8 group cursor-pointer text-left" onClick={() => setSelectedCase(cases[0])}>
                  {cases[0] && (
                    <>
                      <div className="flex gap-2 mb-6">
                        <span className="bg-red-700 text-white text-[9px] font-black px-2 py-1 uppercase">{cases[0].punishment}</span>
                        <span className="bg-black text-white text-[9px] font-black px-2 py-1 uppercase">{cases[0].category}</span>
                      </div>
                      <h3 className="font-serif text-4xl md:text-6xl font-extrabold mb-8 group-hover:underline leading-tight tracking-tight">
                        {cases[0].location}にて<br/>不祥事案が判明
                      </h3>
                      <p className="text-xl text-slate-600 font-serif leading-relaxed mb-8 line-clamp-4 border-l-2 border-slate-200 pl-6">{cases[0].summary}</p>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-6 border-t border-slate-50 flex items-center gap-2">
                        <ExternalLink className="w-3 h-3" /> View Detail Records
                      </div>
                    </>
                  )}
                </article>

                <aside className="lg:col-span-4 space-y-12">
                  <h4 className="font-serif text-xl font-black border-b border-black pb-2 mb-8 uppercase italic tracking-tighter">Latest Updates</h4>
                  <div className="space-y-10">
                    {cases.slice(1, 6).map(c => (
                      <div key={c.id} className="group cursor-pointer border-b border-slate-50 pb-6 last:border-0 text-left" onClick={() => setSelectedCase(c)}>
                        <div className="flex justify-between text-[9px] font-black text-slate-400 mb-2 uppercase tracking-[0.1em]">
                          <span>{c.category}</span>
                          <span>{c.date}</span>
                        </div>
                        <h5 className="font-serif text-lg font-bold group-hover:text-red-700 leading-tight">{c.what}</h5>
                      </div>
                    ))}
                    {cases.length <= 1 && <p className="text-[10px] italic text-slate-400">Loading more reports...</p>}
                  </div>
                  
                  {/* 小型化した投げ銭ボタンをここに配置 */}
                  <SmallDonation />
                </aside>
              </div>
            ) : (
              /* アーカイブリスト */
              <div className="space-y-10">
                <h2 className="font-serif text-4xl font-extrabold text-left border-b-2 border-slate-50 pb-6">全処分記録アーカイブ</h2>
                <div className="grid gap-3">
                  {cases.map(c => (
                    <div key={c.id} onClick={() => setSelectedCase(c)} className="bg-white p-5 border border-slate-100 hover:shadow-md cursor-pointer flex justify-between items-center transition-all rounded-xl">
                      <div className="text-left">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{c.date} | {c.location}</div>
                        <div className="font-bold text-sm text-slate-800">{c.what}</div>
                      </div>
                      <div className="text-[9px] font-black text-red-700 uppercase bg-red-50 px-2 py-1 rounded">{c.punishment}</div>
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
