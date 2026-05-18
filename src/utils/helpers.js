export function escHtml(s) {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

export function formatTime(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return d.toLocaleDateString('zh-CN')
}

export function getTodayStr() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export function yesterdayStr(today) {
  const d = new Date(today)
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function formatDiaryDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = getTodayStr()
  const yesterday = yesterdayStr(today)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const wd = weekdays[d.getDay()]
  if (dateStr === today) return '今天 ' + wd
  if (dateStr === yesterday) return '昨天 ' + wd
  const diff = Math.floor((new Date(today + 'T00:00:00') - d) / 86400000)
  if (diff < 7) return diff + '天前 ' + wd
  return d.toLocaleDateString('zh-CN') + ' ' + wd
}

export function exportPDF(title, itemsHtml) {
  const w = window.open('', '_blank')
  w.document.write(itemsHtml)
  w.document.close()
  setTimeout(() => w.print(), 400)
}

export function exportWord(filename, html) {
  const blob = new Blob([html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename + '_' + new Date().toISOString().slice(0, 10) + '.doc'
  a.click()
  URL.revokeObjectURL(url)
}
