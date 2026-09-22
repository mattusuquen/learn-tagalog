export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ELEVENLABS_API_KEY is not set" }, { status: 500 });
  }

  const formData = await request.formData();
  const audio = formData.get("audio");

  if (!(audio instanceof Blob)) {
    return Response.json({ error: "audio is required" }, { status: 400 });
  }

  try {
    const elevenLabsForm = new FormData();
    elevenLabsForm.append("model_id", "scribe_v1");
    elevenLabsForm.append("file", audio, "recording.webm");

    const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: elevenLabsForm,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`ElevenLabs speech-to-text failed: ${res.status} ${body}`);
    }

    const data = (await res.json()) as { text?: string };
    return Response.json({ text: data.text ?? "" });
  } catch (err) {
    console.error("speech-to-text error", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
