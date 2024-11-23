import { createClient } from "npm:@supabase/supabase-js@2";
import { getVoyageEmbeddings } from "./voyage-embeddings.ts";
Deno.serve(async (req: Request) => {
  const { preferences } = await req.json();
  if (!preferences) {
    return new Response(JSON.stringify({ error: "No preferences provided" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  // Get the session or user object
  const authHeader = req.headers.get("Authorization")!;
  const token = authHeader.replace("Bearer ", "");
  const { data, findUserError } = await supabaseClient.auth.getUser(token);
  if (findUserError) {
    return errorResponse(findUserError.message);
  }

  const user = data.user;

  const { data: embeddings, error: embeddingsError } =
    await getVoyageEmbeddings(preferences);

  if (embeddingsError || !embeddings) {
    return errorResponse(
      embeddingsError?.message ?? "Error getting embeddings",
    );
  }
  console.log(user);

  const { data: _, error: insertError } = await supabaseClient
    .from("preferences")
    .insert(
      embeddings.map((embedding) => ({
        preference: embedding.preference,
        embedding: embedding.embedding,
        user_id: user.id,
      })),
    );

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
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
