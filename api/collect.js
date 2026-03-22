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
  // --- 診断セクション ---
  const apiKey = process.env.GEMINI_API_KEY;
  const keyDiagnostics = {
    exists: !!apiKey,
    length: apiKey ? apiKey.length : 0,
    prefix: apiKey ? apiKey.substring(0, 4) : "NONE"
  };

  if (!apiKey) {
    return res.status(500).json({ 
      error: "APIキーがシステムに読み込まれていません", 
      diagnostics: keyDiagnostics,
      tip: "VercelのProduction環境にキーが登録されているか、再デプロイしたか確認してください"
    });
  }

  try {
    // 最新の安定版URLを使用
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "日本の最新の公務員不祥事・懲戒処分ニュースを3件探し、以下のJSON配列形式のみを出力してください。余計な文章は一切不要です。[{\"date\":\"2024.03.22\", \"location\":\"自治体名\", \"what\":\"見出し\", \"summary\":\"内容\", \"punishment\":\"処分\", \"category\":\"汚職\"}]"
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();

    if (aiData.error) {
      return res.status(500).json({ 
        error: "Google側が拒否しました", 
        message: aiData.error.message,
        diagnostics: keyDiagnostics 
      });
    }

    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
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

    res.status(200).json({ 
      message: "成功しました！", 
      added: addedCount, 
      news: newsItems,
      diagnostics: keyDiagnostics
    });

  } catch (error) {
    res.status(500).json({ error: "実行エラー", message: error.message, diagnostics: keyDiagnostics });
  }
}
