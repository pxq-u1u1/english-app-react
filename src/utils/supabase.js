import { createClient } from '@supabase/supabase-js'

let supabase = null

export function getSupabase() {
  if (supabase) return supabase
  const url = localStorage.getItem('sb_url')
  const key = localStorage.getItem('sb_key')
  if (url && key) {
    supabase = createClient(url, key)
  }
  return supabase
}

export function initSupabase(url, key) {
  localStorage.setItem('sb_url', url)
  localStorage.setItem('sb_key', key)
  supabase = createClient(url, key)
  return supabase
}

export function getSession() {
  const sb = getSupabase()
  return sb ? sb.auth.getSession() : null
}

export function onAuthChange(cb) {
  const sb = getSupabase()
  if (!sb) return () => {}
  const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session))
  return () => data.subscription.unsubscribe()
}

export function isConfigured() {
  return !!(localStorage.getItem('sb_url') && localStorage.getItem('sb_key'))
}

// ---- Data CRUD ----

export async function fetchRecords() {
  const sb = getSupabase()
  const { data, error } = await sb.from('records').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addRecord(r) {
  const sb = getSupabase()
  const { error } = await sb.from('records').insert({
    id: r.id,
    direction: r.direction,
    chinese: r.chinese || '',
    english: r.english || '',
    created_at: r.createdAt,
  })
  if (error) throw error
}

export async function deleteRecord(id) {
  const sb = getSupabase()
  const { error } = await sb.from('records').delete().eq('id', id)
  if (error) throw error
}

export async function clearRecords() {
  const sb = getSupabase()
  const { error } = await sb.from('records').delete().neq('id', 0)
  if (error) throw error
}

// Diaries
export async function fetchDiaries() {
  const sb = getSupabase()
  const { data, error } = await sb.from('diaries').select('*').order('date', { ascending: false })
  if (error) throw error
  return data.map(d => ({ ...d, createdAt: d.created_at, updatedAt: d.updated_at }))
}

export async function saveDiary(d) {
  const sb = getSupabase()
  const { error } = await sb.from('diaries').upsert({
    id: d.id,
    date: d.date,
    content: d.content,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
  })
  if (error) throw error
}

export async function deleteDiary(id) {
  const sb = getSupabase()
  const { error } = await sb.from('diaries').delete().eq('id', id)
  if (error) throw error
}

export async function clearDiaries() {
  const sb = getSupabase()
  const { error } = await sb.from('diaries').delete().neq('id', 0)
  if (error) throw error
}

// Corpus
export async function fetchCorpus() {
  const sb = getSupabase()
  const { data, error } = await sb.from('corpus').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data.map(c => ({ ...c, createdAt: c.created_at }))
}

export async function addCorpusEntry(e) {
  const sb = getSupabase()
  const { error } = await sb.from('corpus').insert({
    id: e.id,
    english: e.english,
    chinese: e.chinese || '',
    category: e.category,
    source: e.source || '',
    created_at: e.createdAt,
  })
  if (error) throw error
}

export async function deleteCorpusEntry(id) {
  const sb = getSupabase()
  const { error } = await sb.from('corpus').delete().eq('id', id)
  if (error) throw error
}

export async function clearCorpus() {
  const sb = getSupabase()
  const { error } = await sb.from('corpus').delete().neq('id', 0)
  if (error) throw error
}

// Categories
export async function fetchCategories() {
  const sb = getSupabase()
  const { data, error } = await sb.from('categories').select('*').order('id')
  if (error) throw error
  return data.map(c => c.name)
}

export async function saveCategories(names) {
  const sb = getSupabase()
  await sb.from('categories').delete().neq('id', 0)
  if (names.length) {
    const { error } = await sb.from('categories').insert(names.map(name => ({ name })))
    if (error) throw error
  }
}
