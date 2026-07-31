# Energiewirtschaft Updates – Projektkontext für Claude Code

## Was das ist
Vronis Energierecht-Atlas: interaktive Wissenskarte des EU-/DE-Energierechts plus Energie-Briefing. **Die App ist eine einzige Datei (`index.html`)** – kein Build-Schritt, keine Abhängigkeiten, kein Framework (Vanilla JS + SVG, Grafiken als Base64 eingebettet). Sprache der Inhalte: Deutsch.

Daneben liegen nur die App-Icons für Homebildschirm/Installation: `apple-touch-icon.png` (180, iOS), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (Android) und `manifest.json`. Die müssen Dateien sein – iOS/Android akzeptieren dafür keine Data-URIs. Das Tab-Favicon bleibt zusätzlich inline in `index.html`, damit die Datei auch allein ein Icon hat.

## Struktur von index.html
Alle Inhalte liegen als JS-Konstanten im `<script>`-Block:

| Konstante | Zweck |
|---|---|
| `CATS`, `STATUS` | Themenfelder (8) und Status-Typen (5) mit Farben |
| `N` | Rechtsakte: `{id, n (Kurzname), f (offizieller Titel), lvl ("EU"/"DE"), cat, st, stT, d (Beschreibung), p (Kernpunkte[]), r (Verfahrensstand), src (Quell-URL)}` |
| `E` | Kanten `[vonId, nachId, typ, label]`; Typen: `umsetzung` (EU→DE), `aenderung`, `bezug` |
| `EXTRA` | je Rechtsakt-Id optional `{kpi:[{v,l}], links:[{t,u}]}` für die Detailansicht |
| `NCAT`, `NEWS` | Briefing-Kategorien und Meldungen `{d (Datum), cat, t (Titel), s (Zusammenfassung), det[], w (Warum relevant), src:[{t,u}]}` |

## Regeln beim Aktualisieren
- Neuer Rechtsakt: Eintrag in `N` + passende Kanten in `E` (+ ggf. `EXTRA`). Neue Meldung: oben in `NEWS` einfügen.
- **„Stand“-Datum an drei Stellen aktualisieren:** Fußzeile Sidebar (`.foot`), `#newsstamp` und `.tabstand`.
- Quellen nur offiziell (EUR-Lex, Bundestag, BMWE, BNetzA o. ä.). Einordnung „Warum relevant“ aus Sicht VPP/Flexibilität/BHKW/Speicher.
- Keine externen Ressourcen einbinden (kein CDN, keine Fonts von außen – die Datei muss offline funktionieren). Ausnahme sind die Icon-Dateien im selben Ordner; fehlen sie, greift das Inline-Favicon.
- Icon ändern: alle vier PNGs neu erzeugen (gleiche Motiv-/Farbwelt: Hintergrund `#0b0e14`-Verlauf, Vroni, Knotenpunkte in den Themenfeld-Farben), Inline-Favicon in `index.html` mit ersetzen und `vroni-atlas-deploy.zip` neu packen.

## Deployment & Sync
- Push auf `main` ⇒ GitHub Pages veröffentlicht automatisch: https://haidarra82066.github.io/energiewirtschaft-updates/
- Lokale Arbeitskopie: `C:\Users\RamiHaidar\OneDrive\Projects\Energiewirtschaft Updates`. Nach Cloud-Änderungen lokal zuerst `git pull`, vor lokalen Änderungen ebenfalls – GitHub ist die Quelle der Wahrheit.
- Details: siehe DEPLOY-ANLEITUNG.md

## Automatische Pflege
Vronis Routinen laufen als Claude-Code-Cloud-Agenten gegen dieses Repo (Fakten-Check Mo, Briefing Mo/Mi/Fr) und pushen selbst auf `main`. Prompts und Zeitpläne: `.claude/routines/` – siehe [.claude/routines/README.md](.claude/routines/README.md).
