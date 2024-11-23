import { errorResponse } from "../lib/error-response.ts";
import supabaseClient from "../lib/supabase-client.ts";
Deno.serve(async (req: Request) => {
  // Verify supabase client is initialized correctly
  if (!supabaseClient) {
    return errorResponse("Supabase client not initialized");
  }
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
  console.log(user);

  const { data: userData, error } = await supabaseClient.from("profiles")
    .select("*").eq("id", user?.id);

  if (error) {
    return errorResponse(error.message);
  }

  return new Response(JSON.stringify({ userData }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
