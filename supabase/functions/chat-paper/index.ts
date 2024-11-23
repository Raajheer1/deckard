import { createClient } from "npm:@supabase/supabase-js@2";
import { errorResponse } from "../lib/error-response.ts";
import { Anthropic } from "npm:@anthropic-ai/sdk";

Deno.serve(async (req: Request) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  // Get the session or user object
  const authHeader = req.headers.get("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data, error: findUserError } = await supabaseClient.auth.getUser(
    token,
  );
  if (findUserError) {
    return errorResponse(findUserError.message);
  }

  const user = data.user;
  if (!user) {
    return errorResponse("User not found");
  }

  // Get chat history from request body
  const {
    messages,
    paperId,
    model = "claude-3-5-sonnet-latest",
    max_tokens = 1024,
  } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return errorResponse("Invalid messages format");
  }
  if (!paperId) {
    return errorResponse("paperId is required");
  }

  // Fetch paper details
  const { data: paper, error: paperError } = await supabaseClient
    .from("papers")
    .select("title, summary")
    .eq("id", paperId)
    .single();

  if (paperError) {
    return errorResponse("Failed to fetch paper details");
  }

  const systemPrompt = `
    You are discussing the paper "${paper.title}".
    
    Here is its abstract: "${paper.summary}"
    
    You are an intelligent researcher explaining the paper to the user who may not be familiar 
    with the concepts discussed in the paper. Be very concise in your answers, only specifying
    the most important points.
  `;

  const anthropic = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
  });

  const chatResponse = await anthropic.messages.create({
    model,
    max_tokens,
    messages,
    system: systemPrompt,
  });

  return new Response(
    JSON.stringify((chatResponse.content[0] as Anthropic.TextBlock).text),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    },
  );
});
