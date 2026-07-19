import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'she-can-do-anything-secret-dev-key'
const JWT_EXPIRES_IN = '7d'

/**
 * Express-style middleware that extracts and verifies the Bearer token.
 * On success: sets req.user = { id, email, nickname } and calls next().
 * On failure: returns 401 JSON error.
 *
 * Also works with our custom HTTP server by wrapping the logic.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, nickname: user.nickname },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export const JWT_SECRET_CONST = JWT_SECRET

/**
 * Middleware for use with Express routers.
 * Extracts Bearer token from Authorization header.
 */
export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    res.status(401).json({ error: '未登录，请先登录' })
    return
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    res.status(401).json({ error: '登录已过期，请重新登录' })
    return
  }

  req.user = decoded
  next()
}

/**
 * Optional auth middleware — sets req.user if valid token present,
 * otherwise proceeds without user (anonymous mode).
 */
export function optionalAuthMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      req.user = decoded
    }
  }
  next()
}
