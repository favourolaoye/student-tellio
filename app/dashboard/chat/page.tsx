"use client"
import type React from "react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    content: "Hello! I'm your Tellio assistant. How can I help you today?",
    sender: "bot",
    timestamp: new Date(),
  },
  {
    id: "2",
    content: "You can report any incidents or issues you're facing, and I'll help guide you through the process.",
    sender: "bot",
    timestamp: new Date(),
  },
]

export default function ChatPage() {
  const { user, token } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportContent, setReportContent] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

    try {
      const { data } = await axios.post(
        "/api/chat",
        {
          message: input,
          history: [...messages, userMessage].map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      toast.error("Failed to get assistant response.")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openReportDialog = () => {
    const reportText = messages
      .filter((m) => m.sender === "user")
      .map((m) => m.content)
      .join("\n\n")

    setReportContent(reportText)
    setIsReportModalOpen(true)
  }

  const handleReportSubmit = async () => {
    if (!token) {
      toast.error("User information is missing.");
      return;
    }
    try {
      setIsSubmitting(true)
      await axios.post("https://speakup-api-v2.onrender.com/api/report/save",{name: user?.name, email: user?.email, report: reportContent})
      toast.success("Report submitted successfully.")
      setIsReportModalOpen(false)
    } catch (error) {
      toast.error("Failed to submit report.")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

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
            Describe your issue and our AI assistant will help you report it properly
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
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="/placeholder.svg" alt="Tellio" />
                        <AvatarFallback>T</AvatarFallback>
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

        <CardFooter className="flex flex-col gap-3">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              placeholder="Describe your issue..."
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

          <div className="w-full flex justify-end">
            <Button variant="outline" onClick={openReportDialog}>
              Submit Report
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review and Submit Your Report</DialogTitle>
            <DialogDescription>
              Please review or edit your report before submitting.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            className="min-h-[200px]"
          />
          <DialogFooter>
            <Button onClick={handleReportSubmit} disabled={isSubmitting}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
