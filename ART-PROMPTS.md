# Betel Nut Simulator — Art Prompts

18 images total: 5 character portraits + 13 scene backgrounds, one per act.
Style reference: painterly anime/manga cover art — moody neon lighting, high
detail rendering, dramatic close crop, cinematic color grading (see the
sample you shared: red/green neon glow, soft painterly skin, sharp linework
on hair/clothing, glowing text treatment optional — skip the text for these).

**Common style suffix** — append to every prompt:
> digital painting, anime/manga illustration style, painterly rendering, cinematic lighting, moody neon color grading, high detail, dramatic atmosphere, no text, no watermark, portrait orientation

**Where images go:** drop files in `src/assets/` (create the folder), then
wire the path into `imageUrl` on the matching `Character` (portraits, not
yet wired — see note at bottom) or `BackgroundSpec` (scenes, in each
`src/game/acts/actN.ts`, `backgrounds` object) entry.

---

## Character Portraits (5)

Each character has a `color` (accent/neon color) and `glyph` (their CJK
initial) already defined in `src/game/characters.ts` — used here to keep
portraits consistent with their in-game UI color.

### 1. Ah-Mei (阿美) — betel nut beauty
**Accent color:** hot pink/magenta `#ff2d78`

> Portrait of a 22-year-old Taiwanese betel nut beauty (檳榔西施) leaning in the glass booth of her betel nut stand, sharp confident eyes, teasing half-smile, glossy dark hair, wearing a sheer glittery halter top with a choker, neon pink and magenta light from stand signage reflecting off her skin and glass, night street market bokeh in the background, sultry but sharp-witted expression — not innocent, street-smart

### 2. Brother Long (龍哥) — recruiter/handler
**Accent color:** deep red `#c53030`

> Portrait of a Taiwanese gangster in his mid-40s, calm unreadable expression, buzzed hair greying at the temples, plain dark button-up shirt, standing very still, faint red neon glow from a truck depot sign behind him, minimal warmth in the eyes, an aura of quiet menace and total control, cinematic low-key lighting

### 3. Boss Tsai (蔡老闆) — farm operator
**Accent color:** amber/gold `#e8a33d`

> Portrait of a weathered 63-year-old Taiwanese betel nut farmer, deep sun-worn wrinkles, calloused hands, sleeveless undershirt, straw hat pushed back on his head, standing among rows of areca palms at golden-hour dusk, warm amber backlight through palm leaves, paternal and blunt expression, dirt under his fingernails

### 4. "Snake" Hsu (蛇哥) — rival lieutenant
**Accent color:** teal `#38b2ac`

> Portrait of a smooth, ambitious Taiwanese gangster in his late 30s, slicked-back hair, an expensive open-collar silk shirt, a wide charming smile that doesn't reach his eyes, leaning back with easy confidence, teal and cyan neon glow from a karaoke/teahouse sign, one eyebrow raised, an aura of charisma hiding calculation

### 5. Big Brother Kuo (郭大哥) — head of the operation
**Accent color:** gold `#d4af37`

> Portrait of a powerful 68-year-old Taiwanese crime boss, deep lines of age and wisdom on his face, thinning silver hair, sitting very upright in a dark tailored tangzhuang jacket, holding a small teacup, warm gold candlelight from a private tea room, tired philosophical eyes that have seen everything, an aura of history and quiet danger

---

## Scene Backgrounds (13)

Grouped by act. Each includes the act's mood/gradient so the art direction
matches what's already coded — treat the gradient as the target lighting
palette. These render full-bleed behind the dialogue box, so keep the
**lower third fairly uncluttered** (a dialogue/vignette overlay sits there)
and put the interesting detail in the upper two-thirds.

### Act 1 — "The Stand" (台北街頭)
*Rain on the windshield, pink neon on the glass. The last delivery of the night is never the last.*
Palette: near-black → deep purple → magenta/pink

**1. `street` — Wanxia District, 11:47 PM**
> Wide night street scene in a fictional Taipei neon district, rain-slicked asphalt reflecting pink and purple neon signage, betel nut stands and motorbikes lining the street, mist and glow, cinematic wide shot, empty of people or one distant silhouette, moody and atmospheric, magenta and violet color grading

**2. `stand` — Twin Star Betel Nut (雙星檳榔)**
> A glowing glass-walled betel nut stand booth at night, hot pink and magenta neon signage reading (stylized, no legible text needed) glowing through misted glass, betel nut leaves and packets displayed inside, rain droplets on the glass, close-up cinematic angle, saturated pink/magenta glow

**3. `alley` — the alley behind the stand**
> A narrow dark alley behind a night market street, dumpsters and pipes, single flickering violet neon light spilling in from the street beyond, wet pavement reflections, ominous and quiet, deep purple and near-black color grading, cinematic low angle

### Act 2 — "The Farm" (南部檳榔園)
*Five hours south, the neon gives way to palms in rows. Money really does grow on trees here — if you can climb.*
Palette: dark olive → moss green → amber-gold

**4. `road` — Provincial Highway 1, southbound**
> A lone delivery truck on a rural Taiwanese highway at dusk, rice paddies and distant mountains, warm dying golden-olive light, long empty road stretching to the horizon, dust and heat haze, cinematic wide shot, amber and olive color grading

**5. `farm` — Binnan Township (檳南鎮)**
> Rows of areca palm trees on a hillside betel nut farm in southern Taiwan, golden hour sunlight filtering through palm fronds, workers' baskets and ladders leaning against trunks, warm green-gold atmosphere, wide cinematic establishing shot, dust motes in the light

**6. `shed` — the packing shed**
> Interior of a rustic betel nut packing shed, bare bulbs hanging from wooden beams, sacks of betel nuts stacked along the walls, warm amber bulb light against dark wood shadows, workbenches with baskets, cinematic interior lighting, dusty and lived-in

### Act 3 — "The Runs" (北上運輸)
*Three hundred kilometers of dark highway between the farm and the neon. Every kilometer wants something from you.*
Palette: near-black → navy → cold blue

**7. `highway` — Provincial Highway 1, northbound, 2 a.m.**
> A truck's headlights cutting through fog on a dark highway at 2am, distant sodium streetlights, deep navy blue night sky, rain starting on the windshield, tense and isolating atmosphere, cold blue cinematic color grading, wide low-angle shot

**8. `reststop` — highway rest stop, sodium lights**
> A near-empty highway rest stop at night, harsh orange sodium vapor lights against a deep violet-blue sky, a few parked trucks, vending machines glowing, quiet unease, cinematic wide shot, warm/cold color contrast (orange lights vs blue night)

**9. `warehouse` — the Sanchong warehouse**
> Interior of a large dim industrial warehouse at night, stacked shipping crates and pallets, cold blue-white light from a few hanging fixtures, long dramatic shadows, sense of scale and quiet threat, cinematic low-key lighting, navy and steel-blue color grading

### Act 4 — "The Rift" (幫派內鬥)
*The organization is a table with one chair that matters, and everyone has started measuring the legs.*
Palette: near-black → deep red/maroon → burnt orange (office); dark brown → amber (teahouse); pink/magenta (stand2, matches Act 1 stand)

**10. `office` — the route captain's office, Sanchong**
> A dim, spare gangster's office at night, a metal desk, a single desk lamp casting deep red-orange light, cigarette smoke curling in the light beam, venetian blind shadows on the wall, tense and formal atmosphere, cinematic low-key lighting, maroon and burnt-orange color grading

**11. `teahouse` — the Golden Crane tea house, private room**
> An opulent private tea house room in Taipei, dark wood paneling, a low table with a full tea service, warm amber lantern light, silk cushions, rich texture and detail, an air of old-world power and negotiation, cinematic warm lighting, brown and amber color grading

**12. `stand2` — Twin Star №3, Ah-Mei's corner**
> A different glowing glass betel nut stand booth at night on a busier corner, hot pink and magenta neon glow, slightly more upscale and lit than the Act 1 stand, rain-slicked street reflections, cinematic close angle, saturated pink/magenta color grading (match the Act 1 stand palette)

### Act 5 — "The Throne" (王座)
*Every man who took a throne dug a grave beside it. The old man dug his forty years ago and kept it swept.*
Palette: near-black → dark gold → amber

**13. `temple` — Longevity Tea House, the back room**
> A grand, dim private back room in an old tea house, ornate dark wood furniture, a single low table with tea set for two, deep gold candlelight, faded ceremonial banners on the walls, an atmosphere of finality and old power, cinematic warm gold color grading, painterly detail on wood grain and shadow

---

## Notes for wiring images back into the game

- **Backgrounds:** each `BackgroundSpec` in `src/game/acts/actN.ts` has an
  optional `imageUrl` field (see `src/types/game.ts:46`). Once you have a
  file, drop it in `src/assets/backgrounds/` and set e.g.
  `imageUrl: new URL('../../assets/backgrounds/street.png', import.meta.url).href`
  or just import it and reference the import. `SceneBackground.tsx` already
  renders `imageUrl` full-bleed with a vignette + bottom gradient on top, so
  no component changes needed — just fill in the field per scene.
- **Portraits:** `Character` in `src/types/game.ts` doesn't have an
  `imageUrl` field yet — only `Portrait.tsx` renders characters currently
  (worth checking how it draws them today before wiring portraits in; may
  need a small type + component addition, unlike backgrounds which are
  ready to go out of the box).
- Recommended output size: backgrounds ~1536×1024 (or any 3:2ish landscape,
  they get `object-cover` cropped); portraits ~1024×1536 portrait orientation.
