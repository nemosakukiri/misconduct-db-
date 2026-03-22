import React, { useState } from 'react';
import { 
  Newspaper, Database, Search, MapPin, User, 
  AlertTriangle, Scale, ChevronRight, ExternalLink, 
  ShieldCheck, Gavel, ArrowLeft, Download, Landmark
} from 'lucide-react';

// --- 【データ拡充】直近の主要な不祥事案 6件 ---
const mockCases = [
  {
    id: "JP-2024-0322",
    date: "2024.03.21",
    location: "埼玉県 富士見市",
    who: "市立小学校 事務主事 (20代)",
    what: "給食費など公金約310万円を横領",
    punishment: "懲戒免職",
    summary: "学校の預金口座から給食費等を無断で引き出し私的に流用。銀行の残高証明書を偽造して発覚を免れようとしていた。市は刑事告訴を検討中。",
    category: "公金横領",
    source: "地方自治体公式発表",
    impact: "管理責任として校長を文書訓告"
  },
  {
    id: "JP-2024-0319",
    date: "2024.03.19",
    location: "大阪府 吹田市",
    who: "地域経済推進室 課長級 (50代)",
    what: "酒気帯び運転による物損事故",
    punishment: "停職 6ヶ月",
    summary: "飲食店で飲酒後、乗用車を運転しガードレールに衝突。呼気検査で基準値を超えるアルコールが検出。本人は依願退職の意向。",
    category: "交通違反",
    source: "産経新聞 / NHK",
    impact: "幹部職員のコンプライアンス研修実施"
  },
  {
    id: "JP-2024-0315",
    date: "2024.03.15",
    location: "宮崎県 延岡市",
    who: "消防局 消防副士長 (20代)",
    what: "不同意わいせつ容疑での逮捕",
    punishment: "懲戒免職",
    summary: "知人女性に対し抵抗できない状態でわいせつな行為をした疑い。公務員としての信用を著しく失墜させたとして即日免職処分。",
    category: "性犯罪",
    source: "宮崎日日新聞",
    impact: "消防局長が公式会見で謝罪"
  },
  {
    id: "JP-2024-0310",
    date: "2024.03.10",
    location: "奈良県庁",
    who: "土木部 主事 (30代)",
    what: "時間外勤務手当の不正受給",
    punishment: "減給 1/10 (3ヶ月)",
    summary: "実際には勤務していない時間帯をシステムに入力。約1年間にわたり計45万円の手当を不正に受け取っていた。全額返還済み。",
    category: "手当不正",
    source: "県人事課広報",
    impact: "勤怠管理システムのログ監査実施"
  },
  {
    id: "JP-2024-0305",
    date: "2024.03.05",
    location: "愛知県 警察本部",
    who: "警察署 巡査部長 (40代)",
    what: "捜査情報の漏洩（地方公務員法違反）",
    punishment: "停職 3ヶ月",
    summary: "知人に対し、特定の人物が捜査対象になっているかどうか等の情報を漏洩。見返りの金品受領は確認されず。本人は引責辞職。",
    category: "情報漏洩",
    source: "中日新聞",
    impact: "県警全職員への守秘義務再徹底"
  },
  {
    id: "JP-2024-0228",
    date: "2024.02.28",
    location: "兵庫県 神戸市",
    who: "環境局 技能員 (40代)",
    what: "同僚に対するパワーハラスメント",
    punishment: "停職 1ヶ月",
    summary: "複数の同僚に対し、日常的に暴言を吐く、身体を小突くなどの行為を繰り返し、一人の職員を適応障害による休職に追い込んだ。",
    category: "ハラスメント",
    source: "神戸新聞",
    impact: "ハラスメント外部通報窓口の周知"
  }
];

const FrontPage = ({ onDetail }) => (
  <div className="animate-in fade-in duration-700 space-y-12">
    {/* 新聞ヘッダー */}
    <div className="border-y-4 border-black py-6 flex justify-between items-end">
      <div className="max-w-2xl text-slate-900">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-600 mb-2 block animate-pulse">Update: 2024.03.22 Edition</span>
        <h2 className="font-serif text-5xl md:text-7xl font-black tracking-tighter leading-tight italic">事実のみを、記録する。</h2>
      </div>
      <div className="hidden md:block text-right font-serif text-slate-900">
        <p className="text-sm italic opacity-40">Public Misconduct Archive</p>
        <p className="text-xl font-bold">The Digital Broadsheet</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-slate-900">
      {/* メイン記事 */}
      <article className="lg:col-span-8 group cursor-pointer" onClick={() => onDetail(mockCases[0])}>
        <div className="flex gap-3 mb-6">
          <span className="bg-red-700 text-white text-[10px] font-black px-3 py-1 uppercase">{mockCases[0].punishment}</span>
          <span className="bg-black text-white text-[10px] font-black px-3 py-1 uppercase">{mockCases[0].category}</span>
        </div>
        <h3 className="font-serif text-4xl md:text-6xl font-extrabold mb-8 leading-tight group-hover:underline">
          {mockCases[0].location}、<br/>給食費310万円を横領。<br/>残高証明を偽造。
        </h3>
        <p className="text-xl text-slate-600 font-serif leading-relaxed mb-6 border-l-4 border-slate-200 pl-6">
          {mockCases[0].summary}
        </p>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <ExternalLink className="w-3 h-3" /> 出典: {mockCases[0].source}
        </div>
      </article>

      {/* サイドバー（最新5件を表示） */}
      <aside className="lg:col-span-4 space-y-10 border-l border-slate-100 pl-8">
        <h4 className="font-serif text-2xl font-black border-b-2 border-black pb-2 mb-6 uppercase italic">Latest Reports</h4>
        <div className="space-y-8">
          {mockCases.slice(1).map(c => (
            <div key={c.id} className="group cursor-pointer border-b border-slate-50 pb-4 last:border-0" onClick={() => onDetail(c)}>
              <div className="flex justify-between text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                <span>{c.category}</span>
                <span>{c.date}</span>
              </div>
              <h5 className="font-serif text-lg font-bold group-hover:text-red-700 transition-colors leading-tight mb-2">{c.what}</h5>
              <div className="text-[10px] font-bold text-red-600">{c.punishment}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('paper');
  const [selectedCase, setSelectedCase] = useState(null);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A202C] font-sans flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col fixed h-screen w-64 bg-[#F1F4F6] border-r border-slate-200 p-8 z-50">
        <div className="mb-12 text-slate-900">
          <h1 className="font-serif text-3xl font-black tracking-tighter">公務不正DB</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Modern Archivist</p>
        </div>
        <nav className="flex-1 space-y-4">
          <button onClick={() => {setActiveTab('paper'); setSelectedCase(null)}} className={`w-full flex items-center gap-3 text-xs font-black uppercase tracking-widest ${activeTab==='paper'?'text-black':'text-slate-400'}`}><Newspaper className="w-4 h-4"/> 今日の表紙</button>
          <button onClick={() => {setActiveTab('database'); setSelectedCase(null)}} className={`w-full flex items-center gap-3 text-xs font-black uppercase tracking-widest ${activeTab==='database'?'text-black':'text-slate-400'}`}><Database className="w-4 h-4"/> アーカイブ</button>
        </nav>
        <div className="mt-auto pt-8 border-t border-slate-200 text-slate-900 text-left">
          <a href="https://fusakui-db.vercel.app/" target="_blank" className="flex flex-col gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group border border-slate-100">
            <div className="flex items-center gap-2"><Landmark className="w-4 h-4 text-[#000666]" /><p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sister Project</p></div>
            <p className="text-xs font-bold text-[#000666]">水際作戦DBへ ➔</p>
          </a>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-6 md:p-20 text-slate-900">
        {selectedCase ? (
          <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 space-y-8 pb-20">
            <button onClick={() => setSelectedCase(null)} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-black uppercase tracking-widest"><ArrowLeft className="w-4 h-4"/> 一覧に戻る</button>
            <div className="space-y-4">
              <span className="bg-red-700 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">Case Report</span>
              <h2 className="font-serif text-5xl font-black leading-tight text-slate-900">{selectedCase.what}</h2>
            </div>
            <div className="bg-white p-10 border border-slate-100 shadow-xl space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm border-b border-slate-50 pb-8 text-slate-900">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Location</div><div className="md:col-span-3 font-bold">{selectedCase.location}</div>
                <div className="text-slate-400 font-bold uppercase text-[10px]">Result</div><div className="md:col-span-3 font-bold text-red-700">{selectedCase.punishment}</div>
                <div className="text-slate-400 font-bold uppercase text-[10px]">Category</div><div className="md:col-span-3 font-bold">{selectedCase.category}</div>
              </div>
              <p className="font-serif text-2xl leading-relaxed text-slate-700">{selectedCase.summary}</p>
              <div className="bg-slate-50 p-8 border-l-4 border-slate-800 text-sm font-bold text-slate-500 italic">" {selectedCase.impact} "</div>
            </div>
          </div>
        ) : (
          activeTab === 'paper' ? <FrontPage onDetail={setSelectedCase} /> : (
            <div className="animate-in fade-in space-y-8">
              <h2 className="font-serif text-4xl font-extrabold mb-10">全処分事案アーカイブ</h2>
              <div className="grid gap-4">
                {mockCases.map(c => (
                  <div key={c.id} onClick={() => setSelectedCase(c)} className="bg-white p-6 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer flex justify-between items-center transition-all">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{c.date} | {c.location}</div>
                      <div className="font-bold text-slate-800">{c.what}</div>
                    </div>
                    <div className="text-xs font-black text-red-700 uppercase bg-red-50 px-3 py-1">{c.punishment}</div>
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
