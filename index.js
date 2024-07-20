// File: ReplyBotServer/index.js

const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/generate-replies', async (req, res) => {
  try {
    const { tweetContent, style } = req.body;

    const completion = await openai.createChatCompletion({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: `You are a helpful assistant that generates ${style} replies to tweets.` },
        { role: "user", content: `Generate three ${style} replies to the following tweet: "${tweetContent}"` }
      ],
      n: 1,
      max_tokens: 250,
    });

    const replies = completion.data.choices[0].message.content.split('\n').filter(reply => reply.trim() !== '');

    res.status(200).json(replies);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while generating replies' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// File: ReplyBotServer/package.json
{
  "name": "replybotserver",
  "version": "1.0.0",
  "description": "Backend for GPT-4 Twitter reply generator",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "openai": "^3.2.1",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.12"
  }
}

// File: ReplyBotServer/vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
