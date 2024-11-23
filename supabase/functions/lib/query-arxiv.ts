// Import DOMParser for Node.js
import { DOMParser } from "npm:xmldom";

export interface ArxivPaper {
    title: string;
    summary: string;
    link: string;
}

interface ArxivResponse {
    data: ArxivPaper[] | null;
    error: string | null;
}

// Function to get 10 papers from arXiv API and extract their title, summary, and URL
export async function getArxivPapers(
    count: number,
): Promise<ArxivResponse> {
    try {
        // arXiv API endpoint with 'all' category and a limit of 10 results
        const url =
            `http://export.arxiv.org/api/query?search_query=all&start=0&max_results=${count}`;

        // Fetch the data from the arXiv API
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        // Parse the XML response
        const xmlData = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, "application/xml");

        // Get entries from the response
        const entries = xmlDoc.getElementsByTagName("entry");

        // Extract title, summary, and URL from each entry
        const papers = [];
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const title = entry.getElementsByTagName("title")[0].textContent;
            const summary =
                entry.getElementsByTagName("summary")[0].textContent;
            const link = entry.getElementsByTagName("id")[0].textContent;
            papers.push({ title, summary, link });
        }

        return { data: papers, error: null };
    } catch (error) {
        console.error("Error fetching arXiv papers:", error);
        return {
            data: null,
            error: error instanceof Error
                ? error.message
                : "An unknown error occurred",
        };
    }
}
