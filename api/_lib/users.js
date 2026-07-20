import { query } from './db.js'

const profileFields = {
  nickname: 'nickname',
  city: 'city',
  age: 'age',
  education: 'education',
  industry: 'industry',
  marriage: 'marriage',
  tagline: 'tagline',
  lifeStory: 'life_story',
  canHelp: 'can_help',
  expertise: 'expertise',
  referrer: 'referrer',
  timeTags: 'time_tags',
  hobbies: 'hobbies',
  mbti: 'mbti',
}

export function toApiUser(row) {
  if (!row) return null

  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    city: row.city,
    age: row.age,
    education: row.education,
    industry: row.industry,
    marriage: row.marriage,
    tagline: row.tagline,
    lifeStory: row.life_story,
    canHelp: row.can_help,
    expertise: row.expertise,
    referrer: row.referrer,
    timeTags: Array.isArray(row.time_tags) ? row.time_tags : [],
    hobbies: Array.isArray(row.hobbies) ? row.hobbies : [],
    mbti: row.mbti,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function findUserByEmail(email) {
  const { rows } = await query('select * from users where lower(email) = lower($1) limit 1', [email])
  return rows[0] || null
}

export async function findUserById(id) {
  const { rows } = await query('select * from users where id = $1 limit 1', [id])
  return rows[0] || null
}

export async function createUser(email, passwordHash, nickname) {
  const { rows } = await query(
    `insert into users (email, password_hash, nickname)
     values (lower($1), $2, $3)
     returning *`,
    [email, passwordHash, nickname || null]
  )
  return rows[0]
}

export async function updateUserProfile(userId, profile) {
  const sets = []
  const values = []

  for (const [apiKey, column] of Object.entries(profileFields)) {
    if (profile[apiKey] === undefined) continue
    values.push(Array.isArray(profile[apiKey]) ? JSON.stringify(profile[apiKey]) : profile[apiKey])
    const cast = column === 'time_tags' || column === 'hobbies' ? '::jsonb' : ''
    sets.push(`${column} = $${values.length}${cast}`)
  }

  if (!sets.length) return findUserById(userId)

  values.push(userId)
  const { rows } = await query(
    `update users
     set ${sets.join(', ')}, updated_at = now()
     where id = $${values.length}
     returning *`,
    values
  )

  return rows[0] || null
}
