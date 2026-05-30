export function formatDate(date: string): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatMonthDay(date: string): string {
  if (!date) return ''
  const d = new Date(date)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}-${day}`
}

export function formatYear(date: string): string {
  if (!date) return ''
  return new Date(date).getFullYear().toString()
}
