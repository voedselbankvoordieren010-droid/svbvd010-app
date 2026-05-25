export function renderClientNotes(
  client
) {

  const panel =
    document.getElementById(
      "notes"
    );

  if (!panel) {
    return;
  }

  panel.innerHTML = `

    <h3>
      Notities
    </h3>

    <div class="card">

      ${client.notes || "Geen notities"}

    </div>
  `;
}