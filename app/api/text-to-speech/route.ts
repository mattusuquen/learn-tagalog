export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    return Response.json({ error: "ElevenLabs env vars are not set" }, { status: 500 });
  }

  const { text } = (await request.json()) as { text?: string };

  if (!text) {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_flash_v2_5",
      }),
    });

    if (!res.ok) {
      throw new Error(`ElevenLabs text-to-speech failed: ${res.status}`);
    }

    const audio = await res.arrayBuffer();
    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    console.error("text-to-speech error", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
