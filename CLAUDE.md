# Energiewirtschaft Updates – Projektkontext für Claude Code

## Was das ist
Vronis Energierecht-Atlas: interaktive Wissenskarte des EU-/DE-Energierechts plus Energie-Briefing. **Die App ist eine einzige Datei (`index.html`)** – kein Build-Schritt, keine Abhängigkeiten, kein Framework (Vanilla JS + SVG, Grafiken als Base64 eingebettet). Sprache der Inhalte: Deutsch.

Daneben liegen nur die App-Icons für Homebildschirm/Installation: `apple-touch-icon.png` (180, iOS), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (Android) und `manifest.json` (`display: standalone`). Die müssen Dateien sein – iOS/Android akzeptieren dafür keine Data-URIs. Das Tab-Favicon bleibt zusätzlich inline in `index.html`, damit die Datei auch allein ein Icon hat.

Dazu kommt `sw.js` (Service Worker) für Offline-Betrieb und Benachrichtigungen – siehe unten. Auch das muss eine eigene Datei sein (Browser-Vorgabe); ohne sie läuft die App normal weiter, nur ohne Offline-Cache und ohne Hinweise.

## Struktur von index.html
Alle Inhalte liegen als JS-Konstanten im `<script>`-Block:

| Konstante | Zweck |
|---|---|
| `CATS`, `STATUS` | Themenfelder (12) und Status-Typen (5) mit Farben |
| `LVLS`, `ARTS` | Ebenen (`EU`/`DE`/`INT`) und Arten (`recht`/`foerd`/`std`) mit Label und Emoji |
| `N` | Einträge (~120): `{id, n (Kurzname), f (offizieller Titel), lvl, art, cat, st, stT, d (Beschreibung), p (Kernpunkte[]), r (Verfahrensstand), src (Quell-URL)}` |
| `E` | Kanten `[vonId, nachId, typ, label]`; Typen: `umsetzung` (EU→DE), `aenderung`, `bezug` |
| `EXTRA` | je Eintrags-Id optional `{kpi:[{v,l}], links:[{t,u}]}` für die Detailansicht |
| `NCAT`, `NEWS` | Briefing-Kategorien und Meldungen `{d (Datum), cat, t (Titel), s (Zusammenfassung), det[], w (Warum relevant), src:[{t,u}]}` |

Der Atlas enthält nicht nur Gesetze: **`art`** trennt Rechtsakte (`recht`), Förderprogramme
(`foerd`) und Standards/Regelwerke (`std`); **`lvl`** unterscheidet EU, Deutschland und
internationale bzw. privatrechtliche Werke (`INT`, z. B. ISO, GHG Protocol, SBTi, GRI).
`art:"recht"` ist der Normalfall und steht **nicht** in den Daten – ein Einzeiler im Aufbau-Block
ergänzt ihn. Gefiltert wird über die drei Knopfreihen Ebene, Art und Themenfelder (UND-verknüpft).

**Zwei Fallen beim Bearbeiten von `N`:**
- Das Feld `r` trägt den Text „Aktuell". Die Knoten-Geometrie nutzt `n.rad` – wer wieder `n.r`
  für den Radius verwendet, löscht damit den Text aus allen Detailansichten (war bis 08/2026 ein Bug).
- In allen Texten gehören **typografische** Anführungszeichen („ … “). Ein gerades `"` beendet
  den JS-String und zerlegt die Datei.

## Hell-/Dunkelmodus (Design-Tokens)
Die Seite hat beide Modi, **Standard ist hell**. Umgeschaltet wird über den Knopf in der Tab-Bar (`#themebtn`) oder die Taste `T`; die Wahl liegt in `localStorage` unter `vroni-theme`. Ein kleines Skript im `<head>` setzt `data-theme` vor dem ersten Rendern (kein Aufblitzen).

- Alle Farben kommen aus CSS-Variablen: `:root` = Hellmodus, `:root[data-theme="dark"]` überschreibt für dunkel. **Keine festen Farbwerte in neuen Regeln** – stattdessen Tokens nutzen: Text `--ink`/`--ink2`/`--prose`, Flächen `--card`/`--card2`/`--f1`…`--f4`, Linien `--cardline`, Akzent `--accent`/`--link`/`--acc1`/`--acc2`, Schatten `--shadow*`, Netzgrafik `--node-*`/`--e-*`/`--p-*`.
- Kategorie-/Statusfarben (`CATS`, `STATUS`, `NCAT`) gelten für beide Modi. Wo sie aus JS kommen, wird **nicht** direkt `background`/`fill` gesetzt, sondern die Custom Property `--c` (bzw. `--sc`, `--nc`); die eigentliche Füllung entsteht in CSS und wird im Hellmodus über `color-mix()` mit `--dotmix`/`--txtmix` abgedunkelt, damit Punkte und Chip-Texte auf Weiß lesbar bleiben. Jede `color-mix()`-Regel hat eine Rohfarbe als Fallback davor.

## Bedienung: Maus und Finger
Die Karte (`svg#net`) läuft über Pointer-Events, `touch-action:none` hält den Browser aus der Gestensteuerung heraus.

- **Maus:** Knoten direkt ziehen, Rad = Zoom, Ziehen auf leerer Fläche = Verschieben.
- **Finger:** ein Finger verschiebt immer die Karte (auch wenn er auf einem Knoten startet), zwei Finger = Pinch-Zoom + Verschieben, Tippen = Details, Doppeltipp = näher ran, langes Drücken (420 ms) nimmt einen Knoten auf (`.node.grabbed`).
- Zoom ist auf `ZMIN`/`ZMAX` begrenzt (aus der Netz-Ausdehnung `WORLD` berechnet); jeder Zoomweg läuft über `clampF()`. Auf schmalen Bildschirmen startet die Ansicht nicht ganz herausgezoomt, sonst sind die Chips unlesbar.

## Mobiles Layout (≤ 900 px)
Im Media-Query stehen `--top`/`--bot` (Safe-Area von Notch bzw. Home-Indikator). **Alle schwebenden Elemente hängen daran**, damit sich nichts überlappt: oben Menü-Knopf + Tab-Bar (einzeilig durch Kurz-Labels `.kurz`), direkt darunter Bedienhinweis bzw. Update-Banner, unten rechts die Zoom-Knöpfe, darüber der Vroni-Toast. Bei offener Sidebar (`body.sideopen`) werden Tab-Bar, Menü, Zoom, Hinweis und Toast ausgeblendet und ein `#scrim` legt sich über die Karte. Neue schwebende Elemente bitte in dieses Raster einsortieren und in beiden Modi prüfen.

## Benachrichtigungen
Die Seite hat keinen Server, echtes Web-Push ist damit nicht möglich (ein Push-Dienst braucht einen Sender mit VAPID-Schlüsseln). Umgesetzt ist deshalb:

1. **Beim Öffnen/Zurückholen** vergleicht die Seite die geladenen `NEWS`-Titel mit dem Merker in `localStorage` (`vroni-seen`) und holt zusätzlich per `fetch("./?v=…")` die ausgelieferte Seite, um Änderungen zu erkennen (`checkUpdates()`). Neues → Systemhinweis + Banner + NEU-Marker + Zähler am App-Icon.
2. **Hintergrund** über `periodicSync` im Service Worker (Chrome/Android, installierte App, frühestens alle 6 h). Auf iOS/Safari gibt es das nicht – dort kommt der Hinweis beim Öffnen der App.
3. Einstellungen (Themen, Hintergrund, Ruhezeit 22–7 Uhr) im Dialog hinter der Glocke in der Tab-Bar, gespeichert unter `vroni-notify`; der Service Worker bekommt sie per `postMessage` und legt sie im Cache `vroni-state` ab.

**Wichtig für Änderungen an den Daten:** Sowohl `index.html` als auch `sw.js` lesen die Meldungen per Regex aus dem ausgelieferten HTML. Erhalten bleiben müssen deshalb: jeder `NEWS`-Eintrag beginnt am **Zeilenanfang** mit `{d:"…",cat:"…",t:"…"` (in dieser Reihenfolge), und das Stand-Datum steht in `id="newsstamp">…<`. Wird das umgebaut, muss `parseNewsHTML()` in `index.html` **und** `parseNews()` in `sw.js` mitgeändert werden – sonst bleiben Hinweise stumm.

Ein `push`-Handler liegt in `sw.js` bereit: Käme später ein Push-Server dazu, funktioniert er ohne weitere Änderung.

## Regeln beim Aktualisieren
- Neuer Eintrag: Datensatz in `N` + mindestens eine Kante in `E` (+ ggf. `EXTRA`). Bei Förderung oder Standard `art` setzen, bei internationalen Werken `lvl:"INT"`. Neue Meldung: oben in `NEWS` einfügen (Format s. o.).
- Nach jeder Änderung an `N`/`E`/`EXTRA`: `node --check` über den `<script>`-Block **und** die Datenprüfung (eindeutige `id`s, Kanten zeigen auf existierende Einträge, bekannte `cat`/`st`/`lvl`/`art`, `src` beginnt mit `https://`, kein Eintrag ohne Kante).
- Förderprogramme veralten schneller als Gesetze. Vor dem Übernehmen einer Förderangabe prüfen, ob das Programm noch läuft – eingestellte Programme bleiben drin, aber klar als eingestellt gekennzeichnet.
- **„Stand“-Datum an drei Stellen aktualisieren:** Fußzeile Sidebar (`.foot`), `#newsstamp` und `.tabstand`.
- Quellen nur offiziell (EUR-Lex, Bundestag, BMWE, BNetzA o. ä.). Einordnung „Warum relevant“ aus Sicht VPP/Flexibilität/BHKW/Speicher.
- Keine externen Ressourcen einbinden (kein CDN, keine Fonts von außen – die Datei muss offline funktionieren). Ausnahme sind die Icon-Dateien und `sw.js` im selben Ordner; fehlen sie, läuft die Seite trotzdem (Inline-Favicon, keine Hinweise).
- Icon ändern: alle vier PNGs neu erzeugen (gleiche Motiv-/Farbwelt: Hintergrund `#0b0e14`-Verlauf, Vroni, Knotenpunkte in den Themenfeld-Farben), Inline-Favicon in `index.html` mit ersetzen und `vroni-atlas-deploy.zip` neu packen.
- `sw.js` geändert? Dann `CACHE` (`vroni-app-v1`) hochzählen, damit alte Dateien aus dem Cache fallen, und das Zip neu packen.
- Neue UI-Elemente in **beiden** Modi prüfen.

## Deployment & Sync
- Push auf `main` ⇒ GitHub Pages veröffentlicht automatisch: https://haidarra82066.github.io/energiewirtschaft-updates/
- Lokale Arbeitskopie: `C:\Users\RamiHaidar\OneDrive\Projects\Energiewirtschaft Updates`. Nach Cloud-Änderungen lokal zuerst `git pull`, vor lokalen Änderungen ebenfalls – GitHub ist die Quelle der Wahrheit.
- Details: siehe DEPLOY-ANLEITUNG.md

## Automatische Pflege
Vronis Routinen laufen als Claude-Code-Cloud-Agenten gegen dieses Repo (Fakten-Check Mo, Briefing Mo/Mi/Fr) und pushen selbst auf `main`. Prompts und Zeitpläne: `.claude/routines/` – siehe [.claude/routines/README.md](.claude/routines/README.md).
