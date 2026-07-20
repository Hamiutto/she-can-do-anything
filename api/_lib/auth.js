import { createHmac, timingSafeEqual } from 'node:crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'she-can-do-anything-secret-dev-key'
const JWT_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

function base64UrlEncode(value) {
  const input = typeof value === 'string' ? value : JSON.stringify(value)
  return Buffer.from(input)
    .toString('base64url')
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(input) {
  return createHmac('sha256', JWT_SECRET)
    .update(input)
    .digest('base64url')
}

export function signToken(user) {
  const header = base64UrlEncode({ alg: 'HS256', typ: 'JWT' })
  const payload = base64UrlEncode({
    userId: user.id,
    email: user.email,
    nickname: user.nickname,
    exp: Math.floor(Date.now() / 1000) + JWT_MAX_AGE_SECONDS,
  })
  const signature = sign(`${header}.${payload}`)
  return `${header}.${payload}.${signature}`
}

export function verifyRequest(req) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return null

  const [encodedHeader, payload, signature] = token.split('.')
  if (!encodedHeader || !payload || !signature) return null

  const expected = sign(`${encodedHeader}.${payload}`)
  const expectedBuffer = Buffer.from(expected)
  const actualBuffer = Buffer.from(signature)

  if (expectedBuffer.length !== actualBuffer.length) return null
  if (!timingSafeEqual(expectedBuffer, actualBuffer)) return null

  try {
    const decoded = JSON.parse(base64UrlDecode(payload))
    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) return null
    return decoded
  } catch {
    return null
  }
}
