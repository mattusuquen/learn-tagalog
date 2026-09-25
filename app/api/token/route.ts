export const runtime = "nodejs";

// Mints a short-lived WebRTC conversation token for a private ElevenLabs agent.
// The API key stays server-side; the browser only ever sees the token.
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return Response.json(
      { error: "ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID must be set" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
      { headers: { "xi-api-key": apiKey } },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`ElevenLabs token request failed: ${res.status} ${body}`);
    }

    const data = (await res.json()) as { token?: string };
    if (!data.token) {
      throw new Error("No token in ElevenLabs response");
    }

    return Response.json({ token: data.token });
  } catch (err) {
    console.error("token error", err);
    return Response.json({ error: "Couldn't get a conversation token" }, { status: 500 });
  }
}
