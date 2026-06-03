export async function renderClientNotes(
  client,
  supabase
) {

  const panel =
    document.getElementById(
      "notes"
    );

  if (!panel) {
    return;
  }

  const allNotes = client.notes || "";
  const generalNotes = allNotes
    .split("\n")
    .filter(line => line && !line.startsWith("[UITGIFTE]"))
    .join("\n");

  panel.innerHTML = `

    <h3>
      Notities
    </h3>

    <div class="notes-card">
      <textarea
        id="clientNotesTextarea"
        rows="8"
        placeholder="Typ hier notities..."
      >${generalNotes}</textarea>
      <div class="modal-actions">
        <button
          id="saveClientNotesBtn"
          class="btn"
          type="button"
        >
          Opslaan
        </button>
      </div>
    </div>
  `;

  const saveBtn = document.getElementById(
    "saveClientNotesBtn"
  );

  if (!saveBtn) {
    return;
  }

  saveBtn.onclick = async () => {
    const inputNotes =
      document.getElementById(
        "clientNotesTextarea"
      )?.value || "";

    const distributionLines = (client.notes || "")
      .split("\n")
      .filter(line => line.startsWith("[UITGIFTE]"));

    const notes = [
      ...distributionLines,
      ...inputNotes.split("\n")
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await supabase
      .from("clients")
      .update({ notes })
      .eq("id", client.id);

    if (error) {
      alert(error.message);
      return;
    }

    client.notes = notes;
    alert("Notities opgeslagen");

    const generalNotes =
      document.getElementById(
        "generalNotesText"
      );

    if (generalNotes) {
      generalNotes.textContent =
        inputNotes.trim() || "Geen notities";
    }
  };
}
