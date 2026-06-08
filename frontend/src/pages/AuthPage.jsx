import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import authService from "../services/authService"

const loginInitialState = {
  email: "",
  password: "",
}

const registerInitialState = {
  name: "",
  email: "",
  phone: "",
  password: "",
}

const createOtpState = () => Array.from({ length: 6 }, () => "")

function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("login")
  const [loginForm, setLoginForm] = useState(loginInitialState)
  const [registerForm, setRegisterForm] = useState(registerInitialState)
  const [otpValues, setOtpValues] = useState(createOtpState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [devOtp, setDevOtp] = useState("")
  const otpRefs = useRef([])

  useEffect(() => {
    if (mode !== "otp") {
      return
    }

    window.requestAnimationFrame(() => {
      otpRefs.current[0]?.focus()
    })
  }, [mode])

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError("")
    setMessage("")
  }

  const updateLoginField = (field) => (event) => {
    setLoginForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const updateRegisterField = (field) => (event) => {
    setRegisterForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1)

    setOtpValues((current) => {
      const next = [...current]
      next[index] = digit
      return next
    })

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (event) => {
    event.preventDefault()
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)

    if (!digits) {
      return
    }

    const next = createOtpState()

    digits.split("").forEach((digit, index) => {
      next[index] = digit
    })

    setOtpValues(next)
    const nextIndex = Math.min(digits.length, 5)
    otpRefs.current[nextIndex]?.focus()
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const data = await authService.login(loginForm)
      localStorage.setItem("token", data.token)
      navigate("/dashboard")
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in right now.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const data = await authService.register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      })

      setLoginForm({
        email: registerForm.email,
        password: "",
      })
      setDevOtp(data.otp ? String(data.otp) : "")
      setOtpValues(createOtpState())
      setMode("otp")
      setMessage(data.message || "Registration complete. Please verify your email.")
    } catch (submitError) {
      setError(submitError.message || "Unable to create your account.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (event) => {
    event.preventDefault()
    const otp = otpValues.join("")

    if (otp.length !== 6) {
      setError("Enter the full 6-digit OTP.")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      await authService.verifyOtp({
        email: registerForm.email,
        otp,
      })

      const loginData = await authService.login({
        email: registerForm.email,
        password: registerForm.password,
      })

      localStorage.setItem("token", loginData.token)
      navigate("/dashboard")
    } catch (submitError) {
      setError(submitError.message || "Unable to verify the OTP.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = () => {
    setMessage(
      devOtp
        ? `Dev OTP: ${devOtp}`
        : "OTP resend is not wired yet, but the current code is shown above for dev testing.",
    )
    setError("")
  }

  const handleGoogleClick = () => {
    setMessage("Google sign-in will be connected in the next phase.")
    setError("")
  }

  const emailDisplay =
    registerForm.email || loginForm.email || "your@email.com"

  const inputClass =
    "mt-2 w-full rounded-xl border border-navy-600 bg-navy-900 px-4 py-3 text-white placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,_#0D0E1A_0%,_#07080F_100%)] p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="relative z-10">
            <Link to="/" className="font-heading text-3xl font-bold text-indigo-400">
              AIFA
            </Link>
            <p className="mt-4 max-w-md text-lg leading-8 text-slate-300">
              Track your money, verify every payment, and turn daily spending into
              clear next steps.
            </p>
          </div>

          <div className="relative z-10 max-w-md space-y-4">
            <div className="rounded-2xl border border-navy-700 bg-navy-900/80 p-4">
              <p className="text-sm text-slate-400">Receipts</p>
              <p className="mt-1 font-medium text-white">
                Scan slips and extract merchant, amount, and date automatically.
              </p>
            </div>
            <div className="rounded-2xl border border-navy-700 bg-navy-900/80 p-4">
              <p className="text-sm text-slate-400">GPay</p>
              <p className="mt-1 font-medium text-white">
                Import your payment history and organize transactions in seconds.
              </p>
            </div>
            <div className="rounded-2xl border border-navy-700 bg-navy-900/80 p-4">
              <p className="text-sm text-slate-400">AI Insights</p>
              <p className="mt-1 font-medium text-white">
                Ask natural-language questions and get actionable money advice.
              </p>
            </div>
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(rgba(129,140,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.08)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
        </aside>

        <main className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-3xl border border-navy-700 bg-navy-800 p-10 shadow-2xl shadow-black/25">
            <div className="mb-8 text-center">
              <p className="font-heading text-2xl font-bold text-indigo-400 lg:hidden">
                AIFA
              </p>
              {mode === "login" && (
                <>
                  <h1 className="mt-4 font-heading text-3xl font-bold text-white">
                    Welcome back
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">
                    Sign in to your AIFA account
                  </p>
                </>
              )}
              {mode === "register" && (
                <>
                  <h1 className="mt-4 font-heading text-3xl font-bold text-white">
                    Create account
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">
                    Start managing money with AIFA
                  </p>
                </>
              )}
              {mode === "otp" && (
                <>
                  <h1 className="mt-4 font-heading text-3xl font-bold text-white">
                    Verify your email
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">{emailDisplay}</p>
                </>
              )}
            </div>

            {error ? (
              <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            ) : null}

            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <div className="relative mt-2">
                    <EnvelopeIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={updateLoginField("email")}
                      placeholder="name@company.com"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative mt-2">
                    <LockClosedIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={updateLoginField("password")}
                      placeholder="Enter your password"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                  <div className="mt-3 text-right">
                    <button
                      type="button"
                      onClick={() => setMessage("Password reset is coming soon.")}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-navy-700" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-navy-800 px-3 text-sm text-slate-400">
                      or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-navy-600 bg-white px-4 py-3 font-medium text-navy-950 transition hover:bg-slate-200"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sm font-bold text-indigo-500">
                    G
                  </span>
                  Continue with Google
                </button>

                <p className="text-center text-sm text-slate-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterForm((current) => ({
                        ...current,
                        email: loginForm.email,
                      }))
                      switchMode("register")
                    }}
                    className="font-medium text-indigo-400 transition hover:text-indigo-300"
                  >
                    Register
                  </button>
                </p>
              </form>
            )}

            {mode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div>
                  <label htmlFor="register-name" className="text-sm font-medium text-slate-300">
                    Full Name
                  </label>
                  <div className="relative mt-2">
                    <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-name"
                      type="text"
                      required
                      value={registerForm.name}
                      onChange={updateRegisterField("name")}
                      placeholder="Enter your full name"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <div className="relative mt-2">
                    <EnvelopeIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-email"
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={updateRegisterField("email")}
                      placeholder="name@company.com"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-phone" className="text-sm font-medium text-slate-300">
                    Phone Number
                  </label>
                  <div className="relative mt-2">
                    <PhoneIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-phone"
                      type="tel"
                      value={registerForm.phone}
                      onChange={updateRegisterField("phone")}
                      placeholder="9876543210"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-password" className="text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <div className="relative mt-2">
                    <LockClosedIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-password"
                      type="password"
                      required
                      value={registerForm.password}
                      onChange={updateRegisterField("password")}
                      placeholder="Create a password"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>

                <p className="text-center text-sm text-slate-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginForm((current) => ({
                        ...current,
                        email: registerForm.email,
                      }))
                      switchMode("login")
                    }}
                    className="font-medium text-indigo-400 transition hover:text-indigo-300"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}

            {mode === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="text-center text-sm text-slate-400">
                  We sent a code to <span className="text-white">{emailDisplay}</span>
                </div>

                {devOtp ? (
                  <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-center text-sm text-indigo-200">
                    Dev OTP: <span className="font-semibold text-white">{devOtp}</span>
                  </div>
                ) : null}

                <div className="grid grid-cols-6 gap-3" onPaste={handleOtpPaste}>
                  {otpValues.map((value, index) => (
                    <input
                      key={`otp-${index}`}
                      ref={(node) => {
                        otpRefs.current[index] = node
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={value}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      className="h-14 rounded-xl border border-navy-600 bg-navy-900 text-center text-xl font-semibold text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="flex w-full items-center justify-center rounded-xl border border-navy-600 bg-transparent py-3 font-semibold text-white transition hover:border-indigo-500 hover:bg-navy-900"
                >
                  Resend OTP
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to register
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AuthPage
