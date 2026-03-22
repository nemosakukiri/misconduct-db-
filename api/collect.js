import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  // 1. キーの存在チェック（ここが原因の可能性大）
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEYがVercelに設定されていません。Settingsを確認してください。" });
  }

  try {
    // 2. 公式SDKを使用してGeminiを初期化
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "日本の最新の公務員不祥事ニュースを3件探し、以下のJSON形式の配列のみを出力してください。余計な説明文は不要です。[{\"date\":\"2024.03.22\", \"location\":\"自治体名\", \"what\":\"見出し\", \"summary\":\"内容\", \"punishment\":\"処分\", \"category\":\"汚職\"}]";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // AIの回答からJSONを抽出
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("AIの回答がJSON形式ではありませんでした: " + text);
    }
    const newsItems = JSON.parse(jsonMatch[0]);

    // 3. Firebaseへ保存
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
      news: newsItems 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "実行時にエラーが発生しました", details: error.message });
  }
}
