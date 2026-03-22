import React, { useState, useEffect } from 'react';
import { 
  Newspaper, Database, Search, MapPin, AlertTriangle, 
  ChevronRight, ExternalLink, Landmark, ArrowLeft, Sparkles
} from 'lucide-react';

// --- Firebaseの設定を読み込む ---
import { db } from './firebase'; 
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// --- 支援セクション ---
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

// --- 1. 今日の表紙 (Newspaper View) ---
const FrontPage = ({ onDetail, cases }) => (
  <div className="animate-in fade-in duration-700 space-y-12">
    <div className="border-y-4 border-black py-6 flex justify-between items-end text-slate-900">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-600 mb-2 block">Archive Edition: {new Date().toLocaleDateString()}</span>
        <h2 className="font-serif text-5xl md:text-7xl font-black tracking-tighter leading-tight italic text-left">事実のみを、記録する。</h2>
      </div>
      <div className="hidden md:block text-right font-serif opacity-40">
        <p className="text-xl font-bold">The Digital Broadsheet</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-slate-900 text-left">
      {/* メイン記事 (最新の1件) */}
      <article className="lg:col-span-8 group cursor-pointer" onClick={() => onDetail(cases[0])}>
        {cases[0] ? (
          <>
            <div className="flex gap-3 mb-6">
              <span className="bg-red-700 text-white text-[10px] font-black px-3 py-1 uppercase">{cases[0].punishment}</span>
              <span className="bg-black text-white text-[10px] font-black px-3 py-1 uppercase">{cases[0].category}</span>
            </div>
            <h3 className="font-serif text-4xl md:text-6xl font-extrabold mb-8 group-hover:underline leading-tight">
              {cases[0].location}にて<br/>不祥事案が発生
            </h3>
            <p className="text-xl text-slate-600 font-serif leading-relaxed mb-6 border-l-4 border-slate-200 pl-6">{cases[0].summary}</p>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 pt-4 border-t border-slate-50">
              <ExternalLink className="w-3 h-3" /> データベース記録を確認 ➔
            </div>
          </>
        ) : <p className="font-serif italic text-slate-400">現在ニュースを読み込んでいます...</p>}
      </article>

      {/* サイドバー (2件目以降を表示) */}
      <aside className="lg:col-span-4 space-y-10 border-l border-slate-100 pl-8">
        <h4 className="font-serif text-2xl font-black border-b-2 border-black pb-2 mb-6 uppercase italic">Latest Updates</h4>
        <div className="space-y-8">
          {cases.slice(1).map(c => (
            <div key={c.id} className="group cursor-pointer border-b border-slate-50 pb-4 last:border-0" onClick={() => onDetail(c)}>
              <div className="flex justify-between text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                <span>{c.category}</span>
                <span>{c.date}</span>
              </div>
              <h5 className="font-serif text-lg font-bold group-hover:text-red-700 transition-colors leading-tight mb-1">{c.what}</h5>
              <div className="text-[10px] font-bold text-red-600">{c.punishment}</div>
            </div>
          ))}
          {cases.length <= 1 && (
            <p className="text-xs italic text-slate-400">追加のニュースを待機中...</p>
          )}
        </div>
      </aside>
    </div>
    
    <DonationBanner />
  </div>
);

// --- 2. メインアプリ全体構造 ---
export default function App() {
  const [activeTab, setActiveTab] = useState('paper');
  const [selectedCase, setSelectedCase] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // データベースから情報をリアルタイム取得
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
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col fixed h-screen w-64 bg-[#F1F4F6] border-r border-slate-200 p-8 z-50">
        <div className="mb-12">
          <h1 className="font-serif text-3xl font-black tracking-tighter">公務不正DB</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 text-left">Modern Archivist</p>
        </div>
        <nav className="flex-1 space-y-4">
          <button onClick={() => {setActiveTab('paper'); setSelectedCase(null)}} className={`w-full flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab==='paper' && !selectedCase ?'text-black':'text-slate-400 hover:text-slate-600'}`}><Newspaper className="w-4 h-4"/> 今日の表紙</button>
          <button onClick={() => {setActiveTab('database'); setSelectedCase(null)}} className={`w-full flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab==='database' && !selectedCase ?'text-black':'text-slate-400 hover:text-slate-600'}`}><Database className="w-4 h-4"/> アーカイブ</button>
        </nav>
        <div className="mt-auto pt-8 border-t border-slate-200">
          <a href="https://fusakui-db.vercel.app/" target="_blank" className="flex flex-col gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group border border-slate-100">
            <div className="flex items-center gap-2"><Landmark className="w-4 h-4 text-[#000666]" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sister Project</p></div>
            <p className="text-xs font-bold text-[#000666]">水際作戦DBへ ➔</p>
          </a>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-6 md:p-20">
        {selectedCase ? (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 space-y-8 pb-20">
            <button onClick={() => setSelectedCase(null)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-black uppercase tracking-widest"><ArrowLeft className="w-4 h-4"/> 一覧に戻る</button>
            <div className="bg-white p-10 border border-slate-100 shadow-2xl space-y-10 rounded-3xl">
              <div className="space-y-4">
                <span className="bg-red-700 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest italic">Official Case Report</span>
                <h2 className="font-serif text-5xl font-black leading-tight text-slate-900">{selectedCase.what || "詳細情報"}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm border-y border-slate-50 py-8">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Location</div><div className="md:col-span-3 font-bold">{selectedCase.location}</div>
                <div className="text-slate-400 font-bold uppercase text-[10px]">Date</div><div className="md:col-span-3 font-bold">{selectedCase.date}</div>
                <div className="text-slate-400 font-bold uppercase text-[10px]">Result</div><div className="md:col-span-3 font-bold text-red-700">{selectedCase.punishment}</div>
              </div>
              <p className="font-serif text-2xl leading-relaxed text-slate-700">{selectedCase.summary}</p>
            </div>
          </div>
        ) : (
          activeTab === 'paper' ? <FrontPage onDetail={setSelectedCase} cases={cases} /> : (
            <div className="animate-in fade-in space-y-8">
              <h2 className="font-serif text-4xl font-extrabold mb-10 text-left">全処分事案アーカイブ</h2>
              <div className="grid gap-4">
                {cases.map(c => (
                  <div key={c.id} onClick={() => setSelectedCase(c)} className="bg-white p-6 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer flex justify-between items-center transition-all rounded-xl">
                    <div className="text-left">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{c.date} | {c.location}</div>
                      <div className="font-bold text-slate-800">{c.what}</div>
                    </div>
                    <div className="text-xs font-black text-red-700 uppercase bg-red-50 px-3 py-1 rounded-lg">{c.punishment}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
