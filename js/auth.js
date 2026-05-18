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

  if (!data?.session) {

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

  return true;
}