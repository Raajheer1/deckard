interface VoyageEmbeddingResponse {
    object: string;
    data: {
        embedding: number[];
        index: number;
    }[];
    model: string;
    usage: {
        total_tokens: number;
    };
}
export interface EmbeddingResult {
    embeddings: number[][] | null;
    error: Error | null;
}

async function getVoyageEmbeddings(texts: string[]): Promise<EmbeddingResult> {
    try {
        const response = await fetch("https://api.voyageai.com/v1/embeddings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("VOYAGE_API_KEY")}`,
            },
            body: JSON.stringify({
                input: texts,
                model: "voyage-3",
            }),
        });

        if (!response.ok) {
            return {
                embeddings: null,
                error: new Error(`Voyage API error: ${response.statusText}`),
            };
        }

        const result: VoyageEmbeddingResponse = await response.json();
        const embeddings = result.data.map((item) => item.embedding);
        return {
            embeddings,
            error: null,
        };
    } catch (err) {
        return {
            embeddings: null,
            error: err instanceof Error ? err : new Error(String(err)),
        };
    }
}

export { getVoyageEmbeddings };
