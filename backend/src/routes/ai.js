import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Missing 'prompt'" });
    }

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: prompt, // you can also pass [{role:"user", parts:[{text: prompt}]}]
    });

    res.json({ answer: response.text });
  } catch (err) {
    console.error(err);
    res.status(err.status ?? 500).json({
      error: "AI request failed",
      detail: err.message,
    });
  }
});

export default router;