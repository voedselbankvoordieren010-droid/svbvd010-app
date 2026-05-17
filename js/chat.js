export function initChat(supabase, state) {
console.log("📦 chat.js geladen");
  let activeConversation = null;
  let channel = null;
  let typingChannel = null;
  let typingTimeout;

  const el = {
    list: () => document.getElementById("chatList"),
    conv: () => document.getElementById("chatConversations"),
    input: () => document.getElementById("chatInput"),
    header: () => document.getElementById("chatHeader")
  };

  function formatTime(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ======================
  // LOAD CONVERSATIONS
  // ======================
  async function loadConversations() {
  console.log("🔥 LOAD CONVERSATIONS START");

  const { data, error } = await supabase
    .from("conversation_participants")
    .select(`
      conversation_id,
      unread,
      conversations (
        id,
        last_message,
        last_message_at
      ),
      users!conversation_participants_user_auth_id_fkey (
        id,
        naam,
        email,
        avatar_url
      )
    `)
    .eq("user_auth_id", state.session.user.id)
    .order("conversation_id", { ascending: false });

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    console.error("❌ Load conversations error:", error);
    return;
  }

  const box = el.conv();
  box.innerHTML = "";

  if (!data || data.length === 0) {
    box.innerHTML = "<div style='padding:20px;'>Geen gesprekken</div>";
    return;
  }

  data.forEach(c => {
    const user = c.users;
    const convo = c.conversations;

    const div = document.createElement("div");
    div.className = "chat-item";

    div.innerHTML = `
      <div class="avatar">
        ${user?.avatar_url
          ? `<img src="${user.avatar_url}" />`
          : (user?.naam || "?")[0]}
      </div>

      <div style="flex:1;">
        <div style="display:flex;justify-content:space-between;">
          <b>${user?.naam || "Onbekend"}</b>
          <small>${formatTime(convo?.last_message_at)}</small>
        </div>

        <div style="display:flex;justify-content:space-between;">
          <small style="opacity:0.7;">
            ${convo?.last_message || "Geen berichten"}
          </small>

          ${
            c.unread > 0
              ? `<span class="badge">${c.unread}</span>`
              : ""
          }
        </div>
      </div>
    `;

    div.onclick = async () => {
      document.querySelectorAll(".chat-item")
        .forEach(i => i.classList.remove("active"));

      div.classList.add("active");

      activeConversation = c.conversation_id;
      el.header().textContent = user?.naam || "Chat";

      // 🔥 reset unread
      await supabase
        .from("conversation_participants")
        .update({ unread: 0 })
        .eq("user_auth_id", state.session.user.id)
        .eq("conversation_id", activeConversation);

      subscribeRealtime();
      loadMessages();
    };

    box.appendChild(div);
  });

  // 🔥 auto open eerste chat
  if (!activeConversation && data.length > 0) {
    const first = data[0];

    activeConversation = first.conversation_id;
    el.header().textContent = first.users?.naam || "Chat";

    subscribeRealtime();
    loadMessages();
  }
}
  // ======================
  // LOAD MESSAGES
  // ======================
  async function loadMessages() {

    if (!activeConversation) return;

    const { data, error } = await supabase
      .from("chat")
      .select("*")
      .eq("conversation_id", activeConversation)
      .order("created_at", { ascending: true });

    if (error) return console.error(error);

    const box = el.list();
    box.innerHTML = "";

    data.forEach(m => {

      const isMe = m.user_auth_id === state.session.user.id;

      const div = document.createElement("div");
      div.className = "chat-bubble " + (isMe ? "chat-me" : "chat-other");

      div.innerHTML = `
        ${m.bericht}
        <br>
        <small>${new Date(m.created_at).toLocaleTimeString()}</small>
      `;

      box.appendChild(div);
    });

    box.scrollTop = box.scrollHeight;
  }

  // ======================
  // SEND
  // ======================
  async function send() {

    const input = el.input();
    const text = input.value.trim();

    if (!text || !activeConversation) return;

    const { error } = await supabase.from("chat").insert({
      bericht: text,
      user_auth_id: state.session.user.id,
      conversation_id: activeConversation
    });

    if (error) return console.error(error);

    // update laatste bericht
    await supabase
      .from("conversations")
      .update({
        last_message: text,
        last_message_at: new Date()
      })
      .eq("id", activeConversation);

    // 🔴 unread verhogen bij andere users
    await supabase
      .from("conversation_participants")
      .update({ unread: 1 })
      .neq("user_auth_id", state.session.user.id)
      .eq("conversation_id", activeConversation);

    input.value = "";

    loadConversations();
  }

  // ======================
  // REALTIME
  // ======================
 function subscribeRealtime() {

  if (channel) supabase.removeChannel(channel);

  channel = supabase
    .channel("chat-live")

    // 📩 nieuwe berichten
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat",
        filter: `conversation_id=eq.${activeConversation}`
      },
      () => {
        loadMessages();
        loadConversations();
      }
    )

    // ✍️ typing ontvangen
    .on("broadcast", { event: "typing" }, payload => {

      if (payload.payload.conversation !== activeConversation) return;

      showTyping();
      setTimeout(removeTyping, 1200);
    })

    .subscribe();
}

  // ======================
  // TYPING
  // ======================
  function typing() {

    clearTimeout(typingTimeout);

    if (!typingChannel) {
      typingChannel = supabase.channel("typing");
      typingChannel.subscribe();
    }

    if (!activeConversation) return;

    typingChannel.send({
      type: "broadcast",
      event: "typing",
      payload: { conversation: activeConversation }
    });

    typingTimeout = setTimeout(() => {}, 800);
  }
function showTyping() {

  removeTyping();

  const div = document.createElement("div");
  div.id = "typingIndicator";
  div.className = "chat-bubble chat-other";
  div.style.opacity = "0.7";
  div.textContent = "… is aan het typen";

  el.list().appendChild(div);
}

function removeTyping() {
  const t = document.getElementById("typingIndicator");
  if (t) t.remove();
}
  // ======================
  // INIT
  // ======================
 function init() {
  console.log("💬 CHAT INIT");

  const input = el.input();
  const sendBtn = document.getElementById("sendChatBtn");

  // ❌ voorkom dubbele listeners
  if (input) {
    input.replaceWith(input.cloneNode(true));
  }

  if (sendBtn) {
    sendBtn.replaceWith(sendBtn.cloneNode(true));
  }

  const newInput = el.input();
  const newSendBtn = document.getElementById("sendChatBtn");

  // 📩 SEND BUTTON
  if (newSendBtn) {
    newSendBtn.addEventListener("click", send);
  }

  // ⌨️ ENTER + TYPING
  if (newInput) {
    newInput.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      } else {
        typing();
      }
    });
  }

  // 🔥 gesprekken laden
  loadConversations();
}
  return {
    init,
    loadMessages
  };
}