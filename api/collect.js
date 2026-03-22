import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

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

  try {
    // 【修正ポイント】URLを v1beta から v1 に変更しました
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "日本の公務員不祥事ニュースを3件探し、以下のJSON配列形式のみを出力してください。余計な説明文は一切不要です。[{\"date\":\"2024.03.22\", \"location\":\"自治体名\", \"what\":\"タイトル\", \"summary\":\"内容\", \"punishment\":\"処分\", \"category\":\"汚職\"}]"
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();

    if (aiData.error) {
      return res.status(500).json({ error: "Google APIエラー", detail: aiData.error.message });
    }

    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: "JSON解析失敗", rawText });
    
    const newsItems = JSON.parse(jsonMatch[0]);

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
    res.status(500).json({ error: "プログラム実行エラー", message: error.message });
  }
}
