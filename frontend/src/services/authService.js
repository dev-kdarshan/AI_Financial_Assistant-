import api from "./api"

const readStoredUser = () => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const rawUser = localStorage.getItem("user")
    return rawUser ? JSON.parse(rawUser) : null
  } catch {
    return null
  }
}

const storeUser = (user) => {
  if (typeof window === "undefined") {
    return
  }

  const currentUser = readStoredUser() || {}
  localStorage.setItem("user", JSON.stringify({ ...currentUser, ...user }))
}

const register = (payload) =>
  api.post("/auth/register", payload).then((response) => {
    storeUser({
      name: payload.name,
      email: payload.email,
      phone: payload.phone || "",
    })

    return response.data
  })

const verifyOtp = (payload) =>
  api.post("/auth/verify-otp", payload).then((response) => response.data)

const login = (payload) =>
  api.post("/auth/login", payload).then((response) => {
    const storedUser = readStoredUser()

    storeUser({
      name: storedUser?.name || payload.email?.split("@")?.[0] || "AIFA User",
      email: payload.email,
      phone: storedUser?.phone || "",
    })

    return response.data
  })

const googleLogin = (payload) =>
  api.post("/auth/google-login", payload).then((response) => {
    storeUser({
      name: payload.name || payload.email?.split("@")?.[0] || "AIFA User",
      email: payload.email,
      googleId: payload.googleId || "",
    })

    return response.data
  })

const authService = {
  register,
  verifyOtp,
  login,
  googleLogin,
}

export { register, verifyOtp, login, googleLogin }

export default authService
