import { useState, useEffect, useRef } from 'react'
import { fetchCorpus, addCorpusRecord, deleteCorpusRecord, clearAllCorpus, fetchCategories, saveCategoriesRecord, corpusTranslateAI, categorizeAI } from '../utils/api'
import { escHtml, exportPDF, exportWord } from '../utils/helpers'
import { showToast } from './Toast'
import Pagination from './Pagination'

const PAGE_SIZE = 15

export default function CorpusTab() {
  const [corpus, setCorpus] = useState([])
  const [categories, setCategories] = useState([])
  const [english, setEnglish] = useState('')
  const [chinese, setChinese] = useState('')
  const [category, setCategory] = useState('')
  const [source, setSource] = useState('')
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('全部')
  const [page, setPage] = useState(1)
  const [catModal, setCatModal] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [translatingCorpus, setTranslatingCorpus] = useState(false)
  const [categorizing, setCategorizing] = useState(false)
  const catSelRef = useRef(null)

  useEffect(() => { fetchCorpus().then(setCorpus) }, [])
  useEffect(() => { fetchCategories().then(setCategories) }, [])

  const translateCorpus = async () => {
    if (!english.trim()) { showToast('请先输入英语表达'); return }
    setTranslatingCorpus(true)
    try {
      const result = await corpusTranslateAI(english)
      setChinese(result.trim())
    } catch (e) { showToast('翻译失败: ' + e.message) }
    setTranslatingCorpus(false)
  }

  const autoCategorize = async () => {
    if (!english.trim()) { showToast('请先输入英语表达'); return }
    setCategorizing(true)
    try {
      const result = await categorizeAI(english, categories)
      const matched = result.trim()
      const found = categories.find(c => c === matched || matched.includes(c))
      if (found) { setCategory(found); showToast('已分类为: ' + found) }
      else { showToast('AI 建议: ' + matched + ' (未匹配，请手动选择)') }
    } catch (e) { showToast('分类失败: ' + e.message) }
    setCategorizing(false)
  }

  const addEntry = async () => {
    if (!english.trim()) { showToast('请输入英语表达'); return }
    const e = { id: Date.now().toString(), english, chinese, category: category || categories[0], source, createdAt: new Date().toISOString() }
    await addCorpusRecord(e)
    setCorpus([e, ...corpus])
    setEnglish(''); setChinese(''); setSource(''); setPage(1)
    showToast('已添加到语料库')
  }

  const openEntry = (id) => {
    const e = corpus.find(x => x.id === id)
    if (!e) return
    setEnglish(e.english); setChinese(e.chinese || ''); setCategory(e.category); setSource(e.source || '')
  }

  const deleteEntry = async (id) => {
    if (!confirm('确定删除这条语料？')) return
    await deleteCorpusRecord(id)
    setCorpus(corpus.filter(e => e.id !== id))
  }

  const clearAll = async () => {
    if (!confirm('确定清空整个语料库？')) return
    await clearAllCorpus()
    setCorpus([])
  }

  const addCategory = async () => {
    const name = newCatName.trim()
    if (!name) return
    if (categories.includes(name)) { showToast('该分类已存在'); return }
    const updated = [...categories, name]
    setCategories(updated)
    await saveCategoriesRecord(updated)
    setNewCatName('')
    showToast('已添加分类: ' + name)
  }

  const deleteCategory = async (name) => {
    if (categories.length <= 2) { showToast('至少保留2个分类'); return }
    if (!confirm(`删除分类 "${name}"？已有语料将变为"其他"。`)) return
    const updated = categories.filter(c => c !== name)
    setCategories(updated)
    await saveCategoriesRecord(updated)
    setCorpus(corpus.map(e => e.category === name ? { ...e, category: '其他' } : e))
    // Update server for reassigned items
    for (const e of corpus.filter(e => e.category === name)) {
      await addCorpusRecord({ ...e, category: '其他' })
    }
    if (activeCat === name) setActiveCat('全部')
  }

  const counts = {}
  counts['全部'] = corpus.length
  corpus.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1 })

  let filtered = activeCat !== '全部' ? corpus.filter(e => e.category === activeCat) : corpus
  if (search) {
    filtered = filtered.filter(e =>
      e.english.toLowerCase().includes(search.toLowerCase()) ||
      (e.chinese||'').toLowerCase().includes(search.toLowerCase()) ||
      (e.source||'').toLowerCase().includes(search.toLowerCase())
    )
  }
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const p = page > totalPages ? 1 : page
  const pageItems = filtered.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE)

  const getExportItems = () => activeCat !== '全部' ? corpus.filter(e => e.category === activeCat) : corpus

  const doExportPDF = () => {
    const items = getExportItems()
    if (!items.length) { showToast('没有可导出的语料'); return }
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>语料库-导出</title>
<style>body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;padding:30px 40px;color:#2c2416}h1{font-size:20px;margin-bottom:6px}.date{color:#999;font-size:12px;margin-bottom:24px}.item{margin-bottom:22px;page-break-inside:avoid}.en{font-size:15px;font-weight:600;margin-bottom:4px}.zh{font-size:14px;color:#555;margin-bottom:2px}.meta{font-size:11px;color:#bbb}hr{border:none;border-top:1px solid #eee;margin:18px 0}@media print{body{padding:20px}}</style></head><body>
<h1>英语语料库</h1><p class="date">导出日期: ${new Date().toLocaleDateString('zh-CN')} | 共 ${items.length} 条</p>
${items.map(e => `<div class="item"><div class="en">${escHtml(e.english)}</div>${e.chinese?`<div class="zh">${escHtml(e.chinese)}</div>`:''}<div class="meta">${escHtml(e.category)}${e.source?' · 来源: '+escHtml(e.source):''}</div></div><hr>`).join('')}
</body></html>`
    exportPDF('', html)
  }

  const doExportWord = () => {
    const items = getExportItems()
    if (!items.length) { showToast('没有可导出的语料'); return }
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;padding:30px;color:#2c2416}h1{font-size:20px;margin-bottom:6px}.date{color:#999;font-size:12px;margin-bottom:24px}table{width:100%;border-collapse:collapse}td{padding:10px 12px;border:1px solid #ddd;vertical-align:top;font-size:14px;line-height:1.6}td.en{font-weight:600}th{background:#f5f0eb;padding:10px 12px;text-align:left;font-size:13px;border:1px solid #ddd}</style></head><body>
<h1>英语语料库</h1><p class="date">导出日期: ${new Date().toLocaleDateString('zh-CN')} | 共 ${items.length} 条</p>
<table><tr><th>English</th><th>中文</th><th>分类</th><th>来源</th></tr>
${items.map(e => `<tr><td class="en">${escHtml(e.english)}</td><td>${escHtml(e.chinese||'')}</td><td>${escHtml(e.category)}</td><td>${escHtml(e.source||'')}</td></tr>`).join('')}
</table></body></html>`
    exportWord('英语语料库', html); showToast('Word 文件已下载')
  }

  return (
    <>
      <div className="panel-left">
        <div>
          <label>地道英语表达</label>
          <textarea style={{ minHeight: 130 }} rows={5} value={english} onChange={e => setEnglish(e.target.value)} placeholder="输入你遇到的好的英语句子或短语..." />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" disabled={translatingCorpus} onClick={translateCorpus}>
            {translatingCorpus ? '翻译中...' : '一键翻译成中文'}
          </button>
          {chinese && <span style={{ fontSize: 14, color: 'var(--text-secondary)', flex: 1 }}>{chinese}</span>}
        </div>

        <div className="corpus-input-row">
          <div className="field" style={{ flex: 1 }}>
            <label>分类</label>
            <select value={category || categories[0]} onChange={e => setCategory(e.target.value)} ref={catSelRef}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-outline" disabled={categorizing} onClick={autoCategorize} style={{ width: '100%' }}>
              {categorizing ? '分析中...' : 'AI 自动分类'}
            </button>
          </div>
        </div>

        <div className="corpus-input-row">
          <div className="field">
            <label>来源（可选）</label>
            <input value={source} onChange={e => setSource(e.target.value)} placeholder="如：每日说三句、某本书、美剧..." />
          </div>
        </div>

        <button className="btn btn-primary" onClick={addEntry}>添加到语料库</button>
      </div>

      <div className="panel-right">
        <div className="panel-right-header">
          <h2>语料库</h2>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{filtered.length} 条</span>
        </div>

        <div className="category-chips">
          {['全部', ...categories].map(c => (
            <button key={c} className={`category-chip${activeCat === c ? ' active' : ''}`} onClick={() => { setActiveCat(c); setPage(1) }}>
              {c} ({counts[c] || 0})
            </button>
          ))}
        </div>

        <input className="search-input" placeholder="搜索英语或中文..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />

        <div className="record-list">
          {pageItems.length === 0
            ? <div className="empty-state">{search || activeCat !== '全部' ? '没有匹配的语料' : '语料库还是空的\n把遇到的好句子收藏进来吧'}</div>
            : pageItems.map(e => (
              <div key={e.id} className="record-item corpus-item">
                <div className="preview" onClick={() => openEntry(e.id)}>
                  <div className="en-corpus">{e.english}</div>
                  {e.chinese && <div className="zh-corpus">{e.chinese}</div>}
                  {e.source && <div className="src-corpus">来源: {e.source}</div>}
                </div>
                <span className="cat-tag">{e.category}</span>
                <button className="delete-btn" onClick={() => deleteEntry(e.id)}>×</button>
              </div>
            ))
          }
        </div>

        <Pagination page={p} totalPages={totalPages} onPage={setPage} />

        <div className="panel-right-footer">
          <button className="btn btn-outline btn-sm" onClick={doExportPDF}>导出 PDF</button>
          <button className="btn btn-outline btn-sm" onClick={doExportWord}>导出 Word</button>
          <button className="btn btn-outline btn-sm" onClick={() => setCatModal(true)}>管理分类</button>
          <button className="btn btn-danger btn-sm" onClick={clearAll}>清空语料库</button>
        </div>
      </div>

      {catModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setCatModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>管理分类</h3>
            {categories.map(c => (
              <div key={c} className="cat-mgmt-row">
                <span>{c}</span>
                <button className="btn btn-danger btn-sm" disabled={categories.length <= 2} onClick={() => deleteCategory(c)}>删除</button>
              </div>
            ))}
            <div className="cat-mgmt-row" style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="新分类名称" style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 14, fontFamily: 'inherit' }} />
              <button className="btn btn-primary btn-sm" onClick={addCategory}>添加</button>
            </div>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setCatModal(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
