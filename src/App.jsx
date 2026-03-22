import React, { useState, useEffect } from 'react';
import { 
  Newspaper, Database, Search, MapPin, AlertTriangle, 
  ChevronRight, ExternalLink, Landmark, ArrowLeft, Sparkles
} from 'lucide-react';

// --- Firebase接続設定 ---
import { db } from './firebase'; 
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// --- 支援（投げ銭）セクション ---
const DonationBanner = () => (
  <section className="mt-20 py-16 px-6 bg-[#000666] text-white text-center rounded-[2.5rem] shadow-2xl relative overflow-hidden">
    <div className="relative z-10">
      <Sparkles className="w-12 h-12 text-blue-300 mx-auto mb-6 animate-pulse" />
      <h3 className="text-3xl font-bold mb-4 tracking-tight font-serif italic">Support Our Mission</h3>
      <p className="text-blue-100/70 mb-10 max-w-xl mx-auto leading-relaxed">
        本プロジェクトは個人のボランティアで運営されています。AI解析費やデータ維持のため、コーヒー1杯分のご支援をいただければ幸いです。
      </p>
      <a 
        href="https://www.buymeacoffee.com/あなたのID" 
        target="_blank" 
        className="inline-flex items-center gap-3 bg-[#FFDD00] text-black px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl"
      >
        ☕ Buy Me a Coffee
      </a>
    </div>
  </section>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('paper');
  const [selectedCase, setSelectedCase] = useState(null);
  const [cases, setCases] = useState([]); // データベースから取得するデータ
  const [loading, setLoading] = useState(true);

  // --- データベースから情報をリアルタイム取得 ---
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
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col fixed h-screen w-64 bg-[#F1F4F6] border-r border-slate-200 p-8 z-50">
        <div className="mb-12">
          <h1 className="font-serif text-3xl font-black tracking-tighter">公務不正DB</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Modern Archivist</p>
        </div>
        <nav className="flex-1 space-y-4">
          <button onClick={() => {setActiveTab('paper'); setSelectedCase(null)}} className={`flex items-center gap-3 text-xs font-black uppercase ${activeTab==='paper'?'text-black':'text-slate-400'}`}><Newspaper className="w-4 h-4"/> 今日の表紙</button>
          <button onClick={() => {setActiveTab('database'); setSelectedCase(null)}} className={`flex items-center gap-3 text-xs font-black uppercase ${activeTab==='database'?'text-black':'text-slate-400'}`}><Database className="w-4 h-4"/> アーカイブ</button>
        </nav>
        <div className="mt-auto pt-8 border-t border-slate-200">
          <a href="https://fusakui-db.vercel.app/" target="_blank" className="flex flex-col gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group border border-slate-100">
            <div className="flex items-center gap-2"><Landmark className="w-4 h-4 text-[#000666]" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sister Project</p></div>
            <p className="text-xs font-bold text-[#000666]">水際作戦DBへ ➔</p>
          </a>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-6 md:p-20 text-slate-900">
        {selectedCase ? (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 space-y-8">
            <button onClick={() => setSelectedCase(null)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-black uppercase"><ArrowLeft className="w-4 h-4"/> BACK</button>
            <div className="bg-white p-12 border border-slate-100 shadow-2xl space-y-8">
              <h2 className="font-serif text-5xl font-black">{selectedCase.what}</h2>
              <div className="text-red-700 font-bold border-y py-4">処分結果：{selectedCase.punishment}</div>
              <p className="font-serif text-xl leading-relaxed">{selectedCase.summary}</p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
            {activeTab === 'paper' ? (
              <div className="space-y-12">
                <div className="border-y-4 border-black py-6 flex justify-between items-end">
                  <h2 className="font-serif text-5xl md:text-7xl font-black tracking-tighter">事実のみを、記録する。</h2>
                  <div className="hidden md:block text-right font-serif opacity-40"><p className="text-xl font-bold">The Digital Broadsheet</p></div>
                </div>
                
                {loading ? <p className="font-serif italic text-slate-400">Loading Database...</p> : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <article className="lg:col-span-8 group cursor-pointer" onClick={() => setSelectedCase(cases[0])}>
                      {cases[0] && (
                        <>
                          <div className="flex gap-3 mb-6">
                            <span className="bg-red-700 text-white text-[10px] font-black px-3 py-1 uppercase">{cases[0].punishment}</span>
                            <span className="bg-black text-white text-[10px] font-black px-3 py-1 uppercase">{cases[0].category}</span>
                          </div>
                          <h3 className="font-serif text-4xl md:text-6xl font-extrabold mb-8 group-hover:underline leading-tight">{cases[0].location}にて不祥事案が発生</h3>
                          <p className="text-xl text-slate-600 font-serif leading-relaxed line-clamp-3">{cases[0].summary}</p>
                        </>
                      )}
                    </article>
                    <aside className="lg:col-span-4 space-y-10 border-l border-slate-100 pl-8">
                      <h4 className="font-serif text-2xl font-black border-b-2 border-black pb-2 mb-6 uppercase italic">Latest Updates</h4>
                      {cases.slice(1, 5).map(c => (
                        <div key={c.id} className="group cursor-pointer border-b border-slate-50 pb-4" onClick={() => setSelectedCase(c)}>
                          <div className="flex justify-between text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest"><span>{c.category}</span><span>{c.date}</span></div>
                          <h5 className="font-serif text-lg font-bold group-hover:text-red-700 leading-tight">{c.what}</h5>
                        </div>
                      ))}
                    </aside>
                  </div>
                )}
                <DonationBanner />
              </div>
            ) : (
              <div className="space-y-8">
                <h2 className="font-serif text-4xl font-extrabold mb-10">全処分事案アーカイブ</h2>
                <div className="grid gap-4">
                  {cases.map(c => (
                    <div key={c.id} onClick={() => setSelectedCase(c)} className="bg-white p-6 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer flex justify-between items-center">
                      <div><div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{c.date} | {c.location}</div><div className="font-bold">{c.what}</div></div>
                      <div className="text-xs font-black text-red-700 uppercase bg-red-50 px-3 py-1">{c.punishment}</div>
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
