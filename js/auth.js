export async function checkSession(
  supabase,
  state
) {

  const {
    data,
    error
  } = await supabase.auth.getSession();

  if (error) {

    console.error(
      "Session error:",
      error
    );

    return false;
  }

  if (!data.session) {

    window.location.href =
      "./index.html";

    return false;
  }

  state.session =
    data.session;

  return true;
}

export async function loadProfile(
  supabase,
  state
) {

  try {

    const {
      data,
      error
    } = await supabase
      .from("profiles")
      .select("*")
      .eq(
        "id",
        state.session.user.id
      )
      .maybeSingle();

    if (error) {

      console.error(
        "Profile error:",
        error
      );

      return false;
    }

    // 🔥 nieuw profiel aanmaken
    if (!data) {

      console.log(
        "Nieuw profiel aanmaken..."
      );

      const {
        data: newUser,
        error: insertError
      } = await supabase
        .from("profiles")
        .insert({
          id:
            state.session.user.id,

          email:
            state.session.user.email,

          full_name:
            state.session.user.email,

          role: "client",

          approved: true
        })
        .select()
        .single();

      if (insertError) {

        console.error(
          "Insert error:",
          insertError
        );

        return false;
      }

      state.profile =
        newUser;

    } else {

      state.profile =
        data;
    }

    // 🔐 approved check
    if (
      !state.profile?.approved
    ) {

      alert(
        "Nog niet goedgekeurd"
      );

      window.location.href =
        "./index.html";

      return false;
    }

    // 👤 user info tonen
    const el =
      document.getElementById(
        "userMeta"
      );

    if (el) {

      el.textContent = `
        ${state.profile.email}
        (${state.profile.role})
      `;
    }

    return true;

  } catch (err) {

    console.error(
      "loadProfile crash:",
      err
    );

    return false;
  }
}