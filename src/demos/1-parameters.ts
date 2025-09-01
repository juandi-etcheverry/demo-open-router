import * as dotenv from "dotenv"
import { FreeModels } from "./Models"
dotenv.config()

async function parametersDemo() {
  console.log("OpenRouter Parameters Demo\n")

  const requestBody = {
    model: FreeModels.meta["llama-3.3-8b"],
    
    messages: [
      { role: "user", content: "Write a creative short story about a robot discovering emotions." }
    ],

    // Sampling Parameters
    temperature: 0.8,           // Controls creativity/randomness (0=predictable, 2=very creative)
    top_p: 0.9,                // Limits token choices to top 90% probability mass
    top_k: 50,                 // Only consider top 50 most likely tokens at each step
    frequency_penalty: 0.3,     // Reduces repetition based on token frequency in input
    presence_penalty: 0.2,      // Reduces repetition of any token already used
    repetition_penalty: 1.1,    // Alternative repetition control (>1 = less repetition)
    min_p: 0.05,               // Only tokens with 5% of max token probability
    top_a: 0.1,                // Dynamic filtering based on highest probability token
    
    // Generation Control
    max_tokens: 200,           // Maximum tokens to generate in response
    seed: 42,                  // Makes output more deterministic/reproducible
    
    // Output Control
    stop: ["THE END", "\n\n\n"], // Stop generation if these strings appear
    logprobs: true,            // Return probability scores for each token
    top_logprobs: 3,           // Show top 3 token alternatives with probabilities
    
    // Response Format
    response_format: {         // Force specific output format (JSON, etc.)
      type: "text"
    },
    
    // Tool Parameters (when using function calling)
    // tools: [],              // Available functions the model can call
    // tool_choice: "auto",    // How to choose tools: none/auto/required/specific
    // parallel_tool_calls: true, // Allow calling multiple tools simultaneously
    
    // Quality Control
    verbosity: "medium",       // Response length: low/medium/high (provider-specific)
    
    // Token Manipulation
    logit_bias: {              // Bias specific tokens (-100 to 100)
      "464": -50               // Reduce likelihood of token ID 464 (example)
    }
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://getcharon.com",
      "X-Title": "Parameters Demo"
    },
    body: JSON.stringify(requestBody)
  })

  const data = await response.json()

  if (!response.ok) {
    console.error("API Error:", data)
    return
  }

  console.log("📝 Generated Story:")
  console.log(data.choices[0].message.content)
  
  if (data.choices[0].logprobs) {
    console.log("\n📊 Token Probabilities (first few tokens):")
    data.choices[0].logprobs.content?.slice(0, 3).forEach((token: any, i: number) => {
      console.log(`${i + 1}. "${token.token}" (prob: ${Math.exp(token.logprob).toFixed(3)})`)
      if (token.top_logprobs) {
        token.top_logprobs.forEach((alt: any) => {
          console.log(`   Alt: "${alt.token}" (prob: ${Math.exp(alt.logprob).toFixed(3)})`)
        })
      }
    })
  }

  console.log("\n🎯 Parameters Used:")
  console.log("• temperature: 0.8 - Creative but not chaotic")
  console.log("• top_p: 0.9 - Consider top 90% of probability mass")
  console.log("• top_k: 50 - Only top 50 token candidates")
  console.log("• max_tokens: 200 - Keep response concise")
  console.log("• frequency_penalty: 0.3 - Reduce word repetition")
  console.log("• repetition_penalty: 1.1 - Alternative repetition control")
  console.log("• min_p: 0.05 - Minimum 5% of max token probability")
  console.log("• seed: 42 - Reproducible results")
  console.log("• verbosity: medium - Balanced response length")
  console.log("• logit_bias: Applied to token 464 - Custom token probability adjustment")
}

parametersDemo().catch(console.error)