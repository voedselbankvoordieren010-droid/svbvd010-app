import { supabase } from "./supabase";

export async function sendMessage(user, message) {

  return await supabase
    .from("messages")
    .insert([
      {
        user_auth_id: user.id,
user_email: user.email,
bericht: message
      }
    ]);
}


export async function getMessages() {

  const { data, error } = await supabase
    .from("messages")
    .select("*");

  console.log("MESSAGES:", data);
  console.log("ERROR:", error);

  return data || [];
}

export function subscribeToMessages(callback) {

  return supabase

    .channel("messages-live")

    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages"
      },

      payload => {

        callback(payload.new);

      }
    )

    .subscribe();
}
export async function createConversation(userIds) {

  const { data: conversation, error } =
    await supabase
      .from("conversations")
      .insert([{}])
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  const participants = userIds.map(id => ({
    conversation_id: conversation.id,
    user_auth_id: id
  }));

  await supabase
    .from("conversation_participants")
    .insert(participants);

  return conversation;
}

export async function getUserConversations(userId) {

  const { data, error } = await supabase

    .from("conversation_participants")

    .select(`
      conversation_id,
      conversations (
        id,
        created_at
      )
    `)

    .eq("user_auth_id", userId);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}