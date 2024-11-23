import { errorResponse } from "../lib/error-response.ts";
import supabaseClient from "../lib/supabase-client.ts";
Deno.serve(async (req: Request) => {
  // Get parameters from request body
  const { matchThreshold = 0.3, matchCount = 10 } = await req.json();

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

  const { data: userData, error: matchDocumentsError } = await supabaseClient
    .rpc("match_documents_for_user", {
      user_id: user.id,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });
  if (matchDocumentsError) {
    return errorResponse(matchDocumentsError.message);
  }
  if (!userData) {
    return errorResponse("No documents found");
  }

  return new Response(JSON.stringify({ userData }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
