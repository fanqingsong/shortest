const apiKey = process.env.SILICONFLOW_API_KEY;

console.log('Testing SiliconFlow API with different models...');
console.log('API Key:', apiKey ? apiKey.substring(0, 15) + '...' : 'NOT SET');

const models = [
  'deepseek-ai/DeepSeek-V3',
  'Qwen/Qwen2.5-7B-Instruct',
  'THUDM/glm-4-9b-chat'
];

for (const model of models) {
  console.log(`\nTesting model: ${model}`);

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: 'Hi' }
        ],
        max_tokens: 10
      })
    });

    console.log(`Status: ${response.status}`);

    if (response.status === 200) {
      const data = await response.json();
      console.log(`✅ SUCCESS with ${model}`);
      console.log(`Response: ${data.choices[0].message.content}`);
      break; // Stop on first success
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}
