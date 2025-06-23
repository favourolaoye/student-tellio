import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const categories = [
  "Academic Misconduct",
  "Harassment and Discrimination",
  "Financial/Resources Misconduct",
  "Safety/Security Breaches",
  "None of the Above",
]

export async function POST(req: NextRequest) {
  const { description } = await req.json()

  const prompt = `Classify the following report description into one of these categories:
${categories.join(", ")}

Description:
"${description}"

Only reply with the most appropriate category. If none match, return "spam".`

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  })

  const category = response.choices[0].message.content?.trim()
  const result = categories.includes(category!) ? category! : "spam"

  return NextResponse.json({ category: result })
}
