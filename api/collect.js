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
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEYが設定されていません。VercelのSettingsを確認してください。" });
  }

  // 試行するモデルのリスト（新しい順）
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      
      const aiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "日本の最新の公務員不祥事ニュースを3件探し、以下の形式のJSON配列のみを出力してください。説明不要。[{\"date\":\"2024.03.22\", \"location\":\"...\", \"what\":\"...\", \"summary\":\"...\", \"punishment\":\"...\", \"category\":\"...\"}]"
            }]
          }]
        })
      });

      const aiData = await aiResponse.json();

      // 404が出たら次のモデルを試す
      if (aiResponse.status === 404) {
        lastError = `モデル ${modelName} は見つかりませんでした(404)。`;
        continue;
      }

      if (aiData.error) {
        lastError = aiData.error.message;
        continue;
      }

      // 成功した場合の処理
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

      return res.status(200).json({ 
        message: "成功しました！", 
        model_used: modelName,
        added: addedCount, 
        news: newsItems 
      });

    } catch (e) {
      lastError = e.message;
    }
  }

  // すべての試行が失敗した場合
  res.status(500).json({ 
    error: "すべてのAIモデルで失敗しました", 
    last_error: lastError,
    tip: "Google AI Studioで新しいAPIキーを作成し、Vercelの値を更新してRedeployしてみてください。"
  });
}
