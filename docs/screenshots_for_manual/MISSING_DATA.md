# Missing Data / Failed Screenshots

Updated: 2026-02-24

**4 out of 39** screenshot pairs could not be captured. These remain as `\screenshotplaceholder` in `docs/manuale-utente-screenshots.tex`.

---

## dialog-overlap
- **Reason:** Overlap warning did not appear during registration flow
- **Root cause:** The volunteer test account was not registered for an event that overlaps with the target event's time slot. The overlap check requires an existing confirmed registration for a time-conflicting event.
- **To capture manually:** Register the volunteer for one event, then attempt to register for another event at the same date/time. The overlap warning step should appear in the registration dialog.

## dialog-waitlist-offer
- **Reason:** Dialog did not show the waitlist offer step
- **Root cause:** The event may not have been at full capacity when the dialog was opened, or the waitlist_limit was 0.
- **To capture manually:** Find an event at full capacity with `waitlist_limit > 0`. Click "Iscriviti (lista d'attesa)" — the dialog should show the waitlist offer step with position info.

## dialog-iscrizione-successo
- **Reason:** Volunteer was already registered from an earlier script run
- **Root cause:** The test volunteer had already been registered for the target event in a previous automation run, so the dialog showed "already registered" instead of the success step.
- **To capture manually:** Cancel any existing registration for the volunteer, then register again. The success step appears after confirming registration.

## dialog-iscrizione-errore
- **Reason:** No tag-restricted event exists that the volunteer lacks qualifications for
- **Root cause:** The seed data does not include events with `required_tags` that the test volunteer does not possess.
- **To capture manually:** Create an event with required tags (e.g., "Clown Terapia Certificato") and attempt to register a volunteer who does not have that tag. The error step should appear in the registration dialog.

---

## Summary

| # | Label | Status | Desktop | Mobile |
|---|-------|--------|---------|--------|
| 1 | calendario-page | captured | calendario-page.png | calendario-page-mobile.png |
| 2 | calendario-filtro | captured | calendario-filtro.png | calendario-filtro-mobile.png |
| 3 | dettaglio-evento-disponibile | captured | dettaglio-evento-disponibile.png | dettaglio-evento-disponibile-mobile.png |
| 4 | dettaglio-evento-completo | captured | dettaglio-evento-completo.png | dettaglio-evento-completo-mobile.png |
| 5 | dialog-conferma-iscrizione | captured | dialog-conferma-iscrizione.png | dialog-conferma-iscrizione-mobile.png |
| 6 | dialog-overlap | **MISSING** | — | — |
| 7 | dialog-waitlist-offer | **MISSING** | — | — |
| 8 | dialog-iscrizione-successo | **MISSING** | — | — |
| 9 | dialog-iscrizione-errore | **MISSING** | — | — |
| 10 | dialog-cancel-normal | captured | dialog-cancel-normal.png | dialog-cancel-normal-mobile.png |
| 11 | dialog-cancel-late | captured | dialog-cancel-late.png | dialog-cancel-late-mobile.png |
| 12 | dashboard-prossimi | captured | dashboard-prossimi.png | dashboard-prossimi-mobile.png |
| 13 | dashboard-riepilogo-presenze | captured | dashboard-riepilogo-presenze.png | dashboard-riepilogo-presenze-mobile.png |
| 14 | profilo-page | captured | profilo-page.png | profilo-page-mobile.png |
| 15 | dialog-eliminazione-account | captured | dialog-eliminazione-account.png | dialog-eliminazione-account-mobile.png |
| 16 | admin-eventi-page | captured | admin-eventi-page.png | admin-eventi-page-mobile.png |
| 17 | admin-eventi-dropdown | captured | admin-eventi-dropdown.png | admin-eventi-dropdown-mobile.png |
| 18 | admin-crea-evento | captured | admin-crea-evento.png | admin-crea-evento-mobile.png |
| 19 | admin-pubblica-evento | captured | admin-pubblica-evento.png | admin-pubblica-evento-mobile.png |
| 20 | admin-clona-singola | captured | admin-clona-singola.png | admin-clona-singola-mobile.png |
| 21 | admin-clona-multipla | captured | admin-clona-multipla.png | admin-clona-multipla-mobile.png |
| 22 | admin-serie-ambito | captured | admin-serie-ambito.png | admin-serie-ambito-mobile.png |
| 23 | admin-evento-dettaglio | captured | admin-evento-dettaglio.png | admin-evento-dettaglio-mobile.png |
| 24 | admin-riepilogo-presenze-attivo | captured | admin-riepilogo-presenze-attivo.png | admin-riepilogo-presenze-attivo-mobile.png |
| 25 | admin-riepilogo-presenze-scaduto | captured | admin-riepilogo-presenze-scaduto.png | admin-riepilogo-presenze-scaduto-mobile.png |
| 26 | admin-iscrizioni-tabella | captured | admin-iscrizioni-tabella.png | admin-iscrizioni-tabella-mobile.png |
| 27 | admin-aggiungi-ricerca | captured | admin-aggiungi-ricerca.png | admin-aggiungi-ricerca-mobile.png |
| 28 | admin-aggiungi-conferma | captured | admin-aggiungi-conferma.png | admin-aggiungi-conferma-mobile.png |
| 29 | admin-correzione-attiva | captured | admin-correzione-attiva.png | admin-correzione-attiva-mobile.png |
| 30 | admin-correzione-scaduta | captured | admin-correzione-scaduta.png | admin-correzione-scaduta-mobile.png |
| 31 | admin-utenti-page | captured | admin-utenti-page.png | admin-utenti-page-mobile.png |
| 32 | admin-richieste-attesa | captured | admin-richieste-attesa.png | admin-richieste-attesa-mobile.png |
| 33 | admin-utenti-filtrati | captured | admin-utenti-filtrati.png | admin-utenti-filtrati-mobile.png |
| 34 | admin-gdpr-conferma | captured | admin-gdpr-conferma.png | admin-gdpr-conferma-mobile.png |
| 35 | admin-audit-filtri | captured | admin-audit-filtri.png | admin-audit-filtri-mobile.png |
| 36 | admin-audit-tabella | captured | admin-audit-tabella.png | admin-audit-tabella-mobile.png |
| 37 | admin-audit-dettaglio | captured | admin-audit-dettaglio.png | admin-audit-dettaglio-mobile.png |
| 38 | admin-export-page | captured | admin-export-page.png | admin-export-page-mobile.png |
| 39 | admin-export-compilato | captured | admin-export-compilato.png | admin-export-compilato-mobile.png |
