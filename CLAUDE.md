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

## Hell-/Dunkelmodus (Design-Tokens)
Die Seite hat beide Modi, **Standard ist hell**. Umgeschaltet wird über den Knopf in der Tab-Bar (`#themebtn`) oder die Taste `T`; die Wahl liegt in `localStorage` unter `vroni-theme`. Ein kleines Skript im `<head>` setzt `data-theme` vor dem ersten Rendern (kein Aufblitzen).

- Alle Farben kommen aus CSS-Variablen: `:root` = Hellmodus, `:root[data-theme="dark"]` überschreibt für dunkel. **Keine festen Farbwerte in neuen Regeln** – stattdessen Tokens nutzen: Text `--ink`/`--ink2`/`--prose`, Flächen `--card`/`--card2`/`--f1`…`--f4`, Linien `--cardline`, Akzent `--accent`/`--link`/`--acc1`/`--acc2`, Schatten `--shadow*`, Netzgrafik `--node-*`/`--e-*`/`--p-*`.
- Kategorie-/Statusfarben (`CATS`, `STATUS`, `NCAT`) gelten für beide Modi. Wo sie aus JS kommen, wird **nicht** direkt `background`/`fill` gesetzt, sondern die Custom Property `--c` (bzw. `--sc`, `--nc`); die eigentliche Füllung entsteht in CSS und wird im Hellmodus über `color-mix()` mit `--dotmix`/`--txtmix` abgedunkelt, damit Punkte und Chip-Texte auf Weiß lesbar bleiben. Jede `color-mix()`-Regel hat eine Rohfarbe als Fallback davor.

## Regeln beim Aktualisieren
- Neuer Rechtsakt: Eintrag in `N` + passende Kanten in `E` (+ ggf. `EXTRA`). Neue Meldung: oben in `NEWS` einfügen.
- **„Stand“-Datum an drei Stellen aktualisieren:** Fußzeile Sidebar (`.foot`), `#newsstamp` und `.tabstand`.
- Quellen nur offiziell (EUR-Lex, Bundestag, BMWE, BNetzA o. ä.). Einordnung „Warum relevant“ aus Sicht VPP/Flexibilität/BHKW/Speicher.
- Keine externen Ressourcen einbinden (kein CDN, keine Fonts von außen – die Datei muss offline funktionieren). Ausnahme sind die Icon-Dateien im selben Ordner; fehlen sie, greift das Inline-Favicon.
- Icon ändern: alle vier PNGs neu erzeugen (gleiche Motiv-/Farbwelt: Hintergrund `#0b0e14`-Verlauf, Vroni, Knotenpunkte in den Themenfeld-Farben), Inline-Favicon in `index.html` mit ersetzen und `vroni-atlas-deploy.zip` neu packen.
- Neue UI-Elemente in **beiden** Modi prüfen.

## Deployment & Sync
- Push auf `main` ⇒ GitHub Pages veröffentlicht automatisch: https://haidarra82066.github.io/energiewirtschaft-updates/
- Lokale Arbeitskopie: `C:\Users\RamiHaidar\OneDrive\Projects\Energiewirtschaft Updates`. Nach Cloud-Änderungen lokal zuerst `git pull`, vor lokalen Änderungen ebenfalls – GitHub ist die Quelle der Wahrheit.
- Details: siehe DEPLOY-ANLEITUNG.md

## Automatische Pflege
Vronis Routinen laufen als Claude-Code-Cloud-Agenten gegen dieses Repo (Fakten-Check Mo, Briefing Mo/Mi/Fr) und pushen selbst auf `main`. Prompts und Zeitpläne: `.claude/routines/` – siehe [.claude/routines/README.md](.claude/routines/README.md).
