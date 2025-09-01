import OpenAI from "openai"
import * as dotenv from "dotenv"
import { FreeModels } from "./Models"
dotenv.config()

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

interface Book {
  id: number;
  title: string;
  authors: string[];
}

const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'searchGutenbergBooks',
      description:
        'Search for books in the Project Gutenberg library based on specified search terms',
      parameters: {
        type: 'object',
        properties: {
          searchTerms: {
            type: 'array',
            items: {
              type: 'string',
            },
            description:
              "List of search terms to find books in the Gutenberg library (e.g. ['dickens', 'great'] to search for books by Dickens with 'great' in the title)",
          },
        },
        required: ['searchTerms'],
      },
    },
  },
];

async function searchGutenbergBooks({searchTerms}: {searchTerms: string[]}): Promise<Book[]> {
  const searchQuery = searchTerms.join(' ');
  const url = 'https://gutendex.com/books';
  const response = await fetch(`${url}?search=${searchQuery}`);
  const data = await response.json();
  return data.results.map((book: any) => ({
    id: book.id,
    title: book.title,
    authors: book.authors,
  }));
}


const TOOL_MAPPING = {
  searchGutenbergBooks,
};

const main = async () => {
  const result = await client.chat.completions.create({
    model: FreeModels.meta["llama-3.3-8b"],
    messages: [
      { role: "user", content: "What are the books about Dickens with 'great' in the title?" }
    ],
    tools: tools,
  })
  console.log('######################## RESULT ########################')
  console.dir(result, { depth: null })

  if (result.choices[0].finish_reason === "tool_calls") {
    const toolCalls = result.choices[0].message.tool_calls
    console.log('######################## TOOL CALLS ########################')
    console.dir(toolCalls, { depth: null })
    if (!toolCalls) {
      console.log("No tool calls found")
      return
    }
    for (const toolCall of toolCalls) {
      if (toolCall.type !== "function") {
        console.log("No function tool call found")
        return
      }

      const selectedTool = TOOL_MAPPING[toolCall.function.name as keyof typeof TOOL_MAPPING]
      if (!selectedTool) {
        console.log("No tool found")
        return
      }

      const toolArgs = JSON.parse(toolCall.function.arguments)

      console.log(`Tool args: ${toolCall.function.name}`, toolArgs)

      const toolResult = await selectedTool(toolArgs)

      console.log('######################## TOOL RESULT ########################')
      console.dir(toolResult, { depth: null })
    }
  }

}

main()