import { Link } from "react-router-dom"
import { ArrowRightIcon } from "@heroicons/react/24/outline"

const featureCards = [
  {
    emoji: "🧾",
    title: "Scan Receipts",
    description:
      "Upload any payment slip and our OCR extracts merchant, amount and date instantly.",
  },
  {
    emoji: "📱",
    title: "GPay Import",
    description:
      "Upload your Google Pay activity.html and get all transactions parsed automatically.",
  },
  {
    emoji: "🤖",
    title: "AI Assistant",
    description:
      "Ask questions about your spending and get intelligent answers powered by Groq LLM.",
  },
  {
    emoji: "📊",
    title: "Smart Analytics",
    description:
      "Visual breakdowns of your spending with predictions for next month.",
  },
  {
    emoji: "📄",
    title: "PDF Reports",
    description:
      "Generate professional financial reports with charts and AI insights.",
  },
  {
    emoji: "🔔",
    title: "Notifications",
    description:
      "Get email and SMS alerts for spending reminders and monthly summaries.",
  },
]

const steps = [
  {
    number: "1",
    title: "Create Account",
    description: "Sign up with email or Google in under 30 seconds.",
  },
  {
    number: "2",
    title: "Add Your Data",
    description: "Scan slips, import GPay, or add expenses manually.",
  },
  {
    number: "3",
    title: "Get Insights",
    description: "Let AIFA analyze your spending and guide you forward.",
  },
]

function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-navy-700 bg-navy-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-heading text-2xl font-bold text-indigo-400">
            AIFA
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              How it works
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center rounded-full border border-indigo-500/50 px-4 py-2 text-sm font-medium text-white transition hover:border-indigo-400 hover:bg-indigo-500/10"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Get Started
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24">
        <section className="relative isolate overflow-hidden bg-navy-950">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(129,140,248,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.12)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
          <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute left-0 top-32 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
            <span className="mb-6 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300">
              AI-Powered Finance
            </span>

            <h1 className="max-w-4xl font-heading text-4xl font-bold leading-tight text-white md:text-6xl">
              <span className="block">Your Money, Finally</span>
              <span className="block">Under Control</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
              AIFA tracks your expenses, reads your receipts, imports your GPay
              history, and gives you AI-powered insights - all in one place.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Start for Free
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-navy-700 bg-navy-900/60 px-6 py-3 text-sm font-semibold text-white transition hover:border-indigo-500/60 hover:bg-navy-800"
              >
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-navy-700 bg-navy-900/80 px-4 py-2">
                🔒 Secure
              </span>
              <span className="rounded-full border border-navy-700 bg-navy-900/80 px-4 py-2">
                ⚡ Real-time
              </span>
              <span className="rounded-full border border-navy-700 bg-navy-900/80 px-4 py-2">
                🤖 AI Powered
              </span>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-28 border-y border-navy-700 bg-navy-900/60 py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">
                Features
              </p>
              <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
                Everything you need to manage money
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className="group rounded-2xl border border-navy-700 bg-navy-800 p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-navy-700/80"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-navy-600 bg-navy-900 text-3xl">
                    <span aria-hidden="true">{card.emoji}</span>
                  </div>
                  <h3 className="mt-5 font-heading text-xl font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-28 bg-navy-950 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">
                Process
              </p>
              <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
                Get started in 3 steps
              </h2>
            </div>

            <div className="relative mt-14">
              <div className="hidden md:block absolute left-24 right-24 top-8 border-t border-dashed border-navy-600" />
              <div className="grid gap-8 md:grid-cols-3">
                {steps.map((step) => (
                  <article
                    key={step.number}
                    className="relative rounded-2xl border border-navy-700 bg-navy-900 p-6 pt-10 text-center"
                  >
                    <div className="absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-indigo-600 font-heading text-2xl font-bold text-white shadow-lg shadow-indigo-600/20">
                      {step.number}
                    </div>
                    <h3 className="mt-6 font-heading text-xl font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-28 border-y border-navy-700 bg-navy-800 py-10">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            <div className="rounded-2xl border border-navy-700 bg-navy-900 px-4 py-6 text-center">
              <p className="font-heading text-3xl font-bold text-white">10,000+</p>
              <p className="mt-2 text-sm text-slate-400">Users</p>
            </div>
            <div className="rounded-2xl border border-navy-700 bg-navy-900 px-4 py-6 text-center">
              <p className="font-heading text-3xl font-bold text-white">₹50Cr+</p>
              <p className="mt-2 text-sm text-slate-400">Tracked</p>
            </div>
            <div className="rounded-2xl border border-navy-700 bg-navy-900 px-4 py-6 text-center">
              <p className="font-heading text-3xl font-bold text-white">99.9%</p>
              <p className="mt-2 text-sm text-slate-400">Uptime</p>
            </div>
            <div className="rounded-2xl border border-navy-700 bg-navy-900 px-4 py-6 text-center">
              <p className="font-heading text-3xl font-bold text-white">&lt; 2s</p>
              <p className="mt-2 text-sm text-slate-400">AI Response</p>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-navy-700 bg-navy-900 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-heading text-2xl font-bold text-indigo-400">AIFA</p>
            <p className="mt-2 text-sm text-slate-400">Your AI Finance Assistant</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
            <a href="#about" className="transition hover:text-white">
              Privacy
            </a>
            <a href="#about" className="transition hover:text-white">
              Terms
            </a>
            <a href="#contact" className="transition hover:text-white">
              Contact
            </a>
          </div>

          <p className="text-sm text-slate-400">© 2024 AIFA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
