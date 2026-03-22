import React, { useState } from 'react';
import { 
  Newspaper, Database, Search, 
  MapPin, User, AlertTriangle, Scale, 
  ChevronRight, ExternalLink, ShieldCheck, 
  Gavel, ArrowLeft, Download, Landmark
} from 'lucide-react';

// --- 【手動更新エリア】最新のニュースデータ ---
const mockCases = [
  {
    id: "JP-2024-0322",
    date: "2024.03.21",
    location: "埼玉県 富士見市",
    who: "市立小学校 事務主事 (20代)",
    what: "給食費など公金約310万円を横領",
    punishment: "懲戒免職",
    summary: "学校の預金口座から約310万円を無断で引き出し、私的に流用。銀行の残高証明書を偽造して発覚を免れようとしていた。市は刑事告訴も検討中。",
    category: "公金横領・公文書偽造",
    source: "埼玉新聞 / 共同通信",
    impact: "管理監督責任として校長ら3名を文書訓告"
  },
  {
    id: "JP-2024-0319",
    date: "2024.03.19",
    location: "大阪府 吹田市",
    who: "地域経済推進室 課長級 (50代)",
    what: "酒気帯び運転による物損事故",
    punishment: "停職 6ヶ月",
    summary: "勤務終了後、飲食店で飲酒した後に乗用車を運転。ガードレールに衝突する事故を起こし、警察の呼気検査で基準値を超えるアルコールが検出された。",
    category: "飲酒運転",
    source: "毎日新聞 / NHKニュース",
    impact: "本人は依願退職の意向"
  },
  {
    id: "JP-2024-0315",
    date: "2024.03.15",
    location: "宮崎県 延岡市",
    who: "消防局 消防副士長 (20代)",
    what: "知人女性に対する不同意わいせつ容疑",
    punishment: "懲戒免職",
    summary: "飲食店で知人女性に対し、抵抗できない状態でわいせつな行為をしたとして逮捕・起訴。公務員としての信用を著しく失墜させたとして厳罰処分。",
    category: "性犯罪・不祥事",
    source: "宮崎日日新聞",
    impact: "消防局長が会見で謝罪"
  }
];

// --- 1. 今日の表紙 (Newspaper View) ---
const FrontPage = ({ onDetail }) => (
  <div className="animate-in fade-in duration-700 space-y-12">
    <div className="border-y-4 border-black py-6 flex justify-between items-end">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-600 mb-2 block">Breaking News / 2024.03.22 Edition</span>
        <h2 className="font-serif text-5xl md:text-7xl font-black tracking-tighter leading-tight">権力の行使を、<br/>客観的な記録として。</h2>
      </div>
      <div className="hidden md:block text-right font-serif opacity-40">
        <p className="text-sm italic">Vol. CCXLII — NO. 84,212</p>
        <p className="text-xl font-bold">The Digital Broadsheet</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* メイン記事 */}
      <article className="lg:col-span-8 group cursor-pointer" onClick={() => onDetail(mockCases[0])}>
        <div className="flex gap-3 mb-6">
          <span className="bg-red-700 text-white text-[10px] font-black px-3 py-1 uppercase">{mockCases[0].punishment}</span>
          <span className="bg-black text-white text-[10px] font-black px-3 py-1 uppercase">{mockCases[0].category}</span>
        </div>
        <h3 className="font-serif text-4xl md:text-6xl font-extrabold mb-8 leading-tight group-hover:underline">
          {mockCases[0].location}職員、<br/>給食費310万円を横領。<br/>証明書も偽造。
        </h3>
        <p className="text-xl text-slate-600 font-serif leading-relaxed mb-6">{mockCases[0].summary}</p>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-t border-slate-100 pt-4">
          <ExternalLink className="w-3 h-3" /> 出典: {mockCases[0].source}
        </div>
      </article>

      {/* サイドバー（サブ記事） */}
      <aside className="lg:col-span-4 space-y-10 border-l border-slate-100 pl-8">
        <h4 className="font-serif text-2xl font-black border-b-2 border-black pb-2 mb-6 uppercase italic">Latest Updates</h4>
        {mockCases.slice(1).map(c => (
          <div key={c.id} className="group cursor-pointer border-b border-slate-100 pb-6" onClick={() => onDetail(c)}>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
              <span>{c.category}</span>
              <span>{c.date}</span>
            </div>
            <h5 className="font-serif text-xl font-bold group-hover:text-red-700 transition-colors leading-tight mb-2">{c.what}</h5>
            <p className="text-sm text-slate-500 line-clamp-2">{c.summary}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- メインアプリコンポーネント ---
export default function App() {
  const [activeTab, setActiveTab] = useState('paper');
  const [selectedCase, setSelectedCase] = useState(null);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A202C] font-sans flex">
      {/* Sidebar (共通) */}
      <aside className="hidden lg:flex flex-col fixed h-screen w-64 bg-[#F1F4F6] border-r border-slate-200 p-8 z-50">
        <div className="mb-12">
          <h1 className="font-serif text-3xl font-black tracking-tighter">公務不正DB</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Modern Archivist</p>
        </div>
        <nav className="flex-1 space-y-4">
          <button onClick={() => {setActiveTab('paper'); setSelectedCase(null)}} className={`flex items-center gap-3 text-xs font-black uppercase ${activeTab==='paper'?'text-black':'text-slate-400'}`}><Newspaper className="w-4 h-4"/> 今日の表紙</button>
          <button onClick={() => {setActiveTab('database'); setSelectedCase(null)}} className={`flex items-center gap-3 text-xs font-black uppercase ${activeTab==='database'?'text-black':'text-slate-400'}`}><Database className="w-4 h-4"/> データベース</button>
        </nav>
        <div className="mt-auto pt-8 border-t border-slate-200">
          <a href="https://fusakui-db.vercel.app/" className="flex flex-col gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group border border-slate-100">
            <div className="flex items-center gap-2"><Landmark className="w-4 h-4 text-[#000666]" /><p className="text-[10px] font-black text-slate-400 uppercase">Sister Project</p></div>
            <p className="text-xs font-bold text-[#000666]">水際作戦DBへ ➔</p>
          </a>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-6 md:p-20">
        {selectedCase ? (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 space-y-8">
            <button onClick={() => setSelectedCase(null)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-black"><ArrowLeft className="w-4 h-4"/> BACK TO LIST</button>
            <div className="space-y-4">
              <span className="bg-red-700 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">不祥事詳細レポート</span>
              <h2 className="font-serif text-5xl font-black leading-tight text-slate-900">{selectedCase.what}</h2>
            </div>
            <div className="bg-white p-10 border border-slate-100 shadow-xl space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm border-b border-slate-50 pb-8">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Location</div>
                <div className="md:col-span-3 font-bold">{selectedCase.location}</div>
                <div className="text-slate-400 font-bold uppercase text-[10px]">Action</div>
                <div className="md:col-span-3 font-bold text-red-700">{selectedCase.punishment}</div>
              </div>
              <p className="font-serif text-xl leading-relaxed text-slate-700">{selectedCase.summary}</p>
              <div className="bg-slate-50 p-6 rounded-xl text-sm font-bold text-slate-500">影響範囲：{selectedCase.impact}</div>
            </div>
          </div>
        ) : (
          activeTab === 'paper' ? <FrontPage onDetail={setSelectedCase} /> : <div className="text-center py-20 text-slate-400 font-serif italic">Archive Database coming soon...</div>
        )}
      </main>
    </div>
  );
}
