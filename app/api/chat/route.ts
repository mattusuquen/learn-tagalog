import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation, StateGraph, END, START } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

export const runtime = "nodejs";

const model = new ChatOpenAI({ model: "gpt-4o-mini" });

const graph = new StateGraph(MessagesAnnotation)
  .addNode("agent", async (state) => {
    const response = await model.invoke(state.messages);
    return { messages: [response] };
  })
  .addEdge(START, "agent")
  .addEdge("agent", END)
  .compile();

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: ChatMessage[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages is required" }, { status: 400 });
  }

  try {
    const result = await graph.invoke({
      messages: messages.map((m) =>
        m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content),
      ),
    });

    const last = result.messages[result.messages.length - 1];
    const text =
      typeof last.content === "string"
        ? last.content
        : JSON.stringify(last.content);

    return Response.json({ text });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
