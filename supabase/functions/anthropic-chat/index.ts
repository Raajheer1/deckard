import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Anthropic } from "npm:@anthropic-ai/sdk";
console.log("Hello from Functions!");

Deno.serve(async (req) => {
  const { message } = await req.json();
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  const anthropic = new Anthropic({
    apiKey,
  });

  const chatResponse = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{ role: "user", content: message }],
  });

  return new Response(
    JSON.stringify(chatResponse),
    { headers: { "Content-Type": "application/json" } },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/anthropic-chat' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
