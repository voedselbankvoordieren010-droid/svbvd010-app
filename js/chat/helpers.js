export function formatTime(date) {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function getMessageText(message) {
  return message?.bericht || message?.message || "";
}

export function getMessageSenderId(message) {
  return message?.user_auth_id || message?.sender_id || null;
}

export function renderMessage(message, el, state) {
  const box = el.list();
  if (!box) {
    return;
  }

  const senderId = getMessageSenderId(message);
  const isMe = senderId === state.session.user.id;
  const div = document.createElement("div");
  div.className = `chat-bubble ${isMe ? "chat-me" : "chat-other"}`;

  const text = document.createElement("div");
  text.textContent = getMessageText(message);

  const time = document.createElement("small");
  time.textContent = formatTime(message.created_at);

  div.appendChild(text);
  div.appendChild(time);
  box.appendChild(div);
}
