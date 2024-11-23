import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  // Get the session or user object
  const authHeader = req.headers.get("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data } = await supabaseClient.auth.getUser(token);
  const user = data.user;
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

function errorResponse(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    headers: { "Content-Type": "application/json" },
    status: 500,
  });
}