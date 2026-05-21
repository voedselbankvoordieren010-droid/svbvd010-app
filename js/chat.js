export function initChat(
  supabase,
  state
) {

  console.log(
    "📦 chat.js geladen"
  );

  let activeConversation = null;

  let channel = null;

  let typingChannel = null;

  let typingTimeout;

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

  function formatTime(date) {

    if (!date) return "";

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
  // LOAD CONVERSATIONS
  // ======================

  async function loadConversations() {

    console.log(
      "🔥 LOAD CONVERSATIONS START"
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

    console.log(
      "DATA:",
      data
    );

    console.log(
      "ERROR:",
      error
    );

    if (error) {

      console.error(error);

      return;
    }

    const box = el.conv();

    if (!box) return;

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

      const div =
        document.createElement(
          "div"
        );

      div.className =
        "chat-item";

      div.innerHTML = `
        <div style="
          flex:1;
        ">

          <div style="
            display:flex;
            justify-content:
            space-between;
          ">

            <b>
              Gesprek
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
          ">

            <small style="
              opacity:0.7;
            ">
              ${
                convo?.last_message ||
                "Geen berichten"
              }
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

          loadMessages();
        };

      box.appendChild(div);
    }

    if (
      !activeConversation &&
      data.length > 0
    ) {

      activeConversation =
        data[0].conversation_id;

      subscribeRealtime();

      loadMessages();
    }
  }

  // ======================
  // LOAD MESSAGES
  // ======================

  async function loadMessages() {

    if (!activeConversation)
      return;

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

      console.error(error);

      return;
    }

    const box = el.list();

    if (!box) return;

    box.innerHTML = "";

    data.forEach(m => {

      const isMe =
        m.user_auth_id ===
        state.session.user.id;

      const div =
        document.createElement(
          "div"
        );

      div.className =
        "chat-bubble " +

        (
          isMe
            ? "chat-me"
            : "chat-other"
        );

      div.innerHTML = `
        ${m.bericht}

        <br>

        <small>
          ${formatTime(m.created_at)}
        </small>
      `;

      box.appendChild(div);
    });

    box.scrollTop =
      box.scrollHeight;
  }

  // ======================
  // SEND
  // ======================

  async function send() {

    const input =
      el.input();

    if (!input) return;

    const text =
      input.value.trim();

    if (
      !text ||
      !activeConversation
    ) return;

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

      console.error(error);

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

    if (channel) {

      supabase.removeChannel(
        channel
      );
    }

    channel = supabase

      .channel(
        "chat-live"
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

        () => {

          loadMessages();

          loadConversations();
        }
      )

      .on(
        "broadcast",
        {
          event: "typing"
        },
        payload => {

          if (
            payload.payload
              .conversation !==
            activeConversation
          ) return;

          showTyping();

          setTimeout(
            removeTyping,
            1200
          );
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

    if (!typingChannel) {

      typingChannel =
        supabase.channel(
          "typing"
        );

      typingChannel
        .subscribe();
    }

    if (!activeConversation)
      return;

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

  function showTyping() {

    removeTyping();

    const div =
      document.createElement(
        "div"
      );

    div.id =
      "typingIndicator";

    div.className =
      "chat-bubble chat-other";

    div.style.opacity =
      "0.7";

    div.textContent =
      "… is aan het typen";

    const list =
      el.list();

    if (!list) return;

    list.appendChild(div);
  }

  function removeTyping() {

    const t =
      document.getElementById(
        "typingIndicator"
      );

    if (t) t.remove();
  }

  // ======================
  // INIT
  // ======================

  function init() {

    console.log(
      "💬 CHAT INIT"
    );

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
  }

  return {

    init,

    loadMessages

  };

}