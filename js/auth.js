export async function checkSession(
  supabase,
  state
) {

  try {

    const {
      data,
      error
    } = await supabase
      .auth
      .getSession();

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

  } catch (err) {

    console.error(
      "SESSION CRASH:",
      err
    );

    return false;
  }
}

export async function loadProfile(
  supabase,
  state
) {

  console.log(
    "LOAD PROFILE START"
  );

  try {

    const user =
      state.session?.user;

    if (!user) {

      console.error(
        "GEEN USER"
      );

      return false;
    }

    // bestaand profiel ophalen
    let {
      data: profile,
      error: profileError
    } = await supabase
      .from("profiles")
      .select("*")
      .eq(
        "id",
        user.id
      )
      .maybeSingle();

    console.log(
      "PROFILE DATA:",
      profile
    );

    console.log(
      "PROFILE ERROR:",
      profileError
    );

    if (profileError) {

      console.error(
        profileError
      );

      return false;
    }

    // profiel bestaat nog niet
    if (!profile) {

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
            user.id,

          email:
            user.email,

          full_name:

            user.user_metadata
              ?.full_name ||

            user.user_metadata
              ?.name ||

            user.email,

          role: "client",

          approved: false
        })
        .select()
        .single();

      if (insertError) {

        console.error(
          "INSERT ERROR:",
          insertError
        );

        return false;
      }

      profile =
        newProfile;
    }

    // automatische client koppeling
    if (
      profile.role === "client" &&
      !profile.client_id
    ) {

      console.log(
        "ZOEK CLIENT KOPPELING"
      );

      const {
        data: linkedClient,
        error: clientError
      } = await supabase
        .from("clients")
        .select("id")
        .eq(
          "email",
          profile.email
        )
        .maybeSingle();

      if (clientError) {

        console.error(
          "CLIENT SEARCH ERROR:",
          clientError
        );
      }

      if (linkedClient) {

        console.log(
          "CLIENT GEVONDEN"
        );

        const {
          error: updateError
        } = await supabase
          .from("profiles")
          .update({

            client_id:
              linkedClient.id
          })
          .eq(
            "id",
            profile.id
          );

        if (updateError) {

          console.error(
            "CLIENT LINK ERROR:",
            updateError
          );

        } else {

          profile.client_id =
            linkedClient.id;

          console.log(
            "CLIENT GEKOPPELD"
          );
        }
      }
    }

    state.profile =
      profile;

    // user info tonen
    const userMeta =
      document.getElementById(
        "userMeta"
      );

    if (userMeta) {

      userMeta.textContent = `

        ${profile.email}

        (${profile.role})

      `;
    }

    console.log(
      "PROFILE OK",
      profile
    );

    return true;

  } catch (err) {

    console.error(
      "LOAD PROFILE CRASH:",
      err
    );

    return false;
  }
}
export async function loginWithGoogle(
  supabase
) {

  const {
    error
  } = await supabase
    .auth
    .signInWithOAuth({

      provider: "google",

      options: {

        redirectTo:
          window.location.origin
      }
    });

  if (error) {

    console.error(
      error
    );

    alert(
      error.message
    );
  }
}
