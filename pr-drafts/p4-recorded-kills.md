# fix(p4): follow the recorded fights: lead-in damage, orbs taken on the glow tick, rift bursts and the kill reset

## What players get

- Ocellus takes damage as soon as he is back on the platform (P4 tick 4), not only from the first inner void at 8.
- Standing on your lifeforce orb as it glows gives the HP back on that tick. Stepping on later still returns it the tick after, as before.
- A void rift left alive bursts 30 ticks after it rises (was 23) and hits you once for 28 to 41 (was 14 per rift), however many burst together.
- Destroying a rift resets your attack timer, so the next attack can go at once.

## Sources

The new evidence is RuneLite fight logs recorded on 2026-10-23: two spectated 8-player kills and two 7-player raids, with the game's animations, spotanims, hitsplats and NPC spawns by tick. They're cited as a new `fight-log` source (`L1` to `L4` in `OCELLUS_P4.fightLogs`), with a new `log-repeated` basis. Ticks are given from S, the tick of his Deflect rise (seq 14863).

| Value | Was | Now | Evidence |
|---|---|---|---|
| `leadIn.presentBoss` (new; the lead-in state was hardcoded `present-invulnerable`) | invulnerable t4 to t7 | `present-damageable` from t4 | Hitsplats on him at S-1 (L1) and at S-3 and S-1 (L2), i.e. t5 and t7 here. The clips show no splat before t8, but that only shows nobody hit him. **This replaces a footage-based value: a logged hitsplat is direct evidence where a clip shows only absence.** |
| `lifeforceOrb.returnAfterMaturing` (new) | a waiting player got the orb a tick after it glowed (S+17) | on the glow tick (S+16) | 7 returns (4314 plus the heal) at S+16 over 4 cycles of L2 and L4, and the game sends the glowing orb (4310) from S+16 (L4). Walk-on returns keep `returnAfterStep` (1), which the logs fit. |
| `rifts.chargeAfterSpawn` | 23 (owner's estimate) | 30 | All 4 unkilled rifts in L3 and L4 burst 30 ticks after spawning, at S+29 (detonate sequence, 4306 on every player, the hit, the rift gone 2 ticks later). |
| `rifts.burstDamage` | 14 per rift | 28 to 41, one hit per burst | L4: 41 and 40 from one rift, 30 and 28 from two rifts bursting together (one hitsplat each). L3's 3 and 3 hit a player at his last HP, so they give no amount. The old 14 was the next cycle's first explosion at S+10. |
| `rifts.killEmpowers` (new) | not modelled | attack delay reset to 0 on the destroy tick | Void Rift wiki page rev 15380527 (already cited): "It empowers you, resetting your tick cool down." The tick is inferred: the destroy tick, when the chat line shows. |

Corroborating citations only (values unchanged): "End..." 3 ticks before the first Deflect in all four logs (so the t5/t8 anchors match); inner and outer orbs glow at hit + 12 and hit + 6 (4310 first sent at S+16 and S+41); rifts at S-1 from cycle 2; 4306 on each player at the burst.

### Checked, no change

- "End..." 1 tick into phase 4 and the first Deflect 4 ticks in: the logs start phase 4 four ticks after the last quadrant collapses, which is t4 here. "End..." at t5 and the Deflect at t8 already match. Only the lead-in damage differed.
- Orb ready ticks 16 and 41: these already match the game's glow graphic. (Our sim's 42 for the outer orb was wrong.)
- Void bombs that stay into phase 4: the floor holes already model them. The logs don't record the void locs or a clean hit from one in phase 4, so the hole damage stays as it is.
- Standard melee and ranged max-hits on rifts (#58) are kept.

## How it maps onto the trainer

- Data: every value and its provenance is in `OcellusTimings.ts`. `provenance.ts` gains one basis.
- Lead-in: `schedule.ts` reads `leadIn.presentBoss` for the present ticks. `present-invulnerable` is gone from the `BossState` union and from `damageable`.
- Orbs: `matureOrb` takes the player's tile as the tick opens. If the player is on the orb (within `orbPickupRadius`), it goes straight to `claimed` with `returnsAt = at + returnAfterMaturing`, and the existing settlement returns it that tick, after the tick's hits.
- Rifts: `burstRifts` detonates every due rift and requests one hit. `PlayerHit`/`FightEvent` `rift-burst` carries `rifts: Burst` (a non-empty tuple) in place of `rift` and `tile`. `destroyFallenRifts` emits the existing `cut-attack-delay` output by the current delay. `rift-destroyed` logs `attackDelay: { before, after }` like the dodge outcome, which now shares an `AttackDelayChange` type.

## Tests

- Changed to the new behaviour: the U1 lead-in guard, the BossStates contract, the U3 maturity and max-HP returns, U6's burst, timer bar and hit guards, and the Invincible orb return.
- New: U6 "destroying a rift resets the attack delay" (the second bow shot goes at 73 and lands at 76, not 78).
- Re-targeted because the new burst tick (S+29) can no longer share a tick with an orb return or a Deflect reflection:
  - U3's two "return on the tick the rift bursts" guards now use an explosion landing on the maturity tick, and they guard the same settlement order.
  - The Division "spec into the invulnerable lead-in" case is now a spec into Deflect Range (blocked, no drain).
  - The Invincible lethal-order cases use the `explosions` drill for the two-reflection orders (seeds 167 and 3) and keep a lethal `rift-burst` case (seed 1 at 217).
- `perfTelemetry.test.tsx` pins the newest release, so it moves to `2026.10.26` with the changelog.
- Checks on Windows:
  - `npm run typecheck` and `npm run build` pass.
  - `npm test`: 298 of 299 pass. The one failure is the known Windows-only `schedule.test.ts > the stage contract`.
  - `release-notes.test.sh`, `install-beta-sdk.test.sh`, `netlify-build.test.sh` and `shell-test-runs-entry.test.sh` pass.
  - `check-types.test.sh` fails 26 of 31 cases here, the same 26 as untouched `main`. Its expected output uses `/` and Windows prints `\`.
  - `shell-test-runs-entry.mjs` and `replay-controls.mjs` can't create their `node_modules` symlink here (EPERM). I ran a local, uncommitted copy of `replay-controls` that uses a junction, runs vitest through node and uses `/` in suite paths, with `--base upstream/main`. Result: 7 files replayed and 37 unchanged controls, none broken.

## Verification

`scripts/verify.sh` wasn't run: `agent-browser` doesn't run in this environment. Instead:

- A new recipe, `features/p4-recorded-fights.md`, adds `drive_recorded_fights` with its own checker (`recorded-checks.json`). The rift recipe gains `riftKillResetsAttackDelay`, and its burst, timer and sound constants move to 97/96.
- The invincible orb drive now waits on (3, 8) and steps onto (4, 8) after 24. A 3D click on (4, 9) from under the boss attacks him.
- I mirrored those drives with puppeteer-core in headless Chrome (muted) against the dev server: the lead-in shot, the orb at 24, the burst of 36 at 97 with one hit, the reset (76 not 78), and the invincible orb returning 0 at 26. All matched, with no page errors. Then I ran the new drive's checker on those captures, and all four checks passed.
- Not re-measured: the rift burst sound times (97.13 and 97.93 are the earlier 90.13 and 90.93 moved by 7) and the timer bar pixel shares.

## PStack principles applied

- **model-the-domain**: one burst is one hit, so `Burst` names the rifts that burst together. The kill's empower is a data rule (`killEmpowers`) with its wiki citation. The orb rule is "ready under you means returned now".
- **type-system-discipline**: the non-empty `Burst` tuple. Removing the dead `present-invulnerable` state lets the `never` checks keep the boss-state switch exhaustive. `AttackDelayChange` is shared.
- **boundary-discipline**: no SDK change. The reset uses the binding's existing `cut-attack-delay` output.
- **minimize-reader-load / laziness-protocol**: no new choice where the evidence is direct. The rift count and void-bomb damage stay as they are (see follow-ups).
- **test-behavior-not-implementation**: new tests assert fight-log events and boss HP, not internals.

## Follow-ups (for Julian)

- **Rift count**: one raid's log shows 2, 3, 4 and 5 rifts in cycles 2 to 5, and another shows 2 then 3. The trainer always spawns 2 at fixed tiles. More rifts need placements, which the logs give in game coordinates but no rule for.
- **One hit per burst** rests on one log of two rifts bursting together. If you'd rather keep it optional, it could be a choice.
- **The reset tick** (destroy tick versus kill-landing tick) is inferred.
- **Changelog**: the new release is `2026.10.26`. Rename it if it ships on another day or merges into another unreleased entry.
