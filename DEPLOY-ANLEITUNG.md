# 🚀 Vronis Energierecht-Atlas veröffentlichen

Die App ist eine einzige Datei (`index.html`) – jedes statische Hosting funktioniert. Dieser Ordner (`C:\Users\RamiHaidar\OneDrive\Projects\Energiewirtschaft Updates`) ist zugleich ein Git-Repository.

## Option A: GitHub Pages (Standard-Weg, kostenlos, dauerhaft)
Repository: **https://github.com/haidarra82066/energiewirtschaft-updates** · Live-Seite: **https://haidarra82066.github.io/energiewirtschaft-updates/**

Nach jedem Inhalts-Update genügt:
```
cd "C:\Users\RamiHaidar\OneDrive\Projects\Energiewirtschaft Updates"
git add -A
git commit -m "Update Briefing/Gesetzesdaten"
git push
```
GitHub Pages baut die Seite automatisch neu (Settings → Pages → Branch `main`, Ordner `/root`).

## Option B: Netlify Drop (schnellster Weg ohne Git)
1. Öffne **https://app.netlify.com/drop**
2. Ziehe `vroni-atlas-deploy.zip` per Drag & Drop auf die Seite (enthält `index.html`, `manifest.json` und die App-Icons)
3. Du bekommst sofort eine öffentliche URL; mit kostenlosem Netlify-Konto bleibt sie dauerhaft und ist umbenennbar (z. B. `vroni-atlas.netlify.app`)

## Option C: Vercel (kostenlos)
```
npm i -g vercel
cd "C:\Users\RamiHaidar\OneDrive\Projects\Energiewirtschaft Updates"
vercel --prod
```
(Beim ersten Mal: Login-Link im Browser bestätigen.)

## 📱 Icon auf dem Homebildschirm
Neben `index.html` müssen `manifest.json`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` und `icon-maskable-512.png` mit hochgeladen werden – sonst zeigt iOS beim Speichern auf dem Homebildschirm statt eines Icons nur einen Screenshot der Seite. Bei GitHub Pages passiert das automatisch mit; bei Netlify/Vercel nur, wenn der ganze Ordner bzw. das Zip hochgeladen wird.

Wer die Seite vorher schon gespeichert hat: iOS merkt sich das alte Icon. Verknüpfung einmal löschen und in Safari über **Teilen → Zum Home-Bildschirm** neu anlegen.

## 🔄 Nach Vronis Updates
Vroni aktualisiert `index.html` in diesem OneDrive-Ordner (montags Fakten-Check, Mo/Mi/Fr News). Danach einfach neu veröffentlichen:
- GitHub Pages: committen & pushen (siehe Option A)
- Netlify: Seite öffnen → **Deploys** → Zip erneut hineinziehen
- Vercel CLI: `vercel --prod`

Hinweis: Der Ordner hieß früher `Knowledge Map Energiegesetze` und wurde am 31.07.2026 in `Energiewirtschaft Updates` umbenannt; die HTML-Datei heißt seitdem `index.html` (vorher `Energie-Gesetze-Knowledge-Map.html`).
