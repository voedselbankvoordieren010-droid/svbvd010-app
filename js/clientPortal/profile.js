import { loadClientMessages } from "../chat/clientChat.js";
import { loadClientFiles } from "./files.js";
import { loadPortalAnimals } from "./animals.js";

export async function loadOwnClientProfile(supabase, profile) {
  const clientsPanel = document.getElementById("chatList");

  if (!clientsPanel) {
    return;
  }

  if (!profile?.id) {
    clientsPanel.innerHTML = `
      <p>
        Geen geldig profiel gevonden.
      </p>
    `;
    return;
  }

  if (!profile?.client_id) {
    clientsPanel.innerHTML = `
      <p>
        Geen cliënt gekoppeld
      </p>
    `;
    return;
  }

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", profile.client_id)
    .maybeSingle();

  if (error || !data) {
    console.error("CLIENT LOAD ERROR:", error);
    clientsPanel.innerHTML = `
      <p>
        Fout bij laden dossier
      </p>
    `;
    return;
  }

  clientsPanel.innerHTML = `
    <div class="client-card">
      <h1>
        Mijn dossier
      </h1>
      <h2>
        ${data.full_name || "Naam onbekend"}
      </h2>
      <p>
        📧 ${data.email || "-"}
      </p>
      <p>
        📞 ${data.phone || "-"}
      </p>
      <p>
        📍 ${data.address || "-"}
      </p>
      <p>
        Status:
        ${data.status || "-"}
      </p>
    </div>

    <div class="client-card">
      <h2>
        Mijn dieren
      </h2>
      <div id="portalAnimals">
        Laden...
      </div>
    </div>

    <div class="client-card">
      <h2>
        Mijn bestanden
      </h2>
      <label class="btn" for="clientUploadInput">
        📎 Bestand kiezen
      </label>
      <input id="clientUploadInput" type="file" hidden>
      <span id="selectedFileName">Geen bestand gekozen</span>
      <button id="uploadClientFileBtn" class="btn">
        Upload bestand
      </button>
      <div id="clientFilesList">Laden...</div>
    </div>

    <div class="client-card">
      <h2>
        Chat met hulpverlener
      </h2>
      <div id="clientMessages">Laden...</div>
      <div class="emoji-bar">
        <button type="button" class="emoji-button">😊</button>
        <button type="button" class="emoji-button">😂</button>
        <button type="button" class="emoji-button">😍</button>
        <button type="button" class="emoji-button">😎</button>
        <button type="button" class="emoji-button">🤗</button>
        <button type="button" class="emoji-button">🐶</button>
        <button type="button" class="emoji-button">🐱</button>
        <button type="button" class="emoji-button">🐰</button>
        <button type="button" class="emoji-button">🦊</button>
        <button type="button" class="emoji-button">🐻</button>
        <button type="button" class="emoji-button">🐼</button>
        <button type="button" class="emoji-button">🦁</button>
      </div>
      <div class="chat-input-row">
        <textarea id="clientMessageInput" rows="3" placeholder="Typ een bericht..." autocomplete="off"></textarea>
        <button id="sendClientMessageBtn" class="btn">
          Verstuur
        </button>
      </div>
    </div>
  `;

  await loadClientFiles(supabase, profile.client_id);
  await loadPortalAnimals(supabase, profile.client_id);
  await loadClientMessages(supabase, profile);

  const sendBtn = document.getElementById("sendClientMessageBtn");
  if (sendBtn) {
    sendBtn.onclick = async () => {
      if (!profile?.client_id || !profile?.id) {
        return;
      }

      const input = document.getElementById("clientMessageInput");
      const message = input.value.trim();
      if (!message) {
        return;
      }

      const { error } = await supabase
        .from("messages")
        .insert({
          client_id: profile.client_id,
          sender_id: profile.id,
          message
        });

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      input.value = "";
      await loadClientMessages(supabase, profile);
    };
  }

  const emojiButtons = document.querySelectorAll(".emoji-button");
  const messageInput = document.getElementById("clientMessageInput");

  emojiButtons.forEach(button => {
    button.onclick = () => {
      if (!messageInput) {
        return;
      }

      messageInput.value += button.textContent || "";
      messageInput.focus();
    };
  });

  const uploadBtn = document.getElementById("uploadClientFileBtn");
  const fileInput = document.getElementById("clientUploadInput");
  const fileName = document.getElementById("selectedFileName");

  if (fileInput && fileName) {
    fileInput.onchange = () => {
      fileName.textContent = fileInput.files?.[0]?.name || "Geen bestand gekozen";
    };
  }

  if (uploadBtn) {
    uploadBtn.onclick = async () => {
      const input = document.getElementById("clientUploadInput");
      const file = input.files[0];
      if (!file) {
        return;
      }

      const filePath = `${profile.client_id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("client-files").upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        return;
      }

      await supabase.from("client_files").insert({
        client_id: profile.client_id,
        file_name: file.name,
        file_path: filePath
      });

      await loadClientFiles(supabase, profile.client_id);
    };
  }
}
