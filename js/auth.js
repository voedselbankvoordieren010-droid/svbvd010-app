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

    if (error) {

      console.error(
        "SESSION ERROR:",
        error
      );

      return false;
    }

    if (!data?.session) {

      console.log(
        "GEEN SESSION"
      );

      return false;
    }

    state.session =
      data.session;

    console.log(
      "SESSION OK"
    );

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

    // BESTAAND PROFIEL
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

    if (profileError) {

      console.error(
        "PROFILE ERROR:",
        profileError
      );

      return false;
    }

    // NIEUW PROFIEL
    if (!profile) {

      console.log(
        "NIEUW PROFIEL"
      );

      const email =
        user.email
          ?.trim()
          ?.toLowerCase() || "";

      const full_name =
        user.user_metadata
          ?.full_name ||

        user.user_metadata
          ?.name ||

        email;

      const {
        data: newProfile,
        error: insertError
      } = await supabase
        .from("profiles")
        .insert({

          id:
            user.id,

          email,

          full_name,

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

    // ROLE VALIDATIE
    const validRoles =
      [
        "admin",
        "hulpverlener",
        "intake",
        "client"
      ];

    if (
      !validRoles.includes(
        profile.role
      )
    ) {

      console.warn(
        "ONGELDIGE ROLE:",
        profile.role
      );

      profile.role =
        "client";
    }

    // CLIENT KOPPELING
    if (
      profile.role ===
      "client" &&

      !profile.client_id
    ) {

      console.log(
        "ZOEK CLIENT KOPPELING"
      );

      const email =
        profile.email
          ?.trim()
          ?.toLowerCase();

      const {
        data: linkedClient,
        error: clientError
      } = await supabase
        .from("clients")
        .select("id")
        .ilike(
          "email",
          email
        )
        .maybeSingle();

      if (clientError) {

        console.error(
          "CLIENT SEARCH ERROR:",
          clientError
        );

      } else if (
        linkedClient
      ) {

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

    // STATE
    state.profile =
      profile;

    // USER INFO
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

  try {

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
        "GOOGLE LOGIN ERROR:",
        error
      );

      alert(
        error.message
      );
    }

  } catch (err) {

    console.error(
      "GOOGLE LOGIN CRASH:",
      err
    );
  }
}

export async function logout(
  supabase
) {

  try {

    await supabase
      .auth
      .signOut();

    location.reload();

  } catch (err) {

    console.error(
      "LOGOUT ERROR:",
      err
    );
  }
}
