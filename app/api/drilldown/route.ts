import OpenAI from "openai"
import { buildPrompt } from "@/lib/prompt-builder"
import type { DrilldownNode } from "@/lib/types"

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
})

export async function POST(request: Request) {
  const body = await request.json() as { node: DrilldownNode }
  const { node } = body

  if (!node || !node.label || !node.values) {
    return new Response("Invalid node data", { status: 400 })
  }

  const { systemPrompt, userPrompt } = buildPrompt(node)

  const stream = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: true,
    temperature: 0.3,
    max_tokens: 300,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ""
        if (text) {
          controller.enqueue(encoder.encode(text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  })
}
