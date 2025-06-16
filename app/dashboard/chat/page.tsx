"use client"
import { useState, useRef, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function ChatPage() {
  const { user, token } = useAuthStore()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(0)
  const [reportData, setReportData] = useState({ day: "", time: "", description: "" })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else {
      // Greet the user based on time
      const now = new Date()
      const hour = now.getHours()
      const greeting =
        hour < 12
          ? "Good morning!"
          : hour < 17
          ? "Good afternoon!"
          : "Good evening!"

      setMessages([
        {
          id: "0",
          content: `Hi, ${greeting} 👋`,
          sender: "bot",
          timestamp: new Date(),
        },
        {
          id: "1",
          content: "Do you have any incident you want to report?",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsSubmitting(true)

    let botReply = ""
    let updatedData = { ...reportData }

    switch (step) {
      case 0:
        if (input.toLowerCase().includes("yes")) {
          botReply = "Great. What day did the incident happen?"
          setStep(1)
        } else {
          botReply = "Okay. Let me know whenever you're ready."
          setStep(0)
        }
        break

      case 1:
        updatedData.day = input
        botReply = "Thanks. What time did it happen?"
        setReportData(updatedData)
        setStep(2)
        break

      case 2:
        updatedData.time = input
        botReply = "Got it. Please describe what happened."
        setReportData(updatedData)
        setStep(3)
        break

      case 3:
        updatedData.description = input
        botReply = "Thanks for reporting. We’ll get back to you as soon as possible."
        setReportData(updatedData)

        try {
          await axios.post("https://speakup-api-v2.onrender.com/api/report/save", {
            name: user?.name,
            email: user?.email,
            report: `Day: ${updatedData.day}\nTime: ${updatedData.time}\nIncident: ${updatedData.description}`,
          })
          // toast.success("Report submitted successfully.")
        } catch (err) {
          toast.error("Failed to submit report.")
        }

        setStep(0)
        setReportData({ day: "", time: "", description: "" })
        break

      default:
        botReply = "Can you please clarify what you mean?"
        setStep(0)
        break
    }

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botReply,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsSubmitting(false)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Incident</h1>
        <p className="text-gray-500 mt-2">Chat with our AI assistant to report incidents or issues</p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Incident Reporting Assistant</CardTitle>
          <CardDescription>
            Describe your issue and our AI assistant will help you report it properly.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-[500px] overflow-y-auto pr-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8">
                    {message.sender === "user" ? (
                      <>
                        <AvatarImage src="" alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="/bot.png" alt="Bot" />
                        <AvatarFallback>Bot</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.sender === "user"
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
        </CardContent>

        <CardFooter>
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              placeholder="Type your response..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button type="submit" disabled={isSubmitting || !input.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
