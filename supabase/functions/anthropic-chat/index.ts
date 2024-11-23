import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Anthropic } from "npm:@anthropic-ai/sdk";

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
