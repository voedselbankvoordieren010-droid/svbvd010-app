export function getDashboardTitle(role) {
  if (role === "admin") {
    return "Beheer dashboard";
  }
  if (role === "hulpverlener") {
    return "Dashboard hulpverlener";
  }
  return "Dashboard";
}

function parseDistributionDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const parts = value.split(/[-/]/).map(Number);
  if (parts.length !== 3) {
    return null;
  }

  let [year, month, day] = parts;
  if (year < 100) {
    year += year > 50 ? 1900 : 2000;
  }

  if (parts[0] > 31) {
    [day, month, year] = parts;
  }

  return new Date(year, month - 1, day);
}

function isCurrentMonth(value, now) {
  const date = parseDistributionDate(value);
  return date && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export async function updateDashboardCounts(supabase) {
  const [aanvragenRes, clientsRes, volunteersRes, distributionsRes] = await Promise.all([
    supabase.from("client_aanvragen").select("status, opmerkingen"),
    supabase.from("clients").select("warning_notes, notes"),
    supabase.from("profiles").select("id").eq("role", "vrijwilliger"),
    supabase.from("client_distributions").select("id, date, created_at")
  ]);

  const now = new Date();
  const counts = {
    nieuw: 0,
    intake: 0,
    spoed: 0,
    clients: 0,
    volunteers: 0,
    warnings: 0,
    uitgiftes: 0
  };

  if (!aanvragenRes.error && Array.isArray(aanvragenRes.data)) {
    aanvragenRes.data.forEach(item => {
      if (item.status === "nieuw") counts.nieuw += 1;
      if (item.status === "intake") counts.intake += 1;
      if (typeof item.opmerkingen === "string" && item.opmerkingen.startsWith("[SPOED]")) counts.spoed += 1;
    });
  }

  if (!clientsRes.error && Array.isArray(clientsRes.data)) {
    counts.clients = clientsRes.data.length;
    counts.warnings = clientsRes.data.filter(client => client.warning_notes).length;
  }

  if (!volunteersRes.error && Array.isArray(volunteersRes.data)) {
    counts.volunteers = volunteersRes.data.length;
  }

  if (!distributionsRes.error && Array.isArray(distributionsRes.data)) {
    counts.uitgiftes = distributionsRes.data.filter(row => isCurrentMonth(row.date || row.created_at, now)).length;
  } else if (!clientsRes.error && Array.isArray(clientsRes.data)) {
    counts.uitgiftes = clientsRes.data.reduce((sum, client) => {
      const lines = (client.notes || "").split("\n").filter(line => line.startsWith("[UITGIFTE]") && isCurrentMonth(line, now));
      return sum + lines.length;
    }, 0);
  }

  const clientsCard = document.getElementById("cardClients");
  const volunteersCard = document.getElementById("cardVolunteers");
  const warningsCard = document.getElementById("cardWarnings");
  const nieuwCard = document.getElementById("cardNieuw");
  const intakeCard = document.getElementById("cardIntake");
  const spoedCard = document.getElementById("cardSpoed");
  const uitgiftesCard = document.getElementById("cardUitgiftes");

  if (clientsCard) clientsCard.textContent = `Cliënten (${counts.clients})`;
  if (volunteersCard) volunteersCard.textContent = `Vrijwilligers (${counts.volunteers})`;
  if (nieuwCard) nieuwCard.textContent = `Nieuw (${counts.nieuw})`;
  if (intakeCard) intakeCard.textContent = `Intake (${counts.intake})`;
  if (spoedCard) spoedCard.textContent = `Spoed (${counts.spoed})`;
  if (uitgiftesCard) uitgiftesCard.textContent = `Uitgiftes deze maand (${counts.uitgiftes})`;
  if (warningsCard) warningsCard.textContent = `Waarschuwingen (${counts.warnings})`;
}
