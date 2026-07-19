function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase()
}

// 五种时间中英文映射
const TIME_TYPE_MAP = {
  '生存时间': 'survival',
  '赚钱时间': 'earning',
  '好看时间': 'beauty',
  '好玩时间': 'fun',
  '心流时间': 'flow',
}

function splitSearchQuery(query) {
  if (Array.isArray(query)) {
    return query.map(normalizeText).filter(Boolean)
  }

  return String(query ?? '')
    .toLowerCase()
    .split(/[\s,，、;；]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function getSearchableText(person) {
  return [
    person.name,
    person.role,
    person.city,
    person.industry,
    person.mbti,
    person.zodiac,
    person.tagline,
    person.story,
    ...person.tags,
    ...person.hobbyTags,
    ...person.canHelp
  ].join(' ').toLowerCase()
}

export function parseSearchQuery(query) {
  return splitSearchQuery(query)
}

export function matchesTag(person, tag) {
  if (!tag) return true
  const normalized = normalizeText(tag)

  // 如果是时间类型标签，同时匹配中文和英文 key
  const englishKey = TIME_TYPE_MAP[normalized]
  const searchValues = englishKey ? [normalized, englishKey] : [normalized]

  return [
    person.city,
    person.industry,
    person.mbti,
    person.zodiac,
    ...person.tags,
    ...person.hobbyTags,
    ...(person.timeLabels || []),
  ].some((value) => searchValues.includes(normalizeText(value)))
}

export function matchesKeyword(person, keyword) {
  if (!keyword) return true
  const normalized = normalizeText(keyword)
  return [
    person.name,
    person.tagline,
    person.story,
    ...person.tags
  ].some((value) => normalizeText(value).includes(normalized))
}

export function matchesSearchQuery(person, query) {
  const terms = splitSearchQuery(query)
  if (!terms.length) return true

  const searchableText = getSearchableText(person)
  return terms.every((term) => searchableText.includes(term))
}

export function sortPeople(list, sortMode = 'match', query = '') {
  const terms = splitSearchQuery(query)

  const scored = list.map((person) => {
    const searchableText = getSearchableText(person)
    const exactFields = [
      person.name,
      person.role,
      person.city,
      person.industry,
      person.mbti,
      person.zodiac,
      ...person.tags,
      ...person.hobbyTags,
      ...person.canHelp
    ].map(normalizeText)

    const score = terms.reduce((total, term) => {
      const exactHit = exactFields.includes(term) ? 4 : 0
      const fuzzyHit = searchableText.includes(term) ? 1 : 0
      return total + exactHit + fuzzyHit
    }, 0)

    return { ...person, score }
  })

  if (sortMode === 'complete') return scored.sort((a, b) => b.completeness - a.completeness)
  if (sortMode === 'helped') return scored.sort((a, b) => b.helpedCount - a.helpedCount)
  return scored.sort((a, b) => b.score - a.score || b.completeness - a.completeness || b.helpedCount - a.helpedCount)
}
