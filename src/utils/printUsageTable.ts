import OpenAI from "openai";

export function printUsageTable(completion: OpenAI.Chat.Completions.ChatCompletion) {
  const usage = completion.usage;

  if (!usage) {
    console.log("No usage data available for this completion.");
    return;
  }

  const tableData = [
    { "Metric": "Prompt Tokens", "Value": usage.prompt_tokens },
    { "Metric": "Completion Tokens", "Value": usage.completion_tokens },
    { "Metric": "Total Tokens", "Value": usage.total_tokens },
  ];

  console.table(tableData);
}
