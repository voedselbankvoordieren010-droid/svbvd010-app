export async function checkSession(
  supabase,
  state
) {

  const {
    data,
    error
  } = await supabase.auth.getSession();

  console.log(
    "SESSION:",
    data
  );

  console.log(
    "SESSION ERROR:",
    error
  );

  if (
    error ||
    !data?.session
  ) {

    console.log(
      "GEEN SESSION"
    );

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

  console.log(
    "LOAD PROFILE START"
  );

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

    console.log(
      "PROFILE DATA:",
      data
    );

    console.log(
      "PROFILE ERROR:",
      error
    );

    if (error) {

      return false;
    }

    // profiel bestaat niet
    if (!data) {

      console.log(
        "NIEUW PROFIEL"
      );

      const {
        data: newProfile,
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

          role: "admin",

          approved: true
        })
        .select()
        .single();

      if (insertError) {

        console.error(
          insertError
        );

        return false;
      }

      state.profile =
        newProfile;

    } else {

      state.profile =
        data;
    }

    // user info tonen
    const userMeta =
      document.getElementById(
        "userMeta"
      );

    if (userMeta) {

      userMeta.textContent = `
        ${state.profile.email}
        (${state.profile.role})
      `;
    }

    return true;

  } catch (err) {

    console.error(
      "LOAD PROFILE CRASH:",
      err
    );

    return false;
  }
}