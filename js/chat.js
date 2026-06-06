import { loadConversations as loadConversationsModule, loadMessageConversations as loadMessageConversationsModule } from "./chat/conversations.js";
import { loadMessages as loadMessagesModule, openConversationForClient as openConversationForClientModule, sendMessage as sendMessageModule, subscribeRealtime as subscribeRealtimeModule, typing as typingModule } from "./chat/messages.js";

export function initChat(supabase, state, prefix = "") {
  console.log("💬 CHAT MODULE");

  const chatState = {
    activeConversation: null,
    useLegacyMessages: false,
    activeClient: null,
    legacyClientMap: new Map(),
    chatChannel: null,
    typingChannel: null,
    typingTimeout: null
  };

  const el = {
    list: () => document.getElementById(`${prefix}chatList`),
    conv: () => document.getElementById(`${prefix}chatConversations`),
    input: () => document.getElementById(`${prefix}chatInput`),
    header: () => document.getElementById(`${prefix}chatHeader`)
  };

  function cleanupRealtime() {
    if (chatState.chatChannel) {
      supabase.removeChannel(chatState.chatChannel);
      chatState.chatChannel = null;
    }

    if (chatState.typingChannel) {
      supabase.removeChannel(chatState.typingChannel);
      chatState.typingChannel = null;
    }
  }

  async function loadConversations() {
    await loadConversationsModule(supabase, state, chatState, el, {
      loadMessageConversations: async () => {
        await loadMessageConversationsModule(supabase, state, chatState, el, {
          onConversationSelected: async () => {
            await subscribeRealtime();
            await loadMessages();
          }
        });
      },
      onConversationSelected: async () => {
        await subscribeRealtime();
        await loadMessages();
      }
    });
  }

  async function loadMessageConversations() {
    await loadMessageConversationsModule(supabase, state, chatState, el, {
      onConversationSelected: async () => {
        await subscribeRealtime();
        await loadMessages();
      }
    });
  }

  async function loadMessages() {
    await loadMessagesModule(supabase, state, chatState, el);
  }

  async function openConversationForClient(clientId, clientName) {
    await openConversationForClientModule(supabase, state, chatState, el, clientId, clientName);
  }

  async function send() {
    await sendMessageModule(supabase, state, chatState, el);
  }

  function subscribeRealtime() {
    return subscribeRealtimeModule(supabase, state, chatState, el);
  }

  function typing() {
    return typingModule(supabase, chatState);
  }

  function init() {
    console.log("💬 CHAT INIT");

    const header = el.header();
    if (header) {
      header.textContent = "Vrijwilliger inbox";
    }

    const input = el.input();
    const sendBtn = document.getElementById(`${prefix}sendChatBtn`);

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
