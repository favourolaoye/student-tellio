
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const classifyReport = async (description: string): Promise<string> => {
  const categories = [
    "Academic Misconduct",
    "Harassment and Discrimination",
    "Financial/Resources Misconduct",
    "Safety/Security Breaches",
    "None of the Above",
  ]

  const prompt = `Classify the following report description into one of these categories:
${categories.join(", ")}

Description:
"${description}"

Only reply with the most appropriate category. If none match, return "None of the Above".`

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  })

  const category = response.choices[0].message.content?.trim()
  return categories.includes(category!) ? category! : "None of the Above"
}
