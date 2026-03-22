import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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
  if (!apiKey) return res.status(500).json({ error: "API KEY MISSING" });

  try {
    // 1. AIへのリクエスト（件数を2件に絞って高速化）
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "日本の最新の公務員不祥事ニュースを2件探し、JSON配列のみ出力してください。例：[{\"date\":\"2024.03.22\",\"location\":\"...\",\"what\":\"...\",\"summary\":\"...\",\"punishment\":\"...\",\"category\":\"...\"}]"
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();
    if (aiData.error) return res.status(500).json({ error: "GOOGLE_ERROR", msg: aiData.error.message });

    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    const newsItems = JSON.parse(jsonMatch[0]);

    // 2. Firebaseに保存（最短の手順で）
    for (const item of newsItems) {
      await addDoc(collection(db, "misconduct_cases"), {
        ...item,
        collectedAt: serverTimestamp() // いつ収集したか記録
      });
    }

    res.status(200).json({ message: "成功", count: newsItems.length });

  } catch (error) {
    res.status(500).json({ error: "CRASH", detail: error.message });
  }
}
