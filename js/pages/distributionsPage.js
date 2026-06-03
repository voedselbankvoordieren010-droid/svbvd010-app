export async function renderDistributionsPage(supabase, state) {
  const container = document.getElementById("distributions");
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="card" style="padding:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div>
          <h1>Uitgiftes</h1>
          <p style="margin:6px 0 0;color:#555;">Beheer alle distributies voor cliënten en voeg nieuwe uitgiftes toe.</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0 24px;">
        <label style="display:block;">
          Zoeken
          <input id="distributionsSearch" type="search" placeholder="Zoek op cliëntnaam, product of opmerking" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;margin-top:8px;">
        </label>
        <label style="display:block;">
          Filter maand
          <input id="distributionsMonth" type="month" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;margin-top:8px;">
        </label>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
        <section class="card" style="padding:16px;">
          <h2 style="margin-top:0;">Nieuwe uitgifte</h2>
          <label style="display:block;margin-bottom:12px;">
            Cliënt
            <select id="distributionClient" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;margin-top:8px;"></select>
          </label>
          <label style="display:block;margin-bottom:12px;">
            Datum
            <input id="distributionDate" type="date" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;margin-top:8px;" value="${new Date().toISOString().slice(0, 10)}">
          </label>
          <label style="display:block;margin-bottom:12px;">
            Product / hoeveelheid
            <input id="distributionItem" type="text" placeholder="Bijv. 3 kratten aardappelen" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;margin-top:8px;">
          </label>
          <label style="display:block;margin-bottom:12px;">
            Extra toelichting
            <textarea id="distributionNote" rows="3" placeholder="Optioneel" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:8px;margin-top:8px;"></textarea>
          </label>
          <button id="saveDistributionBtn" class="btn" type="button">Opslaan</button>
          <div id="distributionSaveStatus" style="margin-top:12px;color:#d00;"></div>
        </section>

        <section class="card" style="padding:16px;">
          <h2 style="margin-top:0;">Statistieken</h2>
          <div id="distributionStats" style="display:grid;grid-template-columns:1fr;gap:12px;margin-top:16px;"></div>
        </section>
      </div>

      <section>
        <h2>Uitgiftegeschiedenis</h2>
        <div id="distributionList" style="margin-top:16px;">Laden...</div>
      </section>
    </div>
  `;

  const clientSelect = document.getElementById("distributionClient");
  const searchInput = document.getElementById("distributionsSearch");
  const monthInput = document.getElementById("distributionsMonth");
  const saveStatus = document.getElementById("distributionSaveStatus");

  const loadClients = async () => {
    if (!clientSelect) {
      return [];
    }

    clientSelect.innerHTML = `<option value="">Laden...</option>`;

    const query = supabase
      .from("clients")
      .select("id, full_name")
      .order("full_name", { ascending: true });

    const { data, error } = await query;
    if (error) {
      console.error("Failed to load clients for distributions page", error);
      clientSelect.innerHTML = `<option value="">Fout bij laden cliënten</option>`;
      return [];
    }

    if (!data?.length) {
      clientSelect.innerHTML = `<option value="">Geen cliënten gevonden</option>`;
      return [];
    }

    clientSelect.innerHTML = `
      <option value="">Selecteer cliënt</option>
      ${data.map(client => `<option value="${client.id}">${client.full_name || client.id}</option>`).join("")}
    `;

    return data;
  };

  const loadDistributions = async () => {
    const list = document.getElementById("distributionList");
    const stats = document.getElementById("distributionStats");
    if (list) list.innerHTML = `Laden...`;
    if (stats) stats.innerHTML = ``;

    const result = await supabase
      .from("client_distributions")
      .select("id, client_id, date, item, note, created_by, created_at")
      .order("created_at", { ascending: false });

    if (result.error) {
      console.error("Failed to load distributions", result.error);
      if (list) list.innerHTML = `<p>Fout bij laden uitgiftes.</p>`;
      return [];
    }

    const rows = Array.isArray(result.data) ? result.data : [];
    const clientIds = [...new Set(rows.map(row => row.client_id).filter(Boolean))];
    const creatorIds = [...new Set(rows.map(row => row.created_by).filter(Boolean))];
    const clientMap = {};
    const creatorMap = {};

    if (clientIds.length) {
      const clientQuery = await supabase
        .from("clients")
        .select("id, full_name")
        .in("id", clientIds);

      if (!clientQuery.error && Array.isArray(clientQuery.data)) {
        clientQuery.data.forEach(client => {
          clientMap[client.id] = client.full_name || client.id;
        });
      }
    }

    if (creatorIds.length) {
      const creatorQuery = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", creatorIds);

      if (!creatorQuery.error && Array.isArray(creatorQuery.data)) {
        creatorQuery.data.forEach(user => {
          creatorMap[user.id] = user.full_name || user.email || user.id;
        });
      }
    }

    return rows.map(row => ({
      ...row,
      client_name: clientMap[row.client_id] || "Onbekende cliënt",
      creator_name: creatorMap[row.created_by] || row.created_by || "Systeem"
    }));
  };

  const applyFilters = rows => {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const monthValue = monthInput?.value || "";
    return rows.filter(row => {
      const matchesSearch = q
        ? [row.client_name, row.item, row.note, row.creator_name, row.date]
            .filter(Boolean)
            .some(value => value.toLowerCase().includes(q))
        : true;
      const matchesMonth = monthValue
        ? row.date?.startsWith(monthValue) || row.created_at?.startsWith(monthValue)
        : true;
      return matchesSearch && matchesMonth;
    });
  };

  const renderSummary = rows => {
    const stats = document.getElementById("distributionStats");
    if (!stats) {
      return;
    }

    const total = rows.length;
    const uniqueClients = new Set(rows.map(row => row.client_id)).size;
    const recent = rows.slice(0, 3);

    stats.innerHTML = `
      <div style="padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;">
        <strong>Totaal uitgiftes</strong>
        <div style="font-size:1.5rem;">${total}</div>
      </div>
      <div style="padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;">
        <strong>Cliënten met uitgifte</strong>
        <div style="font-size:1.5rem;">${uniqueClients}</div>
      </div>
      <div style="padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;">
        <strong>Laatste registratie</strong>
        <div style="font-size:1rem;">${recent.length ? recent[0].date || recent[0].created_at?.slice(0, 10) : "-"}</div>
      </div>
    `;
  };

  const renderDistributionList = rows => {
    const list = document.getElementById("distributionList");
    if (!list) {
      return;
    }

    if (!rows.length) {
      list.innerHTML = `<p>Geen uitgiftes gevonden.</p>`;
      return;
    }

    list.innerHTML = `
      <div style="display:grid;gap:12px;">
        ${rows
          .map(row => `
            <article class="card" style="padding:16px;">
              <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;flex-wrap:wrap;">
                <div>
                  <strong>${row.client_name}</strong>
                  <div style="margin-top:6px;color:#555;">${row.item || "Onbekend product"}</div>
                </div>
                <div style="text-align:right;min-width:130px;">
                  <div style="font-size:0.95rem;color:#666;">${row.date || row.created_at?.slice(0, 10) || "-"}</div>
                  <div style="margin-top:4px;color:#333;">${row.creator_name || "Systeem"}</div>
                </div>
              </div>
              <p style="margin:12px 0 0;color:#555;">${row.note || "Geen toelichting."}</p>
            </article>
          `)
          .join("")}
      </div>
    `;
  };

  const refreshPage = async () => {
    const rows = await loadDistributions();
    const filtered = applyFilters(rows);
    renderSummary(filtered);
    renderDistributionList(filtered);
  };

  const clients = await loadClients();
  await refreshPage();

  if (searchInput) {
    searchInput.addEventListener("input", () => refreshPage());
  }

  if (monthInput) {
    monthInput.addEventListener("change", () => refreshPage());
  }

  const saveButton = document.getElementById("saveDistributionBtn");
  if (saveButton) {
    saveButton.addEventListener("click", async () => {
      if (!clientSelect) {
        return;
      }

      const clientId = clientSelect.value;
      const date = document.getElementById("distributionDate")?.value || "";
      const item = document.getElementById("distributionItem")?.value?.trim() || "";
      const note = document.getElementById("distributionNote")?.value?.trim() || "";

      saveStatus.textContent = "";
      if (!clientId || !date || !item) {
        saveStatus.textContent = "Vul cliënt, datum en product/hoeveelheid in.";
        return;
      }

      const payload = {
        client_id: clientId,
        date,
        item,
        note,
        created_by: state?.profile?.id || null
      };

      const { error } = await supabase.from("client_distributions").insert(payload);
      if (error) {
        console.error("Failed to save distribution", error);
        saveStatus.textContent = "Opslaan mislukt. Probeer het opnieuw.";
        return;
      }

      document.getElementById("distributionItem").value = "";
      document.getElementById("distributionNote").value = "";
      saveStatus.textContent = "Uitgifte succesvol toegevoegd.";
      await refreshPage();
    });
  }
}
