export async function renderClientDistributions(
  client,
  supabase,
  state
) {
  const panel = document.getElementById(
    "distributions"
  );
  if (!panel) {
    return;
  }

  const createFallbackList = () => {
    return (client.notes || "")
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .filter(line => line.startsWith("[UITGIFTE]"))
      .map(line => {
        const content = line.replace(/^[^\]]+\]\s*/, "");
        const parts = content.split(" - ");
        return {
          id: null,
          date: parts[0] || "",
          item: parts[1] || "",
          note: parts.slice(2).join(" - ") || "",
          source: "notes"
        };
      });
  };

  const createRow = row => ({
    id: row.id,
    date: row.date || row.created_at?.slice(0, 10) || "",
    item: row.item || "",
    note: row.note || "",
    source: "table"
  });

  const loadDistributions = async () => {
    const { data, error } = await supabase
      .from("client_distributions")
      .select("id, date, item, note, created_by, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("client_distributions load failed", error);
      return null;
    }

    return Array.isArray(data)
      ? data.map(createRow)
      : [];
  };

  const tableDistributions = await loadDistributions();
  const distributions =
    tableDistributions === null
      ? createFallbackList()
      : tableDistributions.length
      ? tableDistributions
      : createFallbackList();

  panel.innerHTML = `
    <div class="info-card">
      <h3>Uitgifte historie</h3>
      <div id="clientDistributionList">
        ${distributions.length
          ? `<ol class="distribution-list">
              ${distributions
                .map(entry => `
                  <li>
                    <strong>${entry.date}</strong><br>
                    ${entry.item || "Onbekend product"}<br>
                    ${entry.note || "Geen toelichting"}
                  </li>
                `)
                .join("")}
            </ol>`
          : `<p>Geen uitgiftegeschiedenis gevonden.</p>`}
      </div>
    </div>

    <div class="info-card">
      <h3>Nieuwe uitgifte toevoegen</h3>
      <label>
        Datum<br>
        <input id="distributionDate" type="date" value="${new Date()
          .toISOString()
          .slice(0, 10)}">
      </label>
      <label>
        Aantal / product<br>
        <input id="distributionItem" type="text" placeholder="Bijv. 3 kratten aardappelen">
      </label>
      <label>
        Extra toelichting<br>
        <textarea id="distributionNote" rows="3" placeholder="Optioneel"></textarea>
      </label>
      <div class="modal-actions" style="margin-top:12px;">
        <button id="saveDistributionBtn" class="btn" type="button">Opslaan</button>
      </div>
    </div>
  `;

  const saveBtn = document.getElementById(
    "saveDistributionBtn"
  );
  if (!saveBtn) {
    return;
  }

  saveBtn.onclick = async () => {
    const date =
      document.getElementById(
        "distributionDate"
      )?.value || "";
    const item =
      document.getElementById(
        "distributionItem"
      )?.value?.trim() || "";
    const note =
      document.getElementById(
        "distributionNote"
      )?.value?.trim() || "";

    if (!date || !item) {
      alert("Vul datum en product/hoeveelheid in.");
      return;
    }

    const payload = {
      client_id: client.id,
      date,
      item,
      note,
      created_by: state?.profile?.id || null
    };

    const { error } = await supabase
      .from("client_distributions")
      .insert(payload);

    if (error) {
      console.warn("client_distributions insert failed", error);
      alert("Opslaan naar client_distributions mislukt. Probeer het opnieuw of gebruik de oude notatie.");
      return;
    }

    const freshRows = await loadDistributions();
    if (freshRows !== null) {
      client.distributions = freshRows;
    }

    await renderClientDistributions(client, supabase, state);
  };
}
