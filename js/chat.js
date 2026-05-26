import { formatTime, getMessageText, getMessageSenderId, renderMessage } from "./chat/helpers.js";

export function initChat(supabase, state) {
  console.log("💬 CHAT MODULE");

  let activeConversation = null;
  let useLegacyMessages = false;
  let activeClient = null;
  let legacyClientMap = new Map();
  let chatChannel = null;
  let typingChannel = null;
  let typingTimeout = null;

  const el = {
    list: () => document.getElementById("chatList"),
    conv: () => document.getElementById("chatConversations"),
    input: () => document.getElementById("chatInput"),
    header: () => document.getElementById("chatHeader")
  };

  function cleanupRealtime() {
    if (chatChannel) {
      supabase.removeChannel(chatChannel);
      chatChannel = null;
    }

    if (typingChannel) {
      supabase.removeChannel(typingChannel);
      typingChannel = null;
    }
  }

  async function loadConversations() {
    console.log("🔥 LOAD CONVERSATIONS");

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
      await loadMessageConversations();
      return;
    }

    const conversationIds = data.map(c => c.conversation_id).filter(Boolean);
    let conversationClientMap = new Map();

    if (conversationIds.length) {
      const { data: conversations, error: conversationError } = await supabase
        .from("conversations")
        .select("id, client_id")
        .in("id", conversationIds);

      if (conversationError) {
        console.error(conversationError);
      } else {
        conversationClientMap = new Map((conversations || []).map(item => [item.id, item.client_id]));
      }
    }

    const clientIds = [...new Set(Array.from(conversationClientMap.values()).filter(Boolean))];
    let clientsMap = new Map();

    if (clientIds.length) {
      const { data: clients, error: clientError } = await supabase
        .from("clients")
        .select("id, full_name, email")
        .in("id", clientIds);

      if (clientError) {
        console.error(clientError);
      } else {
        clientsMap = new Map((clients || []).map(client => [client.id, client]));
      }
    }

    for (const c of data) {
      const convo = c.conversations;
      const clientId = conversationClientMap.get(c.conversation_id);
      const client = clientsMap.get(clientId);
      const label = client?.full_name || client?.email || `Gesprek ${c.conversation_id}`;
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
            ${c.unread > 0 ? `<span class="badge">${c.unread}</span>` : ""}
          </div>
        </div>
      `;

      div.onclick = async () => {
        document.querySelectorAll(".chat-item").forEach(i => i.classList.remove("active"));
        div.classList.add("active");
        activeConversation = c.conversation_id;
        activeClient = client || null;

        const header = el.header();
        if (header) {
          header.textContent = client ? `Chat met ${client.full_name || client.email}` : "Chat";
        }

        await supabase
          .from("conversation_participants")
          .update({ unread: 0 })
          .eq("user_auth_id", state.session.user.id)
          .eq("conversation_id", activeConversation);

        subscribeRealtime();
        await loadMessages();
      };

      box.appendChild(div);
    }

    if (!activeConversation && data.length > 0) {
      activeConversation = data[0].conversation_id;
      subscribeRealtime();
      await loadMessages();
    }
  }

  async function loadMessageConversations() {
    useLegacyMessages = true;
    activeConversation = null;
    activeClient = null;

    const { data, error } = await supabase
      .from("messages")
      .select("client_id, sender_id, message, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      const box = el.conv();
      if (box) {
        box.innerHTML = `<div style="padding:20px;">Geen gesprekken</div>`;
      }
      return;
    }

    const messages = data || [];
    const clientIds = [...new Set(messages.map(m => m.client_id).filter(Boolean))];

    if (!clientIds.length) {
      const box = el.conv();
      if (box) {
        box.innerHTML = `<div style="padding:20px;">Geen gesprekken</div>`;
      }
      return;
    }

    const { data: clients, error: clientError } = await supabase.from("clients").select("id, full_name, email").in("id", clientIds);
    if (clientError) {
      console.error(clientError);
    }

    legacyClientMap = new Map((clients || []).map(c => [c.id, c]));
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

    const box = el.conv();
    if (!box) {
      return;
    }

    box.innerHTML = "";

    for (const [clientId, lastMsg] of latestMessageByClient) {
      const client = legacyClientMap.get(clientId);
      const label = client?.full_name || client?.email || `Cliënt ${clientId}`;
      const snippet = getMessageText(lastMsg) || "Geen berichten";
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
        activeConversation = clientId;
        activeClient = client || null;

        const header = el.header();
        if (header) {
          header.textContent = `Chat met ${label}`;
        }

        subscribeRealtime();
        await loadMessages();
      };

      box.appendChild(div);
    }

    if (!activeConversation && latestMessageByClient.size > 0) {
      const [clientId] = latestMessageByClient.keys();
      activeConversation = clientId;
      activeClient = legacyClientMap.get(clientId) || null;
      subscribeRealtime();
      await loadMessages();
    }
  }

  async function loadMessages() {
    if (!activeConversation) {
      return;
    }

    let data = [];
    let error = null;

    if (useLegacyMessages) {
      ({ data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("client_id", activeConversation)
        .order("created_at", { ascending: true }));
    } else {
      ({ data, error } = await supabase
        .from("chat")
        .select("*")
        .eq("conversation_id", activeConversation)
        .order("created_at", { ascending: true }));
    }

    if (error) {
      console.error(error);
      return;
    }

    const box = el.list();
    if (!box) {
      return;
    }

    box.innerHTML = "";
    data.forEach(message => renderMessage(message, el, state));
    box.scrollTop = box.scrollHeight;
  }

  async function openConversationForClient(clientId, clientName) {
    if (!clientId) {
      return;
    }

    const displayName = clientName || `Cliënt ${clientId}`;
    const header = el.header();
    if (header) {
      header.textContent = `Chat met ${displayName}`;
    }

    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("client_id", clientId)
      .order("last_message_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error(error);
    }

    if (conversations?.length) {
      useLegacyMessages = false;
      activeConversation = conversations[0].id;
      activeClient = { full_name: clientName };
    } else {
      useLegacyMessages = true;
      activeConversation = clientId;
      activeClient = { full_name: clientName };
    }

    subscribeRealtime();
    await loadMessages();
  }

  async function send() {
    const input = el.input();
    if (!input) {
      return;
    }

    const text = input.value.trim();
    if (!text || !activeConversation) {
      return;
    }

    let error = null;

    if (useLegacyMessages) {
      ({ error } = await supabase.from("messages").insert({
        client_id: activeConversation,
        sender_id: state.session.user.id,
        message: text
      }));
    } else {
      ({ error } = await supabase.from("chat").insert({
        bericht: text,
        user_auth_id: state.session.user.id,
        conversation_id: activeConversation
      }));
    }

    if (error) {
      console.error(error);
      return;
    }

    if (!useLegacyMessages) {
      await supabase
        .from("conversations")
        .update({
          last_message: text,
          last_message_at: new Date()
        })
        .eq("id", activeConversation);
    }

    input.value = "";
  }

  function subscribeRealtime() {
    if (!activeConversation) {
      return;
    }

    if (chatChannel) {
      supabase.removeChannel(chatChannel);
    }

    const table = useLegacyMessages ? "messages" : "chat";
    const filter = useLegacyMessages ? `client_id=eq.${activeConversation}` : `conversation_id=eq.${activeConversation}`;

    chatChannel = supabase
      .channel(`${table}-${activeConversation}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table,
        filter
      }, async () => {
        await loadMessages();
        await loadConversations();
      })
      .subscribe();
  }

  function typing() {
    clearTimeout(typingTimeout);
    if (!activeConversation) {
      return;
    }

    if (!typingChannel) {
      typingChannel = supabase.channel("typing");
      typingChannel.subscribe();
    }

    typingChannel.send({
      type: "broadcast",
      event: "typing",
      payload: { conversation: activeConversation }
    });

    typingTimeout = setTimeout(() => {}, 800);
  }

  function init() {
    console.log("💬 CHAT INIT");

    const header = el.header();
    if (header) {
      header.textContent = "Vrijwilliger inbox";
    }

    const input = el.input();
    const sendBtn = document.getElementById("sendChatBtn");

    if (sendBtn) {
      sendBtn.onclick = send;
    }

    if (input) {
      input.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          send();
        } else {
          typing();
        }
      });
    }

    loadConversations();

    window.addEventListener("beforeunload", cleanupRealtime);
  }

  return {
    init,
    loadMessages,
    cleanupRealtime,
    openConversationForClient
  };
}
