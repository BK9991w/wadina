import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { TOOLS, executeTool } from "@/lib/ai/tools";
import { describeAttractionsToolContext, tripToContext } from "@/lib/ai/context-utils";
import type { AIChatRequest, AIChatResponse, ConversationMessage, AIResponse, Trip } from "@/types/ai";

// ⚠️ DO NOT cache API_KEY or USE_AI at module level —
// they must be read per-request so .env changes take effect without restart.
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 25_000;

// ── Helpers ────────────────────────────────────────────────────────────────

function sanitizeMessage(content: string): string {
  return content.trim().slice(0, 2000) || "";
}

/** Strip OpenRouter safety metadata lines that sometimes leak into content */
function stripSafetyLabels(text: string): string {
  return text
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      // Drop lines like "User Safety: safe", "Response Safety: safe/unsafe"
      if (/^(User|Response|Content|Input|Output)\s+Safety\s*:/i.test(t)) return false;
      // Drop lines like "Safety: safe"
      if (/^Safety\s*:\s*(safe|unsafe|flagged)/i.test(t)) return false;
      return true;
    })
    .join("\n")
    .trim();
}

// Normalise Arabic: remove tashkeel, normalise hamza/alef variants
function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآا]/g, "ا")   // normalise alef
    .replace(/ة/g, "ه")         // ta marbuta → ha
    .replace(/ى/g, "ي")         // alef maqsura → ya
    .replace(/[\u064B-\u065F]/g, ""); // strip all tashkeel
}

async function callOpenRouter(
  messages: Array<{ role: string; content: string }>,
  tools?: Array<{ name: string; description: string; parameters: Record<string, unknown> }>
): Promise<
  | { type: "text"; content: string }
  | { type: "tool_call"; id: string; name: string; arguments: Record<string, unknown> }
> {
  // Read per-request — never cached at module level
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL ?? "openrouter/free";

  if (!apiKey || !apiKey.trim()) {
    throw new Error("NO_API_KEY");
  }

  const body: Record<string, unknown> = {
    model,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 2048,
    temperature: 0.7,
    top_p: 0.9,
    stream: false,
  };

  if (tools && tools.length > 0) {
    body.tools = tools;
    body.tool_choice = "auto";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "https://wadina.app",
        "X-Title": "Wadina - Tourism Assistant",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`OpenRouter HTTP ${res.status}: ${text.slice(0, 300)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
          tool_calls?: Array<{
            id?: string;
            type?: string;
            function?: { name?: string; arguments?: string };
          }>;
        };
      }>;
    };

    const choice = data.choices?.[0];
    if (!choice?.message) throw new Error("Empty response from OpenRouter");

    const msg = choice.message;
    const toolCalls = msg.tool_calls ?? [];

    if (toolCalls.length > 0) {
      const tc = toolCalls[0];
      if (tc.type === "function" && tc.function) {
        try {
          return {
            type: "tool_call",
            id: tc.id ?? `tool_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: tc.function.name ?? "",
            arguments: JSON.parse(tc.function.arguments ?? "{}"),
          };
        } catch {
          return { type: "text", content: "عذراً، واجهت مشكلة في قراءة رد الذكاء الاصطناعي. حاول مرة أخرى." };
        }
      }
    }

    return { type: "text", content: stripSafetyLabels(msg.content ?? "") };
  } catch (err: unknown) {
    clearTimeout(timer);
    if ((err as Error).name === "AbortError") {
      throw new Error("استجابة بطيئة من الذكاء الاصطناعي. حاول مرة أخرى.");
    }
    throw err;
  }
}

// Contextual fallback — used ONLY when OpenRouter is unavailable/unconfigured.
// Covers more patterns with normalised Arabic so different questions → different replies.
function fallbackResponse(userMessage: string): AIResponse {
  const n = normalizeArabic(userMessage);

  // Trip planning
  if (n.match(/رحله|رحله|خطط|ايام|يوم|اجازه|ليله|سفر|جدول|برنامج/)) {
    return {
      type: "fallback",
      text: "يسعدني مساعدتك في تخطيط رحلتك! لتجربة أفضل أضف مفتاح OpenRouter في ملف .env، وسأبني لك رحلة مخصصة. الآن يمكنك استخدام \"المخطط المنظم\" في الأعلى لتحديد الأيام والاهتمامات والميزانية.",
      suggestedReplies: ["📋 استخدم المخطط المنظم", "🌿 أماكن طبيعية", "🏛️ آثار تاريخية", "♨️ عيون علاجية"],
    };
  }

  // Greeting
  if (n.match(/سلام|اهلا|مرحبا|هلا|هاي|صباح|مساء|كيف حالك/)) {
    return {
      type: "fallback",
      text: "وعليكم السلام! 👋 أنا وادينا، مساعدك السياحي للوادي الجديد. يمكنني مساعدتك في اكتشاف الأماكن السياحية أو تخطيط رحلتك. بماذا تريد أن تبدأ؟",
      suggestedReplies: ["✨ خطط رحلتي", "🧭 ما الأماكن المتاحة؟", "🌿 أماكن طبيعية", "🏛️ آثار وعروض"],
    };
  }

  // Family
  if (n.match(/عائله|عائله|اطفال|اطفل|اسره|اسره|ولاد|بنات|عائلي|مناسب/)) {
    return {
      type: "fallback",
      text: "للعائلات، الوادي الجديد يقدم تجارب رائعة:\n• العيون الحرارية — مناسبة لجميع الأعمار\n• الصحراء البيضاء — مغامرة لا تُنسى للأطفال\n• المعابد الأثرية — تعليمية وممتعة\n• السفاري بالسيارات الرباعية\n\nاستخدم المخطط المنظم لتحديد \"مع العائلة\" وسيختار لك أنسب الأماكن.",
      suggestedReplies: ["📋 المخطط المنظم", "♨️ عيون علاجية", "🏜️ سفاري", "🏛️ آثار"],
    };
  }

  // Places / attractions
  if (n.match(/مكان|اماكن|معلم|معالم|وجهه|وجهة|سياح|اثر|اثار|متاح|زياره|زيارة/)) {
    return {
      type: "fallback",
      text: "الوادي الجديد يضم ثلاث واحات رئيسية:\n• 🏛️ الخارجة — معابد فرعونية ورومانية وعيون حرارية\n• 🕌 الداخلة — قصر الداخلة وبلاط الأثرية ومعبد دير الحجر\n• 🏜️ الفرافرة — الصحراء البيضاء وجبل الكريستال وبحر الرمال\n\nاستخدم صفحة \"استكشف\" لرؤية كل الأماكن بالتفصيل.",
      suggestedReplies: ["🏛️ الخارجة", "🕌 الداخلة", "🏜️ الفرافرة", "✨ خطط رحلتي"],
    };
  }

  // Price / cost
  if (n.match(/سعر|تكلفه|تكلفة|جنيه|ميزانيه|ميزانية|غالي|رخيص|مجاني/)) {
    return {
      type: "fallback",
      text: "تكلفة الزيارة في الوادي الجديد تتنوع:\n• مجانية: معظم الشواطئ والعيون الطبيعية\n• اقتصادية: دخول المعابد والمناطق الأثرية (أقل من 100 جنيه)\n• متوسطة: رحلات السفاري والتخييم (200-500 جنيه)\n• استخدم المخطط لتحديد ميزانيتك وسيعرض لك الأماكن المناسبة.",
      suggestedReplies: ["💰 مواقع مجانية", "🚙 سفاري", "📋 خطط برميزانيتي", "🏛️ أثار"],
    };
  }

  // How to use the site
  if (n.match(/كيف|استخدم|شرح|ساعدني|ايه|ايش|وش|شو|ماذا تفعل|ماذا يمكن/)) {
    return {
      type: "fallback",
      text: "أهلاً! إليك ما يمكنني مساعدتك به:\n• 🗺️ اسألني عن أي مكان في الوادي الجديد\n• ✨ اطلب مني تخطيط رحلة مخصصة لك\n• 🔍 ابحث عن أماكن بناءً على اهتماماتك\n• 💡 احصل على نصائح وتوصيات سياحية\n\nفقط أخبرني بما تريد!",
      suggestedReplies: ["✨ خطط رحلتي", "🧭 ما الأماكن المتاحة؟", "👨‍👩‍👧 رحلة عائلية", "💰 الميزانية"],
    };
  }

  // Nature / safari
  if (n.match(/طبيعه|طبيعة|صحراء|رمال|جبل|محميه|محمية|سفاري/)) {
    return {
      type: "fallback",
      text: "الوادي الجديد جنة للمحبين الطبيعة! 🌿\n• الصحراء البيضاء — ظاهرة طبيعية نادرة في الفرافرة\n• بحر الرمال العظيم — أكبر بحر رمال في العالم\n• جبل الكريستال — من أجمل مناظر الصحراء\n• محمية الفرافرة الطبيعية\n\nهل تريد رحلة طبيعة متخصصة؟",
      suggestedReplies: ["✨ رحلة طبيعة", "🚙 سفاري", "🏜️ الصحراء البيضاء", "📋 خطط رحلتي"],
    };
  }

  // Default — still different from greeting
  return {
    type: "fallback",
    text: "يسعدني مساعدتك في التخطيط لرحلتك! أخبرني كم يوماً تريد، ومع من ستسافر، وما اهتماماتك — وسأقترح لك برنامجاً مناسباً.",
    suggestedReplies: ["🧭 ما الأماكن المتاحة؟", "✨ خطط رحلتي", "👨‍👩‍👧 رحلة عائلية", "💰 التكلفة"],
  };
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse<AIChatResponse>> {
  let body: AIChatRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { response: { type: "error", text: "بيانات غير صالحة." }, conversation: [], trip: undefined },
      { status: 400 }
    );
  }

  const userMessage = sanitizeMessage(body.message ?? "");
  if (!userMessage) {
    return NextResponse.json(
      { response: { type: "error", text: "يرجى كتابة رسالة." }, conversation: [], trip: undefined },
      { status: 400 }
    );
  }

  // Validate and trim conversation history
  const rawConv = Array.isArray(body.conversation) ? body.conversation : [];
  const conversation: ConversationMessage[] = rawConv
    .filter(
      (m): m is ConversationMessage =>
        m && typeof m === "object" && typeof m.role === "string" && typeof m.content === "string"
    )
    .slice(-40)
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.slice(0, 2000),
    }));

  const incomingTrip = body.trip ?? undefined;

  // Build context for OpenRouter
  const contextMessages: Array<{ role: string; content: string }> = [];

  if (incomingTrip && incomingTrip.days?.length > 0) {
    contextMessages.push({
      role: "system",
      content: `========== الرحلة الحالية ==========\n${tripToContext(incomingTrip)}\n==================================`,
    });
  }

  for (const msg of conversation.slice(-20)) {
    contextMessages.push({ role: msg.role, content: msg.content });
  }

  contextMessages.push({ role: "user", content: userMessage });

  // ── Step 1: Call OpenRouter ─────────────────────────────────────────────
  let firstResult: Awaited<ReturnType<typeof callOpenRouter>>;
  try {
    firstResult = await callOpenRouter(contextMessages, TOOLS);
  } catch (err: unknown) {
    const errMsg = (err as Error).message ?? "";
    if (errMsg === "NO_API_KEY") {
      // No API key configured — use contextual fallback
      console.warn("[AI] OPENROUTER_API_KEY not set — using fallback");
    } else {
      console.error("[AI] OpenRouter call failed:", err);
    }
    const fallback = fallbackResponse(userMessage);
    const assistantMsg: ConversationMessage = {
      role: "assistant",
      content: fallback.text,
      suggestedReplies: fallback.suggestedReplies,
    };
    return NextResponse.json({
      response: fallback,
      conversation: [...conversation, { role: "user", content: userMessage }, assistantMsg],
      trip: undefined,
    });
  }

  // ── Step 2: Tool call ───────────────────────────────────────────────────
  if (firstResult.type === "tool_call") {
    const toolName = firstResult.name as (typeof TOOLS)[number]["name"];
    const toolDef = TOOLS.find((t) => t.name === toolName);
    const argumentsObj = firstResult.arguments;

    if (!toolDef) {
      const errText = "عذراً، حدث خطأ داخلي. حاول مرة أخرى.";
      return NextResponse.json({
        response: { type: "error", text: errText },
        conversation: [
          ...conversation,
          { role: "user", content: userMessage },
          { role: "assistant", content: errText },
        ],
        trip: incomingTrip,
      });
    }

    let toolResult: { ok: boolean; message: string; data?: unknown };
    try {
      toolResult = await executeTool(incomingTrip, toolName, argumentsObj);
    } catch (err: unknown) {
      console.error(`[AI] Tool ${toolName} execution failed:`, err);
      toolResult = { ok: false, message: "حدث خطأ أثناء تنفيذ الطلب. حاول مرة أخرى." };
    }

    const toolResultText = toolResult.ok
      ? `${toolResult.message}\n\n--- ناتج الأداة ---\n${describeAttractionsToolContext(toolResult.data)}\n--- انتهى ناتج الأداة ---`
      : `فشل تنفيذ الأداة: ${toolResult.message}`;

    const followUpMessages = [
      ...contextMessages,
      {
        role: "assistant",
        content: `أردت استدعاء أداة: ${toolName}، الوسائط: ${JSON.stringify(argumentsObj)}`,
      },
      { role: "user", content: `ناتج أداة "${toolName}":\n${toolResultText}` },
    ];

    let finalResult: Awaited<ReturnType<typeof callOpenRouter>>;
    try {
      finalResult = await callOpenRouter(followUpMessages);
    } catch (err: unknown) {
      console.error("[AI] Follow-up call failed:", err);
      const fallback = fallbackResponse(userMessage);
      const assistantMsg: ConversationMessage = {
        role: "assistant",
        content: fallback.text,
        suggestedReplies: fallback.suggestedReplies,
      };
      return NextResponse.json({
        response: fallback,
        conversation: [...conversation, { role: "user", content: userMessage }, assistantMsg],
        trip: incomingTrip,
      });
    }

    const tripOut = extractTripFromData(toolResult.data);
    const textOut =
      finalResult.type === "text" && finalResult.content
        ? finalResult.content
        : "تمّت المعالجة. يرجى مراجعة الردود.";
    const assistantMsg: ConversationMessage = { role: "assistant", content: textOut, trip: tripOut };

    return NextResponse.json({
      response: { type: "response", text: textOut, trip: tripOut, suggestedReplies: extractSuggestedReplies(textOut) },
      conversation: [...conversation, { role: "user", content: userMessage }, assistantMsg],
      trip: tripOut,
    });
  }

  // ── Step 4: Direct text response ────────────────────────────────────────
  const text = firstResult.type === "text" ? firstResult.content : "";

  if (!text) {
    const fallback = fallbackResponse(userMessage);
    const assistantMsg: ConversationMessage = {
      role: "assistant",
      content: fallback.text,
      suggestedReplies: fallback.suggestedReplies,
    };
    return NextResponse.json({
      response: fallback,
      conversation: [...conversation, { role: "user", content: userMessage }, assistantMsg],
      trip: incomingTrip,
    });
  }

  const replies = extractSuggestedReplies(text);
  const assistantMsg: ConversationMessage = { role: "assistant", content: text, suggestedReplies: replies };

  return NextResponse.json({
    response: { type: "response", text, suggestedReplies: replies },
    conversation: [...conversation, { role: "user", content: userMessage }, assistantMsg],
    trip: incomingTrip,
  });
}

// ── Small helpers ──────────────────────────────────────────────────────────

function extractTripFromData(data: unknown): Trip | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  if (d.days && Array.isArray(d.days)) return d as unknown as Trip;
  return undefined;
}

function extractSuggestedReplies(text: string): string[] {
  const n = normalizeArabic(text);
  const replies: string[] = [];
  if (n.match(/رحله|رحلة|خطه|خطط|create_trip/)) replies.push("✅ أنشئ لي رحلة");
  if (n.match(/طبيعه|طبيعة|محمي|جبل|صحراء/)) replies.push("🌿 أماكن طبيعية");
  if (n.match(/اثر|اثار|معبد|قصر|تاريخ/)) replies.push("🏛️ أماكن أثرية");
  if (n.match(/سفاري|مغامر|رمال|جيب/)) replies.push("🚙 سفاري ومغامرات");
  if (n.match(/علاجي|حراريه|حرارية|ماء|عيون/)) replies.push("♨️ سياحة علاجية");
  if (n.match(/سعر|تكلفه|تكلفة|ميزانيه|ميزانية|جنيه/)) replies.push("💰 معلومات التكلفة");
  if (n.match(/شكر|وداع|باي|bye/)) replies.push("🔄 ابدأ رحلة جديدة");
  if (replies.length === 0) replies.push("🧭 ما الأماكن المتاحة؟", "✨ خطط رحلتي", "🌿 أماكن طبيعية", "🏛️ آثار وعروض");
  return replies.slice(0, 4);
}
