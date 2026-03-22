import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

// Firebase設定（自己完結型）
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
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Vercelの環境変数 GEMINI_API_KEY が設定されていません" });
  }

  try {
    // 【修正の核心】現在最も安定している v1beta と gemini-1.5-flash の組み合わせです
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "日本の最新の公務員不祥事ニュースを3件探し、以下のJSON配列形式のみで出力してください。マークダウンなどの装飾は不要です。[{\"date\":\"2024.03.22\", \"location\":\"自治体名\", \"what\":\"見出し\", \"summary\":\"内容\", \"punishment\":\"処分\", \"category\":\"汚職\"}]"
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();

    // Google API側からのエラー詳細を表示
    if (aiData.error) {
      return res.status(500).json({ 
        error: "Google APIエラー", 
        message: aiData.error.message,
        code: aiData.error.code
      });
    }

    // AIの回答テキストを取得
    let rawText = aiData.candidates[0].content.parts[0].text;
    
    // AIが ```json [ ... ] ``` のように返してきた場合の対策
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "AIが正しいJSON形式を返しませんでした", rawText });
    }
    
    const newsItems = JSON.parse(jsonMatch[0]);

    // Firebaseに保存
    let addedCount = 0;
    for (const item of newsItems) {
      const q = query(collection(db, "misconduct_cases"), where("what", "==", item.what));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(collection(db, "misconduct_cases"), item);
        addedCount++;
      }
    }

    res.status(200).json({ 
      message: "成功しました！", 
      added: addedCount, 
      news: newsItems 
    });

  } catch (error) {
    res.status(500).json({ error: "プログラム実行エラー", message: error.message });
  }
}
