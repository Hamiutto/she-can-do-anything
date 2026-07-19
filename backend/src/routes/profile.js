import { findUserById, updateUserProfile, sanitizeUser } from '../db/users.js'

/**
 * GET /api/profile
 * Requires: Authorization: Bearer <token>
 * Returns the current user's full profile.
 */
export function handleGetProfile(sendJson, user) {
  if (!user) {
    sendJson(401, { error: '未登录' })
    return
  }
  const fullUser = findUserById(user.userId)
  if (!fullUser) {
    sendJson(404, { error: '用户不存在' })
    return
  }
  sendJson(200, { user: sanitizeUser(fullUser) })
}

/**
 * PUT /api/profile
 * Requires: Authorization: Bearer <token>
 * Body: partial or full profile fields
 */
export async function handleUpdateProfile(sendJson, body, user) {
  if (!user) {
    sendJson(401, { error: '未登录' })
    return
  }

  const updated = updateUserProfile(user.userId, body)
  if (!updated) {
    sendJson(404, { error: '用户不存在' })
    return
  }

  sendJson(200, { user: sanitizeUser(updated) })
}

/**
 * GET /api/profile/:userId
 * No auth required — public profile.
 */
export function handleGetPublicProfile(sendJson, userId) {
  const id = Number(userId)
  if (!id || !Number.isFinite(id)) {
    sendJson(400, { error: '无效的用户 ID' })
    return
  }

  const user = findUserById(id)
  if (!user) {
    sendJson(404, { error: '用户不存在' })
    return
  }

  // Only expose public fields
  const publicUser = {
    id: user.id,
    nickname: user.nickname || '匿名用户',
    city: user.city,
    age: user.age,
    education: user.education,
    industry: user.industry,
    marriage: user.marriage,
    tagline: user.tagline,
    lifeStory: user.lifeStory,
    canHelp: user.canHelp,
    expertise: user.expertise,
    referrer: user.referrer,
    timeTags: user.timeTags,
    hobbies: user.hobbies,
    mbti: user.mbti,
    created_at: user.created_at,
  }

  sendJson(200, { user: publicUser })
}
