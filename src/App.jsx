import React, { useState } from 'react';
import { 
  Newspaper, Database, BarChart3, Info, Search, 
  MapPin, User, AlertTriangle, Scale, Calendar, 
  ChevronRight, ExternalLink, ShieldCheck, 
  Gavel, ArrowLeft, Download, Landmark, Quote
} from 'lucide-react';

// --- モックデータ ---
const mockCases = [
  {
    id: "JP-2023-0842", date: "2023.11.15", location: "東京都某区 福祉事務所",
    who: "係長級職員", what: "生活保護費の不正操作による公金横領",
    punishment: "懲戒免職", summary: "架空名義を作成し824万円を自身の口座へ送金。内部監査により発覚。",
    category: "公金横領", source: "区広報 / 読売新聞"
  }
];

// --- 表紙コンポーネント ---
const FrontPage = ({ onDetail }) => (
  <div className="animate-in fade-in duration-700 space-y-12">
    <div className="border-y-4 border-black py-6 flex justify-between items-end">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 block">Archive Edition: 2024.03.22</span>
        <h2 className="font-serif text-5xl md:text-7xl font-black tracking-tighter leading-tight">権力の行使を、<br/>客観的な記録として。</h2>
      </div>
      <div className="hidden md:block text-right font-serif opacity-40">
        <p className="text-sm italic">Vol. CCXLII — NO. 84,210</p>
        <p className="text-xl font-bold">The Digital Broadsheet</p>
      </div>
    </div>
    <article className="group cursor-pointer border-b border-slate-200 pb-12" onClick={() => onDetail(mockCases[0])}>
      <div className="flex gap-3 mb-6">
        <span className="bg-red-700 text-white text-[10px] font-black px-3 py-1 uppercase">懲戒免職</span>
        <span className="bg-black text-white text-[10px] font-black px-3 py-1 uppercase">公金横領</span>
      </div>
      <h3 className="font-serif text-4xl md:text-6xl font-extrabold mb-8 leading-tight group-hover:underline">{mockCases[0].location}幹部による<br/>巨額の公金不正流用が発覚</h3>
      <p className="text-xl text-slate-600 font-serif leading-relaxed line-clamp-3">{mockCases[0].summary}</p>
    </article>
  </div>
);

// --- メインアプリ ---
export default function App() {
  const [activeTab, setActiveTab] = useState('paper');
  const [selectedCase, setSelectedCase] = useState(null);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A202C] font-sans flex">
      {/* サイドバー：ここを連結しました */}
      <aside className="hidden lg:flex flex-col fixed h-screen w-64 bg-[#F1F4F6] border-r border-slate-200 p-8 z-50">
        <div className="mb-12">
          <h1 className="font-serif text-3xl font-black tracking-tighter">公務不正DB</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Modern Archivist</p>
        </div>
        <nav className="flex-1 space-y-4">
          <button onClick={() => {setActiveTab('paper'); setSelectedCase(null)}} className={`flex items-center gap-3 text-xs font-black uppercase ${activeTab==='paper'?'text-black':'text-slate-400'}`}><Newspaper className="w-4 h-4"/> 今日の表紙</button>
          <button onClick={() => {setActiveTab('database'); setSelectedCase(null)}} className={`flex items-center gap-3 text-xs font-black uppercase ${activeTab==='database'?'text-black':'text-slate-400'}`}><Database className="w-4 h-4"/> データベース</button>
        </nav>
        
        {/* 姉妹サイトへのワープボタン */}
        <div className="mt-auto pt-8 border-t border-slate-200">
          <a 
            href="https://fusakui-db.vercel.app/" 
            className="flex flex-col gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group border border-slate-100"
          >
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#000666] group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sister Project</p>
            </div>
            <p className="text-xs font-bold text-[#000666]">水際作戦DBへ ➔</p>
          </a>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-6 md:p-20">
        {selectedCase ? (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4">
            <button onClick={() => setSelectedCase(null)} className="mb-8 flex items-center gap-2 text-xs font-bold text-slate-400"><ArrowLeft className="w-4 h-4"/> BACK</button>
            <h2 className="font-serif text-5xl font-black mb-8">{selectedCase.what}</h2>
            <div className="bg-white p-10 border border-slate-100 shadow-xl space-y-6">
              <p className="font-serif text-lg leading-relaxed">{selectedCase.summary}</p>
              <div className="pt-6 border-t font-bold text-red-700">処分：{selectedCase.punishment}</div>
            </div>
          </div>
        ) : (
          activeTab === 'paper' ? <FrontPage onDetail={setSelectedCase} /> : <div className="text-center py-20 text-slate-400 font-serif italic">Database view is coming soon...</div>
        )}
      </main>
    </div>
  );
}
