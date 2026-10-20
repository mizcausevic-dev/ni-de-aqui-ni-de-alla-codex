# Ni de Aquí Ni de Allá with Codex

A complete, deterministic 30-second cocktail recipe film. Vanilla JavaScript + Canvas, local Space Grotesk fonts, no CDN, no app framework, no runtime dependencies or keys.

**Live:** https://mizcausevic-dev.github.io/ni-de-aqui-ni-de-alla-codex/

## Run

Requires Node.js 20 or newer. No install is needed for browser playback:

```sh
npm start
```

Open http://localhost:8080 and press **Play**. Or serve this folder with any static HTTP server. `index.html`, `recipe.js`, `scene.js`, `player.js`, and `assets/` are the complete web application.

## Playback and capture

- Play / pause, restart, timeline scrubber, keyboard controls.
- Space: play / pause. R: restart. Arrow keys: seek one second. Escape: exit capture view.
- Playback stops at exactly 30.000 seconds. Restart plays from zero.
- Capture view hides page chrome and controls. It starts paused at zero.
- `?capture=1&autoplay=1` starts automatically with controls hidden.
- `?capture=1&t=28` displays the hero frame, paused.
- `?portrait=1` renders 1080 × 1440 artwork. Mobile playback automatically uses this portrait composition.
- Reduced-motion users start paused, including when autoplay is requested. Explicit Play remains available.
- `window.cocktail.renderAt(seconds)` renders any exact timestamp. The render uses absolute time, with no random state or frame-dependent simulation.

### Export an exact 30-second MP4

Install [FFmpeg](https://ffmpeg.org/download.html) on your PATH, then:

```sh
npm install
npm run export
```

Output: `output/ni-de-aqui-ni-de-alla-with-codex.mp4`, 1920 × 1080, H.264, yuv420p, 30 fps, **900 frames / exactly 30 seconds**. It is silent; no music or audio was requested. Export renders the same Canvas drawing functions directly through `@napi-rs/canvas` and feeds uncompressed frames to FFmpeg. No screen recording or browser is needed. Canvas rasterizers can differ slightly between browser and native output.

```sh
node scripts/export.cjs --portrait   # 1080 × 1440 MP4
node scripts/export.cjs --stills     # inspection PNGs
npm test                            # launch-blocker checks
```

## Edit the recipe or timing

`recipe.js` contains all ingredient names, measurements, time ranges, credits, step labels, and named motion windows. `scene.js` derives liquid levels, color blending, dash pulses, stir, strain and glass transitions from those absolute timestamps. Retiming lives in `recipe.js`: adjust the step/ingredient ranges and matching named `motion` windows together. Keep all events contiguous and the duration at 30 seconds; `npm test` checks this. `player.js` owns controls, URL options and the playback clock.

| Seconds | Action |
| --- | --- |
| 0–3 | Title; empty rocks glass |
| 3–4.8 | Line the glass with a fresh, trimmed banana leaf |
| 4.8–6.6 | Add one large ice cube |
| 6.6–8 | Fill a separate mixing glass with ice |
| 8–10.8 | 1 oz bourbon |
| 10.8–13.6 | 1 oz mezcal |
| 13.6–16.4 | ½ oz prepared plantain syrup |
| 16.4–18.6 | 2 dashes Angostura bitters |
| 18.6–20.8 | 2 dashes banana bitters |
| 20.8–23 | Stir until chilled, shown with compressed time |
| 23–25 | Strain into the prepared rocks glass; retain mixing ice |
| 25–30 | Highlight the banana leaf garnish; finished drink and title hold |

### Recipe provenance and limits

The recipe was supplied by Miz, attributed to Danny González and Pedro Tobar at Bar Providencia in Washington, D.C. This implementation follows that supplied brief; it is not independently certified by the bar. “With Codex” names the animation, not a claimed recipe modification or endorsement.

The banana leaf lining is the garnish. No second garnish is invented. The supplied recipe uses 1 oz bourbon, 1 oz mezcal, ½ oz plantain syrup (or spiced plantain purée), 2 dashes Angostura bitters, and 2 dashes banana bitters. The film uses the syrup option.

The supplied syrup method is fried plantains simmered with cinnamon, water and toasted coriander, then blended and finely strained. Batch ratios and cooking times were not provided. The film begins with **prepared syrup** and does not fabricate a syrup recipe. Chilling is compressed for the 30-second format, not prescribed as a literal 2.2-second stir. Liquid levels are illustrative, not calibrated; visual dash displacement is not a fluid-ounce instruction.

## GitHub Pages

The site is served from **`gh-pages` → `/ (root)`**. Source is on `main`; the published snapshot is on `gh-pages`. No build step is needed.

For subsequent updates, from a local checkout authenticated with your own GitHub SSH key:

```sh
git clone git@github.com:mizcausevic-dev/ni-de-aqui-ni-de-alla-codex.git
cd ni-de-aqui-ni-de-alla-codex
# Edit source, then:
npm install
npm test
git add .
git commit -m "Update cocktail film"
git push origin main
git push origin main:gh-pages
```

GitHub → repository Settings → Pages → Deploy from a branch → `gh-pages` → `/ (root)` → Save. The existing site will rebuild after each push. Exported MP4 files are deliverables, excluded from the source repository; generate them with the exporter above.

## License

Application code: MIT. Space Grotesk: SIL Open Font License; see `assets/FONT-LICENSE.txt`. Recipe names and creator credits remain attributed to their respective owners. No analytics, external requests, user data collection, authentication, or API keys.
