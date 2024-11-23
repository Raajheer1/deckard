import { createClient } from "npm:@supabase/supabase-js@2";
import { errorResponse } from "../lib/error-response.ts";

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

  const { data: userData, error: matchDocumentsError } = await supabaseClient
    .rpc("match_documents_for_user", {
      user_id: user.id,
      match_threshold: 0.3,
      match_count: 10,
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
