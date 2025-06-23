"use client"

import { useState, useRef, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
// import { classifyReport } from "@/app/api/classify/route"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

type Step =
  | "askIncident"
  | "askDate"
  | "askTime"
  | "askDescription"
  | "askLecturerInvolved"
  | "askLecturerName"
  | "submitReport"
  | "completed"

export default function ChatPage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<Step>("askIncident")
  const [reportCategory, setReportCategory] = useState<string | null>(null) // ✅ New state
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

  const [reportData, setReportData] = useState({
    date: "",
    time: "",
    description: "",
    lecturerInvolved: "",
    lecturerName: "",
  })

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

  const classifyReport = async (description: string): Promise<string> => {
  const res = await fetch("/api/classify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ description })
  })

  if (!res.ok) throw new Error("Failed to classify")

  const data = await res.json()
  return data.category
}

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const botReply = async (text: string) => {
    await delay(1200)
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: text,
        sender: "bot",
        timestamp: new Date(),
      },
    ])
  }

  const resetConversation = async () => {
    await delay(15000)
    setMessages([])
    setReportData({
      date: "",
      time: "",
      description: "",
      lecturerInvolved: "",
      lecturerName: "",
    })
    setReportCategory(null) 
    setStep("askIncident")
    botReply(`${getGreeting()}! Do you have another incident you'd like to report?`)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: generateId(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const text = input.trim().toLowerCase()
    setInput("")

    switch (step) {
      case "askIncident":
        if (text.includes("yes")) {
          setStep("askDate")
          await botReply("Great! What day did the incident happen? (e.g July 10 2025)")
        } else {
          await botReply("Alright. Let me know if anything comes up.")
        }
        break

      case "askDate":
        setReportData((r) => ({ ...r, date: input }))
        setStep("askTime")
        await botReply("Thanks. What time did it happen?")
        break

      case "askTime":
        setReportData((r) => ({ ...r, time: input }))
        setStep("askDescription")
        await botReply("Please describe what happened.")
        break

      case "askDescription":
        setReportData((r) => ({ ...r, description: input }))
        try {
          const category = await classifyReport(input) // ✅ Classify
          setReportCategory(category)
          await botReply(`Thank you. This may fall under: **${category}**.`)
        } catch (err) {
          console.error("Classification failed:", err)
          await botReply("Thanks. We'll proceed.")
        }
        setStep("askLecturerInvolved")
        await botReply("Was a lecturer involved? (yes/no)")
        break

      case "askLecturerInvolved":
        if (text.includes("yes")) {
          setReportData((r) => ({ ...r, lecturerInvolved: "yes" }))
          setStep("askLecturerName")
          await botReply("Please provide the lecturer’s name (or say 'prefer not to say').")
        } else {
          setReportData((r) => ({ ...r, lecturerInvolved: "no" }))
          setStep("submitReport")
          handleFinalSubmission()
        }
        break

      case "askLecturerName":
        setReportData((r) => ({ ...r, lecturerName: input }))
        setStep("submitReport")
        handleFinalSubmission()
        break

      default:
        break
    }
  }

  const handleFinalSubmission = async () => {
    await botReply("Thanks for reporting. We're submitting your report now...")
    try {
      setIsSubmitting(true)
      await delay(1000)

      await axios.post("https://speakup-api-v2.onrender.com/api/report/save", {
        name: user?.name || "Anonymous",
        email: user?.email || "N/A",
        report: `
          Date: ${reportData.date}
          Time: ${reportData.time}
          Description: ${reportData.description}
          Lecturer Involved: ${reportData.lecturerInvolved}
          Lecturer Name: ${reportData.lecturerName || "N/A"}
        `,
      })

      await botReply("Thank you. Your report has been received. We’ll get back to you as soon as possible.")
      setStep("completed")
      resetConversation()
    } catch (error) {
      toast.error("Failed to submit report.")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    botReply(`${getGreeting()}! Do you have any incident you'd like to report?`)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Report Incident</h1>
      <p className="text-gray-500 mt-2">Chat with our AI assistant to report incidents or issues</p>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Incident Reporting Assistant</CardTitle>
          <CardDescription>
            Our assistant will guide you through your report. Please answer the questions step by step.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-[500px] overflow-y-auto pr-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{message.sender === "user" ? "U" : "T"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 ${message.sender === "user"
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-900"
                        }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {reportCategory && step !== "completed" && (
            <p className="text-sm mt-4 text-blue-600 font-medium">
              🧠 Detected Category: <strong>{reportCategory}</strong>
            </p>
          )}
        </CardContent>

        <CardFooter>
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSubmitting || step === "completed"}
              className="flex-1"
            />
            <Button type="submit" disabled={isSubmitting || !input.trim() || step === "completed"}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
