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
          <p className="text-[9px] font-bold uppercase tracking-[0.2e
