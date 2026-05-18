import { useState } from 'react'
import { getApiKey } from '../utils/deepseek'
import { showToast } from './Toast'

export default function SettingsModal({ onClose }) {
  const [key, setKey] = useState(() => getApiKey())

  const save = () => {
    const v = key.trim()
    if (!v) {
      localStorage.removeItem('english_app_api_key')
      showToast('API Key 已清除')
    } else {
      localStorage.setItem('english_app_api_key', v)
      showToast('API Key 已保存')
    }
    onClose()
  }

  const masked = getApiKey() ? getApiKey().slice(0, 8) + '...' + getApiKey().slice(-4) : ''

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>API 设置</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          DeepSeek API Key 仅保存在你的浏览器本地，不会上传到任何服务器。
        </p>
        <label style={{ fontSize: 13, fontWeight: 600 }}>API Key</label>
        <input
          type="password"
          placeholder="sk-..."
          value={key}
          onChange={e => setKey(e.target.value)}
          style={{
            width: '100%', padding: 10, border: '1px solid var(--border)',
            borderRadius: 7, fontSize: 14, fontFamily: 'inherit', margin: '6px 0 4px'
          }}
        />
        {masked && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>当前: {masked}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>取消</button>
          <button className="btn btn-primary btn-sm" onClick={save}>保存</button>
        </div>
      </div>
    </div>
  )
}
