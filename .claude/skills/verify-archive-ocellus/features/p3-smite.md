# P3 smite flick (hidden)

With the `ARCHIVE_P3` flag on, the P3 boss ends each 20-tick autos table with the smite. On its first tick, S (P3 tick 27 in a run), he deals a swing-like opening blow that Protect from Melee takes down to chip, and blades spin up around him. Spins land at S + 4 and then every 3 ticks: once in quadrant 1, twice with `start=2` and three times with `start=3`. The boss reads Protect from Melee once a tick, after prayer clicks and before hits land. Under the default rule `on-off-on`, a spin is blocked when the prayer was on at its reference tick (the smite's start for the first spin, the previous landing after that), off on at least one later tick, and on at the landing. A blocked spin deals 0. Any other spin deals 43 to 50, and the chat says why: the prayer stayed on (held), was not back on for the landing (late), or was already off when the smite started (early). On the first landing, rubble is aimed at the player's tile. It falls for 5 ticks, then hits 5 to 7 each tick the player stands on that tile, for 10 ticks. The autos start again 3 ticks after the last spin. `start=2` and `start=3` also open the boss at ⌊5250 × 0.75⌋ = 3937 and ⌊5250 × 0.5⌋ = 2625 HP. `flick=off-then-on` or `flick=held-blocks` changes the rule, and `missedFlickDamage=swing-chip` changes a missed spin to 0 to 6.

## Sub-features

- `p3-smite-flick` blocks a spin flicked on the prayer tab: on at S, off after it, on for the landing.
- `p3-smite-held` hits for 43 to 50 with a held prayer, and the chat says it stayed on.
- `p3-smite-late` hits for 43 to 50 when the prayer comes back a tick after the landing, and the chat says it was late.
- `p3-smite-spins` lands 2 spins with `start=2` and 3 with `start=3`, 3 ticks apart, each judged from the landing before it.
- `p3-smite-blades` draws cache spotanims 4325, 4326 and 4327 on the boss in 3D, and three blades around him in 2D, from S to the last spin.
- `p3-smite-rubble` aims rubble at the player's tile on the first spin. It falls as spotanim 4346 with an amber 2D outline, then lies as 4347 with a purple 2D tile while it hits.
- `p3-smite-chat` writes one chat line for each spin that hits.

## How to get to it (user POV)

- Run the trainer with the flag on (`scripts/verify.sh serve`), and open `?phase=p3&seed=1&invincible=on`.
- Pray Protect from Melee before P3 tick 27, then flick it on the prayer tab around each landing.
- Add `start=2` or `start=3` to practise two or three spins, and `flick=` or `missedFlickDamage=` to change the rule or the damage.

## Driving it with agent-browser

Preconditions:

- The baseline preconditions in the index hold, with the dev server started by `scripts/verify.sh serve` so the flag is on.
- The view setting is saved before the page that needs it opens: `use3dView` true for 3D and false for 2D.

- **Flick.** Open `?phase=p3&seed=1&invincible=on` in 3D. Click Protect from Melee at the canvas centre plus (`PROTECT_MELEE_RIGHT_PX`, `PROTECT_DOWN_PX`) after P3 ticks 20, 27 and 30. By tick 32 the log's only spin is at 31, spin 1 of 1, `blocked`, requesting 0 with prayer `melee`, and the log's `prayer-published` inputs are on 21, 28 and 31.
- **Held.** Reopen it and click Protect from Melee after tick 20 only. The spin at 31 is `struck`, `held`, requesting and applying 43, and `#game_chat` shows "Spin 1 of 1 hit you for 43. Protect from Melee stayed on. Turn it off after the blades start, then back on for the spin."
- **Late.** Reopen it and click after ticks 20, 27 and 31. The spin at 31 is `struck`, `late`, 43 with prayer `null`, and the chat says "Protect from Melee was not back on in time for the spin."
- **Two and three spins.** Open the same link with `&start=2` and click after 20, 27, 30, 31 and 33: spins 1 and 2 of 2 at 31 and 34 are both `blocked`. With `&start=3`, also click after 34 and 36: spins at 31, 34 and 37 are all `blocked`.
- **Blades.** Open the link in 3D and take a screenshot at P3 tick 25 and at 30. In the box from 260 px left to 120 px right and from 20 px above to 280 px below the canvas centre, at least 0.5% of the pixels are bright purple at 30 and at most 0.3% at 25. Repeat in 2D: at least 0.4% are within 24 of the blade colour `#b48cff` at 30, and none at 25.
- **Scripted.** `scripts/verify.sh browser` runs `drive_p3_smite` after `drive_p3_drill`. It writes `p3-smite-*` and `p3-blades-*` and `p3-smite-checks.json`, and checks `p3SmiteFlickedOnPrayerTab`, `p3HeldPrayerTakesSpin`, `p3LateFlickTakesSpin`, `p3TwoSpinFlick`, `p3ThreeSpinFlick`, `smiteBladesDrawn` and `noP3SmitePageErrors`.

## Gotchas

- A click after tick t is read by the boss on t + 1, so the log's `prayer-published` input sits on the row after the click. A click that slips past the next tick changes the verdict, and the check fails on the spin, not on the click.
- Two clicks in one 0.6 s interval cancel out. The SDK applies the last state of the interval, so off and on in one interval reads as held.
- Without Invincible, a run with no prayer before the smite can die to the swings and a missed spin.
- Model 62698's centre is 144 faces textured with 215. The SDK draws spotanims without textures, so the blades take P4's `tellCentre` recolour, which draws those faces black.
