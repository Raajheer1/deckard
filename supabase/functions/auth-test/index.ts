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
