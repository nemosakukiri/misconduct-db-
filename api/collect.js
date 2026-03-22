import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Firebase設定（変更不要）
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
  if (!apiKey) return res.status(500).json({ error: "APIキーが設定されていません" });

  try {
    // 【修正のポイント】 窓口を「v1」、モデル名を「gemini-1.5-flash」にしています
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "日本の最新の公務員不祥事・懲戒処分ニュースを2件探し、以下のJSON形式の配列のみで答えてください。説明不要。[{\"date\":\"2024.03.22\", \"location\":\"自治体名\", \"what\":\"見出し\", \"summary\":\"内容\", \"punishment\":\"処分\", \"category\":\"不祥事\"}]"
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();

    if (aiData.error) {
      return res.status(500).json({ 
        error: "Google側でエラーが発生しました", 
        message: aiData.error.message,
        code: aiData.error.code 
      });
    }

    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    const newsItems = JSON.parse(jsonMatch[0]);

    for (const item of newsItems) {
      await addDoc(collection(db, "misconduct_cases"), {
        ...item,
        collectedAt: serverTimestamp()
      });
    }

    res.status(200).json({ message: "ついに成功しました！", news: newsItems });

  } catch (error) {
    res.status(500).json({ error: "実行失敗", message: error.message });
  }
}
