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
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // 1. 【自動検知】あなたの鍵で今使えるモデル一覧を取得します
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResponse.json();

    if (listData.error) {
      return res.status(500).json({ error: "Google APIキーの確認が必要です", detail: listData.error.message });
    }

    // 2. 使えるモデルの中から、最適なものを自動で選びます
    // あなたのリストにあった gemini-2.0-flash か gemini-1.5-flash-latest を優先します
    const available = listData.models.map(m => m.name);
    const targetModel = available.find(m => m.includes("gemini-2.0-flash")) 
                     || available.find(m => m.includes("gemini-1.5-flash-latest"))
                     || available.find(m => m.includes("gemini-pro"))
                     || available[0]; // 最悪、一番上のやつを使う

    // 3. 自動選択されたモデルでニュース収集を実行
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`;
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "日本の最新の公務員不祥事ニュースを3件探し、以下のJSON形式の配列のみで回答してください。余計な文は不要です。[{\"date\":\"2024.03.22\", \"location\":\"自治体名\", \"what\":\"見出し\", \"summary\":\"詳細\", \"punishment\":\"処分\", \"category\":\"公金横領\"}]"
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();

    if (aiData.error) {
      return res.status(500).json({ error: "AI実行時にエラー", message: aiData.error.message, used_model: targetModel });
    }

    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    const newsItems = JSON.parse(jsonMatch[0]);

    // 4. Firebaseに保存
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
      message: "ついに成功しました！", 
      used_model: targetModel,
      added: addedCount, 
      news: newsItems 
    });

  } catch (error) {
    res.status(500).json({ error: "最終実行エラー", message: error.message });
  }
}
