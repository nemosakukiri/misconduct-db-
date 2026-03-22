import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

// Firebaseの設定を直接書き込み（場所のミスを防ぐため）
const firebaseConfig = {
  apiKey: "AIzaSyB5K73evEK33c3VIOlIEkOz2c1IRAiltWM",
  authDomain: "fusakui-db.firebaseapp.com",
  projectId: "fusakui-db",
  storageBucket: "fusakui-db.firebasestorage.app",
  messagingSenderId: "520726255572",
  appId: "1:520726255572:web:1d3151dfb01c36ccdf3211"
};

// Firebaseの二重起動を防ぐ安全な初期化
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "APIキーが設定されていません" });
  }

  try {
    // 1. Geminiにニュースを探させる（プロンプトをさらに簡潔に）
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `日本の公務員不祥事ニュースを3件探し、以下のJSON配列形式のみで出力してください。余計な文章は一切含めないでください。
            [{"date":"2024.03.22", "location":"自治体名", "what":"タイトル", "summary":"詳細内容", "punishment":"処分内容", "category":"汚職等"}]`
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();
    
    if (!aiData.candidates || !aiData.candidates[0].content.parts[0].text) {
      throw new Error("AIからの回答が空でした。APIキーを確認してください。");
    }

    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AIの回答にJSONが含まれていませんでした。");
    
    const newsItems = JSON.parse(jsonMatch[0]);

    // 2. Firebaseに保存
    let added = 0;
    for (const item of newsItems) {
      const q = query(collection(db, "misconduct_cases"), where("what", "==", item.what));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(collection(db, "misconduct_cases"), item);
        added++;
      }
    }

    res.status(200).json({ message: "成功しました", added_count: added });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "実行エラー", detail: error.message });
  }
}
