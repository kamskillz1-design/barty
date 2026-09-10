import { getRequestUser, getServiceRoleClient, json } from "./_supabase.js";

export default async function handler(req) {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const user = await getRequestUser(req);

    if (!user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const tradeId = `${body?.trade_id || ""}`.trim();

    if (!tradeId) {
      return json({ error: "trade_id is required" }, 400);
    }

    const admin = getServiceRoleClient();
    const { data: trade, error: tradeError } = await admin
      .from("trades")
      .select("id")
      .eq("id", tradeId)
      .or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .maybeSingle();

    if (tradeError) {
      throw tradeError;
    }

    if (!trade) {
      return json({ error: "Trade not found" }, 404);
    }

    const { data: messages, error: messagesError } = await admin
      .from("messages")
      .select("*")
      .eq("trade_id", tradeId)
      .order("created_at", { ascending: true })
      .limit(500);

    if (messagesError) {
      throw messagesError;
    }

    return json({ messages: messages || [] });
  } catch (error) {
    return json({ error: error.message || "Unable to load trade messages" }, 500);
  }
}
