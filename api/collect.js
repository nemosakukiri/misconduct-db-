import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyB5K73evEK33c3VIOlIEkOz2c1IRAiltWM",
  authDomain: "fusakui-db.firebaseapp.com",
  projectId: "fusakui-db",
  storageBucket: "fusakui-db.firebasestorage.app",
  messagingSenderId: "520726255572",
  appId: "1:520726255572:web:1d3151dfb01c36ccdf3211"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  try {
    // 【最安定設定】
    // 窓口を「v1」、モデルを「gemini-1.5-flash」に固定。
    // これが現在、最も確実に動く組み合わせです。
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "日本の公務員不祥事ニュースを3件探し、JSON形式の配列のみで出力してください。[{\"date\":\"2024.03.22\", \"location\":\"自治体名\", \"what\":\"見出し\", \"summary\":\"内容\", \"punishment\":\"処分\", \"category\":\"公金横領\"}]"
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();

    // 制限エラーが出た場合の具体的なアドバイスを表示
    if (aiData.error) {
      return res.status(500).json({ 
        error: "Google API制限エラー", 
        message: aiData.error.message,
        tip: "もし解決しない場合は Google AI Studio の『Plan』が Free になっているか確認してください"
      });
    }

    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*
