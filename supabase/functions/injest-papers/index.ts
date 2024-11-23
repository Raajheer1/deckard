import { getVoyageEmbeddings } from "../lib/voyage-embeddings.ts";
import { getArxivPapers } from "../lib/query-arxiv.ts";
import {
  errorResponse,
  optionsResponse,
  successResponse,
} from "../lib/responses.ts";
import supabaseClient from "../lib/supabase-client.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return optionsResponse();

  const { paperCount, category } = await req.json();
  if (!paperCount)
    return errorResponse("No paper count provided");
  if (typeof paperCount !== "number") {
    return errorResponse("Paper count must be a number");
  }
  if (paperCount < 1) {
    return errorResponse("Paper count must be greater than 0");
  }
  if (paperCount > 1000) {
    return errorResponse("Paper count must be less than 1000");
  }
  if (!category) return errorResponse("No category provided");
  if (typeof category !== "string") {
    return errorResponse("Category must be a string");
  }

  // Get papers from arXiv
  console.log("Getting papers from arXiv...");
  const { data: papers, error: arxivError } =
    await getArxivPapers(paperCount, category);
  if (arxivError) return errorResponse(arxivError);
  if (!papers) return errorResponse("No papers found");
  console.log("Papers retrieved successfully: ", papers.length);

  console.log(
    "Creating embeddings for ",
    papers.length,
    " papers"
  );
  const textsToEmbed = papers.map(
    (paper) => `${paper.title}: ${paper.summary}`
  );
  const { embeddings, error: embeddingsError } =
    await getVoyageEmbeddings(textsToEmbed);
  if (embeddingsError)
    return errorResponse(embeddingsError.message);
  if (!embeddings)
    return errorResponse("Failed to generate embeddings");
  console.log(
    "Embeddings created successfully: ",
    embeddings.length
  );

  // Insert papers with embeddings into database
  console.log("Inserting papers into database...");
  const { data: _, error: insertError } = await supabaseClient
    .from("papers")
    .upsert(
      papers.map((paper, index) => ({
        link: paper.link,
        title: paper.title,
        summary: paper.summary.slice(0, 500),
        embedding: embeddings[index],
      })),
      {
        onConflict: "link",
        ignoreDuplicates: true,
      }
    );
  if (insertError) return errorResponse(insertError.message);
  console.log("Papers inserted into database successfully");

  return successResponse({
    message: `Successfully ingested ${papers.length} papers`,
  });
});
