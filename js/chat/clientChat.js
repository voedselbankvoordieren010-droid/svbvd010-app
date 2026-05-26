export async function loadClientMessages(
  supabase,
  profile
) {

  const container =
    document.getElementById(
      "clientMessages"
    );

  if (!container) {
    return;
  }

  if (!profile?.client_id || !profile?.id) {
    container.innerHTML = `
      <p>
        Geen geldig profiel om berichten te laden.
      </p>
    `;
    return;
  }

  if (!container) {
    return;
  }

  const {
    data,
    error
  } = await supabase
    .from("messages")
    .select("*")
    .eq(
      "client_id",
      profile.client_id
    )
    .order(
      "created_at",
      {
        ascending: true
      }
    );

  if (error) {

    console.error(error);

    container.innerHTML =
      "Fout bij laden berichten";

    return;
  }

  if (!data?.length) {

    container.innerHTML =
      `

        <p>
          Nog geen berichten
        </p>

      `;

    return;
  }

  container.innerHTML = "";

  data.forEach(message => {

    const isMe =
      message.sender_id ===
      profile.id;

    const messageEl =
      document.createElement("div");

    messageEl.className =
      `chat-message ${
        isMe ? "me" : "other"
      }`;

    const p =
      document.createElement("p");

    p.textContent =
      message.message || "";

    messageEl.appendChild(p);

    container.appendChild(messageEl);
  });
}