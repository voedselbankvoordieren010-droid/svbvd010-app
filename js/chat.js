export function initChat(supabase, state) {

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

  // ======================
  // LOAD CONVERSATIONS
  // ======================
  async function loadConversations() {

    const { data, error } = await supabase
      .from("conversation_participants")
      .select(`
  conversation_id,
  users!cp_user_fk (
    naam,
    email,
    avatar_url
  )
`)
      .eq("user_auth_id", state.session.user.id);

    if (error) return console.error(error);

    const box = el.conv();
    box.innerHTML = "";

    data.forEach(c => {

      const user = c.users;

      const div = document.createElement("div");
      div.className = "chat-item";

      div.innerHTML = `
        <div class="avatar">
          ${user?.avatar_url
            ? `<img src="${user.avatar_url}" />`
            : (user?.naam || "?")[0]}
        </div>
        <div>
          <b>${user?.naam || "Onbekend"}</b><br>
          <small>${user?.email}</small>
        </div>
      `;

      div.onclick = () => {
        activeConversation = c.conversation_id;
        el.header().textContent = user?.naam || "Chat";
        subscribeRealtime();
        loadMessages();
      };

      box.appendChild(div);
    });
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

    if (!input.value || !activeConversation) return;

    await supabase.from("chat").insert({
      bericht: input.value,
      user_auth_id: state.session.user.id,
      conversation_id: activeConversation
    });

    input.value = "";
  }

  // ======================
  // REALTIME
  // ======================
  function subscribeRealtime() {

    if (channel) {
      supabase.removeChannel(channel);
    }

    channel = supabase
      .channel("chat-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat",
          filter: `conversation_id=eq.${activeConversation}`
        },
        () => loadMessages()
      )
      .subscribe();
  }

  // ======================
  // TYPING INDICATOR
  // ======================
function typing() {
  clearTimeout(typingTimeout);

  if (!typingChannel) {
    typingChannel = supabase.channel("typing");
    typingChannel.subscribe();
  }

  if (!activeConversation) return;

typingChannel.httpSend({
  event: "typing",
  payload: {
    user: state.session.user.id,
    conversation: activeConversation
  }
});

  typingTimeout = setTimeout(() => {}, 800);
}

  // ======================
  // INIT
  // ======================
  function init() {

    document.getElementById("sendChatBtn").onclick = send;

    const input = el.input();

    input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  } else {
    typing();
  }
});

    loadConversations();
  }

  return { init, loadMessages };
}