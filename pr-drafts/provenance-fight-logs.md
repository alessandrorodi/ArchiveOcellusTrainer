# feat(provenance): cite RuneLite fight logs and packet analyses

## What this is

This PR adds shared vocabulary only, so the phase PRs (P1 to P4) cite the same evidence the same way. No value changes, and players see no difference.

## What it adds

- **A fight-log registry**: `FIGHT_LOGS` in `OcellusTimings.ts`, exposed as `OCELLUS_P4.fightLogs`. It lists RuneLite fight logs recorded on 2026-10-23, keyed by stable ids `L1` to `L8` in recording order. Each entry gives the fight type, the team size, how far it got and what the log records. No names, times or file names. The logs record the game's animations, spotanims, projectiles, hitsplats and NPC spawns by tick, as one client saw them.

  | Id | Fight | Players | Reached | Records |
  |---|---|---|---|---|
  | L1 | spectated kill | 8 | the kill | boss animations, shouts and floor graphics, his projectiles, each player's hitsplats with their overhead, the boss's hitsplats and HP, player positions through Untether, phase 2 volleys |
  | L2 | spectated kill | 8 | the kill | as L1, plus spotanims on the boss and every player, NPC spawns, and each player's position and overhead on every tick of each spin |
  | L3 | raid | 4 | a wipe in phase 3's first quadrant | recorded by a player in it, with ticks from entering the arena and no phase marks: animations with his facing, floor graphics, projectiles, spotanims, hitsplats with overheads, NPC spawns, chat |
  | L4 | raid | 7 | a wipe in phase 3 after two quadrants fell | as L3 |
  | L5 | raid | 7 | a wipe in phase 4's third cycle | as L3 |
  | L6 | raid | 7 | a wipe in phase 4's fifth cycle | with phase marks: as L2, plus the recording player's own hitsplats with type and prayer, the floor graphics sent to that player (its own lifeforce orbs among them) and where it stepped into the 5x5 |
  | L7 | raid | 7 | a wipe in phase 3 after two quadrants fell | as L6 |
  | L8 | raid | 7 | a wipe in phase 3 after one quadrant fell | as L6 |

- **Two `Source` kinds:**
  - `fight-log`, `{ log, at }`, with the `fightLog(log, at)` helper. `at` counts ticks from S, the tick his Deflect rise (seq 14863) starts a phase 4 cycle, or names the phase and its own marks.
  - `analysis`, `{ url, at }`, with the `analysis(url, at)` helper. It's for written analyses of packet captures, such as MRobertEvers' `ocellus_plan.md` and `RAID_PLAN.md` RSProx notes.
- **A `Basis`:** `log-repeated` in `src/sim/provenance.ts`, for a value seen in more than one fight log.
- **`Scale` values** for the logs' team sizes: `team-7`, `team-8` and `team-7-and-8`. L3's four players use the existing `team-4`.

## Design

- The registry keys are a closed union, `FightLog`, and the registry is a `Record` over it. A cite of an unlisted log, or a registry entry that drifts from the union, fails to compile. Ids are stable, so later logs append as `L9` and up.
- The helpers aren't called yet. Each phase PR calls them, and defining them once here keeps those PRs from adding the same lines in the same place.

## Tests

- `scripts/check-types.test.sh` gains `fight_log_registry_with_an_unlisted_id_fails`: renaming `L8` to `L9` in the registry must not compile.
- The registry sits under `OCELLUS_P4`, so the existing `OcellusTimings.test-d.ts` readonly check covers it.
- Checks, run on Windows:
  - `npm run typecheck`, `npm test` and `npm run build` pass. The one test failure is the known Windows-only `schedule.test.ts > the stage contract`.
  - In `check-types.test.sh` the new case passes. The 26 path-separator cases that already fail on Windows on untouched `main` still fail.

## PStack principles applied

- **model-the-domain**: a log is a registered recording with stable ids, not a free-text date.
- **type-system-discipline**: closed id union with a `Record` registry.
- **laziness-protocol**: vocabulary only, no values moved.
- **minimize-reader-load**: one table describes every log once, and cites stay short.

## What players get

Nothing yet. There's no changelog line, because nothing players see changes.
