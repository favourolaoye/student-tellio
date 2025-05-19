
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    // Format messages as required by OpenAI API
    const messages = history.concat({ role: "user", content: message })

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages,
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content?.trim() || "I'm sorry, I couldn't respond."

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error("[OpenAI Chat API Error]", error)
    return NextResponse.json(
      { error: "Failed to get a response from the assistant." },
      { status: 500 }
    )
  }
}
