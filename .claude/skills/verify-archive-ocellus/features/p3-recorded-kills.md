# P3 recorded kills (hidden)

Quadrant 1 of the hidden P3 drill ([p3-drill.md](./p3-drill.md)) runs as the RuneLite fight logs recorded on 2026-10-23 show it. P3 tick 0 is the tick he lands in his corner. His moves are a chain, each timed from the one before: a swing, a second swing 3 ticks later, a shadow slash 3 ticks after that, and his next move 4 ticks after the slash. Two such sets come before each special, and the specials take turns: the spin, Untether, the spin, Insolence, and again. A panic shot takes a swing's place when nobody is in reach, and his next move then comes 6 ticks after it. With nothing in the way he swings at 4 and 7, slashes at 10, spins at 24, starts Untether at 53 and swings again at 90. The shadow slash lands the tick after its animation, typeless, on a band 3 tiles wide toward the player, snapped to one of 8 directions from his middle tile. The spin's saw cuts 5 ticks after it starts; a protection prayer up on the tick before is severed for 3 ticks with two chat lines, so the cut lands, and Protect from Melee turned off for that tick and on for the cut blocks it. He stands still from the spin's start to the cut. Untether puts him in his corner, south-west tile (21, 7), hovering out of melee reach. Magic lands 10, 14, 18 and 22 ticks in, blocked by Protect from Magic. The slam 29 ticks in hits a player who was not under his 3x3 at the end of tick 28, and the aftershock on 30 hits one still under him at the end of 29. On U+31 the quadrant falls if his HP is down to the floor; otherwise he swings again at U+37. Insolence is his shout, then three superior slashes animating 2, 7 and 12 ticks later, each landing 3 ticks after its animation on a 3-wide band toward the player; his swings resume 20 ticks after the shout. A quadrant falls on the tick after his HP reaches the floor, whatever he is doing, except through Untether, where it waits for U+31. An attack already under way still lands, and in the drill the fall ends the run. The bands, and his 3x3 through Untether, are drawn as practice markers; the game draws no telegraph for them.

## Sub-features

- `p3-chain` runs the moves above, to U+37, with no input.
- `p3-panic` turns a swing into a panic shot with the next move 6 ticks later.
- `p3-slash` lands the shadow slash the tick after its animation on its band.
- `p3-spin` severs a prayer left up for the cut, and blocks the cut when flicked.
- `p3-untether` hovers in the corner, lands the magic, and judges the slam and aftershock on the player's tile the tick before.
- `p3-insolence` lands three bands and resumes the swings 20 ticks after the shout.
- `p3-fall` drops the quadrant the tick after the floor, mid-set or mid-spin, and at U+31 through Untether.

## How to get to it (user POV)

- Run the trainer with the flag on: `ARCHIVE_P3=on npm start`, or `scripts/verify.sh serve`, which sets it.
- Open `?phase=p3&invincible=on` and leave the player beside the boss. Watch the moves, the markers and the chat.

## Driving it with agent-browser

Preconditions:

- The baseline preconditions in the index hold, with the dev server started by `scripts/verify.sh serve` so the flag is on.
- `public/osrs-assets` holds animations 14848 and 14859. They come with `npm run assets`, from `OCELLUS_P3.bossPoses`.

- **Chain.** Open `?phase=p3&seed=1&invincible=on` and wait until P3 tick 91. The log's `boss-moved` events up to tick 90 are swing 4, swing 7, shadow-slash 10, swing 14, swing 17, shadow-slash 20, spin 24, last-saw 29, swing 33, swing 36, shadow-slash 39, swing 43, swing 46, shadow-slash 49, untether 53, slam 82 and swing 90.
- **Markers.** On the same page, take a screenshot on tick 10, with the slash's band drawn red, and from tick 54, with his 3x3 drawn purple.
- **Spin.** Open `?phase=p3&seed=1&invincible=on`, click Protect from Melee after tick 1 and leave it on. The log has `prayer-severed` on 28 and a `saw` hit on 29 with prayer `null`, and the chat shows "Ocellus disrupts your concentration, severing your prayer!" and "You've been injured and can't use protection prayers!".
- **Scripted.** `scripts/verify.sh browser` runs the chain page in `drive_p3_drill`, writes `p3-chain.json` and checks `p3ChainAsRecorded`.

## Gotchas

- A panic counts as one of the set's two swings, so after a panic in place of the second swing the slash comes 6 ticks later.
- The spin severs Protect from Magic too. A prayer severed at 28 stays off until the player turns it on again, so pray Protect from Magic again before Untether's magic.
- Untether's slam and aftershock are judged on where the player stood at the end of the tick before, so the click out from under him goes in on U+28 to land on U+29.
- The quadrant's fall reads his HP before the tick's hits land, so a shot that brings him to 3937 ends the run on the next tick.
