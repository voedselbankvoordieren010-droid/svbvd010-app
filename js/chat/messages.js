import { loadConversations, loadMessageConversations } from "./conversations.js";
import { renderMessage } from "./helpers.js";

export async function loadMessages(supabase, state, chatState, el) {
  if (!chatState.activeConversation) {
    return;
  }

  const query = chatState.useLegacyMessages
    ? supabase.from("messages").select("*").eq("client_id", chatState.activeConversation).order("created_at", { ascending: true })
    : supabase.from("chat").select("*").eq("conversation_id", chatState.activeConversation).order("created_at", { ascending: true });

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return;
  }

  const box = el.list();
  if (!box) {
    return;
  }

  box.innerHTML = "";
  (data || []).forEach(message => {
    renderMessage(message, el, state);
  });
  box.scrollTop = box.scrollHeight;
}

export async function openConversationForClient(supabase, state, chatState, el, clientId, clientName) {
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
    chatState.useLegacyMessages = false;
    chatState.activeConversation = conversations[0].id;
    chatState.activeClient = { full_name: clientName };
  } else {
    chatState.useLegacyMessages = true;
    chatState.activeConversation = clientId;
    chatState.activeClient = { full_name: clientName };
  }

  await subscribeRealtime(supabase, state, chatState, el);
  await loadMessages(supabase, state, chatState, el);
}

export async function sendMessage(supabase, state, chatState, el) {
  const input = el.input();
  if (!input) {
    return;
  }

  const text = input.value.trim();
  if (!text || !chatState.activeConversation) {
    return;
  }

  let error = null;
  if (chatState.useLegacyMessages) {
    ({ error } = await supabase.from("messages").insert({
      client_id: chatState.activeConversation,
      sender_id: state.session.user.id,
      message: text
    }));
  } else {
    ({ error } = await supabase.from("chat").insert({
      bericht: text,
      user_auth_id: state.session.user.id,
      conversation_id: chatState.activeConversation
    }));
  }

  if (error) {
    console.error(error);
    return;
  }

  if (!chatState.useLegacyMessages) {
    await supabase
      .from("conversations")
      .update({
        last_message: text,
        last_message_at: new Date()
      })
      .eq("id", chatState.activeConversation);
  }

  input.value = "";
}

export async function subscribeRealtime(supabase, state, chatState, el) {
  if (!chatState.activeConversation) {
    return;
  }

  if (chatState.chatChannel) {
    supabase.removeChannel(chatState.chatChannel);
  }

  const table = chatState.useLegacyMessages ? "messages" : "chat";
  const filter = chatState.useLegacyMessages
    ? `client_id=eq.${chatState.activeConversation}`
    : `conversation_id=eq.${chatState.activeConversation}`;

  chatState.chatChannel = supabase
    .channel(`${table}-${chatState.activeConversation}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table,
      filter
    }, async () => {
      await loadMessages(supabase, state, chatState, el);
      await loadConversations(supabase, state, chatState, el, {
        loadMessageConversations: async () => {
          await loadMessageConversations(supabase, state, chatState, el, {
            onConversationSelected: async () => {
              await loadMessages(supabase, state, chatState, el);
            }
          });
        },
        onConversationSelected: async () => {
          await loadMessages(supabase, state, chatState, el);
        }
      });
    })
    .subscribe();
}

export function typing(supabase, chatState) {
  clearTimeout(chatState.typingTimeout);
  if (!chatState.activeConversation) {
    return;
  }

  if (!chatState.typingChannel) {
    chatState.typingChannel = supabase.channel("typing");
    chatState.typingChannel.subscribe();
  }

  if (chatState.typingChannel) {
    chatState.typingChannel.send({
      type: "broadcast",
      event: "typing",
      payload: { conversation: chatState.activeConversation }
    });
  }

  chatState.typingTimeout = setTimeout(() => {}, 800);
}
