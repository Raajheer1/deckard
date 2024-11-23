import { createClient } from "npm:@supabase/supabase-js@2";
import { getVoyageEmbeddings } from "../lib/voyage-embeddings.ts";
import { errorResponse } from "../lib/error-response.ts";
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
  if (!user) {
    return errorResponse("User not found");
  }

  console.log("Creating embeddings for ", preferences.length, " preferences");
  const { embeddings: embeddingResults, error: embeddingsError } =
    await getVoyageEmbeddings(preferences);

  if (embeddingsError || !embeddingResults) {
    return errorResponse(
      embeddingsError?.message ?? "Error getting embeddings",
    );
  }
  console.log("Embeddings created successfully: ", embeddingResults.length);

  const embeddings = embeddingResults.map((result, index) => ({
    embedding: result,
    preference: preferences[index],
  }));

  console.log("Inserting preferences into database...");
  const { data: _, error: insertError } = await supabaseClient
    .from("preferences")
    .insert(
      embeddings.map((embedding) => ({
        preference: embedding.preference,
        embedding: embedding.embedding,
        user_id: user.id,
      })),
    );
  console.log("Preferences inserted into database successfully");

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
