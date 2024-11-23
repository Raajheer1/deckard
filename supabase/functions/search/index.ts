import { createClient } from "npm:@supabase/supabase-js@2";
import { errorResponse } from "../lib/error-response.ts";
import { getVoyageEmbeddings } from "../lib/voyage-embeddings.ts";

Deno.serve(async (req: Request) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  // Get the session or user object
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return errorResponse("Missing authorization header");
  }

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

  // Now proceed with the search logic
  const { query, matchThreshold = 0.2, matchCount = 10 } = await req.json();
  // Get embedding for the search query
  const { embeddings, error: embeddingError } = await getVoyageEmbeddings([
    query,
  ]);
  if (embeddingError) {
    return errorResponse(
      `Failed to generate embedding: ${embeddingError.message}`,
    );
  }
  if (!embeddings || embeddings.length === 0) {
    return errorResponse("No embeddings generated");
  }
  const queryEmbedding = embeddings[0];

  // Search papers using RPC call
  const { data: searchResults, error: searchError } = await supabaseClient
    .rpc("search_papers", {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

  if (searchError) {
    return errorResponse(`Search failed: ${searchError.message}`);
  }

  return new Response(JSON.stringify({ results: searchResults }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
