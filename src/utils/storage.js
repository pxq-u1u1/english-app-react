const KEYS = {
  records: 'english_app_records',
  diary: 'english_app_diary',
  corpus: 'english_app_corpus',
  categories: 'english_app_categories',
}

export function loadJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)) || [] }
  catch { return [] }
}

export function saveJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function loadRecords() { return loadJSON(KEYS.records) }
export function saveRecords(data) { saveJSON(KEYS.records, data) }

export function loadDiaries() { return loadJSON(KEYS.diary) }
export function saveDiaries(data) { saveJSON(KEYS.diary, data) }

export function loadCorpus() { return loadJSON(KEYS.corpus) }
export function saveCorpus(data) { saveJSON(KEYS.corpus, data) }

export function loadCategories() {
  const saved = loadJSON(KEYS.categories)
  return saved.length ? saved : ['职场', '日常', '社交', '旅游', '美食', '科技', '学术', '情感', '其他']
}
export function saveCategories(data) { saveJSON(KEYS.categories, data) }
