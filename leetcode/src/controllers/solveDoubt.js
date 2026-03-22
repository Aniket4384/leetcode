const Groq = require("groq-sdk");
const express = require("express");
const app = express();
console.log("aa gaya");
app.use(express.json());

const solveDoubt = async (req, res) => {
  try {
    const { messages, title, description, testCases, startCode } = req.body;
    if (!messages) {
      return res.status(400).json({ message: "messages is required" });
    }
    const groqClient = new Groq({
      apiKey: process.env.GEMINI_KEY
    });
    const chatMessages = [
      {
        role: "system",
        content: `
You are an expert DSA tutor.

Title: ${title}
Description: ${description}
Test Cases: ${testCases}
Starter Code: ${startCode}

Provide clear, step-by-step explanations for coding problems. 
Do NOT discuss unrelated topics.
        `,
      },
      {
        role: "user",
        content: messages,
      },
    ];

     const response = await groqClient.chat.completions.create({
      model:  "llama-3.1-8b-instant",  // lightweight model, good for free usage
      messages: chatMessages
    });

    // Extract AI response
    const reply = response.choices[0].message.content;

    res.status(200).json({ message: reply });

  } catch (err) {
    console.error("Groq API error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = solveDoubt;
