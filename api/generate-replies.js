const { Configuration, OpenAIApi } = require('openai');

// Define the model as a constant for easy updating
const GPT_MODEL = "gpt-4o-mini"; // This is the current name for GPT-4 Turbo

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const allowCors = fn => async (req, res) => {
  const allowedOrigins = ['https://x.com', 'https://twitter.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { tweetContent, style } = req.body;

      const completion = await openai.createChatCompletion({
        model: GPT_MODEL,
        messages: [
          { role: "system", content: `You are a helpful assistant that generates ${style} replies to tweets. Be creative and engaging.` },
          { role: "user", content: `Generate three ${style} replies to the following tweet: "${tweetContent}"` }
        ],
        n: 1,
        max_tokens: 250,
      });

      const replies = completion.data.choices[0].message.content.split('\n').filter(reply => reply.trim() !== '');

      res.status(200).json(replies);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while generating replies', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

module.exports = allowCors(handler);