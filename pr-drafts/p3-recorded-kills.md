# feat(p3): run quadrant 1 as the recorded chain, specials and fall

Brings the hidden P3 drill (#68) in line with RuneLite fight logs recorded on 2026-10-23: eight fights, read tick by tick. Still behind `ARCHIVE_P3`, still quadrant 1 with the interim end. The adds and hazards (bombs, rubble, vine, rifts) follow in a stacked PR, `p3-adds`.

## What players get (with the flag on)

- **The chain, not a clock.** From the tick he lands in his corner (P3 tick 0): swings at 4 and 7, a shadow slash at 10, swings at 14 and 17, a slash at 20, then a special. Each move is timed from the one before: swing, swing 3 later, slash 3 later, next move 4 after the slash. Every recorded quadrant 1 runs exactly this.
- **Panic shot.** With nobody in reach as a swing comes, "Your panic... is futile..." takes its place: magic landing 2 ticks later, blocked by Protect from Magic, and his next move 6 ticks after it, so the chain runs 3 ticks late. It replaces the typeless void shot of 20.
- **Shadow slash** (the old "wave", same animation 14846): lands the tick after its animation, typeless, on a 3-wide band toward you snapped to one of 8 directions from his middle tile.
- **Specials in turn:** spin, Untether, spin, Insolence, and again, after every two sets.
- **Spin:** the saw cuts 5 ticks in. A protection prayer up the tick before is severed for 3 ticks, with "Ocellus disrupts your concentration, severing your prayer!" and "You've been injured and can't use protection prayers!", so the cut lands. Flick it off for that tick and on for the cut. He stands still through the spin.
- **Untether:** he rises in his corner, (21, 7), out of melee reach. Magic lands 10, 14, 18 and 22 ticks in, blocked by Protect from Magic. The slam on 29 hits you if you were not under his 3x3 at the end of 28; the aftershock on 30 hits you if you were still under him at the end of 29. With the quadrant standing he swings again at U+37.
- **Insolence:** superior slashes animate 2, 7 and 12 ticks after the shout and land 3 later on 3-wide bands toward you; swings resume 20 ticks after the shout.
- **The fall:** the quadrant falls the tick after his HP reaches 75%, whatever he is doing ("Obliteration..." or "Run... It matters not..."), except through Untether, where it waits for U+31. Attacks already under way still land. The fall still ends the run as the interim end.
- **Practice markers:** the slash and Insolence bands from aim to landing, and his 3x3 through Untether, in 2D and 3D. The game draws none of these.

## How it maps onto the architecture

- **Schedule stages, one per move** (`p3/schedule.ts`): `arrive`, `swing`, `panic`, `shadow-slash`, `spin`, `untether`, `untether-ends`, `insolence`, `destroy`. Each stage's table is as long as the gap to his next move; `then` picks the next move from visit counts (two swings or panics, then a slash; two slashes, then the next special in `OCELLUS_P3.specials`).
- **One addition to `src/sim/schedule.ts`:** `Schedule.cut(t, stage)`. A panic depends on reach, which the schedule cannot know, so the turn cuts the `swing` visit to a `panic` visit on the same tick. A cut is not a breakpoint (`entered: "cut"`), so the HP breakpoints still fire in order. Tested in `schedule.test.ts`; the stage-contract message gains `| "cut"`.
- **HP breakpoints** stay as #68 built them (75/50/25% → `destroy`). Untether's first 31 ticks are `breakable: false`, so a floor reached there waits for U+31. The turn reads his HP from the `before-npc-hits` snapshot, before the tick's hits land, which gives "the tick after".
- **Pure fight step** (`p3/fight.ts`): facts in (tick, player at the boss step, HP, reach, his south-west tile), events and hit requests out. Delayed hits (panic, slash, superior slash) are `landings` in the fight state, so they land on their tick even when a fall cuts the stage that launched them.
- **Phase** gains `boss: "chasing" | "standing" | "levitating"`. The mob walks only when the last turn's phase says `chasing`; the player's `MeleeGuard` blocks melee while he levitates.
- **SDK side** (`mobs/OcellusP3.ts`): Untether's teleport and the prayer sever are applied from the turn's events; animations, overhead text, chat and markers are presentation in `P3Region.present`, with a new `entities/P3Marks.ts`.
- **Data:** every value in `OCELLUS_P3` with provenance. A new source kind, `fight-log` (recorded 2026-10-23), cites the logs; `P3_DAMAGE_AUDIT` cites the damage audit of the RSProx packet-capture analysis (MRobertEvers/oldschool-clientc). `roll.ts` gains streams `p3Damage` (10) and `p3Shout` (11).
- **Assets:** `superiorSlash` (14848) and `quadrantFalls` (14859) join `OCELLUS_P3.bossPoses`, so `npm run assets` extracts them; `src/assets.ts` is unchanged.

## Sources per value

| Value | Basis | Sources |
|---|---|---|
| First move 4 after landing | footage-repeated | fight logs, fights 1 to 8 |
| Chain gaps 3 / 3 / 4, panic 6, two sets | footage-repeated | fight logs; panfleet's and DefBigbeast's frames (their "waves" are the slash landing, a tick after its animation) |
| Panic lands +2, Protect from Magic blocks it | footage-repeated | fight logs (zeros under Protect from Magic); wiki Strategies |
| Panic damage 20-26 | spec-single | wiki's 20+; logs too noisy to pin |
| Slash +1, 3 wide, 25-28 typeless | footage-repeated | fight logs (111 bands), damage audit |
| Special order | footage-repeated | fight logs, every quadrant 1 |
| Spin cut +5, 15-27, sever 3 ticks | footage-repeated / footage-once | fight logs, damage audit, duo video 18:53 |
| Untether corner (21, 7) | footage-repeated | fight logs (cache (37, 47) in fights 3 to 5) |
| Untether magic +10/14/18/22, 14-29 | footage-repeated / spec-single | fight logs (all zeros under Protect from Magic), damage audit |
| Slam +29 (34-39), aftershock +30 (18-41), U+31, U+37 | footage-repeated | fight logs, damage audit, Molgoatkirby 5:00 |
| Insolence +2/7/12, +3, 3 wide, 38-46, swings +20 | footage-repeated | fight logs, damage audit, duo video 20:24 |
| Fall the tick after the floor | community-tested + logs | wiki/guides for 75/50/25; fight logs for "whatever he is doing" |

## PStack principles applied

- **model-the-domain:** P3 is a chain of moves, so each move is a stage and a panic is a cut, not a clock with exceptions.
- **foundational-thinking:** the one missing primitive (a fact-driven cut) went into the schedule rather than a parallel clock in the fight.
- **type-system-discipline:** discriminated unions for beats, hits, moves and events, with `never` checks; branded ticks and tiles; readonly data.
- **boundary-discipline:** the fight stays pure; SDK side effects (teleport, prayer sever) happen in the mob from logged events.
- **minimize-reader-load / laziness-protocol:** quadrant 1 only, no speculative later-quadrant code; the cross-quadrant special rule lives in the data's note.
- **test-behavior-not-implementation:** tests drive the region with clicks, prayer toggles and Invincible, and read the fight log.

## Verification

- `npm run typecheck`, `npm test` (only `schedule.test.ts > the stage contract` fails, the known Windows path issue; it passes with that path fixed locally, including the new `| "cut"` message), `npm run build`, and `replay-controls --base 15f6462` (35 files replayed, 139 controls unchanged) all pass. `shell-test-runs-entry` cannot run here: Windows refuses its symlink, and with a junction its shell tests time out, as on `main`.
- `scripts/verify.sh` was not run: `agent-browser` cannot run in this environment. Instead, headless Chrome (puppeteer) against the dev server with `ARCHIVE_P3=on`, real clicks on the prayer tab and tiles: the chain to U+37 in 3D and 2D, the swings with Protect from Melee, the panic at 7 landing 25 at 9, the spin's sever with both chat lines, Insolence's three bands, and the interim panel ("P3 time: 6 ticks (0:03.6)"). No page errors. `drive_p3_drill` is updated to the same numbers and gains a chain page with `p3ChainAsRecorded`.

## Decisions for you

1. **The fall's tick.** It now comes the tick after his HP reaches the floor (the HP read before the tick's hits), not on the landing tick. The logs show the fall whatever he is doing but not the tick the floor came. The threshold stays ⌊max × 0.75⌋; the duo video reads the bar's whole-number percentage (under 76%), which is not ported.
2. **P3 tick 0 is the landing**, so the first swing is at 4, not 7.
3. **The panic replaces the void shot:** magic, 20-26, landing 2 ticks later.
4. **`Schedule.cut`** in the shared schedule.
5. **`fight-log` as a source kind**, cited with `footage-repeated`; a log-specific `Basis` may read better.
6. **Practice markers** for bands and the Untether zone, which the game does not draw.

## Not ported, and follow-ups

- Quadrants 2 and 3 (crossings, the next quadrant opening with the other special, two and three saws): the data's notes carry the rules.
- Untether's floor pools: the logs show their graphics but no hit from them.
- Holding his HP at the quadrant's floor.

## Commits

- `1b9c810` feat(schedule): let a turn cut to a stage on a fact other than HP
- `a7fef47` feat(p3): run quadrant 1 as the recorded chain, specials and fall
- `a9287fc` test(verify): drive the P3 chain and the panic shot in the browser stage
- `1114ff1` docs(verify): map the P3 recorded kills recipe and scenarios
- `5181893` test(p3): keep a placed player on the tile the harness puts them on
