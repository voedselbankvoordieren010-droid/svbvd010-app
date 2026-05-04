# Mailbevestiging bij goedkeuren

## Wat er nodig is

1. Een mailprovider zoals Resend, Brevo of SMTP.
2. Een veilige server-side stap:
   - Supabase Edge Function is hiervoor het meest logisch.
3. Een tabel of trigger om te herkennen wanneer een aanvraag van `nieuw` naar `bezig` gaat.

## Aanbevolen flow

1. Hulpverlener klikt in het portaal op `Goedkeuren`.
2. De aanvraagstatus verandert van `nieuw` naar `bezig`.
3. Een Supabase Edge Function ontvangt:
   - aanvraag-id
   - client e-mail
   - naam client
   - nieuwe status
4. Die functie verstuurt een bevestigingsmail.
5. Optioneel log je de verzendstatus in een tabel zoals `email_log`.

## Voorbeeld inhoud bevestigingsmail

- Onderwerp: `Uw aanvraag is goedgekeurd`
- Tekst:
  `Beste [naam], uw aanvraag is ontvangen en goedgekeurd door onze hulpverlener. Wij nemen zo snel mogelijk contact met u op.`

## Waarom niet direct vanuit HTML

Een mail-API sleutel mag niet in een openbare HTML-pagina staan. Daarom moet mailverzending via een backend-stap lopen.
