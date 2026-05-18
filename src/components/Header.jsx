export default function Header({ tab, onTab, onSettings }) {
  const tabs = [
    { key: 'translate', label: '中→英 翻译' },
    { key: 'diary', label: '英文日记' },
    { key: 'corpus', label: '语料库' },
  ]
  const badgeMap = { translate: '中→英', diary: '日记', corpus: '语料库' }

  return (
    <div className="header">
      <h1>英语表达练习</h1>
      <div className="tabs">
        {tabs.map(t => (
          <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`} onClick={() => onTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      <span className="badge">{badgeMap[tab]}</span>
      <button className="btn btn-outline btn-sm" onClick={onSettings}>⚙ 设置</button>
    </div>
  )
}
