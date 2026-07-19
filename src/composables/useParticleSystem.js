import { ref, reactive, onUnmounted } from 'vue'

const PARTICLE_COLORS = [
  '#FFB5A7',
  '#B5D8F7',
  '#C9B1FF',
  '#FFD6A5',
  '#A8E6CF',
]

const LINE_COLOR = 'rgba(180,180,180,0.15)'
const BG_COLOR = '#F5F0E8'

const BASE_MIN = 250
const BASE_MAX = 350
const TRAIL_MAX = 150
const CONNECTION_DIST = 120
const MOUSE_ATTRACT_RADIUS = 250
const MOUSE_REPULSE_RADIUS = 60
const MOUSE_FLASH_RADIUS = 50
const TRAIL_SPAWN_MIN = 3
const TRAIL_SPAWN_MAX = 5
const TRAIL_LIFE_MIN = 40
const TRAIL_LIFE_MAX = 100
const BURST_COUNT = 8
const SHATTER_PARTICLES = 12
const SHATTER_DURATION = 600
const SPEED_MIN = -0.3
const SPEED_MAX = 0.3
const FLASH_GROW_SIZE = 8

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function randomColor() {
  return PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function getCanvasPixelRatio() {
  return window.devicePixelRatio || 1
}

/**
 * Assign a size category based on the distribution:
 * 60 % small (1-2px), 30 % medium (2-4px), 10 % large (4-8px)
 */
function rollSize() {
  const r = Math.random()
  if (r < 0.6) {
    return randomBetween(1, 2)
  }
  if (r < 0.9) {
    return randomBetween(2, 4)
  }
  return randomBetween(4, 8)
}

class Particle {
  constructor(x, y, options = {}) {
    this.x = x
    this.y = y
    this.baseSize = options.baseSize ?? rollSize()
    this.size = this.baseSize
    this.speedX = options.speedX ?? randomBetween(SPEED_MIN, SPEED_MAX)
    this.speedY = options.speedY ?? randomBetween(SPEED_MIN, SPEED_MAX)
    this.color = options.color ?? randomColor()
    this.alpha = options.alpha ?? 1
    this.trail = []
    this.questionData = options.questionData ?? null
    this.isFlashing = false
    this.flashTimer = 0
    this.isShattering = false
    this.isBurst = options.isBurst ?? false
    this.isTrail = options.isTrail ?? false
    this.life = options.life ?? Infinity
  }

  pushTrail() {
    this.trail.push({ x: this.x, y: this.y })
    if (this.trail.length > 10) {
      this.trail.shift()
    }
  }

  update(canvasWidth, canvasHeight, mouseX, mouseY) {
    if (this.isShattering) {
      return
    }

    // Decay lifetime for trail / burst particles
    if (this.life !== Infinity) {
      this.life--
      if (this.life <= 0) {
        this.alpha = 0
        return
      }
      // Fade trail particles as they age
      const fadeStart = this.isTrail ? TRAIL_LIFE_MIN : 30
      if (this.life < fadeStart) {
        this.alpha = this.life / fadeStart
      }
    }

    // Mouse interaction
    if (mouseX !== null && mouseY !== null) {
      const mdx = mouseX - this.x
      const mdy = mouseY - this.y
      const dist = Math.sqrt(mdx * mdx + mdy * mdy)

      if (dist < MOUSE_REPULSE_RADIUS && dist > 0) {
        // Very close: slight repulsion to prevent overlap
        const force = (MOUSE_REPULSE_RADIUS - dist) / MOUSE_REPULSE_RADIUS
        this.speedX -= (mdx / dist) * force * 0.12
        this.speedY -= (mdy / dist) * force * 0.12
      } else if (dist < MOUSE_ATTRACT_RADIUS && dist > 0) {
        // Within attraction range: gravity pull toward mouse
        const force = (MOUSE_ATTRACT_RADIUS - dist) / MOUSE_ATTRACT_RADIUS
        this.speedX += (mdx / dist) * force * 0.06
        this.speedY += (mdy / dist) * force * 0.06
      }

      // Flash / glow when mouse is very close
      if (dist < MOUSE_FLASH_RADIUS && !this.isFlashing) {
        this.isFlashing = true
        this.flashTimer = 30
      }
    }

    // Flash animation
    if (this.isFlashing) {
      this.flashTimer--
      if (this.flashTimer <= 0) {
        this.isFlashing = false
        this.size = this.baseSize
        this.alpha = this.life !== Infinity ? clamp(this.life / TRAIL_LIFE_MIN, 0, 1) : 1
      } else {
        const t = this.flashTimer / 30
        this.size = this.baseSize + (FLASH_GROW_SIZE - this.baseSize) * t
        this.alpha = Math.min(1, 0.7 + 0.3 * t)
      }
    }

    // Clamp speed
    this.speedX = clamp(this.speedX, SPEED_MIN, SPEED_MAX)
    this.speedY = clamp(this.speedY, SPEED_MIN, SPEED_MAX)

    this.x += this.speedX
    this.y += this.speedY

    // Boundary bounce (trail particles can die at edges)
    if (!this.isTrail) {
      if (this.x - this.size < 0) {
        this.x = this.size
        this.speedX *= -1
      }
      if (this.x + this.size > canvasWidth) {
        this.x = canvasWidth - this.size
        this.speedX *= -1
      }
      if (this.y - this.size < 0) {
        this.y = this.size
        this.speedY *= -1
      }
      if (this.y + this.size > canvasHeight) {
        this.y = canvasHeight - this.size
        this.speedY *= -1
      }
    }

    this.pushTrail()
  }

  draw(ctx) {
    if (this.alpha <= 0) {
      return
    }

    ctx.save()
    ctx.globalAlpha = this.alpha

    // Draw trail
    if (this.trail.length > 1) {
      ctx.beginPath()
      ctx.moveTo(this.trail[0].x, this.trail[0].y)
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x, this.trail[i].y)
      }
      ctx.strokeStyle = this.color
      ctx.lineWidth = Math.max(0.5, this.size * 0.3)
      ctx.globalAlpha = this.alpha * 0.3
      ctx.stroke()
    }

    ctx.restore()
    ctx.save()
    ctx.globalAlpha = this.alpha

    // Glow halo (semi-transparent ring behind the particle)
    const glowRadius = this.size * 2.5
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius)
    gradient.addColorStop(0, this.color + '40')
    gradient.addColorStop(0.6, this.color + '18')
    gradient.addColorStop(1, this.color + '00')
    ctx.beginPath()
    ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.globalAlpha = this.alpha * 0.5
    ctx.fill()

    // Core particle
    ctx.restore()
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.restore()
  }
}

export function useParticleSystem() {
  const canvasRef = ref(null)
  const ctx = ref(null)
  const particles = reactive([])
  const animationId = ref(null)
  const particleCount = ref(0)
  const canvasWidth = ref(0)
  const canvasHeight = ref(0)

  // Reactive questions pool for click-to-reveal
  const questions = reactive([])

  let mouseX = null
  let mouseY = null
  let resizeObserver = null
  let trailCount = 0

  function resolveParticleCount() {
    const area = canvasWidth.value * canvasHeight.value
    const ratio = area / (1920 * 1080)
    return Math.round(BASE_MIN + (BASE_MAX - BASE_MIN) * clamp(ratio, 0, 1))
  }

  function createParticle(x, y, options = {}) {
    const p = new Particle(x, y, options)
    if (options.isTrail) {
      trailCount++
    }
    particles.push(p)
    return p
  }

  function removeDeadTrailParticles() {
    // Oldest trail particles first — trim when over TRAIL_MAX
    if (trailCount <= TRAIL_MAX) {
      return
    }
    let removed = 0
    const excess = trailCount - TRAIL_MAX
    for (let i = 0; i < particles.length && removed < excess; i++) {
      if (particles[i].isTrail) {
        particles[i].life = 0
        removed++
      }
    }
  }

  function initParticles(questionData) {
    particles.length = 0
    trailCount = 0
    const count = resolveParticleCount()

    for (let i = 0; i < count; i++) {
      const x = randomBetween(0, canvasWidth.value)
      const y = randomBetween(0, canvasHeight.value)
      createParticle(x, y, { questionData: questionData?.[i % questionData.length] ?? null })
    }

    particleCount.value = particles.length
  }

  function setupCanvas(canvasElement) {
    const dpr = getCanvasPixelRatio()
    const rect = canvasElement.getBoundingClientRect()

    canvasWidth.value = rect.width
    canvasHeight.value = rect.height

    canvasElement.width = rect.width * dpr
    canvasElement.height = rect.height * dpr

    const context = canvasElement.getContext('2d')
    context.scale(dpr, dpr)
    ctx.value = context

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          canvasWidth.value = width
          canvasHeight.value = height
          canvasElement.width = width * dpr
          canvasElement.height = height * dpr
          context.scale(dpr, dpr)
        }
      }
    })
    resizeObserver.observe(canvasElement)
  }

  function drawBackground() {
    if (!ctx.value) return
    ctx.value.fillStyle = BG_COLOR
    ctx.value.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  }

  function drawConnections() {
    if (!ctx.value) return

    const active = particles.filter((p) => p.alpha > 0 && !p.isShattering)

    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i]
        const b = active[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.15
          ctx.value.beginPath()
          ctx.value.moveTo(a.x, a.y)
          ctx.value.lineTo(b.x, b.y)
          ctx.value.strokeStyle = LINE_COLOR
          ctx.value.globalAlpha = alpha
          ctx.value.lineWidth = 0.5
          ctx.value.stroke()
          ctx.value.globalAlpha = 1
        }
      }
    }
  }

  function updateAndDraw() {
    if (!ctx.value) return

    drawBackground()

    // Update & prune dead particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      if (p.life <= 0) {
        if (p.isTrail) trailCount--
        particles.splice(i, 1)
        continue
      }
      p.update(canvasWidth.value, canvasHeight.value, mouseX, mouseY)
    }

    drawConnections()

    for (const p of particles) {
      p.draw(ctx.value)
    }

    particleCount.value = particles.length
  }

  function animationLoop() {
    updateAndDraw()
    animationId.value = requestAnimationFrame(animationLoop)
  }

  function init(canvas, questionData) {
    canvasRef.value = canvas
    setupCanvas(canvas)
    initParticles(questionData)
  }

  function start() {
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }
    animationId.value = requestAnimationFrame(animationLoop)
  }

  function stop() {
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
      animationId.value = null
    }
  }

  /**
   * Called on mousemove — updates mouse position AND spawns trail particles.
   */
  function setMouse(clientX, clientY) {
    if (!canvasRef.value) return
    const rect = canvasRef.value.getBoundingClientRect()
    mouseX = clientX - rect.left
    mouseY = clientY - rect.top

    // Spawn 2-3 trail particles at mouse position
    const spawnCount = Math.floor(randomBetween(TRAIL_SPAWN_MIN, TRAIL_SPAWN_MAX + 1))
    removeDeadTrailParticles()
    for (let i = 0; i < spawnCount; i++) {
      const angle = randomBetween(0, Math.PI * 2)
      const spread = randomBetween(0, 8)
      createParticle(
        mouseX + Math.cos(angle) * spread,
        mouseY + Math.sin(angle) * spread,
        {
          baseSize: randomBetween(1, 2.5),
          speedX: randomBetween(-0.5, 0.5),
          speedY: randomBetween(-0.5, 0.5),
          life: Math.floor(randomBetween(TRAIL_LIFE_MIN, TRAIL_LIFE_MAX + 1)),
          isTrail: true,
        }
      )
    }
  }

  /**
   * Click-to-reveal: always returns a question result with a random offset.
   * Picks a random pending question from the reactive questions list.
   */
  function handleClick(clientX, clientY) {
    if (!canvasRef.value) return null

    const rect = canvasRef.value.getBoundingClientRect()
    const clickX = clientX - rect.left
    const clickY = clientY - rect.top

    // Burst particles at click point
    for (let i = 0; i < BURST_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / BURST_COUNT + randomBetween(-0.3, 0.3)
      const speed = randomBetween(0.8, 2.5)
      createParticle(clickX, clickY, {
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        baseSize: randomBetween(2, 5),
        color: randomColor(),
        life: randomBetween(40, 90),
        isBurst: true,
      })
    }

    // Pick a random question from the pool
    let questionData = null
    if (questions.length > 0) {
      const idx = Math.floor(Math.random() * questions.length)
      questionData = questions[idx]
    }

    const color = randomColor()
    return {
      questionData,
      x: clickX + randomBetween(-30, 30),
      y: clickY + randomBetween(-30, 30),
      color,
    }
  }

  /**
   * Update the questions pool used by handleClick.
   */
  function setQuestions(questionsArray) {
    questions.length = 0
    if (Array.isArray(questionsArray)) {
      questions.push(...questionsArray)
    }
  }

  function shatterParticle(x, y, color) {
    return new Promise((resolve) => {
      if (!ctx.value) {
        resolve(false)
        return
      }

      const originalIndex = particles.findIndex(
        (p) =>
          !p.isShattering &&
          Math.abs(p.x - x) < 5 &&
          Math.abs(p.y - y) < 5 &&
          p.color === color
      )

      if (originalIndex === -1) {
        resolve(false)
        return
      }

      const original = particles[originalIndex]
      original.isShattering = true

      const fragments = []
      for (let i = 0; i < SHATTER_PARTICLES; i++) {
        const angle = (Math.PI * 2 * i) / SHATTER_PARTICLES + randomBetween(-0.2, 0.2)
        const speed = randomBetween(1, 3)
        const fragment = createParticle(original.x, original.y, {
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
          baseSize: randomBetween(1, 2.5),
          color,
          life: randomBetween(20, 50),
          isBurst: true,
        })
        fragments.push(fragment)
      }

      if (original.isTrail) trailCount--
      particles.splice(originalIndex, 1)

      const startTime = performance.now()
      const animate = (now) => {
        const elapsed = now - startTime
        const progress = elapsed / SHATTER_DURATION

        if (progress >= 1) {
          for (const f of fragments) {
            f.life = 0
          }
          resolve(true)
          return
        }

        for (const f of fragments) {
          if (f.life > 0) {
            f.update(canvasWidth.value, canvasHeight.value, null, null)
            f.alpha = 1 - progress
          }
        }

        requestAnimationFrame(animate)
      }

      requestAnimationFrame(animate)
    })
  }

  function clearMouse() {
    mouseX = null
    mouseY = null
  }

  function cleanup() {
    stop()
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }

  onUnmounted(cleanup)

  return {
    init,
    start,
    stop,
    handleClick,
    setMouse,
    clearMouse,
    setQuestions,
    shatterParticle,
    canvasRef,
    particleCount,
    canvasWidth,
    canvasHeight,
    particles,
    cleanup,
  }
}

export default useParticleSystem
