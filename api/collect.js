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
  if (!apiKey) return res.status(500).json({ error: "VERCEL_API_KEY_NOT_FOUND" });

  try {
    // 1. 使えるモデルを自動検知
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();
    if (listData.error) {
      return res.status(500).json({ error: "API_KEY_ERROR", message: listData.error.message });
    }

    const validModel = listData.models.find(m =>
      m.name.includes('gemini') &&
      m.supportedGenerationMethods.includes('generateContent')
    );
    if (!validModel) {
      return res.status(500).json({ error: "NO_USABLE_MODEL", list: listData });
    }

    const modelPath = validModel.name;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;

    // 2. 5件取得
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "日本の最新の公務員不祥事ニュース（懲戒免職・停職・収賄・横領・飲酒運転・盗撮・ハラスメントなど）を5件探し、JSON配列形式でのみ回答。説明不要。[{\"date\":\"2024.03.22\", \"location\":\"自治体名または機関名\", \"what\":\"見出し（30文字以内）\", \"summary\":\"行為の内容（事実のみ100文字以内）\", \"punishment\":\"処分内容\", \"category\":\"不祥事の種別\"}]"
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();
    if (aiData.error) return res.status(500).json({ error: "AI_RUN_ERROR", msg: aiData.error.message });

    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    const newsItems = JSON.parse(jsonMatch[0]);

    // 3. 重複チェックしてFirebaseに保存
    let savedCount = 0;
    for (const item of newsItems) {
      const q = query(collection(db, "misconduct_cases"), where("what", "==", item.what));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "misconduct_cases"), {
          ...item,
          collectedAt: serverTimestamp()
        });
        savedCount++;
      }
    }

    res.status(200).json({
      message: "成功！",
      used_model: modelPath,
      total: newsItems.length,
      saved: savedCount,
      skipped: newsItems.length - savedCount,
      news: newsItems
    });

  } catch (error) {
    res.status(500).json({ error: "FATAL_ERROR", msg: error.message });
  }
}
