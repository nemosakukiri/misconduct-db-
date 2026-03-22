import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

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

  // Claudeの提案通り gemini-2.0-flash を第一候補にし、
  // もし制限エラーが出た場合は 1.5-flash に切り替えます
  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
  let finalError = null;

  for (const modelName of models) {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const aiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "日本の最新の公務員不祥事ニュースを1件探し、以下のJSON形式の配列のみで答えてください。説明不要。[{\"date\":\"2024.03.22\", \"location\":\"自治体名\", \"what\":\"見出し\", \"summary\":\"内容\", \"punishment\":\"処分\", \"category\":\"不祥事\"}]"
            }]
          }]
        })
      });

      const aiData = await aiResponse.json();

      // 制限エラー (Limit: 0 / Quota exceeded) が出た場合は次のモデルへ
      if (aiData.error) {
        finalError = aiData.error.message;
        continue; 
      }

      // 成功した場合
      const rawText = aiData.candidates[0].content.parts[0].text;
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      const newsItems = JSON.parse(jsonMatch[0]);

      for (const item of newsItems) {
        // 重複チェック：同じ見出しが既にあればスキップ
        const q = query(collection(db, "misconduct_cases"), where("what", "==", item.what));
        const snap = await getDocs(q);
        if (snap.empty) {
          await addDoc(collection(db, "misconduct_cases"), {
            ...item,
            collectedAt: serverTimestamp()
          });
        }
      }

      return res.status(200).json({ 
        message: "成功しました！", 
        used_model: modelName, 
        news: newsItems 
      });

    } catch (e) {
      finalError = e.message;
    }
  }

  res.status(500).json({ error: "すべてのモデルで制限エラーです。少し時間を置いてください。", detail: finalError });
}
