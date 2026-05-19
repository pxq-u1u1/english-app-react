import { useState, useEffect, useCallback } from 'react'
import { fetchDiaries, saveDiaryRecord, deleteDiaryRecord, clearAllDiaries, polishAI } from '../utils/api'
import { formatDiaryDate, getTodayStr, escHtml, exportPDF, exportWord } from '../utils/helpers'
import { showToast } from './Toast'
import Pagination from './Pagination'

const PAGE_SIZE = 15

export default function DiaryTab() {
  const [diaries, setDiaries] = useState([])
  const [date, setDate] = useState(getTodayStr)
  const [content, setContent] = useState('')
  const [currentId, setCurrentId] = useState(null)
  const [polishing, setPolishing] = useState(false)
  const [polishText, setPolishText] = useState('')
  const [diffText, setDiffText] = useState('')
  const [showPolish, setShowPolish] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => { fetchDiaries().then(setDiaries) }, [])

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(w => w.length > 0).length : 0
  const charCount = content.replace(/\s/g, '').length

  const loadByDate = useCallback(() => {
    const existing = diaries.find(d => d.date === date)
    if (existing) { setCurrentId(existing.id); setContent(existing.content) }
    else { setCurrentId(null); setContent('') }
    setShowPolish(false); setPolishText('')
  }, [date, diaries])

  useEffect(() => { loadByDate() }, [date])

  const goToday = () => setDate(getTodayStr())

  const save = async () => {
    if (!content.trim()) { showToast('请先写点内容'); return }
    const now = new Date().toISOString()
    let d
    if (currentId) {
      d = { id: currentId, date, content, createdAt: diaries.find(x => x.id === currentId)?.createdAt || now, updatedAt: now }
      setDiaries(diaries.map(x => x.id === currentId ? d : x))
    } else {
      const newId = Date.now().toString()
      d = { id: newId, date, content, createdAt: now, updatedAt: now }
      setCurrentId(newId)
      setDiaries([d, ...diaries].sort((a, b) => b.date.localeCompare(a.date)))
    }
    await saveDiaryRecord(d)
    showToast('日记已保存')
  }

  const polish = async () => {
    if (!content.trim()) { showToast('请先写点内容再批改'); return }
    setPolishing(true)
    try {
      const data = await polishAI(content)
      setPolishText(data.result)
      setDiffText(data.diff || '')
      setShowPolish(true)
    } catch (e) { showToast('批改失败: ' + e.message) }
    setPolishing(false)
  }

  const applyPolish = () => {
    if (!polishText.trim()) return
    setContent(polishText)
    setShowPolish(false); setPolishText(''); setDiffText('')
    showToast('已应用批改结果，记得保存')
  }

  const deleteDiary = async (id) => {
    if (!confirm('确定删除这篇日记？')) return
    await deleteDiaryRecord(id)
    setDiaries(diaries.filter(d => d.id !== id))
    if (currentId === id) { setCurrentId(null); setContent('') }
  }

  const clearAll = async () => {
    if (!confirm('确定清空所有日记？')) return
    await clearAllDiaries()
    setDiaries([]); setCurrentId(null); setContent('')
  }

  const openDiary = (id) => {
    const d = diaries.find(x => x.id === id)
    if (!d) return
    setCurrentId(d.id); setDate(d.date); setContent(d.content)
    setShowPolish(false); setPolishText('')
  }

  // Streak
  const dates = [...new Set(diaries.map(d => d.date))].sort().reverse()
  let streak = 0
  if (dates.length > 0 && (dates[0] === getTodayStr() || dates[0] === (() => { const d = new Date(getTodayStr()); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10) })())) {
    const start = new Date(dates[0])
    for (let i = 0; i < dates.length; i++) {
      const exp = new Date(start); exp.setDate(exp.getDate() - i)
      if (dates[i] === exp.toISOString().slice(0, 10)) streak++
      else break
    }
  }

  const filtered = search ? diaries.filter(d => d.content.toLowerCase().includes(search.toLowerCase())) : diaries
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const p = page > totalPages ? 1 : page
  const pageItems = filtered.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE)

  function renderDiff(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/ORIGINAL: (.+)/g, '<br><span style="background:#fde2e2;text-decoration:line-through;padding:1px 4px;border-radius:3px;">❌ $1</span>')
      .replace(/CORRECTED: (.+)/g, ' → <span style="background:#d4edda;padding:1px 4px;border-radius:3px;">✅ $1</span>')
      .replace(/REASON: (.+)/g, '<br><span style="color:#8c7a6b;font-size:11px;">   💡 $1</span>')
  }

  const doExportPDF = () => {
    if (!diaries.length) { showToast('没有可导出的日记'); return }
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>英文日记-导出</title>
<style>body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;padding:30px 40px;color:#2c2416}h1{font-size:20px;margin-bottom:6px}.date{color:#999;font-size:12px;margin-bottom:30px}.entry{margin-bottom:32px;page-break-inside:avoid}.entry h2{font-size:16px;color:#5a8f6c;margin-bottom:8px}.entry p{font-size:15px;line-height:1.8;white-space:pre-wrap}hr{border:none;border-top:1px solid #eee;margin:24px 0}@media print{body{padding:20px}}</style></head><body>
<h1>英文日记</h1><p class="date">导出日期: ${new Date().toLocaleDateString('zh-CN')} | 共 ${diaries.length} 篇</p>
${diaries.map(d => `<div class="entry"><h2>${formatDiaryDate(d.date)}</h2><p>${escHtml(d.content)}</p></div><hr>`).join('')}
</body></html>`
    exportPDF('', html)
  }

  const doExportWord = () => {
    if (!diaries.length) { showToast('没有可导出的日记'); return }
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;padding:30px;color:#2c2416}h1{font-size:20px;margin-bottom:6px}.date{color:#999;font-size:12px;margin-bottom:24px}.entry{margin-bottom:28px}.entry h2{font-size:15px;color:#5a8f6c;margin-bottom:6px}.entry p{font-size:14px;line-height:1.8;white-space:pre-wrap;margin:0}hr{border:none;border-top:1px solid #ddd;margin:20px 0}</style></head><body>
<h1>英文日记</h1><p class="date">导出日期: ${new Date().toLocaleDateString('zh-CN')} | 共 ${diaries.length} 篇</p>
${diaries.map(d => `<div class="entry"><h2>${formatDiaryDate(d.date)}</h2><p>${escHtml(d.content)}</p></div><hr>`).join('')}
</body></html>`
    exportWord('英文日记', html); showToast('Word 文件已下载')
  }

  return (
    <>
      <div className="panel-left">
        <div className="diary-meta">
          <label>日期</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          <button className="btn btn-outline btn-sm" onClick={goToday}>今天</button>
          <span className="word-count">{wordCount} words · {charCount} chars</span>
        </div>

        <div>
          <textarea style={{ minHeight: 400 }} value={content} onChange={e => setContent(e.target.value)} placeholder="开始写今天的英文日记...&#10;&#10;Today I..." />
        </div>

        <div className="btn-row">
          <button className="btn btn-green" onClick={save}>保存日记</button>
          <button className="btn btn-outline" disabled={polishing} onClick={polish}>{polishing ? '批改中...' : '批改'}</button>
          <button className="btn btn-outline" onClick={goToday}>回到今天</button>
        </div>

        {showPolish && (
          <div className="polish-section">
            <label>批改结果（更地道的表达）</label>
            <textarea value={polishText} onChange={e => setPolishText(e.target.value)} />

            {diffText && (
              <div className="polish-diff">
                <label style={{ marginTop: 14 }}>修改对照</label>
                <div style={{ fontSize: 13, lineHeight: 2, whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{ __html: renderDiff(diffText) }} />
              </div>
            )}

            <div className="btn-row" style={{ marginTop: 10 }}>
              <button className="btn btn-green btn-sm" onClick={applyPolish}>应用修改</button>
              <button className="btn btn-outline btn-sm" onClick={() => { setShowPolish(false); setPolishText(''); setDiffText('') }}>放弃</button>
            </div>
          </div>
        )}
      </div>

      <div className="panel-right">
        <div className="panel-right-header">
          <h2>日记列表</h2>
          <span className="streak-info">
            {streak > 0 ? `🔥 连续 ${streak} 天` : diaries.length ? `${diaries.length} 篇日记` : ''}
          </span>
        </div>
        <input className="search-input" placeholder="搜索日记内容..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <div className="record-list">
          {pageItems.length === 0
            ? <div className="empty-state">{search ? '没有匹配的日记' : '还没有日记\n开始写你的第一篇英文日记吧'}</div>
            : pageItems.map(d => (
              <div key={d.id} className={`record-item${d.id === currentId ? ' diary-selected' : ''}`}>
                <div className="preview" onClick={() => openDiary(d.id)}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:3}}>{formatDiaryDate(d.date)}</div>
                  <div className="en">{d.content.replace(/\n/g, ' ').slice(0, 60)}{d.content.length > 60 ? '...' : ''}</div>
                  <div style={{fontSize:11,color:'#aaa',marginTop:2}}>{d.content.split(/\s+/).filter(w=>w.length>0).length} words</div>
                </div>
                <button className="delete-btn" onClick={() => deleteDiary(d.id)}>×</button>
              </div>
            ))
          }
        </div>
        <Pagination page={p} totalPages={totalPages} onPage={setPage} />
        <div className="panel-right-footer">
          <button className="btn btn-outline btn-sm" onClick={doExportPDF}>导出 PDF</button>
          <button className="btn btn-outline btn-sm" onClick={doExportWord}>导出 Word</button>
          <button className="btn btn-danger btn-sm" onClick={clearAll}>清空全部日记</button>
        </div>
      </div>
    </>
  )
}
