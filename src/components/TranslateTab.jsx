import { useState, useEffect } from 'react'
import { loadRecords, saveRecords } from '../utils/storage'
import { callDeepSeek } from '../utils/deepseek'
import { formatTime, escHtml, exportPDF, exportWord } from '../utils/helpers'
import { showToast } from './Toast'
import Pagination from './Pagination'

const PAGE_SIZE = 15

export default function TranslateTab() {
  const [records, setRecords] = useState(loadRecords)
  const [direction, setDirection] = useState('zh2en')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [translating, setTranslating] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(new Set())

  useEffect(() => { saveRecords(records) }, [records])

  const doTranslate = async () => {
    if (!input.trim()) { showToast(direction === 'zh2en' ? '请先输入中文' : 'Please enter English text'); return }
    setTranslating(true)
    try {
      const sys = direction === 'zh2en'
        ? 'You are a professional translator. Translate the Chinese text into natural, idiomatic English. Keep the tone and style of the original. Only output the translation, nothing else.'
        : 'You are a professional translator. Translate the English text into natural, fluent Chinese. Keep the tone and style of the original. Only output the translation, nothing else.'
      const result = await callDeepSeek(sys, input)
      setOutput(result)
    } catch (e) { showToast('翻译失败: ' + e.message) }
    setTranslating(false)
  }

  const save = () => {
    if (!input.trim()) { showToast(direction === 'zh2en' ? '请先输入中文' : 'Please enter English text'); return }
    if (!output.trim()) { showToast(direction === 'zh2en' ? '请先翻译成英文' : '请先翻译成中文'); return }
    const r = { id: Date.now().toString(), direction, createdAt: new Date().toISOString() }
    if (direction === 'zh2en') { r.chinese = input; r.english = output }
    else { r.english = input; r.chinese = output }
    setRecords([r, ...records])
    setInput(''); setOutput(''); setPage(1)
    showToast('已保存')
  }

  const copy = () => {
    if (!output.trim()) { showToast('没有可复制的内容'); return }
    navigator.clipboard.writeText(output).then(() => showToast('已复制'))
  }

  const deleteRecord = (id) => {
    if (!confirm('确定删除这条记录？')) return
    setRecords(records.filter(r => r.id !== id))
    const s = new Set(selected); s.delete(id); setSelected(s)
  }

  const clearAll = () => {
    if (!confirm('确定清空所有翻译记录？')) return
    setRecords([]); setSelected(new Set())
  }

  const toggleSelect = (id) => {
    const s = new Set(selected)
    if (s.has(id)) s.delete(id); else s.add(id)
    setSelected(s)
  }

  const getExportItems = () => selected.size > 0 ? records.filter(r => selected.has(r.id)) : records

  const doExportPDF = () => {
    const items = getExportItems()
    if (!items.length) { showToast('没有可导出的记录'); return }
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>翻译练习-导出</title>
<style>body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;padding:30px 40px;color:#2c2416}h1{font-size:20px;margin-bottom:6px}.date{color:#999;font-size:12px;margin-bottom:30px}.item{margin-bottom:28px;page-break-inside:avoid}.zh{font-size:15px;margin-bottom:6px;color:#555}.en{font-size:16px;color:#d4764e;line-height:1.7}.dir{font-size:11px;color:#d4764e;margin-bottom:6px}hr{border:none;border-top:1px solid #eee;margin:20px 0}@media print{body{padding:20px}}</style></head><body>
<h1>翻译练习记录</h1><p class="date">导出日期: ${new Date().toLocaleDateString('zh-CN')} | 共 ${items.length} 条</p>
${items.map(r => `<div class="item">${r.direction==='en2zh'?'<div class="dir">英→中</div>':''}<div class="zh">${escHtml(r.chinese||'')}</div><div class="en">${escHtml(r.english||'')}</div></div><hr>`).join('')}
</body></html>`
    exportPDF('', html); setSelected(new Set())
  }

  const doExportWord = () => {
    const items = getExportItems()
    if (!items.length) { showToast('没有可导出的记录'); return }
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;padding:30px;color:#2c2416}h1{font-size:20px;margin-bottom:6px}.date{color:#999;font-size:12px;margin-bottom:24px}table{width:100%;border-collapse:collapse}td{padding:10px 12px;border:1px solid #ddd;vertical-align:top;font-size:14px;line-height:1.6}td.zh{color:#555;width:40%}td.en{color:#d4764e;width:60%}th{background:#f5f0eb;padding:10px 12px;text-align:left;font-size:13px;border:1px solid #ddd}</style></head><body>
<h1>翻译练习记录</h1><p class="date">导出日期: ${new Date().toLocaleDateString('zh-CN')} | 共 ${items.length} 条</p>
<table><tr><th>中文</th><th>English</th><th>方向</th></tr>
${items.map(r => `<tr><td class="zh">${escHtml(r.chinese||'')}</td><td class="en">${escHtml(r.english||'')}</td><td>${r.direction==='en2zh'?'英→中':'中→英'}</td></tr>`).join('')}
</table></body></html>`
    exportWord('英语翻译', html); setSelected(new Set()); showToast('Word 文件已下载')
  }

  // Filter & paginate
  const filtered = search ? records.filter(r =>
    (r.chinese||'').toLowerCase().includes(search.toLowerCase()) ||
    (r.english||'').toLowerCase().includes(search.toLowerCase())
  ) : records
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const p = page > totalPages ? 1 : page
  const pageItems = filtered.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE)

  return (
    <>
      <div className="panel-left">
        <div className="direction-toggle">
          <button className={`dir-btn${direction === 'zh2en' ? ' active' : ''}`} onClick={() => setDirection('zh2en')}>中 → 英</button>
          <button className={`dir-btn${direction === 'en2zh' ? ' active' : ''}`} onClick={() => setDirection('en2zh')}>英 → 中</button>
        </div>

        <div>
          <label>{direction === 'zh2en' ? '中文原文' : 'English'}</label>
          <textarea
            style={{ minHeight: 200 }}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={direction === 'zh2en' ? '输入你想表达但卡壳的中文句子...' : 'Paste English text you want to translate...'}
          />
        </div>

        <button className="btn btn-primary" disabled={translating} onClick={doTranslate}>
          {translating ? '翻译中...' : direction === 'zh2en' ? '翻译 → 英文' : '翻译 → 中文'}
        </button>

        <div>
          <label>{direction === 'zh2en' ? '英文表达' : '中文翻译'}</label>
          <textarea style={{ minHeight: 220, background: '#fafaf9' }} value={output} onChange={e => setOutput(e.target.value)} placeholder="翻译结果将显示在这里..." />
        </div>

        <div className="btn-row">
          <button className="btn btn-outline" onClick={copy}>复制</button>
          <button className="btn btn-primary" onClick={save}>保存到记录</button>
        </div>
      </div>

      <div className="panel-right">
        <div className="panel-right-header">
          <h2>历史记录</h2>
          <span className="selection-info">{selected.size ? `已选 ${selected.size} 条` : ''}</span>
        </div>
        <input className="search-input" placeholder="搜索中文或英文..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <div className="record-list">
          {pageItems.length === 0
            ? <div className="empty-state">{search ? '没有匹配的记录' : '还没有记录\n输入文本并翻译后保存即可'}</div>
            : pageItems.map(r => {
              const sel = selected.has(r.id)
              return (
                <div key={r.id} className={`record-item${sel ? ' selected' : ''}`}>
                  <div className="preview" onClick={() => toggleSelect(r.id)}>
                    <div className="zh">
                      {r.direction === 'en2zh' && <span style={{fontSize:10,color:'#fff',background:'#5a8f6c',padding:'1px 6px',borderRadius:8,marginRight:4}}>英→中</span>}
                      {(r.chinese || '').slice(0, 40)}{(r.chinese || '').length > 40 ? '...' : ''}
                    </div>
                    <div className="en">{(r.english || '').slice(0, 50)}{(r.english || '').length > 50 ? '...' : ''}</div>
                  </div>
                  <span className="time">{formatTime(r.createdAt)}</span>
                  <button className="delete-btn" onClick={() => deleteRecord(r.id)}>×</button>
                </div>
              )
            })
          }
        </div>
        <Pagination page={p} totalPages={totalPages} onPage={setPage} />
        <div className="panel-right-footer">
          <button className="btn btn-outline btn-sm" onClick={doExportPDF}>导出 PDF</button>
          <button className="btn btn-outline btn-sm" onClick={doExportWord}>导出 Word</button>
          <button className="btn btn-outline btn-sm" onClick={() => { if(selected.size===0){showToast('请先点击记录选中');return}; doExportPDF() }}>导出选中 (PDF)</button>
          <button className="btn btn-outline btn-sm" onClick={() => { if(selected.size===0){showToast('请先点击记录选中');return}; doExportWord() }}>导出选中 (Word)</button>
          <button className="btn btn-danger btn-sm" onClick={clearAll}>清空全部</button>
        </div>
      </div>
    </>
  )
}
