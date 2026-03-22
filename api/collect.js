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
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "日本の公務員不祥事ニュースを3件探し、JSON形式で出力してください。[{\"date\":\"2024.03.22\", \"location\":\"...\", \"what\":\"...\", \"summary\":\"...\", \"punishment\":\"...\", \"category\":\"...\"}]" }] }]
      })
    });

    const aiData = await aiResponse.json();

    // --- ここが超重要：ログにGoogleの生の声を出す ---
    console.log("Google API Response Status:", aiResponse.status);
    console.log("Google API Response Data:", JSON.stringify(aiData));

    if (aiData.error) {
      return res.status(500).json({ 
        error: "Google側でエラーが発生しました", 
        message: aiData.error.message, // ここに「なぜダメか」が表示されます
        status: aiData.error.status 
      });
    }

    if (!aiData.candidates) {
      return res.status(500).json({ error: "AIの返答が空でした", full_data: aiData });
    }

    const rawText = aiData.candidates[0].content.parts[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    const newsItems = JSON.parse(jsonMatch[0]);

    let addedCount = 0;
    for (const item of newsItems) {
      const q = query(collection(db, "misconduct_cases"), where("what", "==", item.what));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(collection(db, "misconduct_cases"), item);
        addedCount++;
      }
    }

    res.status(200).json({ message: "成功しました", added: addedCount, news: newsItems });

  } catch (error) {
    res.status(500).json({ error: "実行エラー", message: error.message });
  }
}
