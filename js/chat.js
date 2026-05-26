export function initChat(
  supabase,
  state
) {

  console.log(
    "💬 CHAT MODULE"
  );

  let activeConversation =
    null;

  let chatChannel =
    null;

  let typingChannel =
    null;

  let typingTimeout =
    null;

  // ======================
  // ELEMENTS
  // ======================

  const el = {

    list: () =>
      document.getElementById(
        "chatList"
      ),

    conv: () =>
      document.getElementById(
        "chatConversations"
      ),

    input: () =>
      document.getElementById(
        "chatInput"
      ),

    header: () =>
      document.getElementById(
        "chatHeader"
      )
  };

  // ======================
  // FORMAT TIME
  // ======================

  function formatTime(
    date
  ) {

    if (!date) {
      return "";
    }

    return new Date(date)
      .toLocaleTimeString(
        [],
        {

          hour: "2-digit",

          minute: "2-digit"
        }
      );
  }

  // ======================
  // CLEANUP
  // ======================

  function cleanupRealtime() {

    if (chatChannel) {

      supabase.removeChannel(
        chatChannel
      );

      chatChannel =
        null;
    }

    if (typingChannel) {

      supabase.removeChannel(
        typingChannel
      );

      typingChannel =
        null;
    }
  }

  // ======================
  // RENDER MESSAGE
  // ======================

  function renderMessage(
    message
  ) {

    const box =
      el.list();

    if (!box) {
      return;
    }

    const isMe =
      message.user_auth_id ===
      state.session.user.id;

    const div =
      document.createElement(
        "div"
      );

    div.className =
      `chat-bubble ${
        isMe
          ? "chat-me"
          : "chat-other"
      }`;

    const text =
      document.createElement(
        "div"
      );

    text.textContent =
      message.bericht || "";

    const time =
      document.createElement(
        "small"
      );

    time.textContent =
      formatTime(
        message.created_at
      );

    div.appendChild(text);

    div.appendChild(time);

    box.appendChild(div);
  }

  // ======================
  // LOAD CONVERSATIONS
  // ======================

  async function loadConversations() {

    console.log(
      "🔥 LOAD CONVERSATIONS"
    );

    const {
      data,
      error
    } = await supabase

      .from(
        "conversation_participants"
      )

      .select(`
        conversation_id,
        unread,
        conversations (
          id,
          last_message,
          last_message_at
        )
      `)

      .eq(
        "user_auth_id",
        state.session.user.id
      )

      .order(
        "conversation_id",
        {
          ascending: false
        }
      );

    if (error) {

      console.error(
        error
      );

      return;
    }

    const box =
      el.conv();

    if (!box) {
      return;
    }

    box.innerHTML = "";

    if (!data?.length) {

      box.innerHTML = `

        <div style="
          padding:20px;
        ">

          Geen gesprekken

        </div>

      `;

      return;
    }

    for (const c of data) {

      const convo =
        c.conversations;

      const label =
        `Gesprek ${c.conversation_id}`;

      const snippet =
        convo?.last_message ||
        "Geen berichten";

      const div =
        document.createElement(
          "div"
        );

      div.className =
        "chat-item";

      div.innerHTML = `

        <div class="chat-item-meta">

          <div style="
            display:flex;
            justify-content:
            space-between;
          ">

            <b>
              ${label}
            </b>

            <small>
              ${
                formatTime(
                  convo?.last_message_at
                )
              }
            </small>

          </div>

          <div style="
            display:flex;
            justify-content:
            space-between;
            gap:12px;
          ">

            <small style="
              opacity:0.7;
              flex:1;
            ">
              ${snippet}
            </small>

            ${
              c.unread > 0
                ? `

                  <span class="badge">
                    ${c.unread}
                  </span>

                `
                : ""
            }

          </div>

        </div>
      `;

      div.onclick =
        async () => {

          document
            .querySelectorAll(
              ".chat-item"
            )

            .forEach(i =>
              i.classList.remove(
                "active"
              )
            );

          div.classList.add(
            "active"
          );

          activeConversation =
            c.conversation_id;

          const header =
            el.header();

          if (header) {

            header.textContent =
              "Chat";
          }

          await supabase

            .from(
              "conversation_participants"
            )

            .update({
              unread: 0
            })

            .eq(
              "user_auth_id",
              state.session.user.id
            )

            .eq(
              "conversation_id",
              activeConversation
            );

          subscribeRealtime();

          await loadMessages();
        };

      box.appendChild(div);
    }

    // AUTO OPEN EERSTE
    if (
      !activeConversation &&
      data.length > 0
    ) {

      activeConversation =
        data[0].conversation_id;

      subscribeRealtime();

      await loadMessages();
    }
  }

  // ======================
  // LOAD MESSAGES
  // ======================

  async function loadMessages() {

    if (
      !activeConversation
    ) {
      return;
    }

    const {
      data,
      error
    } = await supabase

      .from("chat")

      .select("*")

      .eq(
        "conversation_id",
        activeConversation
      )

      .order(
        "created_at",
        {
          ascending: true
        }
      );

    if (error) {

      console.error(
        error
      );

      return;
    }

    const box =
      el.list();

    if (!box) {
      return;
    }

    box.innerHTML = "";

    data.forEach(
      renderMessage
    );

    box.scrollTop =
      box.scrollHeight;
  }

  // ======================
  // SEND MESSAGE
  // ======================

  async function send() {

    const input =
      el.input();

    if (!input) {
      return;
    }

    const text =
      input.value.trim();

    if (
      !text ||
      !activeConversation
    ) {
      return;
    }

    const {
      error
    } = await supabase

      .from("chat")

      .insert({

        bericht: text,

        user_auth_id:
          state.session.user.id,

        conversation_id:
          activeConversation
      });

    if (error) {

      console.error(
        error
      );

      return;
    }

    await supabase

      .from("conversations")

      .update({

        last_message:
          text,

        last_message_at:
          new Date()
      })

      .eq(
        "id",
        activeConversation
      );

    input.value = "";
  }

  // ======================
  // REALTIME
  // ======================

  function subscribeRealtime() {

    if (!activeConversation) {
      return;
    }

    if (chatChannel) {

      supabase.removeChannel(
        chatChannel
      );
    }

    chatChannel = supabase

      .channel(
        `chat-${activeConversation}`
      )

      .on(
        "postgres_changes",
        {

          event: "INSERT",

          schema: "public",

          table: "chat",

          filter:
            `conversation_id=eq.${activeConversation}`
        },

        async () => {

          await loadMessages();

          await loadConversations();
        }
      )

      .subscribe();
  }

  // ======================
  // TYPING
  // ======================

  function typing() {

    clearTimeout(
      typingTimeout
    );

    if (!activeConversation) {
      return;
    }

    if (!typingChannel) {

      typingChannel =
        supabase.channel(
          "typing"
        );

      typingChannel.subscribe();
    }

    typingChannel.send({

      type: "broadcast",

      event: "typing",

      payload: {

        conversation:
          activeConversation
      }
    });

    typingTimeout =
      setTimeout(
        () => {},
        800
      );
  }

  // ======================
  // INIT
  // ======================

  function init() {

    console.log(
      "💬 CHAT INIT"
    );

    const header =
      el.header();

    if (header) {
      header.textContent =
        "Vrijwilliger inbox";
    }

    const input =
      el.input();

    const sendBtn =
      document.getElementById(
        "sendChatBtn"
      );

    if (sendBtn) {

      sendBtn.onclick =
        send;
    }

    if (input) {

      input.addEventListener(
        "keydown",
        e => {

          if (
            e.key === "Enter" &&
            !e.shiftKey
          ) {

            e.preventDefault();

            send();

          } else {

            typing();
          }
        }
      );
    }

    loadConversations();

    // PAGE EXIT CLEANUP
    window.addEventListener(
      "beforeunload",
      cleanupRealtime
    );
  }

  return {

    init,

    loadMessages,

    cleanupRealtime
  };
}
