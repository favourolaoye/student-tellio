"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const router = useRouter();
  
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  })

  // useEffect(() => {
  //   setTimeout(() => {
  //     setLoading(false)
  //   }, 1000)
  // })


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-gray-500 mt-2">View and manage your personal information</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Your contact and account information</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={user?.name || ""}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    value={user?.email || ""}
                    disabled={true} 
                  />
                </div>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex">
            <Button onClick={() => setEditing(false)} disabled={loading}>
              Edit Profile
            </Button>
          
        </CardFooter>
      </Card>
    </div>
  )
}
