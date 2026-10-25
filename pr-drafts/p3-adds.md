# feat(p3): add quadrant 1's bombs, rubble, vine and rifts

Stacked on `p3-recorded-kills`. Adds phase 3's adds and hazards to the hidden P3 drill as RuneLite fight logs recorded on 2026-10-23 show them in quadrant 1, played solo. Still behind `ARCHIVE_P3`.

## What players get (with the flag on)

- **Void bombs** show over you 4 and 7 ticks after he lands and drop 2 ticks later: 6-11 if you are still on the tile. Each leaves a void (the cache's void model) that hits 6-7 every 2 ticks from the tick it formed, for the rest of the drill.
- **Rubble** shows over you 3 ticks into each spin and falls 5 ticks later: 14-16 if you did not step off.
- **The vine:** with his first move after the first and third spins he shouts "The void... will take you..." or "Await... the void...", and 3 ticks later a Void Vine (NPC 16681, 44 HP) roots you where you stand. You cannot walk until you cut it; your attack goes to it at once, and you can hit it from your own tile. It outlives Untether.
- **Void Rifts** come only after an Untether the quadrant stands through: one 32 ticks after Untether starts, then every 48 ticks; one due while he spins comes with his first move after the spin. Left alive, a rift detonates 30 ticks after it appears (its flare on you, 39-41 typeless). A standard ranged or melee attack kills one in a hit (#58), and the kill resets your attack cooldown with "Destroying the void rift empowers you!".
- Bombs and rubble are marked on their tiles until they land (practice markers).

## How it maps onto the architecture

- **Pure adds step** (`p3/adds.ts`): voids, live rifts and the rift clock are part of the fight state. `stepAdds` takes the tick's facts (player tile, his south-west tile, the stage, whether Untether started, the rifts still standing, the player's attack clock) and returns events, hit requests and, on a kill, `cut-attack-delay` through the existing `EncounterBinding` output.
- **Bombs** run on the quadrant's own clock, so a panic does not move them; **rubble** is a beat of the spin's table; **the vine's shout** comes from the turn seeing a swing or panic start right after the first or third spin visit. Bomb, rubble and vine landings join the `landings` already used for the panic and the bands, so they land even if the stage that launched them is cut.
- **SDK side** (`mobs/OcellusP3.ts`): the vine and rifts are units the mob spawns from the turn's events (`VoidVine`, Julian's `VoidRift`), it freezes the player while the vine stands, and it logs `vine-cut` when it dies. `P3Player` lets the player hit a vine on their own tile. Voids are drawn with `FloorHole` (model 62508, already extracted), the rift flare with `PlayerLook.riftBurst`.
- **Data:** `OCELLUS_P3.bombs`, `voids`, `rubble`, `vine` and `rifts`, each with its sources. `roll.ts` gains `p3Tile` (12).
- **Shared files:** `src/assets.ts` gains one line, the vine NPC (`npm run assets` extracts it). No P4 file changes: P3 rifts reuse `VoidRift`, and its timer bar is scaled from phase 4's 23-tick charge to the phase 3 rift's 30.

## Sources per value

| Value | Basis | Sources |
|---|---|---|
| Bombs at 4 and 7, drop +2, 6-11, void stays | footage-repeated / spec-single | fight logs (S+4 in all eight, S+7 in fight 1), packet-capture analysis ("6, and 9 in the first"; damage audit), Molgoatkirby 8:55 |
| Void every 2 ticks, 6-7 | spec-single | damage audit (never the tick after, always 2 ticks after) |
| Rubble P+3, falls +5, 14-16 | footage-repeated | fight logs (every quadrant 1 spin; hits on raiders still on the tile), Molgoatkirby 7:20 |
| Vine after spins 1 and 3, roots +3, 44 HP, solo cut | footage-repeated / spec-confirmed | fight logs, packet-capture analysis, wiki Void Vine |
| Rifts U+32, every 48, wait past a spin | footage-repeated | fight logs (fights 3 to 8), packet-capture analysis |
| One rift solo | spec-confirmed | RAID_PLAN.md: max(1, living / 2) |
| Detonation +30, 39-41 | footage-repeated | fight logs, packet-capture analysis |
| Kill resets the attack cooldown | spec-single | wiki Void Rift ("It empowers you, resetting your tick cool down.") |

## PStack principles applied

- **model-the-domain:** the hazards' clocks are what the logs show: bombs on the quadrant's clock, rubble on the spin's, rifts on Untether's.
- **boundary-discipline:** the adds' rules stay pure in `p3/adds.ts`; units and freezes live in the mob.
- **type-system-discipline:** new events and hits are union members with `never` checks; ticks stay branded.
- **laziness-protocol:** Void Rifts only, and no telegraphs or effects without evidence (see below).
- **test-behavior-not-implementation:** `P3-adds.test.ts` drives the region with Invincible, `place` and real clicks, and reads the log.

## Verification

- `npm run typecheck`, `npm test` (the known Windows stage-contract failure only), `npm run build`, and `replay-controls` pass.
- `scripts/verify.sh` was not run (`agent-browser` unavailable here). Headless Chrome against the dev server, 3D and 2D: the adds on seed 1 to tick 134 (bombs 4 and 7, void 6, rubble 27 and 113, vine 36 to 63, rifts 85 and 133, detonation 115), screenshots of each marker and unit, and the branch 1 pages again (swings, panic, sever, interim end). No page errors. `drive_p3_drill`'s chain page runs to 134 and gains `p3AddsAsRecorded`.

## Decisions for you

1. **Phase 3 rifts max-hit** with standard melee and ranged (#58) as in phase 4. The logs disagree for phase 3: 34 of 89 hits on phase 3 rifts were the full 44.
2. **Quadrant 1 rifts follow the logs**, not our earlier per-segment ticks: none before the first Untether, then U+32 and every 48. Only Void Rifts; the Siphon (heals him) and the Augmenter (boosts you) are left out.
3. **Rubble** hits 14-16 and leaves no void; the solo drill puts one over you.
4. **Bombs** only on your wedge; in the game each also drops on the same tile turned into each other standing quadrant, which the closed wedges do not need.

## Not ported, and follow-ups

- The panic's void patch and Insolence's cracks: no evidence found in the logs or the packet-capture analysis.
- The Siphon and Augmenter kinds, and a kind per quadrant.
- Bomb copies on the other wedges, which matter once the drill crosses quadrants and carries the last ones into phase 4.
- `VoidRift`'s timer bar is scaled to phase 4's 23-tick charge; if phase 4 moves to 30 ticks, the scale becomes 1.

## Commits (on top of p3-recorded-kills)

- `7317e91` feat(p3): add quadrant 1's bombs, rubble, vine and rifts
- `f8d85e0` test(verify): check quadrant 1's adds on the P3 chain page
- `d4ce98a` docs(verify): map the P3 adds and hazards recipe and scenarios
- `83ffddb` fix(p3): ring a bomb or rubble mark in 2D so the player's square shows it
