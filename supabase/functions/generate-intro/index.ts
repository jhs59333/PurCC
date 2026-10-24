import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText } from "npm:ai";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI 服務尚未設定" }, 500);
    const { nickname, tags, tone, activities, lookingFor, about } = await req.json();
    if (!Array.isArray(tags) || tags.length === 0) return json({ error: "請至少選一個興趣" }, 400);

    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    const system = `你是 PurCC 溫馨社交 App 的自我介紹寫手。用繁體中文，語氣真誠溫暖、不油膩、不誇大，避免陳腔濫調。
只輸出 JSON（不要 markdown），格式：{"oneLiner":"一句 20 字內吸睛金句","bio":"80-140 字自我介紹，可含 1-2 個 emoji","topics":["3 個能聊的開場話題，每個 20 字內"]}`;
    const prompt = `暱稱：${String(nickname || "").slice(0, 30)}
興趣標籤：${tags.slice(0, 12).join("、")}
語氣：${String(tone || "溫暖真誠").slice(0, 20)}
喜歡的活動：${String(activities || "").slice(0, 200)}
想認識的人：${String(lookingFor || "").slice(0, 200)}
關於我：${String(about || "").slice(0, 300)}`;

    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system,
      prompt,
      abortSignal: req.signal,
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = await result.text;
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return json({ error: "AI 沒有回傳內容，請再試一次" }, 502);
    const data = JSON.parse(m[0]);
    return json({ oneLiner: data.oneLiner ?? "", bio: data.bio ?? "", topics: Array.isArray(data.topics) ? data.topics : [] });
  } catch (e) {
    const status = (e as { statusCode?: number })?.statusCode;
    if (status === 429) return json({ error: "請求太頻繁，請稍後再試" }, 429);
    if (status === 402) return json({ error: "AI 額度已用完，請升級方案以加值" }, 402);
    if (status === 403) return json({ error: "AI 服務目前無法使用" }, 403);
    console.error(e);
    return json({ error: "產生失敗，請稍後再試" }, 500);
  }
});
