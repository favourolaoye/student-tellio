"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios"
import Cookies from "js-cookie"


export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setUser  = useAuthStore((state) => state.setUser)
  const isLoading = useAuthStore((state) => state.loading);
  const setToken = useAuthStore((state) => state.setToken);
  const setIsLoading = useAuthStore((state) => state.setLoading);
  // const token = useAuthStore((state) => state.token)
  


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let response = await axios.post("https://speakup-api-v2.onrender.com/api/student/login", {email, password})
      const {msg, studentData, token} = response.data;
      toast.success(msg);
      const serilized = JSON.stringify(studentData);
      setUser(studentData);
      setToken(token);
      Cookies.set('token', token, { expires: 7 });
      Cookies.set('user', serilized, { expires: 7 });
      toast.success(msg)
      setIsLoading(false);
      router.push("/dashboard")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.msg || 'Something went wrong';
        toast.error(errorMsg);
      } else {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred.');
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Tellio</h1>
            <p className="text-gray-600 mt-2 text-left">Login to access tellio</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-black hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-medium text-black hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
