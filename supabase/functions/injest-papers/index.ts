import { createClient } from "npm:@supabase/supabase-js@2";
import { getVoyageEmbeddings } from "../lib/voyage-embeddings.ts";
import { getArxivPapers } from "../lib/query-arxiv.ts";
import { errorResponse } from "../lib/error-response.ts";

Deno.serve(async (req) => {
  // Get count from query parameters
  const { paperCount } = await req.json();
  if (!paperCount) return errorResponse("No paper count provided");
  if (typeof paperCount !== "number") {
    return errorResponse("Paper count must be a number");
  }
  if (paperCount < 1) {
    return errorResponse("Paper count must be greater than 0");
  }
  if (paperCount > 1000) {
    return errorResponse("Paper count must be less than 1000");
  }

  // Get papers from arXiv
  console.log("Getting papers from arXiv...");
  const { data: papers, error: arxivError } = await getArxivPapers(paperCount);
  if (arxivError) return errorResponse(arxivError);
  if (!papers) return errorResponse("No papers found");
  console.log("Papers retrieved successfully: ", papers.length);

  console.log("Creating embeddings for ", papers.length, " papers");
  const textsToEmbed = papers.map((paper) =>
    `${paper.title}: ${paper.summary}`
  );
  const { embeddings, error: embeddingsError } = await getVoyageEmbeddings(
    textsToEmbed,
  );
  if (embeddingsError) return errorResponse(embeddingsError);
  if (!embeddings) return errorResponse("Failed to generate embeddings");
  console.log("Embeddings created successfully: ", embeddings.length);

  // Initialize Supabase client
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  // Insert papers with embeddings into database
  console.log("Inserting papers into database...");
  const { error } = await supabaseClient.from("papers").insert(
    papers.map((paper, index) => ({
      link: paper.link,
      title: paper.title,
      summary: paper.summary.slice(0, 500),
      embedding: embeddings[index],
    })),
  );
  console.log("Papers inserted into database successfully");
  if (error) return errorResponse(error.message);

  return new Response(
    JSON.stringify({
      message: `Successfully ingested ${papers.length} papers`,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
