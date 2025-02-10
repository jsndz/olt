A simple code to get data from claude

```ts
async function main() {
  anthropic.messages
    .stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 8192,
      temperature: 1,
      messages: [
        { role: "user", content: "Html page to display baby no money" },
      ],
      system: getSystemPrompt(),
    })
    .on("text", (text) => {
      log(text);
    });
}

main();
```
