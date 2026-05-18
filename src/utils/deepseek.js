const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'

export function getApiKey() {
  return localStorage.getItem('english_app_api_key') || ''
}

export async function callDeepSeek(systemPrompt, userMessage) {
  const key = getApiKey()
  if (!key) {
    throw new Error('请先点击右上角 ⚙ 设置 配置 API Key')
  }
  const resp = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 4096
    })
  })
  if (!resp.ok) {
    const err = await resp.text()
    throw new Error('API 请求失败 (' + resp.status + '): ' + err)
  }
  const data = await resp.json()
  return data.choices[0].message.content
}
