# feat(p1): add a hidden P1 drill behind ARCHIVE_P1, from the opening line to his transformation

## What players get (with the flag on)

`?phase=p1`, or **Phase 1** in the Settings Phase box, opens the whole room with Ocellus (NPC 16674, 2,500 HP, the solo and duo value) and runs phase 1 to its end:

- He says "Now... ascension...", then walks a tile a tick to a seeded corner under Protect from Melee, casting a fire (ranged) or water (magic) volley every 5 ticks. A volley lands 3 ticks after the cast within 4 tiles of his 3x3 and 4 beyond, and deals 0 through the matching prayer.
- At a corner he charges. Seven cracks open 2 ticks apart, 8 tiles each, and each closes 5 ticks after it opens. They are drawn with the cache's crack pieces, growing back toward him, and tinted in 2D. Then come a taunt, the explosion and a blast within 2 tiles of his 3x3. A crack that closes under the player is blocked for 3 to 5 damage, which comes back once the player steps off. A crack nobody blocks charges his yellow bar, drawn under his HP bar, and heals him 2.
- At 66% and 25% he teleports to the middle. There he does four clockwise beats of two cracks and a blast, then the strike: one shot of 17 to 19, plus one more per 24 of the bar ("Embrace... annihilation...").
- At 0 HP he says "You... will disappear...", teleports to the middle if he is elsewhere and transforms. The run ends when phase 2 would start, with "Phase 1 cleared (interim end)", the P1 time, **Repeat P1** and **Retry seed**.

Production builds leave the flag off: `?phase=p1` opens P4 and lists `phase=p1` as rejected. No changelog line, because players can't see it yet (the P3 drill shipped without one too).

## How it maps onto the trainer

| P3 drill | P1 drill |
| --- | --- |
| `ARCHIVE_P3` in `flags.ts` and EnvironmentPlugin | `ARCHIVE_P1` beside it. `parseRequest` routes `phase=p1` only with the P1 flag on and `phase=p3` only with the P3 flag on |
| `OCELLUS_P3` with provenance | `OCELLUS_P1`, appended after the P3 and P4 sections so the edits stay apart. P1 reuses P4's `setup` choice. Its max HP is the solo value, with no option, following the solo decision |
| `P3Types.ts`, `p3/arena.ts`, `p3/schedule.ts`, `p3/fight.ts` | `P1Types.ts`, `p1/arena.ts` (the P3 grid with every wedge open), `p1/schedule.ts`, `p1/fight.ts` |
| `mobs/OcellusP3.ts` on `EncounterBinding` | `mobs/OcellusP1.ts` on the same binding. It judges incoming hits (Protect from Melee, invulnerable while teleporting) in `before-npc-hits` and pays block refunds in settlement |
| `P3Region.ts` | `P1Region.ts` plus `entities/P1Views.ts` for crack and blast spotanims on floor tiles |
| `tests/P3-drill.test.ts`, `p3drill.ts`, `P3-page.test.tsx`, `features/p3-drill.md` | `P1-drill.test.ts` (20 cases), `p1drill.ts`, `P1-page.test.tsx` (3), `features/p1-drill.md` |

He walks a scripted route, so the schedule compiles one walk table per kind of leg: from the start (6 or 9 steps, from the seeded first corner), from a corner (always 12) and from the middle (always 6). `compileP1Schedule` throws if the corners stop being equidistant. The HP breakpoints (66%, 25%) enter `middle` from the walk stages. The fight passes `advance` his HP as he last decided a volley. That is how the logs behave: he goes to the middle only on a volley tick. His end at 0 HP is not an HP fraction, so it is a fixed table entered on any tick (`endSlots`).

## Sources

Every value is in `OCELLUS_P1` with a wiki ref or `noWiki(why)`, its sources and a basis. The sources are the wiki (Strategies rev 15381731 and Ocellus rev 15381739: the phase 1 text, the infobox and the hitpoints table), cache 2746 (NPC 16674 stats and params, seq and spotanim names), a tick analysis of packet captures of six fights (cited by link only, since it has no licence), a public duo kill video, and RuneLite fight logs recorded on 2026-10-23 (2 spectated kills and 6 raids). The new `fight-log` source kind matches the one the P3 recorded-kills branch adds. `team-7-and-8` is a new `Scale` for evidence from those teams.

Where the logs disagree with our own simulator, the logs win, and the note says so:

- **Middle trigger.** On volley ticks only. All 8 middles that followed a corner started at C + 21, never at the blast (C + 19).
- **Walk after the strike.** Starts 9 ticks after the strike is told (11 of 11), not 8.
- **End timing.** Teleport out at K + 2, in at K + 5, transform at K + 7, or at K + 3 when he is already in the middle. Phase 2 starts 7 ticks after the transform (8 of 8).
- **Crack length.** 8 tiles (85 of 85), not 9.
- **Damage.** Blast 26 to 34 (the captures gave 28 to 30). Volleys 0 to 27 unprotected (the captures gave 1 to 25). No strike heal: 6 strikes show none.
- **Blocking.** 3 to 5 damage, refunded on stepping off (wiki, logs). Our sim gave a 9 to 16 heal per block.
- **Walk path.** Straight along the longer axis, then diagonally (logged positions).

## PStack principles applied

- **model-the-domain**: walks, corners, middles and the end are stages of one schedule. Beats are a discriminated union, and so are events, crack outcomes (`blocked` / `charged` / `faded`) and hit causes. "Decides on volley ticks" is in the data, not hidden in control flow.
- **type-system-discipline**: no `any`, `as` or `!`. Tiles and ticks are branded, and every `switch` ends in `never`.
- **foundational-thinking**: walk tables come from geometry and are validated at compile time. The schedule never trusts a hand-typed length.
- **boundary-discipline**: `p1/fight.ts` is pure (facts in, events, hit requests, boss heals and refunds out). The SDK is touched only in the mob, the region and the views.
- **minimize-reader-load**: shared files get small, separate edits (a `Source` line, a `Scale` member, the routing lines, P1 roll streams numbered from 101). The P1 data sits at the end of `OcellusTimings.ts`.
- **test-behavior-not-implementation**: tests drive the region with real clicks and ticks and assert the fight log.

## Verification

- `npm run typecheck` and `npm run build` pass.
- `npm test`: 320 pass. The one failure is the known Windows-only `schedule.test.ts > the stage contract`.
- `replay-controls` passes against `15f6462` (exit 0, 35 files replayed). I ran it from a local copy adapted for Windows: it links `node_modules` with a junction and starts vitest through node. The repo's script stops here on an EPERM symlink, as `shell-test-runs-entry.mjs` does.
- `scripts/check-types.test.sh` fails 26 cases on this machine. It fails the same 26 on the base: Windows paths in its assertions.
- `scripts/verify.sh` was **not** run: agent-browser can't run here, and the script has no P1 stage yet. I checked the recipe in `features/p1-drill.md` with headless Chrome (puppeteer) instead, against `ARCHIVE_P1=on npx webpack serve` on port 8012:
  - The walk, the corner cracks and the blast in 3D and 2D.
  - The middle's beats and strike.
  - Blocking and its refund.
  - The end panel.
  - The Phase box round trip.
  - No page errors.
  - The production build with the flag off, served on 8022, opens P4 at 1312 / 5250 with no Phase box.

## Not done / follow-ups

- **His transformation pose is not played.** Seq 14814's frame sound 12819 is missing from cache 2746, and the SDK throws an uncaught error when the pose reaches it. Once the SDK skips missing frame sounds, add the pose back to `bossPoses`.
- **No `drive_p1_drill` in `scripts/verify.sh`.** The recipe is in `features/p1-drill.md`.
- **No P1 sounds** beyond the animation and spotanim frame sounds: no crack-close or shout sounds yet.
- **Untested parts of the model.** One more strike shot per 24 of the bar comes from the captures' engine and was never logged. The first-corner and tendril-order coin flips are inferred.
- **End pose of 12-step walks.** The logs put it 5 ticks early on walks from the south-west corner to the north-east one. Only the pose differs: the charge tick is unchanged.
- **Payload.** Payload grows by about 3.4 MB (7.1 MB to 11 MB): NPC 16674 with 9 poses is 0.86 MB, and 40 spotanims are 2.5 MB. Dropping three of the four floor-explosion turns and keeping one family of crack pieces per axis would save a few hundred KB.

- **Provenance.** The fight-log source, the `team-7-and-8` scale and the use of `footage-repeated` for log-backed values are stand-ins. They will be replaced by the shared `FIGHT_LOGS` registry (L1 to L8 = fights 1 to 8 here), the `analysis` source and the `log-repeated` basis once that foundation branch lands.

## Decisions for Julian

1. The end panel title, "Phase 1 cleared (interim end)", and the P1 time, counted to the tick phase 2 would start rather than the kill tick.
2. Whether the logs-over-our-sim calls above are the ones he wants (blocking refund, middle trigger, 8-tile cracks).
3. Whether the Phase box order should become 1, 3, 4. Today P1 is appended after P3 to keep the diff small.
4. Phase 1's roll streams use 101 to 109, so they don't collide with other phases' new streams.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
