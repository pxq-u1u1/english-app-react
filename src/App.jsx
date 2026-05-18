import { useState } from 'react'
import Header from './components/Header'
import TranslateTab from './components/TranslateTab'
import DiaryTab from './components/DiaryTab'
import CorpusTab from './components/CorpusTab'
import SettingsModal from './components/SettingsModal'
import Toast from './components/Toast'

export default function App() {
  const [tab, setTab] = useState('translate')
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <Header tab={tab} onTab={setTab} onSettings={() => setShowSettings(true)} />

      <div className="main">
        {tab === 'translate' && <TranslateTab />}
        {tab === 'diary' && <DiaryTab />}
        {tab === 'corpus' && <CorpusTab />}
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <Toast />
    </>
  )
}
