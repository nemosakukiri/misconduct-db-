import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

// Firebase設定（他のファイルに頼らず、この中で完結させます）
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
  // 1. Vercelの鍵チェック
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "APIキーが見つかりません。VercelのSettingsを確認してください。" });
  }

  try {
    // 2. 最も安定している gemini-pro モデルへのダイレクト通信
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "日本の最新の公務員不祥事・懲戒処分ニュースを3件探し、以下のJSON配列形式のみを出力してください。[{\"date\":\"2024.03.22\", \"location\":\"自治体名\", \"what\":\"見出し\", \"summary\":\"内容\", \"punishment\":\"処分\", \"category\":\"汚職\"}]"
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();

    // 3. Googleがエラーを返した場合、その理由を画面に出す
    if (aiData.error) {
      return res.status(500).json({ 
        error: "Google APIが拒否しました", 
        reason: aiData.error.message,
        status: aiData.error.status
      });
    }

    // AIの回答からJSONを抽出
    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    const newsItems = JSON.parse(jsonMatch[0]);

    // 4. Firebaseに保存
    let added = 0;
    for (const item of newsItems) {
      const q = query(collection(db, "misconduct_cases"), where("what", "==", item.what));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "misconduct_cases"), item);
        added++;
      }
    }

    res.status(200).json({ message: "成功しました", added: added, news: newsItems });

  } catch (error) {
    res.status(500).json({ error: "実行エラー", detail: error.message });
  }
}
