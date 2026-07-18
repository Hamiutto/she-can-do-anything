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

export function matchesTag(person, tag) {
  if (!tag) return true
  const normalized = tag.toLowerCase()
  return [
    person.city,
    person.industry,
    person.mbti,
    person.zodiac,
    ...person.tags,
    ...person.hobbyTags
  ].some((value) => String(value).toLowerCase() === normalized)
}

export function matchesKeyword(person, keyword) {
  if (!keyword) return true
  const normalized = keyword.toLowerCase()
  return [
    person.name,
    person.tagline,
    person.story,
    ...person.tags
  ].some((value) => String(value).toLowerCase().includes(normalized))
}

export function sortPeople(list, sortMode = 'match', query = '') {
  const normalized = query.toLowerCase()
  const scored = list.map((person) => {
    const exactTags = [
      ...person.tags,
      ...person.hobbyTags,
      person.mbti,
      person.zodiac,
      person.industry,
      person.city
    ].filter((value) => String(value).toLowerCase() === normalized).length
    const keywordHit = normalized && getSearchableText(person).includes(normalized) ? 1 : 0
    return { ...person, score: exactTags * 3 + keywordHit }
  })

  if (sortMode === 'complete') return scored.sort((a, b) => b.completeness - a.completeness)
  if (sortMode === 'helped') return scored.sort((a, b) => b.helpedCount - a.helpedCount)
  return scored.sort((a, b) => b.score - a.score || b.completeness - a.completeness || b.helpedCount - a.helpedCount)
}
