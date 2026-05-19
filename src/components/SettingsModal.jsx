import { useState } from 'react'
import { getServerConfig } from '../utils/api'
import { showToast } from './Toast'

export default function SettingsModal({ onClose }) {
  const [serverUrl, setServerUrl] = useState(() => getServerConfig().url)
  const [password, setPassword] = useState(() => getServerConfig().password)
  const [syncing, setSyncing] = useState(false)

  const save = () => {
    const url = serverUrl.trim()
    const pw = password.trim()
    if (url) localStorage.setItem('server_url', url)
    else localStorage.removeItem('server_url')
    if (pw) localStorage.setItem('server_password', pw)
    else localStorage.removeItem('server_password')
    showToast('设置已保存')
    onClose()
  }

  const doSync = async () => {
    setSyncing(true)
    try {
      const { syncAllToServer } = await import('../utils/api')
      await syncAllToServer()
      showToast('数据已同步到服务器')
    } catch (e) {
      showToast('同步失败: ' + e.message)
    }
    setSyncing(false)
  }

  const configured = !!(localStorage.getItem('server_url') && localStorage.getItem('server_password'))

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>设置</h3>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
          配置后端服务器实现手机电脑数据同步。不填则使用本地存储。
        </p>

        <label style={{ fontSize: 13, fontWeight: 600 }}>服务器地址</label>
        <input
          type="text"
          placeholder="http://你的服务器IP:3456"
          value={serverUrl}
          onChange={e => setServerUrl(e.target.value)}
          style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, fontFamily: 'inherit', margin: '6px 0 10px' }}
        />

        <label style={{ fontSize: 13, fontWeight: 600 }}>管理密码</label>
        <input
          type="password"
          placeholder="服务器上设置的密码"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 7, fontSize: 14, fontFamily: 'inherit', margin: '6px 0 10px' }}
        />

        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
          {configured
            ? '已配置服务器: ' + localStorage.getItem('server_url')
            : '未配置服务器，使用本地存储模式'}
        </p>

        {configured && (
          <button className="btn btn-outline btn-sm" disabled={syncing} onClick={doSync} style={{ marginBottom: 10 }}>
            {syncing ? '同步中...' : '同步本地数据到服务器'}
          </button>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 6, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>取消</button>
          <button className="btn btn-primary btn-sm" onClick={save}>保存</button>
        </div>
      </div>
    </div>
  )
}
