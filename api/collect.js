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
    // 1. まず、このAPIキーで使えるモデルの一覧をGoogleに聞きに行きます（診断）
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    if (listData.error) {
      return res.status(500).json({ 
        error: "Google APIキーが無効、またはAPIが有効化されていません", 
        message: listData.error.message,
        tip: "Google AI Studioの管理画面で『Generative Language API』が有効か確認してください"
      });
    }

    // 2. 使えるモデルの中から今回のニュース収集に適したものを自動選択
    // gemini-1.5-flash, gemini-1.5-pro, gemini-pro の順に探す
    const availableModels = listData.models.map(m => m.name.split('/').pop());
    const targetModel = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"].find(m => availableModels.includes(m));

    if (!targetModel) {
      return res.status(500).json({ error: "利用可能なGeminiモデルが見つかりませんでした", availableModels });
    }

    // 3. 選ばれたモデルでニュース収集を実行
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "日本の最新の公務員不祥事ニュースを3件探し、以下のJSON配列のみを出力してください。[{\"date\":\"2024.03.22\", \"location\":\"...\", \"what\":\"...\", \"summary\":\"...\", \"punishment\":\"...\", \"category\":\"...\"}]" }] }]
      })
    });

    const aiData = await aiResponse.json();
    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    const newsItems = JSON.parse(jsonMatch[0]);

    // 4. Firebaseへ保存
    let addedCount = 0;
    for (const item of newsItems) {
      const q = query(collection(db, "misconduct_cases"), where("what", "==", item.what));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "misconduct_cases"), item);
        addedCount++;
      }
    }

    res.status(200).json({ 
      message: "成功しました！", 
      selected_model: targetModel,
      added: addedCount, 
      news: newsItems 
    });

  } catch (error) {
    res.status(500).json({ error: "実行エラー", message: error.message });
  }
}
