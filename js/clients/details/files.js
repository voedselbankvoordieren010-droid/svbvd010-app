export function renderClientFiles(
  client,
  supabase
) {

  const panel =
    document.getElementById(
      "files"
    );

  if (!panel) {
    return;
  }

  panel.innerHTML = `

    <h3>
      Bestanden
    </h3>

    <p>
      Uploads komen hier
    </p>
  `;
}