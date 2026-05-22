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
