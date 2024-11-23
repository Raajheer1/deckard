import {
  errorResponse,
  optionsResponse,
  successResponse,
} from "../lib/responses.ts";
import { getVoyageEmbeddings } from "../lib/voyage-embeddings.ts";
import supabaseClient from "../lib/supabase-client.ts";
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return optionsResponse();
  // Get the session or user object
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return errorResponse("Missing authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const { data, error: findUserError } =
    await supabaseClient.auth.getUser(token);
  if (findUserError) {
    return errorResponse(findUserError.message);
  }

  const user = data.user;
  if (!user) {
    return errorResponse("User not found");
  }

  // Now proceed with the search logic
  const {
    query,
    matchThreshold = 0.2,
    matchCount = 10,
  } = await req.json();
  // Get embedding for the search query
  const { embeddings, error: embeddingError } =
    await getVoyageEmbeddings([query]);
  if (embeddingError) {
    return errorResponse(
      `Failed to generate embedding: ${embeddingError.message}`
    );
  }
  if (!embeddings || embeddings.length === 0) {
    return errorResponse("No embeddings generated");
  }
  const queryEmbedding = embeddings[0];

  // Search papers using RPC call
  const { data: searchResults, error: searchError } =
    await supabaseClient.rpc("search_papers", {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      user_id: user.id,
    });

  if (searchError) {
    return errorResponse(
      `Search failed: ${searchError.message}`
    );
  }

  return successResponse({ results: searchResults });
});
