import { formatTime } from "./helpers.js";

async function loadClientMap(supabase, clientIds) {
  if (!clientIds.length) {
    return new Map();
  }

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, full_name, email")
    .in("id", clientIds);

  if (error) {
    console.error(error);
    return new Map();
  }

  return new Map((clients || []).map(client => [client.id, client]));
}

async function loadConversationClientMap(supabase, conversationIds) {
  if (!conversationIds.length) {
    return new Map();
  }

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, client_id")
    .in("id", conversationIds);

  if (error) {
    console.error(error);
    return new Map();
  }

  return new Map((conversations || []).map(item => [item.id, item.client_id]));
}

export async function loadConversations(supabase, state, chatState, el, callbacks = {}) {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select(`
      conversation_id,
      unread,
      conversations (
        id,
        last_message,
        last_message_at
      )
    `)
    .eq("user_auth_id", state.session.user.id)
    .order("conversation_id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const box = el.conv();
  if (!box) {
    return;
  }

  box.innerHTML = "";

  if (!data?.length) {
    await callbacks.loadMessageConversations?.();
    return;
  }

  const conversationIds = data.map(c => c.conversation_id).filter(Boolean);
  const conversationClientMap = await loadConversationClientMap(supabase, conversationIds);
  const clientIds = [...new Set(Array.from(conversationClientMap.values()).filter(Boolean))];
  const clientsMap = await loadClientMap(supabase, clientIds);

  for (const item of data) {
    const convo = item.conversations;
    const clientId = conversationClientMap.get(item.conversation_id);
    const client = clientsMap.get(clientId);
    const label = client?.full_name || client?.email || `Gesprek ${item.conversation_id}`;
    const snippet = convo?.last_message || "Geen berichten";
    const div = document.createElement("div");
    div.className = "chat-item";

    div.innerHTML = `
      <div class="chat-item-meta">
        <div style="display:flex;justify-content:space-between;">
          <b>${label}</b>
          <small>${formatTime(convo?.last_message_at)}</small>
        </div>
        <div style="display:flex;justify-content:space-between;gap:12px;">
          <small style="opacity:0.7;flex:1;">${snippet}</small>
          ${item.unread > 0 ? `<span class="badge">${item.unread}</span>` : ""}
        </div>
      </div>
    `;

    div.onclick = async () => {
      document.querySelectorAll(".chat-item").forEach(i => i.classList.remove("active"));
      div.classList.add("active");
      chatState.activeConversation = item.conversation_id;
      chatState.activeClient = client || null;

      const header = el.header();
      if (header) {
        header.textContent = client ? `Chat met ${client.full_name || client.email}` : "Chat";
      }

      await supabase
        .from("conversation_participants")
        .update({ unread: 0 })
        .eq("user_auth_id", state.session.user.id)
        .eq("conversation_id", chatState.activeConversation);

      await callbacks.onConversationSelected?.();
    };

    box.appendChild(div);
  }

  if (!chatState.activeConversation && data.length > 0) {
    chatState.activeConversation = data[0].conversation_id;
    await callbacks.onConversationSelected?.();
  }
}

export async function loadMessageConversations(supabase, state, chatState, el, callbacks = {}) {
  chatState.useLegacyMessages = true;
  chatState.activeConversation = null;
  chatState.activeClient = null;

  const { data, error } = await supabase
    .from("messages")
    .select("client_id, sender_id, message, created_at")
    .order("created_at", { ascending: false });

  const box = el.conv();
  if (!box) {
    return;
  }

  if (error) {
    console.error(error);
    box.innerHTML = `<div style="padding:20px;">Geen gesprekken</div>`;
    return;
  }

  const messages = data || [];
  const clientIds = [...new Set(messages.map(m => m.client_id).filter(Boolean))];
  if (!clientIds.length) {
    box.innerHTML = `<div style="padding:20px;">Geen gesprekken</div>`;
    return;
  }

  const clientsMap = await loadClientMap(supabase, clientIds);
  const latestMessageByClient = new Map();
  const unreadCounts = new Map();

  for (const message of messages) {
    if (!latestMessageByClient.has(message.client_id)) {
      latestMessageByClient.set(message.client_id, message);
    }
    if (message.sender_id !== state.session.user.id) {
      unreadCounts.set(message.client_id, (unreadCounts.get(message.client_id) || 0) + 1);
    }
  }

  box.innerHTML = "";

  for (const [clientId, lastMsg] of latestMessageByClient) {
    const client = clientsMap.get(clientId);
    const label = client?.full_name || client?.email || `Cliënt ${clientId}`;
    const snippet = lastMsg.message || "Geen berichten";
    const unread = unreadCounts.get(clientId) || 0;
    const div = document.createElement("div");
    div.className = "chat-item";

    div.innerHTML = `
      <div class="chat-item-meta">
        <div style="display:flex;justify-content:space-between;">
          <b>${label}</b>
          <small>${formatTime(lastMsg.created_at)}</small>
        </div>
        <div style="display:flex;justify-content:space-between;gap:12px;">
          <small style="opacity:0.7;flex:1;">${snippet}</small>
          ${unread > 0 ? `<span class="badge">${unread}</span>` : ""}
        </div>
      </div>
    `;

    div.onclick = async () => {
      document.querySelectorAll(".chat-item").forEach(i => i.classList.remove("active"));
      div.classList.add("active");
      chatState.activeConversation = clientId;
      chatState.activeClient = client || null;

      const header = el.header();
      if (header) {
        header.textContent = `Chat met ${label}`;
      }

      await callbacks.onConversationSelected?.();
    };

    box.appendChild(div);
  }

  if (!chatState.activeConversation && latestMessageByClient.size > 0) {
    const [clientId] = latestMessageByClient.keys();
    chatState.activeConversation = clientId;
    chatState.activeClient = clientsMap.get(clientId) || null;
    await callbacks.onConversationSelected?.();
  }
}
