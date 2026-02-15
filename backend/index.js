require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { interviewerSystemPrompt } = require('./prompts');

const app = express();
app.use(cors());
app.use(express.json());

let chatHistory = [{ role: "system", content: interviewerSystemPrompt }];

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    chatHistory.push({ role: "user", content: message });

    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "openrouter/free",
            messages: chatHistory,
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000"
            }
        });

        const alexReply = response.data.choices[0].message.content;
        chatHistory.push({ role: "assistant", content: alexReply });
        
        // This 'reply' key must match what your React app is looking for
        res.json({ reply: alexReply });

    } catch (err) {
        console.error("AI Snag:", err.message);
        res.status(500).json({ error: "Alex is temporarily unavailable." });
    }
});

app.listen(5000, () => console.log("✅ Alex's Brain is awake on Port 5000"));