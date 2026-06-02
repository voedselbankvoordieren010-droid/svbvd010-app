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

  panel.innerHTML = `

    <h3>
      Notities
    </h3>

    <div class="notes-card">
      <textarea
        id="clientNotesTextarea"
        rows="8"
        placeholder="Typ hier notities..."
      >${client.notes || ""}</textarea>
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
    const notes =
      document.getElementById(
        "clientNotesTextarea"
      )?.value?.trim() || "";

    const { error } = await supabase
      .from("clients")
      .update({ notes })
      .eq("id", client.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Notities opgeslagen");

    const generalNotes =
      document.getElementById(
        "generalNotesText"
      );

    if (generalNotes) {
      generalNotes.textContent =
        notes || "Geen notities";
    }
  };
}
