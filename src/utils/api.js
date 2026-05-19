// ============================================================
// API 客户端 — 和后端通信
// 服务器连不上时自动降级到 localStorage，不影响使用
// ============================================================

import { loadRecords, saveRecords, loadDiaries, saveDiaries, loadCorpus, saveCorpus, loadCategories, saveCategories } from './storage'
import { callDeepSeek } from './deepseek'
import { showToast } from '../components/Toast'

let serverUnreachable = false

export function getServerConfig() {
  const url = localStorage.getItem('server_url') || ''
  const password = localStorage.getItem('server_password') || ''
  return { url, password }
}

export function isServerConfigured() {
  const { url, password } = getServerConfig()
  return !!(url && password)
}

async function api(method, path, body) {
  const { url, password } = getServerConfig()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)

  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Password': password },
      signal: controller.signal,
    }
    if (body) opts.body = JSON.stringify(body)
    const resp = await fetch(url + path, opts)
    clearTimeout(timer)
    const data = await resp.json()
    if (!resp.ok) throw new Error(data.error || '请求失败')
    if (serverUnreachable) { serverUnreachable = false; showToast('服务器已恢复') }
    return data
  } catch (e) {
    clearTimeout(timer)
    if (e.name === 'AbortError' || e.message?.includes('fetch') || e.message?.includes('Network') || e.message?.includes('Failed')) {
      if (!serverUnreachable) { serverUnreachable = true; showToast('服务器连接失败，已切换本地模式') }
      throw new Error('SERVER_UNREACHABLE')
    }
    throw e
  }
}

async function tryServer(fn) {
  if (!isServerConfigured()) return null
  try { return await fn() }
  catch (e) { if (e.message === 'SERVER_UNREACHABLE') return null; throw e }
}

// ---- 翻译记录 ----

export async function fetchRecords() {
  const r = await tryServer(() => api('GET', '/api/records'))
  return r !== null ? r : loadRecords()
}

export async function addRecordRecord(rec) {
  const r = await tryServer(() => api('POST', '/api/records', rec).then(() => 'ok'))
  if (r === null) { const records = loadRecords(); records.unshift(rec); saveRecords(records) }
}

export async function deleteRecordRecord(id) {
  const r = await tryServer(() => api('DELETE', '/api/records/' + id).then(() => 'ok'))
  if (r === null) { saveRecords(loadRecords().filter(x => x.id !== id)) }
}

export async function clearAllRecords() {
  const r = await tryServer(() => api('DELETE', '/api/records').then(() => 'ok'))
  if (r === null) saveRecords([])
}

// ---- 日记 ----

export async function fetchDiaries() {
  const r = await tryServer(() => api('GET', '/api/diaries'))
  return r !== null ? r : loadDiaries()
}

export async function saveDiaryRecord(d) {
  const r = await tryServer(() => api('POST', '/api/diaries', d).then(() => 'ok'))
  if (r === null) {
    const diaries = loadDiaries()
    const idx = diaries.findIndex(x => x.id === d.id)
    if (idx >= 0) diaries[idx] = d; else diaries.unshift(d)
    diaries.sort((a, b) => b.date.localeCompare(a.date))
    saveDiaries(diaries)
  }
}

export async function deleteDiaryRecord(id) {
  const r = await tryServer(() => api('DELETE', '/api/diaries/' + id).then(() => 'ok'))
  if (r === null) { saveDiaries(loadDiaries().filter(x => x.id !== id)) }
}

export async function clearAllDiaries() {
  const r = await tryServer(() => api('DELETE', '/api/diaries').then(() => 'ok'))
  if (r === null) saveDiaries([])
}

// ---- 语料库 ----

export async function fetchCorpus() {
  const r = await tryServer(() => api('GET', '/api/corpus'))
  return r !== null ? r : loadCorpus()
}

export async function addCorpusRecord(e) {
  const r = await tryServer(() => api('POST', '/api/corpus', e).then(() => 'ok'))
  if (r === null) { const corpus = loadCorpus(); corpus.unshift(e); saveCorpus(corpus) }
}

export async function deleteCorpusRecord(id) {
  const r = await tryServer(() => api('DELETE', '/api/corpus/' + id).then(() => 'ok'))
  if (r === null) { saveCorpus(loadCorpus().filter(x => x.id !== id)) }
}

export async function clearAllCorpus() {
  const r = await tryServer(() => api('DELETE', '/api/corpus').then(() => 'ok'))
  if (r === null) saveCorpus([])
}

// ---- 分类 ----

export async function fetchCategories() {
  const r = await tryServer(() => api('GET', '/api/categories'))
  return r !== null ? r : loadCategories()
}

export async function saveCategoriesRecord(names) {
  const r = await tryServer(() => api('POST', '/api/categories', { names }).then(() => 'ok'))
  if (r === null) saveCategories(names)
}

// ---- AI ----

export async function translateAI(text, direction) {
  const r = await tryServer(() => api('POST', '/api/ai/translate', { text, direction }))
  if (r !== null) return r.result
  const sys = direction === 'zh2en'
    ? 'You are a professional translator. Translate the Chinese text into natural, idiomatic English. Only output the translation, nothing else.'
    : 'You are a professional translator. Translate the English text into natural, fluent Chinese. Only output the translation, nothing else.'
  return await callDeepSeek(sys, text)
}

export async function polishAI(text) {
  const r = await tryServer(() => api('POST', '/api/ai/polish', { text }))
  if (r !== null) return { result: r.result, diff: r.diff, vocab: r.vocab || '' }
  const result = await callDeepSeek(
    'You are a native English editor helping a learner improve their diary writing. Correct all grammar mistakes, replace simple words with richer vocabulary, vary sentence openings. Preserve the original meaning and personal voice. Output ONLY the corrected version, no explanations.',
    text
  )
  return { result }
}

export async function corpusTranslateAI(text) {
  const r = await tryServer(() => api('POST', '/api/ai/corpus-translate', { text }))
  if (r !== null) return r.result
  return await callDeepSeek(
    'Translate the following English sentence into natural, fluent Chinese. Only output the Chinese translation, nothing else.',
    text
  )
}

export async function categorizeAI(text, categories) {
  const r = await tryServer(() => api('POST', '/api/ai/categorize', { text }))
  if (r !== null) return r.result
  const cats = categories.join('、')
  return await callDeepSeek(
    `You are a text classifier. Given an English sentence, choose the SINGLE best category from this list: ${cats}. Only output the exact category name, nothing else.`,
    text
  )
}

// ---- 同步 ----

export async function syncAllToServer() {
  if (!isServerConfigured()) return
  try {
    await api('POST', '/api/sync-all', {
      records: loadRecords(),
      diaries: loadDiaries(),
      corpus: loadCorpus(),
    })
    showToast('数据已同步到服务器')
  } catch (e) {
    if (e.message === 'SERVER_UNREACHABLE') showToast('无法连接服务器')
    else throw e
  }
}
