export function getWordPreview(content: string, wordCount = 34): string {
  const normalized = content.replace(/\s+/g, ' ').trim()
  const words = normalized.split(' ')

  if (words.length <= wordCount) {
    return normalized
  }

  return `${words.slice(0, wordCount).join(' ')}...`
}

export function formatPostDate(dateString: string): string {
  const date = new Date(dateString)

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getReadingTimeLabel(content: string): string {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(wordCount / 220))

  return `${minutes} min read`
}
