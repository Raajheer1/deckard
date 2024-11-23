export function errorResponse(message: string | object) {
    return new Response(JSON.stringify({ error: message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
    });
}
