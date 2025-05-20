"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { LogOut, User, MessageSquare, Home } from "lucide-react"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const user  = useAuthStore((state) =>  state.user);
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)
  const setLoading = useAuthStore((state) => state.setLoading)
  const queryClient = new QueryClient();
  console.log(user);
  // Use a string property from user, e.g., user.name or user.email
  const username = user ? user.name || user.email || "User" : "";
  useEffect(() => {
    if (!token) {
      router.push("/login")
    }
  }, [token, router])

  const handleLogout = () => {
    toast.error("Logged out")
    setToken(null)
    setUser(null) 
    router.push("/login");
    Cookies.remove('user');
    Cookies.remove('token');   
    setLoading(false);
  }


  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold">
            Tellio
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden md:inline-block">Welcome, {username}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-700 hover:text-black">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-16 md:w-64 bg-gray-50 border-r border-gray-200 shrink-0">
          <nav className="p-4 space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-5 w-5 mr-2" />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-5 w-5 mr-2" />
                <span className="hidden md:inline">My Profile</span>
              </Button>
            </Link>
            <Link href="/dashboard/chat">
              <Button variant="ghost" className="w-full justify-start">
                <MessageSquare className="h-5 w-5 mr-2" />
                <span className="hidden md:inline">Report Incident</span>
              </Button>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 bg-gray-50">
          <QueryClientProvider client={queryClient}>
            <div className="container mx-auto p-6">{children}</div>
          </QueryClientProvider>
          
        </main>
      </div>
    </div>
  )
}
