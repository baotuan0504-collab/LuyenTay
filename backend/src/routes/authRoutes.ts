import axios from "axios"
import { Router } from "express"

const router = Router()

const AUTHSERVER_URL = process.env.AUTHSERVER_URL

// Handle axios error helper
const handleAxiosError = (error: unknown, res: any) => {
  if (axios.isAxiosError(error)) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Authserver error" })
  } else {
    res.status(500).json({ message: "Unknown error" })
  }
}

// Helper to get proxy headers
const getProxyHeaders = (req: any) => {
  const headers: any = {
    "Content-Type": "application/json",
  }
  const headersToForward = [
    "authorization",
    "x-signature",
    "x-timestamp",
    "x-client-type",
    "x-device-id",
    "idempotency-key",
  ]
  headersToForward.forEach((h) => {
    if (req.headers[h]) {
      headers[h] = req.headers[h]
    }
  })
  return headers
}

// Proxy register
router.post("/register", async (req, res) => {
  try {
    const response = await axios.post(
      `${AUTHSERVER_URL}/api/auth/register`,
      req.body,
      { headers: getProxyHeaders(req) },
    )
    res.status(response.status).json(response.data)
  } catch (error) {
    handleAxiosError(error, res)
  }
})

// Proxy login
router.post("/login", async (req, res) => {
  try {
    const response = await axios.post(
      `${AUTHSERVER_URL}/api/auth/login`,
      req.body,
      { headers: getProxyHeaders(req) },
    )
    res.status(response.status).json(response.data)
  } catch (error) {
    handleAxiosError(error, res)
  }
})

// Proxy refresh token
router.post("/refresh", async (req, res) => {
  try {
    const response = await axios.post(
      `${AUTHSERVER_URL}/api/auth/refresh`,
      req.body,
      { headers: getProxyHeaders(req) },
    )
    res.status(response.status).json(response.data)
  } catch (error) {
    handleAxiosError(error, res)
  }
})

// Proxy getMe (yêu cầu access token)
router.get("/me", async (req, res) => {
  try {
    const response = await axios.get(`${AUTHSERVER_URL}/api/auth/me`, {
      headers: getProxyHeaders(req),
    })
    res.status(response.status).json(response.data)
  } catch (error) {
    handleAxiosError(error, res)
  }
})

// Proxy verify-login-otp (OTP + Trust Device)
router.post("/verify-login-otp", async (req, res) => {
  try {
    const response = await axios.post(
      `${AUTHSERVER_URL}/api/auth/verify-login-otp`,
      req.body,
      { headers: getProxyHeaders(req) },
    )
    res.status(response.status).json(response.data)
  } catch (error) {
    handleAxiosError(error, res)
  }
})

// Proxy logout
router.post("/logout", async (req, res) => {
  try {
    const response = await axios.post(
      `${AUTHSERVER_URL}/api/auth/logout`,
      req.body,
      { headers: getProxyHeaders(req) },
    )
    res.status(response.status).json(response.data)
  } catch (error) {
    handleAxiosError(error, res)
  }
})

export default router
