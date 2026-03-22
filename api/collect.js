import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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
  if (!apiKey) return res.status(500).json({ error: "APIキーがVercelに設定されていません" });

  try {
    // 【最重要修正：以前接続に成功した組み合わせに戻しました】
    // 窓口を「v1beta」、モデル名を「gemini-2.0-flash」にします。
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "日本の最新の公務員不祥事ニュースを1件だけ探し、JSON形式で答えてください。[{\"date\":\"2024.03.22\", \"location\":\"...\", \"what\":\"...\", \"summary\":\"...\", \"punishment\":\"...\", \"category\":\"...\"}]"
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();

    // 制限エラー(Quota)やその他のエラーが出た場合の処理
    if (aiData.error) {
      return res.status(500).json({ 
        error: "Google側からの返答", 
        message: aiData.error.message, // ここに Quota exceeded 等が出ます
        status: aiData.error.status
      });
    }

    // AIの回答からデータを抽出
    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    const newsItems = JSON.parse(jsonMatch[0]);

    // Firebaseに1件保存
    for (const item of newsItems) {
      await addDoc(collection(db, "misconduct_cases"), {
        ...item,
        collectedAt: serverTimestamp()
      });
    }

    res.status(200).json({ message: "成功しました！", news: newsItems });

  } catch (error) {
    res.status(500).json({ error: "実行失敗", message: error.message });
  }
}
