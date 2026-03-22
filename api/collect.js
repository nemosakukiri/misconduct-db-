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
  if (!apiKey) return res.status(500).json({ error: "VERCEL_API_KEY_NOT_FOUND" });

  try {
    // 1. 【自動検知】あなたの鍵で今「本当に」使えるモデルの名前をGoogleに聞く
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();

    if (listData.error) {
      return res.status(500).json({ error: "API_KEY_ERROR", message: listData.error.message });
    }

    // 2. 使えるモデルの中から、ニュース取得ができるものを1つ選ぶ
    // (geminiという名前を含み、かつ生成ができるモデルを探します)
    const validModel = listData.models.find(m => 
      m.name.includes('gemini') && 
      m.supportedGenerationMethods.includes('generateContent')
    );

    if (!validModel) {
      return res.status(500).json({ error: "NO_USABLE_MODEL", list: listData });
    }

    const modelPath = validModel.name; // 例: "models/gemini-1.5-flash"

    // 3. 検知された正しい名前でAIを実行（件数は1件に絞りタイムアウトを防止）
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "日本の最新の公務員不祥事ニュースを1件探し、JSON配列形式でのみ回答。 [{\"date\":\"2024.03.22\", \"location\":\"...\", \"what\":\"...\", \"summary\":\"...\", \"punishment\":\"...\", \"category\":\"...\"}]"
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();
    if (aiData.error) return res.status(500).json({ error: "AI_RUN_ERROR", msg: aiData.error.message });

    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    const newsItems = JSON.parse(jsonMatch[0]);

    // 4. Firebaseに保存
    for (const item of newsItems) {
      await addDoc(collection(db, "misconduct_cases"), {
        ...item,
        collectedAt: serverTimestamp()
      });
    }

    res.status(200).json({ 
      message: "成功！自動検知で動かしました", 
      used_model: modelPath, 
      news: newsItems 
    });

  } catch (error) {
    res.status(500).json({ error: "FATAL_ERROR", msg: error.message });
  }
}
