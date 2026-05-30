# Stichting Voedselbank voor Dieren 010 – Hulpverlenersportaal

Progressive Web App (PWA) en hulpverlenersportaal voor Stichting Voedselbank voor Dieren 010.

Het platform biedt ondersteuning voor cliëntenbeheer, interne communicatie, chatfunctionaliteit en veilige toegang voor medewerkers, vrijwilligers en hulpverleners.

---

## Functionaliteiten

### Gebruikersbeheer

* Veilige login via Google en Microsoft OAuth
* Rollen en rechten systeem
* Goedkeuringsworkflow voor gebruikers
* Beveiligde toegang per gebruikersrol

### Cliëntenbeheer

* Cliëntdossiers beheren
* Dierenregistratie
* Notities en statusbeheer
* Document- en bestandsuploads
* Cliëntportaal

### Chat & Communicatie

* Realtime chatfunctionaliteit
* Gesprekken en notificaties
* Ongelezen berichten
* Typing indicators

### Progressive Web App (PWA)

* Installeerbaar op mobiel en desktop
* Offline ondersteuning via Service Worker
* Caching van statische bestanden
* Responsive ontwerp

---

## Technologieën

* HTML5
* CSS3
* JavaScript (ES Modules)
* Supabase
* Progressive Web App (PWA)
* Service Workers
* Realtime subscriptions

---

## Projectstructuur

```text
/
├── index.html
├── manifest.json
├── service-worker.js
├── styles.css
├── js/
│   ├── main.js
│   ├── auth.js
│   ├── chat.js
│   ├── clients.js
│   ├── clientPortal.js
│   ├── clientFiles.js
│   ├── clientEdit.js
│   ├── notifications.js
│   ├── admin.js
│   └── supabase.js
```

---

## Beveiliging

* Sessiebeheer via Supabase Auth
* Rolgebaseerde toegangscontrole
* Beveiligde bestandsuploads
* Realtime beveiliging via policies
* Geen publieke toegang tot cliëntdata

---

## Installatie

```bash
npm install
npm run dev
```

## SMTP / e-mail integratie

Voor het versturen van e-mail via Microsoft 365 gebruiken we een kleine Node SMTP-server.

1. Kopieer `.env.example` naar `.env`.
2. Vul je Microsoft 365 SMTP-gegevens in.
3. Start de server met:

```bash
npm run server
```

Standaard luistert de SMTP API op `http://localhost:3001`.

### Voorbeeldconfiguratie

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@domain.nl
SMTP_PASS=your-mail-password
SMTP_FROM="SVBVD010 <your@domain.nl>"
EMAIL_PORT=3001
```

### E-mail versturen vanuit de app

De server biedt een endpoint:

- `POST /send-email`

Body:

```json
{
  "to": "ontvanger@domain.nl",
  "subject": "Onderwerp",
  "text": "Platte tekst bericht",
  "html": "<p>HTML-bericht</p>"
}
```

De frontend gebruikt deze API om automatisch e-mail te sturen bij admin goedkeuring/afwijzing van cliënten.

Je kunt dit endpoint vanuit JavaScript aanroepen met `fetch`.

```js
await fetch("http://localhost:3001/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    to: "client@domain.nl",
    subject: "Nieuw bericht",
    text: "Je aanvraag is goedgekeurd.",
    html: "<strong>Je aanvraag is goedgekeurd.</strong>"
  })
});
```

Voor productiesituaties wil je deze endpoint achter een veilige backend hosten, niet direct vanuit de browser met SMTP-credentials.

Voorlopig is dit een veilige manier om Microsoft SMTP te gebruiken vanuit je project.

Voor productie:

```bash
npm run build
```

---

## Progressive Web App

De applicatie ondersteunt:

* Offline caching
* Mobiele installatie
* Home screen installatie
* Achtergrond caching
* Snelle laadtijden

---

## Status

Project actief in ontwikkeling.

---

## Organisatie

Stichting Voedselbank voor Dieren 010

Website:
https://svbvd010.nl
