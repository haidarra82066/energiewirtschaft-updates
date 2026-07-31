# Energiewirtschaft Updates – Vronis Energierecht-Atlas

Interaktive Wissenskarte des europäischen und deutschen Energierechts plus regelmäßig aktualisiertes Energie-Briefing – als **eine einzige, komplett eigenständige HTML-Datei** ([index.html](index.html)), ohne Build-Schritt und ohne externe Abhängigkeiten.

**Live:** https://haidarra82066.github.io/energiewirtschaft-updates/ · **Repo:** https://github.com/haidarra82066/energiewirtschaft-updates

## Was die App kann

### 🧠 Wissenskarte
- **50+ Gesetze, Verordnungen und Richtlinien** (EU- und DE-Ebene) als interaktiver, physikbasierter Graph (Force-Layout in reinem SVG/Vanilla-JS, keine Bibliotheken).
- **8 Themenfelder:** Klima & Rahmen · Strommarkt & Versorgung · Erneuerbare Energien · Netze & Infrastruktur · Gas & Wasserstoff · Wärme & Gebäude · Energieeffizienz · CO₂-Preis, Industrie & Steuern.
- **Status je Rechtsakt:** in Kraft · im Gesetzgebungsverfahren · Vorschlag/angekündigt · Programm/Strategie · kommend.
- **~60 typisierte Verknüpfungen:** Umsetzung EU → DE (z. B. Strombinnenmarkt-RL → EnWG), Ändert/novelliert (z. B. EnWG-Novelle 2026 → EnWG), inhaltlicher Bezug.
- **Detailansicht** pro Rechtsakt: Kurzbeschreibung, Kernpunkte, aktueller Verfahrensstand, Kennzahlen (Fristen, Ziele) und Links zu offiziellen Quellen (EUR-Lex, Bundestag, BMWE u. a.).
- Suche (Shortcut `/`), Ebenen- und Themenfilter, Zoom/Pan, verschiebbare Knoten, responsives dunkles UI.

### 📰 Vronis Energie-Briefing
- Kuratierte News-Ansicht mit Meldungen zu Regulierung DE, Märkten & Preisen, Technologie, Wasserstoff, Netzen und EU-Politik.
- Jede Meldung mit Datum, Detailpunkten, Quellenlinks und einer Einordnung **„Warum relevant“** (Fokus: VPP, Flexibilität, BHKW/KWK, Speicher).
- Aktualisierungsrhythmus: **Mo · Mi · Fr**; jeden Montag zusätzlich Fakten-Check aller Gesetzesinfos.

## Technik & Datenmodell

Alles liegt in `index.html`:

| Konstante | Inhalt |
|---|---|
| `CATS` / `STATUS` | Themenfelder und Status-Typen inkl. Farbcodierung |
| `N` | Die Rechtsakte (id, Name, offizieller Titel, Ebene, Kategorie, Status, Beschreibung, Kernpunkte, Verfahrensstand, Quelle) |
| `E` | Kanten `[von, nach, typ, label]` mit Typen `umsetzung`, `aenderung`, `bezug` |
| `EXTRA` | Kennzahlen (KPIs) und offizielle Dokumente je Rechtsakt für die Detailansicht |
| `NCAT` / `NEWS` | Kategorien und Meldungen des Energie-Briefings |

Auch Icons/Grafiken sind als Base64-Data-URIs eingebettet – die Datei funktioniert offline und auf jedem statischen Hosting.

## Aktualisieren & Deployment

Inhaltliche Updates = Datenkonstanten in `index.html` ändern, committen, pushen – GitHub Pages veröffentlicht automatisch neu. Details und Alternativen (Netlify Drop mit [vroni-atlas-deploy.zip](vroni-atlas-deploy.zip), Vercel) in der [DEPLOY-ANLEITUNG.md](DEPLOY-ANLEITUNG.md).

---

Stand der Inhalte: 31.07.2026 · Angaben ohne Gewähr, keine Rechtsberatung. Offizielle Quellen in jeder Detailansicht.
