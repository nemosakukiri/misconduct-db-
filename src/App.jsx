import React, { useState } from 'react';
import { 
  Newspaper, Database, BarChart3, Info, Search, Filter, 
  MapPin, User, AlertTriangle, Scale, Calendar, 
  ChevronRight, ArrowRight, ExternalLink, ShieldCheck, 
  Lock, Gavel, ArrowLeft, Download, TrendingUp,
  LayoutDashboard, Timeline, Landmark, Quote
} from 'lucide-react';

// --- モックデータ (将来的にGemini AIが自動収集するデータ) ---
const mockCases = [
  {
    id: "JP-2023-0842",
    date: "2023.11.15",
    location: "東京都某区 福祉事務所",
    who: "係長級職員 (40代・男性)",
    what: "生活保護費の支給データを不正操作し、計824万円を私的横領。",
    punishment: "懲戒免職",
    summary: "架空の受給名義を作成し、3年間にわたり自身の口座に振り込ませていた。内部監査により発覚。",
    category: "公金横領",
    source: "区広報 / 読売新聞",
    impact: "管理監督者3名への減給処分"
  },
  {
    id: "JP-2023-0712",
    date: "2023.10.22",
    location: "大阪府警察本部",
    who: "巡査部長",
    what: "捜査情報の外部漏洩および守秘義務違反。",
    punishment: "停職 3ヶ月",
    summary: "特定の飲食店に対し、抜き打ち検査の日程を事前に漏洩。見返りに接待を受けていた疑い。",
    category: "汚職・収賄",
    source: "大阪府警プレスリリース",
    impact: "刑事告発の検討"
  }
];

// --- 1. 今日の表紙 (Newspaper Style) ---
const FrontPage = ({ onDetail }) => (
  <div className="animate-in fade-in duration-700 space-y-12">
    <div className="border-y-4 border-black py-4 flex justify-between items-end">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Archive Edition: {new Date().toLocaleDateString()}</span>
        <h2 className="font-serif text-5xl md:text-7xl font-black tracking-tighter leading-tight text-[#1A202C]">
          権力の行使を、<br/>客観的な記録として刻む。
        </h2>
      </div>
      <div className="hidden md:block text-right font-serif">
        <p className="text-sm italic text-slate-400">Vol. CCXLII — NO. 84,210</p>
        <p className="text-xl font-bold text-slate-800">The Digital Broadsheet</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <article className="lg:col-span-8 group cursor-pointer" onClick={() => onDetail(mockCases[0])}>
        <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200" className="w-full h-[450px] object-cover grayscale brightness-90 group-hover:brightness-100 transition-all mb-6" />
        <div className="flex gap-3 mb-4">
          <span className="bg-red-700 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">懲戒免職</span>
          <span className="bg-slate-800 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest">公金横領</span>
        </div>
        <h3 className="font-serif text-4xl md:text-5xl font-extrabold mb-6 leading-tight group-hover:underline">
          {mockCases[0].location}幹部による<br/>架空発注、総額800万円の公金流用
        </h3>
        <p className="text-lg text-slate-600 leading-relaxed mb-6 line-clamp-3 font-serif">
          {mockCases[0].summary} 内部監査の結果、長期にわたる組織的隠蔽の疑いも浮上。本件は自治体の透明性を揺るがす重大事案として位置づけられる。
        </p>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-t border-slate-100 pt-4">
          <ExternalLink className="w-3 h-3" /> 出典: {mockCases[0].source}
        </div>
      </article>

      <aside className="lg:col-span-4 space-y-10 border-l border-slate-100 pl-8">
        <h4 className="font-serif text-2xl font-black border-b-2 border-black pb-2 mb-6 uppercase italic">Latest Updates</h4>
        {mockCases.slice(1).map(c => (
          <div key={c.id} className="group cursor-pointer border-b border-slate-100 pb-6" onClick={() => onDetail(c)}>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
              <span>{c.category}</span>
              <span>2時間前</span>
            </div>
            <h5 className="font-serif text-xl font-bold group-hover:text-red-700 transition-colors leading-tight mb-2">{c.what}</h5>
            <p className="text-sm text-slate-500 line-clamp-2">{c.summary}</p>
          </div>
        ))}
        <div className="bg-slate-50 p-6 border-l-4 border-slate-800">
          <h5 className="text-xs font-bold uppercase tracking-widest mb-2">Editor's Analysis</h5>
          <p className="text-xs text-slate-600 italic leading-relaxed">
            「AI解析によれば、地方自治体における管理職層による不正が増加傾向にある。これは個人の資質以上に、組織的な監視体制の欠如が根本原因である。」
          </p>
        </div>
      </aside>
    </div>
  </div>
);

// --- 2. データベース一覧 (Case Archive) ---
const CaseArchive = ({ onDetail }) => (
  <div className="animate-in fade-in duration-500 space-y-8">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
      <div>
        <h2 className="font-serif text-4xl font-extrabold mb-2 text-[#1A202C]">不祥事案件アーカイブ</h2>
        <p className="text-slate-500">透明性の確保と再発防止のための公共データベース</p>
      </div>
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl text-sm" placeholder="案件を検索..." />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockCases.map(c => (
        <article key={c.id} className="bg-white p-8 border-l-4 border-red-700 shadow-sm hover:shadow-xl transition-all cursor-pointer group" onClick={() => onDetail(c)}>
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.date} | {c.location}</span>
            <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-1 uppercase">{c.punishment}</span>
          </div>
          <h3 className="font-serif text-xl font-bold mb-4 group-hover:text-red-700 transition-colors leading-tight">{c.what}</h3>
          <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed">{c.summary}</p>
          <div className="flex justify-between items-center pt-4 border-t border-slate-50">
            <span className="text-[10px] italic text-slate-400">ID: {c.id}</span>
            <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-slate-800">Details <ChevronRight className="w-3 h-3"/></button>
          </div>
        </article>
      ))}
    </div>
  </div>
);

// --- 3. 案件詳細 (Case Detail View) ---
const CaseDetail = ({ caseData, onBack }) => (
  <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto space-y-12">
    <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-black transition-colors uppercase tracking-widest">
      <ArrowLeft className="w-4 h-4"/> 一覧に戻る
    </button>
    
    <div>
      <div className="flex items-center gap-4 mb-4">
        <span className="bg-red-700 text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">重大な不正</span>
        <span className="text-xs text-slate-400 font-bold">案件番号: #{caseData.id}</span>
      </div>
      <h2 className="font-serif text-4xl md:text-6xl font-black leading-tight mb-8 text-[#1A202C]">{caseData.what} に関する報告</h2>
      <p className="text-xl text-slate-500 font-serif leading-relaxed italic border-l-4 border-slate-200 pl-6">
        本件は、{caseData.location}において発生した{caseData.category}および公務員法違反に関する事実をAIが構造化したものである。
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-slate-200 border border-slate-200">
      <div className="lg:col-span-8 bg-white p-10 space-y-10">
        <h4 className="font-serif text-2xl font-bold flex items-center gap-4">
          <span className="w-12 h-px bg-black"></span> 事案の概要 (5W1H)
        </h4>
        <div className="space-y-8">
          {[
            { label: "WHEN (いつ)", value: caseData.date },
            { label: "WHERE (どこで)", value: caseData.location },
            { label: "WHO (だれが)", value: caseData.who },
            { label: "WHAT (何を)", value: caseData.what },
            { label: "WHY/HOW (背景)", value: caseData.summary }
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</div>
              <div className="md:col-span-3 text-slate-800 font-medium leading-relaxed">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-4 bg-slate-50 p-10 space-y-8">
        <h4 className="font-serif text-2xl font-bold">処分内容</h4>
        <div className="p-6 bg-white border border-red-100 shadow-sm">
          <p className="text-[10px] font-black text-red-700 uppercase mb-2">処分の種類</p>
          <p className="text-2xl font-black text-slate-900">{caseData.punishment}</p>
        </div>
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase">付随的な影響</p>
          <p className="text-sm text-slate-600 leading-relaxed font-serif italic">{caseData.impact}</p>
        </div>
        <button className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all">
          <Download className="w-4 h-4"/> PDF資料を出力
        </button>
      </div>
    </div>
  </div>
);

// --- 4. 統計ダッシュボード (Analytics) ---
const AnalyticsDashboard = () => (
  <div className="animate-in fade-in duration-500 space-y-12">
    <div>
      <h2 className="font-serif text-4xl font-extrabold mb-2 text-[#1A202C]">不祥事統計分析</h2>
      <p className="text-slate-500">全国の自治体における不正発生状況の定量的可視化</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-slate-900 text-white p-10 rounded-[2.5rem] flex flex-col justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Incident Rate Heatmap</h4>
          <div className="aspect-video bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-700">
             <MapPin className="w-12 h-12 text-red-500 animate-pulse" />
             <p className="ml-4 font-serif italic opacity-60">Interactive Map Loading...</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-10 border border-slate-100 shadow-sm space-y-8">
        <h4 className="font-serif text-xl font-bold border-b border-black pb-2">ワースト5 (2024)</h4>
        <ol className="space-y-6">
          {["東京都", "大阪府", "愛知県", "神奈川県", "福岡県"].map((name, i) => (
            <li key={i} className="flex items-center gap-4">
              <span className="font-serif text-2xl italic text-slate-300">0{i+1}</span>
              <div className="flex-1">
                <p className="font-bold text-sm">{name}</p>
                <div className="w-full bg-slate-100 h-1 mt-1"><div className="bg-red-700 h-1" style={{width: `${100 - i*15}%`}}></div></div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </div>
);

// --- 5. プロジェクト概要 (Manifesto) ---
const AboutInfo = () => (
  <div className="animate-in fade-in duration-700 max-w-4xl mx-auto space-y-16 py-12">
    <div className="text-center space-y-6">
      <Quote className="w-12 h-12 text-red-700 mx-auto opacity-20" />
      <h2 className="font-serif text-5xl md:text-7xl font-black tracking-tight text-[#1A202C]">「誰がどう言ったか」<br/>ではなく、<br/>「何があったか」を。</h2>
      <p className="text-xl text-slate-500 font-serif max-w-2xl mx-auto leading-relaxed">
        公務不正DBは、感情的な論評を排し、検証可能な事実のみを蓄積するデジタル・アーカイブです。
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-4">
        <h4 className="font-bold text-lg flex items-center gap-2 text-red-700"><ShieldCheck className="w-5 h-5"/> 透明性の担保</h4>
        <p className="text-slate-600 text-sm leading-relaxed text-justify">
          散逸しがちな懲戒処分情報を一元化。過去のデータを消去させないアーカイブ構造により、行政の自浄作用を支援します。
        </p>
      </div>
      <div className="space-y-4">
        <h4 className="font-bold text-lg flex items-center gap-2 text-slate-800"><Scale className="w-5 h-5"/> 政治的中立</h4>
        <p className="text-slate-600 text-sm leading-relaxed text-justify">
          特定の政治的バイアスを排除。公文書および公式な報道発表のみを「原材料」として提供します。
        </p>
      </div>
    </div>
  </div>
);

// --- メインコンポーネント ---
export default function App() {
  const [activeTab, setActiveTab] = useState('paper');
  const [selectedCase, setSelectedCase] = useState(null);

  const renderContent = () => {
    if (selectedCase) return <CaseDetail caseData={selectedCase} onBack={() => setSelectedCase(null)} />;
    
    switch (activeTab) {
      case 'paper': return <FrontPage onDetail={setSelectedCase} />;
      case 'database': return <CaseArchive onDetail={setSelectedCase} />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'info': return <AboutInfo />;
      default: return <FrontPage onDetail={setSelectedCase} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A202C] font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col fixed h-screen w-64 bg-[#F1F4F6] border-r border-slate-200 p-8 z-50">
        <div className="mb-12">
          <h1 className="font-serif text-3xl font-black tracking-tighter">公務不正DB</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Modern Archivist</p>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            { id: 'paper', icon: <Newspaper/>, label: '今日の表紙' },
            { id: 'database', icon: <Database/>, label: 'データベース' },
            { id: 'analytics', icon: <BarChart3/>, label: '統計分析' },
            { id: 'info', icon: <Info/>, label: 'プロジェクト概要' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedCase(null); }}
              className={`w-full flex items-center gap-4 px-4 py-3 text-xs font-black uppercase tracking-[0.1em] transition-all
                ${activeTab === item.id && !selectedCase ? 'bg-white shadow-sm text-black' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {React.cloneElement(item.icon, { className: 'w-4 h-4' })}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-8 border-t border-slate-200">
           <div className="flex items-center gap-3 opacity-60">
             <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center"><Landmark className="w-4 h-4"/></div>
             <p className="text-[10px] font-bold">姉妹サイト: 水際作戦DB</p>
           </div>
        </div>
      </aside>

      {/* Top Bar (Mobile) */}
      <header className="lg:hidden bg-white border-b p-4 sticky top-0 z-50 flex justify-between items-center">
        <h1 className="font-serif font-black text-xl">公務不正DB</h1>
        <button onClick={() => setActiveTab('paper')}><Newspaper className="w-6 h-6"/></button>
      </header>

      {/* Main Content Area */}
      <main className="lg:ml-64 p-6 md:p-12 lg:p-20">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="lg:ml-64 py-12 px-12 border-t border-slate-200 bg-white text-center text-slate-400">
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">© 2025 Public Misconduct Database Project. Facts Only.</p>
      </footer>
    </div>
  );
}
