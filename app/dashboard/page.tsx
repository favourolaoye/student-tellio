"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { MessageSquare, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query";
import axios from "axios"
interface Incident {
  id: string
  title: string
  status: "open" | "in-progress" | "resolved"
  date: string
  type: string
}


export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const setReport = useAuthStore((state) => state.setReport);
  const report = useAuthStore((state) => state.report);
 

  const fetchReports = async () => {
  const response = await axios.get("https://speakup-api-v2.onrender.com/api/report/retrieve");
  return response.data; 
};

const { isPending, data, error } = useQuery({
  queryKey: ["reports"],
  queryFn: fetchReports,
});

  if (!user) {
    return null
  }

  if (isPending) {
    console.log("loading..")
  }

useEffect(() => {
  if (data) {
    setReport(data);
  }
}, [data, setReport]);


  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-red-500 bg-red-50"
      case "in-progress":
        return "text-amber-500 bg-amber-50"
      case "resolved":
        return "text-green-500 bg-green-50"
      default:
        return "text-gray-500 bg-gray-50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4" />
      case "in-progress":
        return <MessageSquare className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-400 mt-2 font-semibold">
            Welcome back, {user.name}.
          </p>
        </div>
        <Link href="/dashboard/chat">
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Report New Incident
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold">{report?.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold">{report?.filter((inc) => inc.category === "spam").length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-3xl font-bold">{report?.filter((inc) => inc.category === "spam").length}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>Your recently reported incidents and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (report ?? []).length > 0 ? (
            <div className="space-y-4">
              {(report ?? []).map((incident) => (
                <div
                  key={incident._id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-full ${getStatusColor(incident.status)} flex items-center justify-center`}
                    >
                      {getStatusIcon(incident.status)}
                    </div>
                    <div>
                      <h3 className="font-medium">{incident.title}</h3>
                      <div className="flex gap-2 text-sm text-gray-500">
                        <span>{incident._id}</span>
                        <span>•</span>
                        <span>{incident.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(
                        incident.status,
                      )}`}
                    >
                      {incident.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No incidents reported yet.</p>
              <Link href="/dashboard/chat" className="mt-2 inline-block">
                <Button variant="outline" size="sm">
                  Report your first incident
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
