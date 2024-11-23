import { corsHeaders } from "./cors.ts";

export function errorResponse(message: string | object) {
  return new Response(JSON.stringify({ error: message }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 500,
  });
}

export function successResponse(message: string | object) {
  return new Response(JSON.stringify({ message }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status: 200,
  });
}

export function optionsResponse() {
  return new Response("ok", { headers: corsHeaders });
}
