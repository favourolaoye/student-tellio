"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios";
import Cookies from "js-cookie";

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");

  // GLOBAL STATES
  const loading = useAuthStore((state) => state.loading)
  const setLoading = useAuthStore((state) => state.setLoading)

  const handleChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
 
    if(password !== confirm){
      toast.error("password mismatch");
      return
    }   
    setLoading(true);
    try {
      const res = await axios.post('https://speakup-api-v2.onrender.com/api/student/register', { username, email, password });
      const { msg } = res.data;
      console.log(res)
      console.log(msg);
      toast.success(msg);
      setLoading(false);
      router.push("/login")

    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.msg || 'Something went wrong';
        toast.error(errorMsg);
        if (errorMsg === "Student already exists") {
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
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
            <h1 className="text-xl font-bold">Tellio</h1>
            <p className="text-gray-600 mt-2">Register your account</p>
          </div>

          <form onSubmit={handleChange} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

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

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                 onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-black hover:underline">
                Login
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
