"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, Eye, EyeOff, Sprout } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-svh flex flex-col bg-[#f0f7f0]">
      {/* Top decorative section */}
      <div className="relative flex flex-col items-center justify-end pt-10 pb-7 bg-gradient-to-b from-[#2d6a4f] to-[#40916c] rounded-b-[2.5rem] shadow-lg">
        {/* Decorative circles */}
        <div className="absolute top-4 left-8 size-14 rounded-full bg-white/10" />
        <div className="absolute top-10 right-10 size-9 rounded-full bg-white/10" />
        <div className="absolute bottom-12 left-16 size-7 rounded-full bg-white/5" />

        {/* App icon */}
        <div className="relative z-10 flex items-center justify-center size-16 rounded-2xl bg-white/20 backdrop-blur-sm shadow-md mb-3">
          <Leaf className="size-8 text-white" strokeWidth={1.8} />
        </div>

        {/* App name */}
        <h1 className="relative z-10 text-xl font-bold text-white tracking-tight">
          Plantie
        </h1>
        <p className="relative z-10 text-xs text-white/70 mt-0.5">
          Track your green friends
        </p>
      </div>

      {/* Login form */}
      <div className="flex-1 flex flex-col px-6 pt-5 pb-4 max-w-md w-full mx-auto">
        <h2 className="text-lg font-semibold text-[#1b4332] mb-0.5">Welcome back</h2>
        <p className="text-sm text-[#52796f] mb-4">
          Sign in to check on your plants
        </p>

        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-[#2d6a4f] text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-[#b7e4c7] bg-white px-4 text-base placeholder:text-[#95d5b2]/70 focus-visible:border-[#40916c] focus-visible:ring-[#40916c]/20"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-[#2d6a4f] text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-[#b7e4c7] bg-white px-4 pr-12 text-base placeholder:text-[#95d5b2]/70 focus-visible:border-[#40916c] focus-visible:ring-[#40916c]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52796f] hover:text-[#2d6a4f] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs font-medium text-[#40916c] hover:text-[#2d6a4f] transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Sign in button */}
          <Button
            type="submit"
            className="h-12 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-base font-semibold shadow-md shadow-[#2d6a4f]/25 transition-all active:scale-[0.98] mt-1"
          >
            <Sprout className="size-5 mr-1" />
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[#b7e4c7]" />
          <span className="text-xs text-[#52796f]">or continue with</span>
          <div className="flex-1 h-px bg-[#b7e4c7]" />
        </div>

        {/* Social login buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            type="button"
            className="flex-1 h-12 rounded-xl border-[#b7e4c7] bg-white hover:bg-[#d8f3dc] text-[#2d6a4f] font-medium"
          >
            <svg className="size-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
          <Button
            variant="outline"
            type="button"
            className="flex-1 h-12 rounded-xl border-[#b7e4c7] bg-white hover:bg-[#d8f3dc] text-[#2d6a4f] font-medium"
          >
            <svg className="size-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06-.01-.18-.04-.56-.04-.95 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.22.05.45.05.68zm4.565 17.4c-.32.74-.68 1.42-1.08 2.06-.56.9-1.43 2.02-2.46 2.04-1.04.02-1.37-.67-2.85-.66-1.48.01-1.84.68-2.88.67-1.03-.02-1.82-1.04-2.38-1.94-1.72-2.73-1.89-5.93-.83-7.63.74-1.19 2.1-1.94 3.37-1.94 1.33 0 2.17.68 3.27.68 1.07 0 1.72-.68 3.26-.68 1.2 0 2.4.65 3.14 1.77-2.76 1.51-2.31 5.45.44 6.5zM12 0h-.09C7.6.14 4 4.02 4 8.5c0 3.14 2 5.82 4.86 7.08.44.2.78.02.83-.45.03-.28.06-.57.06-.87 0-1.08-.55-2.04-1.37-2.6-.4-.28-.66-.73-.66-1.22 0-.83.67-1.5 1.5-1.5h5.56c.83 0 1.5.67 1.5 1.5 0 .49-.26.94-.66 1.22-.82.56-1.37 1.52-1.37 2.6 0 .3.03.59.06.87.05.47.39.65.83.45C17.99 14.32 20 11.64 20 8.5 20 4.02 16.4.14 12.09 0H12z" />
            </svg>
            Apple
          </Button>
        </div>

        {/* Sign up link */}
        <div className="mt-auto pt-4 text-center">
          <p className="text-sm text-[#52796f]">
            New plant parent?{" "}
            <button
              type="button"
              className="font-semibold text-[#2d6a4f] hover:text-[#1b4332] transition-colors"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
