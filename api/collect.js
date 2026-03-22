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
    return res.status(500).json({ error: "GEMINI_API_KEYが設定されていません" });
  }

  try {
    // 【修正の核心】 窓口を「v1」、モデルを「gemini-1.5-flash」に固定します
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "日本の最新の公務員不祥事ニュースを3件探し、JSON配列形式でのみ回答してください。 [{\"date\":\"2024.03.22\", \"location\":\"自治体名\", \"what\":\"見出し\", \"summary\":\"詳細\", \"punishment\":\"処分\", \"category\":\"公金横領\"}]"
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();

    // Google APIのエラーハンドリング
    if (aiData.error) {
      return res.status(aiResponse.status).json({ 
        error: "Google APIが拒否しました", 
        message: aiData.error.message,
        code: aiData.error.code
      });
    }

    if (!aiData.candidates || !aiData.candidates[0].content) {
      return res.status(500).json({ error: "AIの回答が空です", detail: aiData });
    }

    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "JSON形式が見つかりませんでした", rawText });
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

    res.status(200).json({ message: "成功しました！", added: addedCount, news: newsItems });

  } catch (error) {
    res.status(500).json({ error: "実行エラー", message: error.message });
  }
}
