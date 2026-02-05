// api/gemini.js  ← Bu dosya Vercel tarafından otomatik API endpoint olur: /api/gemini

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST isteği kabul edilir' });
  }

  const { question, context } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;  // ← Vercel'deki Environment Variable'dan güvenli okur

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API anahtarı eksik (Vercel settings\'ten ekle)' });
  }

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Harita verisi: ${JSON.stringify(context)}\n\nSoru: ${question}\n\nTürkçe cevap ver.`
            }]
          }]
        })
      }
    );

    const data = await geminiResponse.json();

    if (data.error) {
      console.error("Gemini Hatası:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    if (!data.candidates || data.candidates.length === 0) {
      return res.status(500).json({ error: 'AI cevap üretemedi (güvenlik filtresi olabilir)' });
    }

    res.status(200).json({
      message: data.candidates[0].content.parts[0].text
    });
  } catch (error) {
    console.error("Bağlantı hatası:", error);
    res.status(500).json({ error: error.message });
  }
}
