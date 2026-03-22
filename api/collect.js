import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

// Firebaseの設定をファイル内に直接記入（これでパスエラーを回避します）
const firebaseConfig = {
  apiKey: "AIzaSyB5K73evEK33c3VIOlIEkOz2c1IRAiltWM",
  authDomain: "fusakui-db.firebaseapp.com",
  projectId: "fusakui-db",
  storageBucket: "fusakui-db.firebasestorage.app",
  messagingSenderId: "520726255572",
  appId: "1:520726255572:web:1d3151dfb01c36ccdf3211"
};

// Firebaseの初期化（二重起動防止）
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "VercelのSettingsで GEMINI_API_KEY を設定してください" });
  }

  try {
    // 1. Gemini AIにニュースを探させる
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `日本の公務員不祥事ニュースを3件探し、以下のJSON配列形式のみで出力してください。余計な解説文は一切不要です。
            [{"date":"2024.03.22", "location":"自治体名", "what":"タイトル", "summary":"詳細内容", "punishment":"処分内容", "category":"汚職等"}]`
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();
    
    if (!aiData.candidates || !aiData.candidates[0].content.parts[0].text) {
      return res.status(500).json({ error: "AIからの応答が空です。APIキーを確認してください。" });
    }

    // AIの回答からJSON部分を抽出して解析
    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "AIが正しい形式で回答しませんでした", rawText });
    }
    
    const newsItems = JSON.parse(jsonMatch[0]);

    // 2. Firebaseに保存（重複チェック付き）
    let added = 0;
    for (const item of newsItems) {
      const q = query(collection(db, "misconduct_cases"), where("what", "==", item.what));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(collection(db, "misconduct_cases"), item);
        added++;
      }
    }

    res.status(200).json({ message: "成功しました", added_count: added, items: newsItems });

  } catch (error) {
    res.status(500).json({ error: "実行エラー", message: error.message });
  }
}
