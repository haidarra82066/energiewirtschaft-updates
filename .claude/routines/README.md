# Vronis Routinen (Cloud)

Zwei Routinen pflegen `index.html` automatisch. Sie laufen als **Claude-Code-Cloud-Agenten**
(nicht lokal, PC muss nicht an sein), klonen dieses Repo, recherchieren im Web, bearbeiten
`index.html` und pushen auf `main` – GitHub Pages deployt daraufhin automatisch.

| Datei | Was | Zeitplan (Berlin) | Cron (UTC) | Routine-ID |
|---|---|---|---|---|
| [faktencheck-montag.md](faktencheck-montag.md) | Einträge (`N`, `E`, `EXTRA`) challengen & aktualisieren | Mo 07:00 | `0 5 * * 1` | `trig_01TAxHmZLyExom4NEwE1izn6` |
| [energie-briefing.md](energie-briefing.md) | News-Array (`NEWS`) aktualisieren | Mo/Mi/Fr 08:00 | `0 6 * * 1,3,5` | `trig_01VPG7qUFDtbZqH2z4c3pecr` |

Seit dem Ausbau auf rund 120 Einträge (Rechtsakte, Förderungen, Standards) prüft der Fakten-Check
nicht mehr alles jede Woche, sondern **wöchentlich die volatilen Einträge plus einen von vier
Rotationsblöcken** (`KW mod 4`). Damit ist jeder Eintrag spätestens nach vier Wochen wieder dran.
Förderprogramme werden dabei ausdrücklich auch daraufhin geprüft, ob es sie überhaupt noch gibt.

Beide laufen mit `claude-opus-5`, ohne MCP-Connectors (die API hängt sonst automatisch alle
verbundenen Connectors an – für diese Aufgabe unnötige Rechte) und mit den Tools
Bash, Read, Write, Edit, Glob, Grep, WebSearch, WebFetch.

Die Routinen greifen sich **nicht** gegenseitig an: Der Fakten-Check lässt `NEWS` und
`#newsstamp` in Ruhe, das Briefing lässt `N`/`E`/`EXTRA` und die übrigen „Stand"-Stempel in Ruhe.
Montags liegt eine Stunde zwischen beiden; zusätzlich macht jede vor dem Push ein
`git pull --rebase`.

> Cron ist immer UTC und wandert nicht mit der Sommerzeit. In der Winterzeit laufen die
> Routinen also eine Stunde früher (06:00 bzw. 07:00 Berlin).

## Ändern / neu anlegen

Voraussetzung: In claude.ai muss das **GitHub-Konto verbunden** sein, das dieses Repo besitzt
(`haidarra82066`) – sonst lehnt die API eine Routine mit Git-Repo ab
(`Connect your GitHub account before saving a routine that uses a GitHub repository`).
Verbunden am 31.07.2026.

In Claude Code: `/schedule` und sagen, was geändert werden soll. Übersicht, Laufprotokolle,
manuelles Starten und Löschen: https://claude.ai/code/routines

## Prompt anpassen

Die `.md`-Dateien hier sind die Quelle der Wahrheit für den Wortlaut. Nach einer Änderung muss
die Routine aktualisiert werden (`/schedule` → Update) – die Cloud liest die Datei nicht selbst,
der Prompt steckt in der Routine-Konfiguration.
