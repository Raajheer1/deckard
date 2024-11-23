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

interface PreferenceEmbedding {
    preference: string;
    embedding: number[];
}

interface EmbeddingResult {
    data: PreferenceEmbedding[] | null;
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
                data: null,
                error: new Error(`Voyage API error: ${response.statusText}`),
            };
        }

        const result: VoyageEmbeddingResponse = await response.json();

        const embeddings = texts.map((text, index) => ({
            preference: text,
            embedding: result.data[index].embedding,
        }));

        return {
            data: embeddings,
            error: null,
        };
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err : new Error(String(err)),
        };
    }
}

export { getVoyageEmbeddings };
