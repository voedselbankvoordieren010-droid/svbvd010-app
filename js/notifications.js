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

  // ELEMENTEN BESTAAN NIET
  if (
    !container ||
    !badge
  ) {

    console.warn(
      "NOTIFICATION ELEMENTS ONTBREKEN"
    );

    return;
  }

  // GEEN SESSION
  if (
    !state?.session?.user?.id
  ) {

    console.warn(
      "GEEN USER SESSION"
    );

    return;
  }

  // LOADING
  container.innerHTML = `

    <div class="card">
      Laden...
    </div>

  `;

  // DATA OPHALEN
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
      {
        ascending: false
      }
    );

  // ERROR
  if (error) {

    console.error(
      "NOTIFICATION ERROR:",
      error
    );

    container.innerHTML = `

      <div class="card">
        Fout bij laden
      </div>

    `;

    return;
  }

  // LEGEN
  container.innerHTML = "";

  // GEEN NOTIFICATIES
  if (!data?.length) {

    container.innerHTML = `

      <div class="card">
        Geen notificaties
      </div>

    `;

    badge.style.display =
      "none";

    return;
  }

  // UNREAD
  const unread =
    data.filter(
      n => !n.gelezen
    ).length;

  badge.textContent =
    String(unread);

  badge.style.display =
    unread > 0
      ? "inline-block"
      : "none";

  // RENDER
  data.forEach(n => {

    const div =
      document.createElement(
        "div"
      );

    div.className =
      `list-item ${
        !n.gelezen
          ? "unread"
          : ""
      }`;

    // VEILIG
    div.textContent =
      n.bericht ||
      "Lege notificatie";

    // CLICK
    div.onclick =
      async () => {

        // AL GELEZEN
        if (n.gelezen) {
          return;
        }

        div.classList.remove(
          "unread"
        );

        // BADGE DIRECT UPDATE
        const nextUnread =
          Math.max(
            unread - 1,
            0
          );

        badge.textContent =
          String(nextUnread);

        badge.style.display =
          nextUnread > 0
            ? "inline-block"
            : "none";

        // DATABASE UPDATE
        const {
          error
        } = await supabase

          .from("notifications")

          .update({
            gelezen: true
          })

          .eq(
            "id",
            n.id
          );

        if (error) {

          console.error(
            "NOTIFICATION UPDATE ERROR:",
            error
          );

          div.classList.add(
            "unread"
          );
        }
      };

    container.appendChild(
      div
    );
  });
}

export async function sendNotification(
  supabase,
  userAuthId,
  message
) {
  if (!userAuthId || !message) {
    return;
  }

  const { error } = await supabase
    .from("notifications")
    .insert({
      user_auth_id: userAuthId,
      bericht: message,
      gelezen: false
    });

  if (error) {
    console.error(
      "SEND NOTIFICATION ERROR:",
      error
    );
  }
}
