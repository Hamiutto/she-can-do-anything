import express from "express"
import cors from "cors"
import { initDb } from "./db/database.js"
import questionsRouter from "./routes/questions.js"
import notificationsRouter from "./routes/notifications.js"

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/questions", questionsRouter)
app.use("/api/notifications", notificationsRouter)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Initialize database with schema and seed data
initDb()

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})
