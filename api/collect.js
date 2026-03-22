import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Firebase設定（修正不要）
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

  if (!apiKey) {
    return res.status(500).json({ error: "VercelにGEMINI_API_KEYが設定されていません" });
  }

  try {
    // 1. Google公式ライブラリを使用してGeminiを準備
    const genAI = new GoogleGenerativeAI(apiKey);
    // 最も安定している 1.5-flash を使用
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "日本の最新の公務員不祥事ニュースを2件探し、以下のJSON配列形式のみで出力してください。余計な解説は不要です。[{\"date\":\"2024.03.22\", \"location\":\"自治体名\", \"what\":\"見出し\", \"summary\":\"内容\", \"punishment\":\"処分\", \"category\":\"汚職\"}]";

    // 2. AIから回答を取得
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 3. 回答からJSON部分を抽出
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("AIの回答がJSON形式ではありませんでした");
    }
    const newsItems = JSON.parse(jsonMatch[0]);

    // 4. Firebaseに保存（最短の処理でタイムアウトを防止）
    for (const item of newsItems) {
      await addDoc(collection(db, "misconduct_cases"), {
        ...item,
        collectedAt: serverTimestamp()
      });
    }

    res.status(200).json({ 
      message: "成功しました！", 
      count: newsItems.length,
      news: newsItems 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "実行エラー", 
      message: error.message,
      detail: "APIキーが無効、またはGoogle AI Studio側でAPIが有効化されていない可能性があります"
    });
  }
}
