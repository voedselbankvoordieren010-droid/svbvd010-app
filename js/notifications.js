export async function loadNotifications(
  supabase,
  state
) {

  const container =
    document.getElementById(
      "notifications"
    );

  const badge =
    document.getElementById(
      "notifCount"
    );

  // voorkom crash
  if (!container || !badge) {

    console.warn(
      "Notification elements ontbreken"
    );

    return;
  }

  const {
    data,
    error
  } = await supabase
    .from("notifications")
    .select("*")
    .eq(
      "user_auth_id",
      state.session.user.id
    )
    .order(
      "created_at",
      { ascending: false }
    );

  if (error) {

    console.error(error);

    return;
  }

  container.innerHTML = "";

  if (!data || !data.length) {

    container.innerHTML = `
      <div class="card">
        Geen notificaties
      </div>
    `;

    badge.style.display =
      "none";

    return;
  }

  const unread =
    data.filter(
      n => !n.gelezen
    ).length;

  badge.textContent =
    String(unread);

  badge.style.display =
    unread
      ? "inline-block"
      : "none";

  data.forEach(n => {

    const div =
      document.createElement(
        "div"
      );

    div.className =
      "list-item";

    div.textContent =
      n.bericht;

    div.onclick =
      async () => {

        const {
          error
        } = await supabase
          .from("notifications")
          .update({
            gelezen: true
          })
          .eq("id", n.id);

        if (error) {

          console.error(error);

          return;
        }

        loadNotifications(
          supabase,
          state
        );
      };

    container.appendChild(div);

  });

}