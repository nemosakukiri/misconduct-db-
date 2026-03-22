// api/collect.js (強化版)
import { db } from '../src/firebase'; 
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export default async function handler(req, res) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  try {
    // Geminiへの指示を「5件探せ」に強化
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `あなたは日本の公務員不祥事を記録する調査員です。
            2024年3月の、日本の公務員懲戒処分や不祥事ニュースを【5件】探し、以下のJSON形式で出力してください。
            重複は避けてください。
            
            形式： [{"date":"YYYY.MM.DD", "location":"自治体名", "what":"短い見出し", "summary":"100文字程度の詳細", "punishment":"処分内容", "category":"カテゴリ"}]`
          }]
        }]
      })
    });

    const aiData = await aiResponse.json();
    const text = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/); // JSON部分だけを抽出
    const newsItems = JSON.parse(jsonMatch[0]);

    let addedCount = 0;
    for (const item of newsItems) {
      const q = query(collection(db, "misconduct_cases"), where("what", "==", item.what));
      const existing = await getDocs(q);
      if (existing.empty) {
        await addDoc(collection(db, "misconduct_cases"), item);
        addedCount++;
      }
    }

    res.status(200).json({ message: "収集完了", added: addedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
