# P3 adds and hazards (hidden)

Quadrant 1 of the hidden P3 drill ([p3-drill.md](./p3-drill.md), [p3-recorded-kills.md](./p3-recorded-kills.md)) has his adds and hazards as the RuneLite fight logs recorded on 2026-10-23 show them, played solo. P3 tick 0 is the tick he lands in his corner. Void bombs show over the player at 4 and 7 and drop 2 ticks later, hitting a player still on the tile; each leaves a void that hits a player on it every 2 ticks from the tick it formed, for the rest of the drill. Rubble shows over the player 3 ticks into each spin and falls 5 ticks later on that tile. With his first move after the first and third spins he shouts "The void... will take you..." or "Await... the void...", and 3 ticks later a Void Vine (NPC 16681, 44 HP) roots the player where they stand: they cannot walk until they cut it, and their attack goes to it at once. It outlives Untether. Void Rifts come only after an Untether the quadrant stands through: one 32 ticks after Untether starts, then one every 48 ticks; one due while he spins comes with his first move after the spin. A rift left alive detonates 30 ticks after it appears, with its flare on the player and a typeless hit of 39 to 41. A standard ranged or melee attack kills one in a hit, and the kill resets the player's attack cooldown with "Destroying the void rift empowers you!" in the chat. The bombs and rubble are marked on their tiles until they land, as practice; the voids are drawn with the cache's void model.

## Sub-features

- `p3-bombs` shows bombs over the player at 4 and 7, drops them 2 ticks later and leaves their voids.
- `p3-voids` hits a player on a void every 2 ticks from the tick it formed.
- `p3-rubble` shows rubble at P+3 and drops it at P+8.
- `p3-vine` shouts after the first and third spins, roots the player 3 ticks later and lets them go when they cut it.
- `p3-rifts` spawns rifts at U+32 and every 48 ticks, waits past a spin, detonates a rift left alive at +30, and resets the attack cooldown on a kill.

## How to get to it (user POV)

- Run the trainer with the flag on: `ARCHIVE_P3=on npm start`, or `scripts/verify.sh serve`, which sets it.
- Open `?phase=p3&invincible=on` and play quadrant 1: step off each marked tile, cut the vine, and kill each rift.

## Driving it with agent-browser

Preconditions:

- The baseline preconditions in the index hold, with the dev server started by `scripts/verify.sh serve` so the flag is on.
- `public/osrs-assets/manifest.json` contains `npc-16681`, the vine, from `npm run assets`.

- **Adds as recorded.** Open `?phase=p3&seed=1&invincible=on` and wait until P3 tick 134 with no input. The log has `hazard-shown` on 4, 7, 27 and 113, `void-formed` on 6, `vine-rooted` on 36, `vine-cut` on 63, `rift-spawned` on 85 and 133 and `rift-detonated` on 115.
- **Markers and units.** On the same page, take screenshots on ticks 5 (the bomb's marker over the player), 8 (the void), 28 (the rubble's marker), 37 (the vine on the player's tile) and 87 (the rift). Repeat in 2D.
- **Step off.** Open `?phase=p3&seed=1&invincible=on`, click the tile west of the player after tick 4 and again after tick 7. The log has no `bomb` hit and two `void-formed` events on the tiles the player left.
- **Kill a rift.** Open `?phase=p3&seed=1&invincible=on` and click the rift's tile, from the `rift-spawned` event on 85, after tick 86. The log has one `rift-destroyed`, the chat shows the empower line, and no `rift-detonated` follows for it.
- **Scripted.** `scripts/verify.sh browser` runs the chain page in `drive_p3_drill` to tick 134 and checks `p3AddsAsRecorded`.

## Gotchas

- A player who stands still takes both bombs and their void every 2 ticks after, so a run without Invincible ends early.
- The vine takes the player's attack at once, and a walk order does nothing until it is cut.
- The rifts' timer bar under the HP bar is drawn against phase 4's charge time, scaled so it fills over the phase 3 rift's 30 ticks.
