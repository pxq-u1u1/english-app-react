// ============================================================
// API 客户端 — 和后端通信
// 如果配置了后端就用后端，没配置就走 localStorage
// ============================================================

import { loadRecords, saveRecords, loadDiaries, saveDiaries, loadCorpus, saveCorpus, loadCategories, saveCategories } from './storage'
import { callDeepSeek } from './deepseek'

// ---- 配置 ----

export function getServerConfig() {
  const url = localStorage.getItem('server_url') || ''
  const password = localStorage.getItem('server_password') || ''
  return { url, password }
}

export function isServerConfigured() {
  const { url, password } = getServerConfig()
  return !!(url && password)
}

// ---- 通用请求 ----

async function api(method, path, body) {
  const { url, password } = getServerConfig()
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Password': password },
  }
  if (body) opts.body = JSON.stringify(body)
  const resp = await fetch(url + path, opts)
  const data = await resp.json()
  if (!resp.ok) throw new Error(data.error || '请求失败')
  return data
}

// ---- 翻译记录 ----

export async function fetchRecords() {
  if (!isServerConfigured()) return loadRecords()
  return await api('GET', '/api/records')
}

export async function addRecordRecord(r) {
  if (!isServerConfigured()) {
    const records = loadRecords()
    records.unshift(r)
    saveRecords(records)
    return
  }
  await api('POST', '/api/records', r)
}

export async function deleteRecordRecord(id) {
  if (!isServerConfigured()) {
    const records = loadRecords().filter(r => r.id !== id)
    saveRecords(records)
    return
  }
  await api('DELETE', '/api/records/' + id)
}

export async function clearAllRecords() {
  if (!isServerConfigured()) { saveRecords([]); return }
  await api('DELETE', '/api/records')
}

// ---- 日记 ----

export async function fetchDiaries() {
  if (!isServerConfigured()) return loadDiaries()
  return await api('GET', '/api/diaries')
}

export async function saveDiaryRecord(d) {
  if (!isServerConfigured()) {
    const diaries = loadDiaries()
    const idx = diaries.findIndex(x => x.id === d.id)
    if (idx >= 0) diaries[idx] = d
    else diaries.unshift(d)
    diaries.sort((a, b) => b.date.localeCompare(a.date))
    saveDiaries(diaries)
    return
  }
  await api('POST', '/api/diaries', d)
}

export async function deleteDiaryRecord(id) {
  if (!isServerConfigured()) {
    const diaries = loadDiaries().filter(d => d.id !== id)
    saveDiaries(diaries)
    return
  }
  await api('DELETE', '/api/diaries/' + id)
}

export async function clearAllDiaries() {
  if (!isServerConfigured()) { saveDiaries([]); return }
  await api('DELETE', '/api/diaries')
}

// ---- 语料库 ----

export async function fetchCorpus() {
  if (!isServerConfigured()) return loadCorpus()
  return await api('GET', '/api/corpus')
}

export async function addCorpusRecord(e) {
  if (!isServerConfigured()) {
    const corpus = loadCorpus()
    corpus.unshift(e)
    saveCorpus(corpus)
    return
  }
  await api('POST', '/api/corpus', e)
}

export async function deleteCorpusRecord(id) {
  if (!isServerConfigured()) {
    const corpus = loadCorpus().filter(e => e.id !== id)
    saveCorpus(corpus)
    return
  }
  await api('DELETE', '/api/corpus/' + id)
}

export async function clearAllCorpus() {
  if (!isServerConfigured()) { saveCorpus([]); return }
  await api('DELETE', '/api/corpus')
}

// ---- 分类 ----

export async function fetchCategories() {
  if (!isServerConfigured()) return loadCategories()
  return await api('GET', '/api/categories')
}

export async function saveCategoriesRecord(names) {
  if (!isServerConfigured()) { saveCategories(names); return }
  await api('POST', '/api/categories', { names })
}

// ---- AI（翻译/批改/分类）----

export async function translateAI(text, direction) {
  if (!isServerConfigured()) {
    const sys = direction === 'zh2en'
      ? 'You are a professional translator. Translate the Chinese text into natural, idiomatic English. Only output the translation, nothing else.'
      : 'You are a professional translator. Translate the English text into natural, fluent Chinese. Only output the translation, nothing else.'
    return await callDeepSeek(sys, text)
  }
  const data = await api('POST', '/api/ai/translate', { text, direction })
  return data.result
}

export async function polishAI(text) {
  if (!isServerConfigured()) {
    return await callDeepSeek(
      'You are a native English editor helping a learner improve their diary writing. Correct all grammar mistakes, improve word choices to sound more natural and native-like, and polish sentence flow. Preserve the original meaning, tone, and personal voice. Output ONLY the corrected version, no explanations.',
      text
    )
  }
  const data = await api('POST', '/api/ai/polish', { text })
  return data.result
}

export async function corpusTranslateAI(text) {
  if (!isServerConfigured()) {
    return await callDeepSeek(
      'Translate the following English sentence into natural, fluent Chinese. Only output the Chinese translation, nothing else.',
      text
    )
  }
  const data = await api('POST', '/api/ai/corpus-translate', { text })
  return data.result
}

export async function categorizeAI(text, categories) {
  if (!isServerConfigured()) {
    const cats = categories.join('、')
    return await callDeepSeek(
      `You are a text classifier. Given an English sentence, choose the SINGLE best category from this list: ${cats}. Only output the exact category name, nothing else.`,
      text
    )
  }
  const data = await api('POST', '/api/ai/categorize', { text })
  return data.result
}

// ---- 同步 ----

export async function syncAllToServer() {
  if (!isServerConfigured()) return
  await api('POST', '/api/sync-all', {
    records: loadRecords(),
    diaries: loadDiaries(),
    corpus: loadCorpus(),
  })
}
