// api/collect.js
import { db } from '../src/firebase'; 
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export default async function handler(req, res) {
  // セキュリティのため、このURLは管理者以外が簡単に叩けないようにします（後で設定可能）
  
  const GEMINI_API_KEY = process.env.AIzaSyCjpNoByfZR7SBNQj1tVGI4wy3FrOhFsPY;

  try {
    // 1. Geminiに「今日の日本の公務員不祥事ニュース」を探して構造化させる
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `以下の条件で日本の公務員不祥事ニュースを3件探し、JSON形式で出力してください。
            条件：
            - 今日または昨日の最新ニュース
            - 項目：date, location, what, summary, punishment, category
            - summaryは100文字程度の詳細
            - 全て日本語
            出力例： [{"date":"2024.03.22", "location":"...", "what":"...", ...}]`
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();
    // AIが返したテキストをJSONとして解析
    const newsItems = JSON.parse(aiData.candidates[0].content.parts[0].text.replace(/```json|```/g, ''));

    // 2. 取得したニュースを一つずつ Firebase に保存する
    for (const item of newsItems) {
      // 同じニュースが既にあるかチェック（whatとdateで判定）
      const q = query(collection(db, "misconduct_cases"), where("what", "==", item.what));
      const existing = await getDocs(q);

      if (existing.empty) {
        await addDoc(collection(db, "misconduct_cases"), item);
      }
    }

    res.status(200).json({ message: "自動収集が完了しました", count: newsItems.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
