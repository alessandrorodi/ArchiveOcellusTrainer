# P3 drill (hidden)

A second drill, phase 3, sits behind the build flag `ARCHIVE_P3`. Production builds leave it off, so `?phase=p3` opens P4 and lists `phase=p3` as rejected, and Settings has no Phase box. With the flag on, `?phase=p3` opens the cache arena with the player and Ocellus (NPC 16677) on its north-east wedge. The rest of the floor is drawn darker and is closed. P3 tick 0 is the tick he lands in his corner. The boss chases the player and runs quadrant 1's chain of moves, swings at P3 ticks 4, 7, 14 and 17 among them ([p3-recorded-kills.md](./p3-recorded-kills.md)). A swing in melee reach deals chip of 0 to 6 through Protect from Melee, or 0 to 26 without it. When the player is out of reach after the boss's step, a panic shot takes the swing's place: magic that lands 2 ticks later, blocked by Protect from Magic. The quadrant falls on the tick after the boss's HP reaches 75% of his max, ⌊5250 × 0.75⌋ = 3937, which ends the run with "Quadrant 1 cleared (interim end)", the P3 time, and Repeat P3, Retry seed and Start P4. A death shows "You died" with the P3 tick. `seed`, `setup`, `invincible=on`, `bosshp=N` and `reach` work on a P3 link. Any other key, a P4 focus among them, is rejected.

## Sub-features

- `p3-flag` opens P4 for `?phase=p3` and draws no Phase box when the build leaves `ARCHIVE_P3` off.
- `p3-open` opens P3 on the north-east wedge with NPC 16677 at 5250 HP when the flag is on.
- `p3-arena` draws the open wedge lighter than the closed floor, with the olive rim, in 2D and 3D.
- `p3-swings` swings at 4, 7, 14 and 17 with chip under Protect from Melee.
- `p3-panic` turns a swing into a panic shot when the player is out of reach after the boss steps.
- `p3-interim` ends the run the tick after the boss reaches 3937 HP or below, with the interim panel and its three buttons.
- `p3-start-p4` opens a fresh P4 run that keeps the setup and Invincible.
- `p3-phase-box` shows the current phase in Settings and reloads the other one with its defaults.

## How to get to it (user POV)

- Run the trainer with the flag on: `ARCHIVE_P3=on npm start`, or `scripts/verify.sh serve`, which sets it.
- Open `?phase=p3`, or choose **Phase 3** in the **Phase** box under **Settings**.
- Attack the boss until the interim panel shows, then click **Start P4**, **Repeat P3** or **Retry seed**.

## Driving it with agent-browser

Preconditions:

- The baseline preconditions in the index hold, with the dev server started by `scripts/verify.sh serve` so the flag is on.
- The view setting is saved before the page that needs it opens: `use3dView` true for 3D and false for 2D.

- **Arena.** Open `?phase=p3&seed=1` and wait for P3 tick 3. Read `window.__archiveOcellusProbe.tileCentre(tile)` for the open tiles (25, 11) and (26, 11), the closed tiles (16, 13) and (17, 13), and the rim tile (28, 10), then take a screenshot. In both views the mean colour around each open tile is lighter than each closed tile by at least 12, and the rim's green exceeds its blue by at least 20.
- **Swings.** On the same 3D page, click Protect from Melee after P3 tick 1, at the canvas centre plus (`PROTECT_MELEE_RIGHT_PX`, `PROTECT_DOWN_PX`). By tick 18 the log's `player-hit` events for swings are at 4, 7, 14 and 17 requesting 2, 5, 4 and 1 with prayer `melee`, and the boss bar drew `5250 / 5250 (100.0%)`.
- **Panic.** Reopen `?phase=p3&seed=1`, click Protect from Melee after tick 1, then click the pixel `tileCentre({ x: 27, y: 9 })` returns after tick 3. The log has a swing of 2 at 4, a `boss-moved` panic at 7 and a `panic` hit of 25 at 9 with prayer `melee`, which does not block it.
- **Interim clear.** Open `?phase=p3&seed=100&bosshp=3991` and click `tileCentre({ x: 20, y: 7 })` after tick 2, which attacks the boss. The bow's first shot of 54 lands on tick 5 and the quadrant falls on 6. The row for tick 6 has `bossHp.atPostTick` 3937 and a `run-ended` event, and the panel reads "Quadrant 1 cleared (interim end)", "P3 time: 6 ticks (0:03.6)" with Repeat P3, Retry seed and Start P4.
- **Start P4.** Click `#result_start_p4`. The new page's `location.search` is `?phase=p4&setup=ranged`, the boss has 1312 HP, the log header has no `phase`, and `#phase` shows `p4`.
- **Production.** `scripts/verify.sh production` builds with `ARCHIVE_P3=off`, opens `?phase=p3&seed=1`, records every boss bar the canvas draws, and opens Settings. The first bar is `1312 / 5250 (25.0%)`, P4's entry, and the menu has `#setup` but no `#phase`.
- **Scripted.** `scripts/verify.sh browser` ends with `drive_p3_drill`, writes the `p3-*` files and `p3-checks.json`, and checks `p3BossIsNpc16677`, `p3ArenaDrawn`, `p3SwingsChipUnderMeleePrayer`, `p3PanicOutOfReach`, `p3ChainAsRecorded`, `p3InterimClear`, `p3StartP4OpensP4` and `noP3PageErrors`. The production stage writes `production-phase-p3.json` and checks `phaseP3OpensP4` and `noPhaseBox`.

## Gotchas

- The boss is not drawn during GET READY, so a click on him before P3 tick 0 walks the player instead of attacking.
- The boss steps before he decides each attack. A player running 2 tiles a tick gains only 1 tile a tick on him, so a run along his side stays in reach.
- In 3D the boss's model and both HP bars cover the tiles just south of the two units, so the arena samples use tiles away from both.
- `tile-clicks.jsonl` counts only the P4 pages' named tile clicks. `drive_p3_drill` clicks with `tile_pixel` and `click_after_tick` so it does not add to that count.
- Netlify builds run `npm run build` without the flag. Turning it on for deploy previews needs the owner's approval.
