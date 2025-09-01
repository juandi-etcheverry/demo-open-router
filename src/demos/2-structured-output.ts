import OpenAI from "openai"
import * as dotenv from "dotenv"
import { FreeModels } from "./Models"
import { printUsageTable } from "../utils/printUsageTable"
dotenv.config()

const openrouterClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://getcharon.com",
    "X-Title": "Charon - User Onboarding with AI"
  }
})

async function main() {
  const completion = await openrouterClient.chat.completions.create({
    model: FreeModels.meta["llama-3.3-8b"],
    messages: [
      { role: "user", content: "What is the weather usually like in Uruguay's capital city?" }
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'weather',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'City or location name',
            },
            temperature: {
              type: 'number',
              description: 'Temperature in Celsius',
            },
            conditions: {
              type: 'string',
              description: 'Weather conditions description',
            },
          },
          required: ['location', 'temperature', 'conditions'],
          additionalProperties: false,
        },
      },
    },
  })

  console.log(completion.choices[0].message)
  if (!completion.choices[0].message.content) {
    console.log("No content in response")
    return
  }
  try {

  console.log(JSON.parse(completion.choices[0].message.content))
  } catch (e) {
    console.log("Error parsing response")
  }
  printUsageTable(completion)
}

main();
