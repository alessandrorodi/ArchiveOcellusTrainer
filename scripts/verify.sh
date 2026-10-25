#!/usr/bin/env bash
set -uo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"

OSRS_CACHE_DIR="${OSRS_CACHE_DIR:-$HOME/osrs-sims/cache/openrs2}"
OSRS_CACHE_READER="${OSRS_CACHE_READER:-$HOME/osrs-sims/osrscachereader}"
VERIFY_PORT="${VERIFY_PORT:-8002}"
VERIFY_DIR="${VERIFY_DIR:-$ROOT/.verify/$(date -u +%Y%m%dT%H%M%SZ)}"
STATE_FILE="$ROOT/.verify/current-server"
MANIFEST="$ROOT/public/osrs-assets/manifest.json"
URL="http://127.0.0.1:${VERIFY_PORT}/"
DRILL_QUERY="?seed=1&specialSelection=replay-v2"
BOSS_NPC=16677
SPAWN_TILE='{"x":5,"y":1}'
WALK_CLICK_LEFT_PX=160
WALK_CLICK_UP_PX=50
WALK_TARGET_TILE='{"x":8,"y":3}'
EDGE_CLICK_DOWN_PX=160
EDGE_ORDER_TILE='{"x":8,"y":0}'
EDGE_STOP_TILE='{"x":8,"y":1}'
EDGE_HOLD_TICKS=3
CYCLE_LAST_HIDDEN_TICK=3
BOSS_BAR_AT_ENTRY="1312 / 5250 (25.0%)"
CYCLE_RING_TICK=39
CYCLE_LAST_TICK=70
CYCLE_STAGE_ENTRIES='[[0,"lead-in"],[8,"inner-void"],[30,"after-inner"],[39,"outer-void"],[59,"after-outer"],[68,"inner-void"]]'
CYCLE_OVERHEAD_SWITCHES='[[8,"deflect-melee"],[33,"soul-split"],[38,null],[39,"deflect-range"],[61,"soul-split"],[67,null],[68,"deflect-melee"]]'
CYCLE_SPECIAL_HITS='[[37,"vortex"],[65,"spike-disk"]]'
FOCUS_DRILL="transition-attacks"
FOCUS_LAST_TICK=40
FOCUS_EXPECTED='{"start":27,"beats":["boss-landing-starts","soul-split-heal","special-hit","special-sound","special-tell"]}'
FOCUS_ENTRY_TICKS='[27,29]'
BOSS_POSE_SOUND_SAMPLES='{"rise":39690,"hover":44100}'
LOADOUT_QUERY="?seed=6&setup=ranged"
LOADOUT_RANGED_WORN='{"weapon":20997,"offhand":null,"helmet":27235,"chest":27238,"legs":27241,"gloves":26235,"cape":28951,"necklace":33639,"feet":31097,"ring":28310,"ammo":11212}'
LOADOUT_MELEE_WORN='{"weapon":22325,"offhand":null,"helmet":24419,"chest":24420,"legs":24421,"gloves":22981,"cape":21295,"necklace":29801,"feet":31097,"ring":25485,"ammo":11212}'
LOADOUT_INVENTORY_TAB_X=1164
LOADOUT_INVENTORY_TAB_Y=745
LOADOUT_SLOT_X=1125
LOADOUT_SLOT_Y=508
LOADOUT_SLOT_DX=39
LOADOUT_SLOT_DY=32
LOADOUT_SPECIAL_SLOT=0
LOADOUT_SWITCHES=8
LOADOUT_SPECIAL_ORB_X=1140
LOADOUT_SPECIAL_ORB_Y=157
RISEN_BOSS_CLICK_RIGHT_PX=-10
RISEN_BOSS_CLICK_DOWN_PX=-160
LOADOUT_DIVISION_DRAIN=37
LOADOUT_EQUIPMENT_TAB_X=1197
LOADOUT_EQUIPMENT_TAB_Y=745
LOADOUT_TRAINER_ICONS='{"24419":"27x30","24420":"32x24","24421":"16x31","26235":"30x22","27235":"19x27","27238":"30x23","27241":"13x26","28922":"31x28"}'
DEFENCE_FLOOR_QUERY="?seed=20&setup=ranged"
DEFENCE_FLOOR_STEPS="[250,176,150]"
SUPPLY_QUERY="?seed=1&setup=ranged"
SUPPLY_INVENTORY='[28922,22325,24419,24420,24421,22981,21295,29801,25485,12695,22461,6685,3024,12695,22461,6685,3024,6685,6685,6685,3024,6685,6685,6685,3024,6685,6685,3024]'
SUPPLY_NAMED_SLOT=0
SUPPLY_NAMED_MENU='["Equip Tonalztics of Ralos","Drop Tonalztics of Ralos","Examine Tonalztics of Ralos"]'
SUPPLY_BREW_SLOT=11
SUPPLY_HP_AFTER_BREW=115
SUPPLY_HOVER_NAME_PIXEL="#ff911f"
KEYBIND_INVENTORY_BUTTON_X=1130
KEYBIND_INVENTORY_BUTTON_Y=650
KEYBIND_DEFAULT_KEY=F4
KEYBIND_NEW_KEY=F6
WALKWAY_QUERY="?seed=1&focus=${FOCUS_DRILL}"
WALKWAY_ORDER_TILE='{"x":13,"y":2}'
WALKWAY_STOP_TILE='{"x":11,"y":2}'
WALKWAY_PIXEL="#6b6c40"
WALKWAY_MIN_SHARE=1
WALKWAY_RUN_END_TILE='{"x":11,"y":3}'
WALKWAY_RUN_TILES='[{"x":7,"y":1},{"x":9,"y":1},{"x":11,"y":2}]'
CONTROL_MODIFIER=2
CORRECTION_FIRST_TILE='{"x":8,"y":3}'
CORRECTION_LAST_TILE='{"x":3,"y":2}'
CORRECTION_FIRST_MS=150
CORRECTION_LATE_MS=500
CORRECTION_ATTEMPTS=3
CORRECTION_EXPECTED='{"orders":[{"x":8,"y":3},{"x":3,"y":2}],"tiles":[{"x":3,"y":2},{"x":3,"y":2},{"x":3,"y":2}]}'
CONTROL_WALK_TILES='[{"x":6,"y":1},{"x":7,"y":1},{"x":8,"y":1},{"x":9,"y":1},{"x":10,"y":1},{"x":11,"y":2}]'
BACK_WALL_START_TILE='{"x":10,"y":3}'
BACK_WALL_END_TILE='{"x":7,"y":6}'
BACK_WALL_TOWARD_TILES='[{"x":9,"y":4},{"x":8,"y":5},{"x":7,"y":6}]'
BACK_WALL_BACK_TILES='[{"x":8,"y":5},{"x":9,"y":4},{"x":10,"y":3}]'
BACK_WALL_TOP_DOWN_DRAG_PX=720
CAMERA_SETTLE_MS=1200
CORNER_QUERY="?seed=2&focus=${FOCUS_DRILL}"
CORNER_HOLE_TILE='{"x":3,"y":8}'
CORNER_NUB_TILE='{"x":4,"y":9}'
CORNER_VIEW_TILE='{"x":2,"y":2}'
CORNER_VIEW_DRAG_LEFT_PX=95
PATHING_QUERY="?seed=1&focus=${FOCUS_DRILL}&drillStart=cycle-start"
PATHING_WEST_TILE='{"x":3,"y":5}'
PATHING_EAST_TILE='{"x":7,"y":5}'
PATHING_BACK_TILE='{"x":4,"y":3}'
PATHING_UNDER_TICK=30
PATHING_AROUND_TICK=40
PATHING_LAST_TICK=46
PATHING_EXPECTED='[["after-inner",[{"x":5,"y":5},{"x":7,"y":5}]],["outer-void",[{"x":7,"y":3},{"x":5,"y":3},{"x":4,"y":3}]]]'
PATHING_EDGE_TILE='{"x":5,"y":4}'
PATHING_REROUTE_TICK=38
PATHING_REROUTE_EXPECTED='[[{"x":5,"y":4}],[39],[["outer-void",[{"x":5,"y":3}]]]]'
PATHING_CONTROL_EXPECTED='[[{"x":5,"y":4}],["walk"],[39],[["outer-void",[{"x":5,"y":2},{"x":5,"y":3}]]]]'
PATHING_UNDER_TILE='{"x":5,"y":5}'
PATHING_OUT_TILE='{"x":5,"y":3}'
PATHING_OUT_TICK=40
PATHING_OUT_EXPECTED='[[{"x":5,"y":5},{"x":5,"y":3}],[41],[["lead-in",[{"x":5,"y":3},{"x":5,"y":5}]],["outer-void",[{"x":5,"y":3}]]]]'
HOLES_QUERY="?seed=1&focus=floor-holes"
HOLE_LAYOUT='{"key":"corner-stack","tiles":[{"x":11,"y":1},{"x":11,"y":2},{"x":11,"y":3}]}'
HOLE_PIXELS='[[{"x":11,"y":1},-332,20],[{"x":11,"y":2},-309,-15],[{"x":11,"y":3},-290,-45]]'
HOLE_FREE_PIXELS='[[{"x":10,"y":2},-268,-15],[{"x":10,"y":1},-292,20]]'
HOLE_BOX_HALF_PX=8
HOLE_MIN_DARK_SHARE=30
HOLE_MAX_DARK_SHARE=5
HOLE_FLOOD_SHOT_TICK=45
HOLE_TILE='{"x":11,"y":2}'
HOLE_HITS=3
HOLE_DAMAGE='{"min":9,"max":11}'
PROJECTED_TILE_CLICKS=24
ORB_HOLES_QUERY="?seed=86&floorHoleLayout=v1-turn"
ORB_HOLES_SHOT_TICK=13
ORB_HOLES_EXPECTED='[[12,"inner-void",{"x":2,"y":5}]]'
ORB_HOLES_LAYOUT='{"key":"v1-turn","tiles":[{"x":1,"y":5},{"x":1,"y":6},{"x":2,"y":8},{"x":2,"y":9},{"x":4,"y":9},{"x":8,"y":5}]}'
BOSS_CLICK_RIGHT_PX=150
BOSS_CLICK_UP_PX=150
RING_CLICK_RIGHT_PX=140
RING_CLICK_UP_PX=40
FLOOD_DAMAGE_TICK=44
FLOOD_LAST_TICK=58
FLOOD_RING_SCREENSHOT_TICK=52
NEAR_SQUARE='{"minX":3,"maxX":7,"minY":3,"maxY":7}'
VOID_DRILL="void-floor"
VOID_INNER_SHOT_TICK=12
VOID_FLOOD_SHOT_TICK=45
VOID_FLOOR_HITS='[[44,9],[45,11],[46,10],[47,11],[48,10],[49,9],[50,9],[51,10],[52,9],[53,10],[54,1]]'
VOID_RUN_END='[[54,"death"]]'
VOID_PIXEL="#1e2529"
INVINCIBLE_QUERY="?seed=1&focus=${VOID_DRILL}&invincible=on"
INVINCIBLE_LAST_TICK=56
INVINCIBLE_EXPECTED='{"prevented":[[54,"floor-hit"]],"hp":[[53,1],[54,99]],"chat":"Invincible: the void floor would have killed you on tick 54."}'
INVINCIBLE_ORB_QUERY="?seed=1&invincible=on"
INVINCIBLE_ORB_UNDER_BOSS_CLICK_UP_PX=100
INVINCIBLE_ORB_CLICK_TICK=19
INVINCIBLE_ORB_CLICK_RIGHT_PX=50
INVINCIBLE_ORB_CLICK_UP_PX=75
INVINCIBLE_ORB_LAST_TICK=26
INVINCIBLE_ORB_EXPECTED='{"revived":[15,"floor-hit",38],"returned":[[25,{"requested":0,"applied":0,"beforeHp":99,"afterHp":99}]],"hp":[25,99],"maxHp":99}'
ORB_DRILL="lifeforce-orb"
ORB_SEED=75
ORB_DORMANT_TICK=20
ORB_GLOW_TICK=24
ORB_LAST_TICK=30
ORB_FRAMES=6
ORB_CLICK_RIGHT_PX=-195
ORB_CLICK_UP_PX=78
ORB_BOX='{"minX":-60,"maxX":50,"minY":-75,"maxY":5}'
ORB_SKIP_LAST_TICK=63
ORB_INNER_CLEAR_TICK=30
ORB_INNER_EXPIRY_TICK=35
ORB_LATE_SHOT_TICK=31
ORB_LATE_LAST_TICK=36
ORB_ENTRY_CLICK_TICK=34
ORB_ENTRY_CLICK_RIGHT_PX=106
ORB_ENTRY_CLICK_UP_PX=50
ORB_ENTRY_TILE='{"x":3,"y":3}'
ORB_ENTRY_LAST_TICK=44
ORB_OPPOSITE_EXPECTED='[[43,{"x":7,"y":7}]]'
EXPLOSION_DRILL="explosions"
EXPLOSION_INNER_MARKS="17 19 21 23 25 27"
EXPLOSION_DAMAGE_REDUCTION_PERCENT=60
EXPLOSION_OUTER_MARKS="48 50 52 54 56 58"
EXPLOSION_LAST_TICK=59
EXPLOSION_UNDER_LAST_TICK=29
STEP_CLICK_SIDE_PX=55
STEP_CLICK_DOWN_PX=25
DODGE_CLICK_SIDE_PX=110
UNDER_BOSS_CLICK_UP_PX=120
HOVER_BOSS_BODY_UP_PX=200
DODGE_BOSS_CLICK_TICK=12
DODGE_SOUTH_CLICK_UP_PX=12
DODGE_SETTLE_MS=400
DODGE_SPEEDUP_LAST_TICK=34
DODGE_SPEEDUP_ATTACKS='[13,18,20,22,24,26,28,33]'
MARKER_SHOT_DELAY_MS=450
EXPLOSION_PIXEL="#5e317b"
EXPLOSION_GLOW_BOX='{"minX":-128,"maxX":127,"minY":-16,"maxY":79}'
EXPLOSION_GLOW_MIN_SHARE=1.5
EXPLOSION_GLOW_MAX_SHARE=0.1
EXPLOSION_GLOW_SHOT_FRACTION=0.6
EXPLOSION_MARKED_SHOT_FRACTIONS="0.6 0.8"
EXPLOSION_2D_SIDE_TILE='{"x":6,"y":1}'
EXPLOSION_2D_BOSS_TILE='{"x":5,"y":4}'
EXPLOSION_2D_GLOW_BOX='{"minX":-214,"maxX":213,"minY":-53,"maxY":53}'
EXPLOSION_2D_EXPECTED='{"marks":[[17,{"x":5,"y":1}],[19,{"x":6,"y":1}],[21,{"x":5,"y":1}],[23,{"x":6,"y":1}],[25,{"x":5,"y":1}],[27,{"x":6,"y":1}]],"lateHit":[49,{"x":5,"y":1},{"requested":16,"applied":16,"beforeHp":99,"afterHp":83,"prayer":null}]}'
EXPLOSION_2D_LAST_TICK=50
EXPLOSION_RUN_END_QUERY="?seed=38&bosshp=1&focus=explosions"
EXPLOSION_KILL_CLICK_TICK=14
EXPLOSION_RUN_END_EXPECTED='{"marked":[[17,{"x":5,"y":1}]],"ended":[[18,"kill"]],"resolved":[]}'
EXPLOSION_RUN_END_FRAMES=2
SOUND_SETTINGS_KEY="osrs-sdk:settings"
SOUND_SAMPLES='{"12638":14332,"12537":8820}'
EXPLOSION_SOUNDS='[[14,12638],[17,12537],[19,12537],[21,12537],[23,12537],[25,12537],[27,12537],[45,12638],[48,12537],[50,12537],[52,12537],[54,12537],[56,12537],[58,12537]]'
EXPLOSION_EXPECTED='{"lateHit":{"requested":16,"applied":16,"beforeHp":99,"afterHp":83,"prayer":null},"under":[[18,{"x":5,"y":6},true,"hit",83],[20,{"x":5,"y":6},true,"hit",67],[22,{"x":5,"y":6},true,"hit",51],[24,{"x":5,"y":6},true,"hit",35],[26,{"x":5,"y":6},true,"hit",19],[28,{"x":5,"y":6},true,"hit",3]]}'
SPECIAL_DRILL="transition-attacks"
SPECIAL_QUERY="?seed=1&focus=${SPECIAL_DRILL}&specialSelection=replay-v2"
PROTECT_MAGIC_RIGHT_PX=514
PROTECT_RANGE_RIGHT_PX=551
PROTECT_MELEE_RIGHT_PX=588
PROTECT_DOWN_PX=218
SPECIAL_PRAY_TICK=33
SPECIAL_RANGE_PRAY_TICK=61
SPECIAL_HIT_TICK=37
SPECIAL_BEFORE_SHOT_TICK=31
SPECIAL_VORTEX_SHOT_TICK=35
SPECIAL_SPIKE_SHOT_TICK=63
SPECIAL_SEMICIRCLE_SHOT_TICK=93
SPECIAL_BLACK_SHOT_TICK=95
TELL_BOX='{"minX":-200,"maxX":200,"minY":-220,"maxY":-40}'
TELL_CENTRE_BOX='{"minX":-50,"maxX":0,"minY":-110,"maxY":-75}'
TRANSITION_SOUND_SAMPLES='{"12584":19845,"12587":33075,"12586":22050,"12585":22050,"12572":66150,"12567":33075,"12555":33075,"12556":44100,"12554":35280}'
LANDING_SOUNDS='[[29.1,12584],[29.83,12587],[31.03,12586],[31.47,12585],[89.1,12584],[89.83,12587],[91.03,12586],[91.47,12585]]'
LANDING_WINDOWS='[[29,32],[89,92]]'
STYLE_SOUNDS='[[34.2,12554],[64.4,12555],[65.1,12556],[92.1,12572],[97.1,12567]]'
STYLE_WINDOWS='[[32,37.5],[60,65.5],[92,97.5]]'
SOUND_TOLERANCE_TICKS=0.2
SPECIAL_EXPECTED='{"protected":[37,"magic",{"requested":8,"applied":8,"beforeHp":99,"afterHp":91,"prayer":"magic"}],"late":[37,"magic",{"requested":49,"applied":49,"beforeHp":99,"afterHp":50,"prayer":null}],"told":[[32,"vortex","magic"],[60,"spike-disk","ranged"],[92,"black-disk","melee"]]}'
ORB_EXPECTED='{"told":[[11,"inner-void"]],"drained":[[12,49,50]],"spawned":[[12,{"x":9,"y":4},49]],"matured":[[24,{"x":9,"y":4}]],"returned":{"requested":49,"applied":49,"beforeHp":50,"afterHp":99},"skipExpired":[[35,"inner-void"],[61,"outer-void"]],"skipHeal":[[62,{"kind":"unclaimed-orb"},{"requested":25,"applied":25,"beforeHp":1312,"afterHp":1337}]]}'
RIFT_QUERY="?seed=1&focus=rifts&drillStart=cycle-start"
OVERHEAD_SHOT_TICKS="5 31 35 45"
OVERHEAD_GAP_DRAWS='{"37":["440-11"],"38":[],"39":["440-16"],"66":["440-11"],"67":[],"68":["440-15"]}'
ICON_BOX='{"minX":-40,"maxX":40,"minY":-290,"maxY":-190}'
RIFT_CLICK_TICK=68
NORTH_EAST_RIFT_CLICK_LEFT_PX=270
NORTH_EAST_RIFT_CLICK_UP_PX=52
RIFT_BURST_TICK=90
RIFT_CHARGED_SHOT_TICK=89
RIFT_TIMER_BOX='{"minX":156,"maxX":185,"minY":-85,"maxY":-81}'
RIFT_TIMER_MAX_EARLY_SHARE=10
RIFT_TIMER_MIN_FULL_SHARE=85
RIFT_ONE_HIT='[[72,"rift-67-1","ranged",44]]'
RIFT_RALOS_HITS='[[72,"rift-67-1","ranged",18],[72,"rift-67-1","ranged",18]]'
RIFT_RALOS_LAST_TICK=74
RIFT_MELEE_HITS='[[71,"rift-67-1","melee",35],[76,"rift-67-1","melee",9]]'
RIFT_MELEE_SPLAT_TICK=71
RIFT_MELEE_LAST_TICK=77
CHAT_POLL_WAIT_MS=600
MENU_CONTROLS='["setup","focus","seed","keybinds","sound","area_sound","invincible","perf_data","whats_new"]'
MENU_QUERY="?seed=1"
MENU_SMALL_VIEWPORT="800 600"
MENU_MOBILE_DEVICE="iPhone 14"
WHATS_NEW_PHONE_VIEWPORT="390 844"
DEATH_RESULT_QUERY="?seed=1&focus=void-floor"
DEATH_RESULT_LINES='["You died","on P4 tick 54"]'
KILL_RESULT_QUERY="?seed=4&bosshp=1"
KILL_RESULT_BOSS_HP=1
KILL_RESULT_CLICK_TICK=12
KILL_RESULT_LINES='["Ocellus defeated","P4 time: 16 ticks (0:09.6)"]'
RESULT_BUTTONS='["Restart","Retry seed"]'
TELEMETRY_FIELDS='["version","view","gpu","browser","stage","end","sampleRate","frames","frameMedianMs","frameP95Ms","frameP99Ms","framesOver50Ms","runTicks","tickMedianMs","tickP95Ms","tickMaxMs","lateTicks","devicePixelRatio","canvasWidth","canvasHeight","cores"]'
TELEMETRY_BEACON_WAIT_MS=1800
LOAD_RETRY_QUERY="?seed=1"
GET_READY_QUERY="?seed=1"
GET_READY_TICKS=6
GET_READY_CLICK_TICK=1
DEFLECT_QUERY="?seed=1&focus=rifts&setup=melee&drillStart=cycle-start"
DEFLECT_CLICK_TICK=12
DEFLECT_HOVER_SHOT_TICK=20
DEFLECT_HOVER_TILE='{"x":5,"y":3}'
DEFLECT_HOVER_TICKS='[14,29]'
DEFLECT_FIRST_MELEE_TICK=31
DEFLECT_BLOCKED_SHOT_TICK=31
DEFLECT_LAST_TICK=46
REFLECT_QUERY="?seed=4&focus=rifts&drillStart=cycle-start"
REFLECT_CLICK_TICK=38
REFLECT_BOSS_CLICK_UP_PX=100
REFLECT_NONE_SHOT_TICK=42
REFLECT_HIT_SHOT_TICK=47
REFLECT_LAST_TICK=53
REFLECT_EXPECTED='{"judged":[[42,"ranged","blocked",8],[47,"ranged","blocked",44],[52,"ranged","blocked",62]],"reflected":[[47,"ranged",4],[52,"ranged",6]],"hpAfter":89}'
REFLECT_SPLAT_BOX='{"minX":-14,"maxX":14,"minY":-52,"maxY":-24}'
REFLECT_MIN_SPLAT_SHARE=5
REFLECT_MAX_CLEAR_SHARE=1
SOUL_SPLIT_HEAL_TICK=39
RIFT_EXPECTED='{"spawned":[[67,"rift-67-0",{"x":2,"y":2}],[67,"rift-67-1",{"x":10,"y":2}]],"destroyed":"rift-67-1","bursts":[[90,"rift-67-0",{"requested":14,"applied":14,"beforeHp":99,"afterHp":85,"prayer":null}]]}'
SOUL_SPLIT_EXPECTED='[[39,{"kind":"soul-split","ordinal":0},{"requested":49,"applied":49,"beforeHp":1312,"afterHp":1361}],[67,{"kind":"soul-split","ordinal":1},{"requested":47,"applied":47,"beforeHp":1361,"afterHp":1408}]]'
KILL_CHAT="Destroying the void rift empowers you!"
RIFT_SOUND_SAMPLES='{"12640":11025,"12641":14332,"12642":26460,"12643":7717}'
RIFT_SPAWN_SOUNDS='[[67.2,12643],[67.2,12643]]'
RIFT_KILL_SOUND='[0.27,12640]'
RIFT_BURST_SOUNDS='[[90.13,12641],[90.93,12642]]'
RIFT_SOUND_WINDOW='[66,92]'
CUE_QUERY="?seed=${ORB_SEED}&focus=${ORB_DRILL}&drillStart=cycle-start&outerOrbTile=safe-floor"
CUE_TOGGLE_TICK=6
CUE_CHAT_BEFORE_TICK=10
CUE_CHAT_TICK=11
CUE_LAST_TICK=50
CUE_SOUND_SAMPLES='{"12490":7717,"12497":66150,"12621":12127,"12622":12127,"12623":12127,"12624":9922}'
CUE_SOUNDS='[[5,12490],[12.4,12624],[15.87,12621],[19.8,12622],[22.8,12623],[39,12497],[43.1,12624],[44.7,12621],[46.8,12622],[48.3,12623]]'
CUE_SOUND_WINDOW='[4,50]'
CUE_CHAT="Ocellus manipulates your lifeforce!"
AUTOPLAY_POLICY_JS='(() => { const Native = window.AudioContext; if (!Native) return; const made = []; window.__audioContexts = made; window.AudioContext = class extends Native { constructor(...args) { super(...args); made.push(this); void this.suspend(); } }; })();'
PRODUCTION_PORT="${VERIFY_PRODUCTION_PORT:-8003}"
PRODUCTION_QUERY="?seed=1&invincible=on"
PRODUCTION_P3_QUERY="?phase=p3&seed=1"
PRODUCTION_WATCH_SECONDS=20
PRODUCTION_ORBS='["99","99","100","100"]'
PRODUCTION_ORBS_JS='(() => { const orbs = { framesSinceFirst: 0, blankSinceFirst: 0, first: null, last: null }; window.__orbs = orbs; let frame = []; const fillText = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (text, ...rest) { if (this.textAlign === "center" && this.font.endsWith("px Stats_11") && this.fillStyle !== "#000000" && /^\d+$/.test(String(text))) frame.push(String(text)); return fillText.call(this, text, ...rest); }; const close = () => { if (frame.length > 0) { orbs.first ??= frame; orbs.last = frame; } if (orbs.first) { orbs.framesSinceFirst++; if (frame.length === 0) orbs.blankSinceFirst++; } frame = []; requestAnimationFrame(close); }; requestAnimationFrame(close); })();'
P3_QUERY="?phase=p3&seed=1"
P3_CLEAR_QUERY="?phase=p3&seed=100&bosshp=3991"
P3_ARENA_SHOT_TICK=3
P3_ARENA_TILES='{"open":[{"x":25,"y":11},{"x":26,"y":11}],"closed":[{"x":16,"y":13},{"x":17,"y":13}],"rim":[{"x":28,"y":10}]}'
P3_PRAY_TICK=1
P3_SWINGS_LAST_TICK=21
P3_SWINGS='[[7,"swing",5,5,"melee"],[10,"swing",2,2,"melee"],[17,"swing",1,1,"melee"],[20,"swing",2,2,"melee"]]'
P3_FAR_EAST_TILE='{"x":27,"y":9}'
P3_ESCAPE_TICK=6
P3_VOID_SHOT_LAST_TICK=11
P3_VOID_SHOT='[[7,"swing",5,5,"melee"],[10,"void-shot",20,20,"melee"]]'
P3_BOSS_TILE='{"x":20,"y":7}'
P3_BOSS_CLICK_TICK=2
P3_CLEAR='{"panel":{"lines":["Quadrant 1 cleared (interim end)","P3 time: 5 ticks (0:03.0)"],"buttons":["Repeat P3","Retry seed","Start P4"]},"tick":5,"bossHp":3937}'
P3_START_P4='{"search":"?phase=p4&setup=ranged","bossHp":1312}'
P3_SMITE_QUERY="?phase=p3&seed=1&invincible=on"
P3_SMITE_PAGES=(
  "flick 1 32 20 27 30"
  "held 1 32 20"
  "late 1 32 20 27 31"
  "two-spins 2 35 20 27 30 31 33"
  "three-spins 3 38 20 27 30 31 33 34 36"
)
P3_SMITE_SPINS='{"flick":[[31,1,1,"blocked",0,0,"melee"]],"held":[[31,1,1,"struck held",43,43,"melee"]],"late":[[31,1,1,"struck late",43,43,null]],"two-spins":[[31,1,2,"blocked",0,0,"melee"],[34,2,2,"blocked",0,0,"melee"]],"three-spins":[[31,1,3,"blocked",0,0,"melee"],[34,2,3,"blocked",0,0,"melee"],[37,3,3,"blocked",0,0,"melee"]]}'
P3_SMITE_CHAT='{"held":"Spin 1 of 1 hit you for 43. Protect from Melee stayed on. Turn it off after the blades start, then back on for the spin.","late":"Spin 1 of 1 hit you for 43. Protect from Melee was not back on in time for the spin."}'
P3_BLADES_CONTROL_TICK=25
P3_BLADES_TICK=30
P3_BLADES_BOX='{"left":260,"right":120,"up":20,"down":280}'
P3_BLADES_MIN_SHARE='{"3d":0.5,"2d":0.4}'
P3_BLADES_MAX_CONTROL_SHARE='{"3d":0.3,"2d":0}'
CREDIT_LINE="Created using intellectual property belonging to Jagex Limited under the terms of Jagex's Fan Content Policy. This content is not endorsed by or affiliated with Jagex."

log() { echo "verify: $*"; }

json() {
  node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let v=JSON.parse(s);for(const k of process.argv[1].split(".").filter(Boolean))v=v?.[k];process.stdout.write(typeof v==="string"?v:JSON.stringify(v))})' "$1"
}

ensure_deps() {
  scripts/install-beta-sdk.sh --check && return 0
  log "installing dependencies and the beta SDK"
  npm ci --no-audit --no-fund && scripts/install-beta-sdk.sh
}

manifest_ready() {
  [[ -f "$MANIFEST" ]] && node --input-type=module -e '
    import { loadConfig } from "osrs-sdk-assets";
    import { existsSync, readFileSync } from "node:fs";
    import { dirname, join } from "node:path";
    const { assets } = await loadConfig();
    const m = JSON.parse(readFileSync(process.argv[1], "utf8"));
    const npcs = Object.values(assets.npcs).every(({ id }) => m.assets?.[`npc-${id}`]);
    const items = Object.values(assets.items).every(({ id }) => m.playerItems?.[`item:${id}`]);
    const spotAnims = Object.values(assets.spotAnims).every(({ id }) => m.spotAnims?.[id]);
    const models = Object.values(assets.models).every(({ id }) => m.assets?.[`model-${id}`]);
    const pack = m.soundEffects && join(dirname(process.argv[1]), m.soundEffects.file);
    const bytes = pack && existsSync(pack) ? readFileSync(pack) : Buffer.alloc(6);
    const packed = new Set();
    for (let at = 6, n = 0; n < bytes.readUInt16BE(4); n++, at += 4 + bytes.readUInt16BE(at + 2)) packed.add(bytes.readUInt16BE(at));
    const sounds = Object.values(assets.sounds).every(({ id }) => packed.has(id));
    process.exit(m.cache?.source === "openrs2:2746" && npcs && items && spotAnims && models && sounds ? 0 : 1);
  ' "$MANIFEST" && node scripts/extract-sprites.mjs --check
}

stage_build() {
  npm run build >"$VERIFY_DIR/build.log" 2>&1
}

stage_types() {
  npm run typecheck >"$VERIFY_DIR/types.log" 2>&1
}

stage_test() {
  npm test -- --reporter=default --reporter=json --outputFile.json="$VERIFY_DIR/vitest.json" >"$VERIFY_DIR/test.log" 2>&1 || return 1
  local total
  total="$(json numPassedTests <"$VERIFY_DIR/vitest.json")"
  log "vitest passed ${total} tests"
  [[ "$total" -gt 0 ]]
}

stage_assets() {
  local flags=(--cache-dir "$OSRS_CACHE_DIR" --reader-path "$OSRS_CACHE_READER")
  if manifest_ready; then
    log "assets: manifest already has every configured npc, model, item, spotanim and sound from openrs2:2746, and every sprite, skipping the model rebuild" | tee "$VERIFY_DIR/assets.log"
    npm run item-icons -- "${flags[@]}" >>"$VERIFY_DIR/assets.log" 2>&1
    return
  fi
  npm run assets -- "${flags[@]}" >"$VERIFY_DIR/assets.log" 2>&1 && manifest_ready
}

port_listener() {
  lsof -nP -iTCP:"$VERIFY_PORT" -sTCP:LISTEN -t 2>/dev/null
}

process_start() {
  ps -p "$1" -o lstart= 2>/dev/null
}

serve() {
  case "$VERIFY_PORT" in 8000 | 8001)
    log "port ${VERIFY_PORT} belongs to another trainer; refusing to use it"
    return 1
    ;;
  esac
  if [[ -f "$STATE_FILE" ]]; then
    log "an instance is already recorded in ${STATE_FILE}; run scripts/verify.sh stop first"
    return 1
  fi
  if [[ -n "$(port_listener)" ]]; then
    log "port ${VERIFY_PORT} is already in use by PID $(port_listener); not starting a second instance"
    return 1
  fi
  manifest_ready || { log "assets missing: run scripts/verify.sh assets"; return 1; }

  ARCHIVE_P3=on node node_modules/.bin/webpack serve --mode development --host 127.0.0.1 --port "$VERIFY_PORT" \
    >"$VERIFY_DIR/server.log" 2>&1 &
  local pid=$!
  LAUNCHED_PID=$pid
  printf 'pid=%s\nstarted=%s\nport=%s\nevidence=%s\nrevision=%s\n' \
    "$pid" "$(process_start "$pid")" "$VERIFY_PORT" "$VERIFY_DIR" "$(git rev-parse HEAD)" >"$STATE_FILE"
  cp "$STATE_FILE" "$VERIFY_DIR/server.pid"
  log "started dev server PID ${pid} on ${URL}"

  for _ in $(seq 1 120); do
    if curl -sf -o /dev/null "$URL" && grep -q "compiled successfully" "$VERIFY_DIR/server.log"; then
      return 0
    fi
    kill -0 "$pid" 2>/dev/null || { log "dev server exited; see ${VERIFY_DIR}/server.log"; return 1; }
    sleep 1
  done
  log "dev server did not become ready within 120s"
  return 1
}

state() {
  sed -n "s/^$1=//p" "$STATE_FILE"
}

doctor() {
  [[ -f "$STATE_FILE" ]] || { log "doctor: no recorded instance"; return 1; }
  local pid page manifest problems=0
  pid="$(state pid)"
  if [[ "$(process_start "$pid")" != "$(state started)" ]]; then
    log "doctor: recorded PID ${pid} is not running (or the PID was reused)"
    problems=1
  fi
  if [[ "$(port_listener)" != "$pid" ]]; then
    log "doctor: port $(state port) is held by '$(port_listener)', not the recorded PID ${pid}"
    problems=1
  fi
  if ! page="$(curl -sf "http://127.0.0.1:$(state port)/")"; then
    log "doctor: page request failed"
    problems=1
  elif ! grep -q "<title>Archive Ocellus Trainer</title>" <<<"$page"; then
    log "doctor: page title is not Archive Ocellus Trainer"
    problems=1
  fi
  if ! manifest="$(curl -sf "http://127.0.0.1:$(state port)/osrs-assets/manifest.json")"; then
    log "doctor: manifest request failed"
    problems=1
  elif ! grep -q "\"npc-${BOSS_NPC}\"" <<<"$manifest"; then
    log "doctor: served manifest has no npc-${BOSS_NPC}"
    problems=1
  fi
  if [[ "$(state revision)" != "$(git rev-parse HEAD)" ]] || [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
    log "doctor: served tree differs from HEAD $(git rev-parse --short HEAD) (started at $(state revision), or tracked files are modified)"
  fi
  [[ $problems -eq 0 ]] && log "doctor: instance PID ${pid} on port $(state port) is healthy"
  return $problems
}

stop() {
  [[ -f "$STATE_FILE" ]] || { log "stop: no recorded instance"; return 0; }
  local pid evidence port
  pid="$(state pid)"
  evidence="$(state evidence)"
  port="$(state port)"
  if [[ "$(process_start "$pid")" == "$(state started)" ]]; then
    kill "$pid"
    for _ in $(seq 1 20); do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.5
    done
  fi
  if kill -0 "$pid" 2>/dev/null && [[ "$(process_start "$pid")" == "$(state started)" ]]; then
    log "stop: PID ${pid} is still running"
    return 1
  fi
  rm "$STATE_FILE"
  log "stop: PID ${pid} is gone; evidence kept in ${evidence}" | tee -a "$evidence/cleanup.log"
  [[ -z "$(VERIFY_PORT=$port port_listener)" ]] || { log "stop: port ${port} is still held by $(VERIFY_PORT=$port port_listener)"; return 1; }
}

ab() {
  agent-browser --session "$BROWSER_SESSION" "$@"
}

probe() {
  ab --json eval "window.__archiveOcellusProbe.$1" | json data.result
}

fight_tick_at_least() {
  ab wait --fn "(window.__archiveOcellusProbe?.snapshot().fight?.run.tick ?? -1) >= $1" --timeout "$2" >/dev/null
}

canvas_centre() {
  local box
  box="$(ab --json get box "#world")" || return 1
  CX=$(( $(json data.x <<<"$box") + $(json data.width <<<"$box") / 2 ))
  CY=$(( $(json data.y <<<"$box") + $(json data.height <<<"$box") / 2 ))
}

click_after_tick() {
  printf '[["wait","--fn","(window.__archiveOcellusProbe?.snapshot().fight?.run.tick ?? -1) >= %d","--timeout","90000"],["mouse","move","%d","%d"],["mouse","down","left"],["mouse","up","left"]]' \
    "$1" $((CX + $2)) $((CY + $3)) | ab batch --bail >/dev/null
}

shot_after_tick() {
  printf '[["wait","--fn","(window.__archiveOcellusProbe?.snapshot().fight?.run.tick ?? -1) >= %d","--timeout","30000"],["wait","%d"],["screenshot","%s"]]' \
    "$1" "$2" "$VERIFY_DIR/$3" | ab batch --bail >/dev/null
}

shot_in_fight_tick() {
  printf '[["wait","--fn","((t) => t > %d || (t === %d && (performance.now() - (window.__tickStarts[%d] ?? Infinity)) / 600 >= %s))(window.__archiveOcellusProbe?.snapshot().fight?.run.tick ?? -1)","--timeout","30000"],["screenshot","%s"]]' \
    "$1" "$1" "$1" "$2" "$VERIFY_DIR/$3" | ab batch --bail >/dev/null
}

shot_in_world_tick() {
  printf '[["wait","--fn","((t) => t > %d || (t === %d && (performance.now() - (window.__worldTickStarts[%d] ?? Infinity)) / 600 >= %s))(window.__archiveOcellusProbe.snapshot().tick)","--timeout","30000"],["screenshot","%s"]]' \
    "$1" "$1" "$1" "$2" "$VERIFY_DIR/$3" | ab batch --bail >/dev/null
}

record_tick_starts() {
  ab eval '(() => {
    const starts = window.__tickStarts = {}, worldStarts = window.__worldTickStarts = {};
    const watch = () => {
      const snapshot = window.__archiveOcellusProbe?.snapshot(), run = snapshot?.fight?.run;
      if (run?.kind === "running" && starts[run.tick] === undefined) starts[run.tick] = performance.now();
      if (snapshot && worldStarts[snapshot.tick] === undefined) worldStarts[snapshot.tick] = performance.now();
      requestAnimationFrame(watch);
    };
    watch();
  })()' >/dev/null
}

save_settings() {
  ab eval "(() => { const key = '${SOUND_SETTINGS_KEY}', saved = JSON.parse(localStorage.getItem(key) ?? '{\"version\":1,\"values\":{}}'); saved.values = { ...saved.values, ...$1 }; localStorage.setItem(key, JSON.stringify(saved)); })()" >/dev/null
}

save_sound_settings() {
  save_settings "{ playsAudio: $1, playsAreaAudio: $1 }"
}

record_audio_starts() {
  ab eval '(() => {
    const starts = [], seen = {}, start = AudioBufferSourceNode.prototype.start;
    const tick = () => {
      const run = window.__archiveOcellusProbe?.snapshot().fight?.run;
      const t = run?.kind === "running" ? run.tick : run?.kind === "ended" ? run.at : null;
      if (t !== null && seen[t] === undefined) seen[t] = Math.min(performance.now(), (seen[t - 1] ?? Infinity) + 600);
      return t;
    };
    const watch = () => { tick(); requestAnimationFrame(watch); };
    watch();
    window.__cueAudio = starts;
    AudioBufferSourceNode.prototype.start = function (...args) {
      const t = tick();
      starts.push({ tick: t, phase: t === null ? null : Math.round((performance.now() - seen[t]) / 6) / 100, samples: this.buffer?.length ?? null, rate: this.buffer?.sampleRate ?? null, state: this.context.state });
      return start.apply(this, args);
    };
  })()' >/dev/null
}

record_overhead_draws() {
  ab eval '(() => {
    const draws = {};
    window.__overheadDraws = draws;
    const tick = () => {
      const run = window.__archiveOcellusProbe?.snapshot().fight?.run;
      return run?.kind === "running" ? run.tick : null;
    };
    const at = (t) => (draws[t] ??= { frames: 0, sprites: [] });
    for (const context of [CanvasRenderingContext2D, OffscreenCanvasRenderingContext2D]) {
      const drawImage = context.prototype.drawImage;
      context.prototype.drawImage = function (image, ...rest) {
        const sprite = /\/sprites\/(\d+-\d+)\.png$/.exec(image?.src ?? "")?.[1];
        const t = sprite === undefined ? null : tick();
        if (t !== null && !at(t).sprites.includes(sprite)) at(t).sprites.push(sprite);
        return drawImage.call(this, image, ...rest);
      };
    }
    const frame = () => {
      const t = tick();
      if (t !== null) at(t).frames++;
      requestAnimationFrame(frame);
    };
    frame();
  })()' >/dev/null
}

step_on_marks() {
  local side="$1" mark
  shift
  for mark in "$@"; do
    click_after_tick $((mark - 1)) "$side" "$STEP_CLICK_DOWN_PX" || return 1
    side=$((-side))
  done
}

# The camera trails the player by about a tick, so side steps two ticks apart drift; a click past the north edge always stops on row 1.
step_south_and_back_on_marks() {
  local north=0 mark
  for mark in "$@"; do
    click_after_tick $((mark - 1)) 0 $((north * EDGE_CLICK_DOWN_PX)) || return 1
    north=$((1 - north))
  done
}

drive_walk() {
  local before after box cx cy credit
  before="$(probe "snapshot()")"
  echo "$before" >"$VERIFY_DIR/before.json"
  ab screenshot "$VERIFY_DIR/before.png" >/dev/null || { log "before screenshot failed"; return 1; }

  credit="$(ab --json get text "#credit_line" | json data.text)"
  [[ "$credit" == "$CREDIT_LINE" ]] || { log "credit line text differs: ${credit}"; return 1; }
  [[ "$(ab --json is visible "#credit_line" | json data.visible)" == "true" ]] || { log "credit line is not visible"; return 1; }

  box="$(ab --json get box "#world")"
  cx=$(( $(json data.x <<<"$box") + $(json data.width <<<"$box") / 2 - WALK_CLICK_LEFT_PX ))
  cy=$(( $(json data.y <<<"$box") + $(json data.height <<<"$box") / 2 - WALK_CLICK_UP_PX ))
  echo "{\"x\":${cx},\"y\":${cy}}" >"$VERIFY_DIR/click.json"
  ab mouse move "$cx" "$cy" >/dev/null && ab mouse down left >/dev/null && ab mouse up left >/dev/null || return 1

  ab wait --fn "(() => { const s = window.__archiveOcellusProbe.snapshot(), spawn = ${SPAWN_TILE}; return (s.player.x !== spawn.x || s.player.y !== spawn.y) && s.player.x === s.destination.x && s.player.y === s.destination.y; })()" \
    --timeout 15000 >/dev/null || log "player did not settle on a new tile after the click"
  after="$(probe "snapshot()")"
  echo "$after" >"$VERIFY_DIR/after.json"
  ab wait 1200 >/dev/null
  ab screenshot "$VERIFY_DIR/after.png" >/dev/null || { log "after screenshot failed"; return 1; }
}

click_past_the_edge() {
  canvas_centre || return 1
  click_at "$CX" $((CY + EDGE_CLICK_DOWN_PX)) || return 1
  ab wait --fn "(() => { const s = window.__archiveOcellusProbe.snapshot(), stop = ${EDGE_STOP_TILE}; return s.player.x === stop.x && s.player.y === stop.y; })()" \
    --timeout 15000 >/dev/null || log "player never stopped on the edge tile"
}

drive_edge() {
  local arrived
  click_past_the_edge || return 1
  echo "{\"x\":${CX},\"y\":$((CY + EDGE_CLICK_DOWN_PX))}" >"$VERIFY_DIR/edge-click.json"
  arrived="$(probe "snapshot()")"
  echo "$arrived" >"$VERIFY_DIR/edge-arrived.json"
  ab wait --fn "window.__archiveOcellusProbe.snapshot().tick >= $(json tick <<<"$arrived") + ${EDGE_HOLD_TICKS}" --timeout 15000 >/dev/null
  probe "snapshot()" >"$VERIFY_DIR/edge.json"
  ab screenshot "$VERIFY_DIR/edge.png" >/dev/null || { log "edge screenshot failed"; return 1; }
}

record_boss_bar() {
  ab eval '(() => {
    const bar = {};
    window.__bossBar = bar;
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...rest) {
      const t = /^\d+ \/ \d+ \(\d+\.\d%\)$/.test(String(text)) ? window.__archiveOcellusProbe?.snapshot().fight?.run.tick : undefined;
      if (t !== undefined && !(bar[t] ??= []).includes(String(text))) bar[t].push(String(text));
      return fillText.call(this, text, ...rest);
    };
  })()' >/dev/null
}

drive_lead_in() {
  record_boss_bar || { log "the boss bar probe was not installed"; return 1; }
  fight_tick_at_least 0 90000 || { log "the boss never took its first P4 step"; return 1; }
  ab screenshot "$VERIFY_DIR/hidden.png" >/dev/null || { log "lead-in screenshot failed"; return 1; }
  probe "snapshot()" >"$VERIFY_DIR/hidden.json"
}

drive_flood_shot() {
  local box cx cy
  fight_tick_at_least "$FLOOD_DAMAGE_TICK" 90000 || { log "the flood never reached P4 tick ${FLOOD_DAMAGE_TICK}"; return 1; }
  box="$(ab --json get box "#world")"
  cx=$(( $(json data.x <<<"$box") + $(json data.width <<<"$box") / 2 ))
  cy=$(( $(json data.y <<<"$box") + $(json data.height <<<"$box") / 2 ))
  echo "{\"x\":$((cx + BOSS_CLICK_RIGHT_PX)),\"y\":$((cy - BOSS_CLICK_UP_PX))}" >"$VERIFY_DIR/attack-click.json"
  click_at $((cx + BOSS_CLICK_RIGHT_PX)) $((cy - BOSS_CLICK_UP_PX)) || return 1
  ab wait --fn "window.__archiveOcellusProbe.log().rows.some((row) => row.tick >= ${FLOOD_DAMAGE_TICK} && row.combatDraws > 0)" \
    --timeout 15000 >/dev/null || log "the bow never fired across the flood"
  echo "{\"x\":$((cx + RING_CLICK_RIGHT_PX)),\"y\":$((cy - RING_CLICK_UP_PX))}" >"$VERIFY_DIR/ring-click.json"
  click_at $((cx + RING_CLICK_RIGHT_PX)) $((cy - RING_CLICK_UP_PX)) || return 1
  fight_tick_at_least "$FLOOD_RING_SCREENSHOT_TICK" 30000 || { log "the boss never stepped to P4 tick ${FLOOD_RING_SCREENSHOT_TICK}"; return 1; }
  ab screenshot "$VERIFY_DIR/flood-ring.png" >/dev/null || { log "flood screenshot failed"; return 1; }
}

drive_cycle() {
  local cx cy
  fight_tick_at_least 12 30000 || { log "the boss never stepped to P4 tick 12"; return 1; }
  ab screenshot "$VERIFY_DIR/boss.png" >/dev/null || { log "boss screenshot failed"; return 1; }
  ab --json eval "window.__bossBar" | json data.result >"$VERIFY_DIR/boss-bar.json" || { log "boss bar capture failed"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  step_south_and_back_on_marks $EXPLOSION_INNER_MARKS || { log "the steps on the inner explosion marks were not clicked"; return 1; }
  click_after_tick "$SPECIAL_PRAY_TICK" "$PROTECT_MAGIC_RIGHT_PX" "$PROTECT_DOWN_PX" || { log "Protect from Magic was not clicked before the vortex"; return 1; }
  fight_tick_at_least "$CYCLE_RING_TICK" 60000 || { log "the boss never stepped to P4 tick ${CYCLE_RING_TICK}"; return 1; }
  cx=$((CX + RING_CLICK_RIGHT_PX))
  cy=$((CY - RING_CLICK_UP_PX))
  echo "{\"x\":${cx},\"y\":${cy}}" >"$VERIFY_DIR/cycle-ring-click.json"
  click_at "$cx" "$cy" || return 1
  step_on_marks "$STEP_CLICK_SIDE_PX" $EXPLOSION_OUTER_MARKS || { log "the steps on the outer explosion marks were not clicked"; return 1; }
  click_after_tick "$SPECIAL_RANGE_PRAY_TICK" "$PROTECT_RANGE_RIGHT_PX" "$PROTECT_DOWN_PX" || { log "Protect from Range was not clicked before the spike disk"; return 1; }
  fight_tick_at_least "$CYCLE_LAST_TICK" 90000 || { log "the boss never stepped to P4 tick ${CYCLE_LAST_TICK}"; return 1; }
  probe "snapshot()" >"$VERIFY_DIR/cycle-snapshot.json"
  probe "log()" >"$VERIFY_DIR/cycle.json"
  ab console >"$VERIFY_DIR/console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/page-errors.json" || { log "page error capture failed"; return 1; }
}

open_settings() {
  [[ "$(ab --json is visible "#settings_menu" | json data.visible)" == true ]] || ab click "#settings" >/dev/null || { log "the Settings button did not respond"; return 1; }
}

type_seed() {
  open_settings || return 1
  ab fill "#seed" "$1" >/dev/null || { log "the seed box did not take seed $1"; return 1; }
}

keep_seed() {
  open_settings || return 1
  type_seed "$(ab --json get value "#seed" | json data.value)"
}

choose_focus() {
  if [[ -n "${2:-}" ]]; then type_seed "$2"; else keep_seed; fi || return 1
  ab select "#focus" "$1" >/dev/null || { log "focus control did not accept $1"; return 1; }
  ab wait --fn "new URLSearchParams(location.search).get('focus') === '$1'" --timeout 30000 >/dev/null || { log "choosing $1 did not load focus=$1 without Restart"; return 1; }
}

drive_focus() {
  choose_focus "$FOCUS_DRILL" || return 1
  ab wait --fn "window.__archiveOcellusProbe?.snapshot().fight?.run.kind === 'waiting'" --timeout 30000 >/dev/null || { log "the reloaded drill started before the audio probe could listen"; return 1; }
  record_audio_starts || { log "the audio probe was not installed"; return 1; }
  fight_tick_at_least "$FOCUS_LAST_TICK" 120000 || { log "the reloaded boss never stepped to P4 tick ${FOCUS_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/focus.json"
  ab --json eval "window.__cueAudio" | json data.result >"$VERIFY_DIR/focus-audio.json" || { log "audio capture failed"; return 1; }
  ab screenshot "$VERIFY_DIR/focus.png" >/dev/null || { log "focus screenshot failed"; return 1; }
  ab console >"$VERIFY_DIR/focus-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/focus-page-errors.json" || { log "page error capture failed"; return 1; }
}

drive_void_shot() {
  local box
  ab open "${URL}?seed=4&deflect=none&focus=${VOID_DRILL}" >/dev/null || return 1
  ab wait --fn "window.__archiveOcellusProbe?.snapshot().ticking === true && window.__archiveOcellusProbe.snapshot().tick >= 8" \
    --timeout 90000 >/dev/null || { log "the reloaded ${VOID_DRILL} drill never started ticking"; return 1; }
  box="$(ab --json get box "#world")"
  click_at $(( $(json data.x <<<"$box") + $(json data.width <<<"$box") / 2 - WALK_CLICK_LEFT_PX )) \
    $(( $(json data.y <<<"$box") + $(json data.height <<<"$box") / 2 - WALK_CLICK_UP_PX )) || return 1
  ab wait --fn "(() => { const p = window.__archiveOcellusProbe.snapshot().player, t = ${WALK_TARGET_TILE}; return p.x === t.x && p.y === t.y; })()" \
    --timeout 15000 >/dev/null || log "the player did not reach the walk target on the reloaded drill"
  ab wait 1200 >/dev/null
  click_past_the_edge || return 1
  drive_flood_shot || return 1
  fight_tick_at_least "$FLOOD_LAST_TICK" 30000 || { log "the reloaded drill never stepped to P4 tick ${FLOOD_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/void-shot.json"
  ab console >"$VERIFY_DIR/void-shot-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/void-shot-page-errors.json" || { log "page error capture failed"; return 1; }
}

click_at() {
  ab mouse move "$1" "$2" >/dev/null && ab mouse down left >/dev/null && ab mouse up left >/dev/null
}

click_inventory_slot() {
  click_at $((LOADOUT_SLOT_X + $1 % 4 * LOADOUT_SLOT_DX)) $((LOADOUT_SLOT_Y + $1 / 4 * LOADOUT_SLOT_DY))
}

glaives_landed() {
  ab wait --fn "window.__archiveOcellusProbe.log().rows.flatMap((row) => row.events).filter((event) => event.kind === 'player-hit-judged').length >= $1" \
    --timeout 15000 >/dev/null
}

drive_loadouts() {
  local slot box
  ab open "${URL}${LOADOUT_QUERY}" >/dev/null || return 1
  fight_tick_at_least 9 120000 || { log "the loadout drill never stepped to P4 tick 9"; return 1; }
  probe "snapshot().fight" >"$VERIFY_DIR/loadout-before.json"
  click_at "$LOADOUT_INVENTORY_TAB_X" "$LOADOUT_INVENTORY_TAB_Y" || return 1
  ab wait 600 >/dev/null
  ab screenshot "$VERIFY_DIR/loadout-ranged.png" >/dev/null || { log "ranged setup screenshot failed"; return 1; }
  probe "snapshot().icons" >"$VERIFY_DIR/icons.json"
  click_at "$LOADOUT_EQUIPMENT_TAB_X" "$LOADOUT_EQUIPMENT_TAB_Y" || return 1
  ab wait 600 >/dev/null
  ab screenshot "$VERIFY_DIR/equipment-ranged.png" >/dev/null || { log "ranged equipment tab screenshot failed"; return 1; }
  click_at "$LOADOUT_INVENTORY_TAB_X" "$LOADOUT_INVENTORY_TAB_Y" || return 1
  ab wait 600 >/dev/null

  for slot in $(seq $((LOADOUT_SPECIAL_SLOT + 1)) "$LOADOUT_SWITCHES"); do
    click_inventory_slot "$slot" || return 1
    ab wait 150 >/dev/null
  done
  ab wait 1200 >/dev/null
  probe "snapshot().fight" >"$VERIFY_DIR/loadout-after.json"
  ab screenshot "$VERIFY_DIR/loadout-melee.png" >/dev/null || { log "switched setup screenshot failed"; return 1; }

  click_inventory_slot "$LOADOUT_SPECIAL_SLOT" || return 1
  ab wait 700 >/dev/null
  click_at "$LOADOUT_SPECIAL_ORB_X" "$LOADOUT_SPECIAL_ORB_Y" || return 1
  box="$(ab --json get box "#world")"
  click_at $(( $(json data.x <<<"$box") + $(json data.width <<<"$box") / 2 + RISEN_BOSS_CLICK_RIGHT_PX )) \
    $(( $(json data.y <<<"$box") + $(json data.height <<<"$box") / 2 + RISEN_BOSS_CLICK_DOWN_PX )) || return 1
  ab wait --fn "window.__archiveOcellusProbe.snapshot().fight.player.specialEnergy < 100" --timeout 15000 >/dev/null || log "the special attack was not spent"
  glaives_landed 2 || log "the glaives never landed"
  probe "snapshot().fight" >"$VERIFY_DIR/loadout-spec.json"
  probe "log()" >"$VERIFY_DIR/loadout-spec-log.json"
  ab wait 1200 >/dev/null
  ab screenshot "$VERIFY_DIR/loadout-spec.png" >/dev/null || { log "special attack screenshot failed"; return 1; }
  click_at "$LOADOUT_EQUIPMENT_TAB_X" "$LOADOUT_EQUIPMENT_TAB_Y" || return 1
  ab wait 600 >/dev/null
  ab screenshot "$VERIFY_DIR/equipment-melee.png" >/dev/null || { log "equipment tab screenshot failed"; return 1; }
  ab console >"$VERIFY_DIR/loadout-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/loadout-page-errors.json" || { log "page error capture failed"; return 1; }

  keep_seed && ab select "#setup" melee >/dev/null && ab click "#restart" >/dev/null || { log "setup control did not accept melee"; return 1; }
  ab wait --fn "new URLSearchParams(location.search).get('setup') === 'melee'" --timeout 30000 >/dev/null || { log "restart did not load setup=melee"; return 1; }
  fight_tick_at_least 1 120000 || { log "the reloaded melee drill never stepped to P4 tick 1"; return 1; }
  probe "snapshot().fight" >"$VERIFY_DIR/loadout-selector.json"
  ab --json errors | json data.errors >"$VERIFY_DIR/loadout-selector-page-errors.json" || { log "page error capture failed"; return 1; }
}

drive_defence_floor() {
  local box
  ab open "${URL}${DEFENCE_FLOOR_QUERY}" >/dev/null || return 1
  fight_tick_at_least 9 120000 || { log "the defence floor drill never stepped to P4 tick 9"; return 1; }
  probe "snapshot().fight" >"$VERIFY_DIR/defence-floor-start.json"
  click_at "$LOADOUT_INVENTORY_TAB_X" "$LOADOUT_INVENTORY_TAB_Y" || return 1
  ab wait 600 >/dev/null
  click_inventory_slot "$LOADOUT_SPECIAL_SLOT" || return 1
  ab wait 700 >/dev/null
  click_at "$LOADOUT_SPECIAL_ORB_X" "$LOADOUT_SPECIAL_ORB_Y" || return 1
  box="$(ab --json get box "#world")"
  click_at $(( $(json data.x <<<"$box") + $(json data.width <<<"$box") / 2 + RISEN_BOSS_CLICK_RIGHT_PX )) \
    $(( $(json data.y <<<"$box") + $(json data.height <<<"$box") / 2 + RISEN_BOSS_CLICK_DOWN_PX )) || return 1
  ab wait --fn "window.__archiveOcellusProbe.snapshot().fight.player.specialEnergy === 50" --timeout 15000 >/dev/null || log "the first Division was not spent"
  click_at "$LOADOUT_SPECIAL_ORB_X" "$LOADOUT_SPECIAL_ORB_Y" || return 1
  glaives_landed 2 || log "the first Division's glaives never landed"
  probe "snapshot().fight" >"$VERIFY_DIR/defence-floor-first.json"
  glaives_landed 4 || log "the second Division's glaives never landed"
  probe "snapshot().fight" >"$VERIFY_DIR/defence-floor.json"
  probe "log()" >"$VERIFY_DIR/defence-floor-log.json"
  ab screenshot "$VERIFY_DIR/defence-floor.png" >/dev/null || { log "defence floor screenshot failed"; return 1; }
  ab console >"$VERIFY_DIR/defence-floor-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/defence-floor-page-errors.json" || { log "page error capture failed"; return 1; }
}

right_click_inventory_slot() {
  ab mouse move $((LOADOUT_SLOT_X + $1 % 4 * LOADOUT_SLOT_DX)) $((LOADOUT_SLOT_Y + $1 / 4 * LOADOUT_SLOT_DY)) >/dev/null && ab mouse down right >/dev/null && ab mouse up right >/dev/null
}

drive_supplies() {
  ab open "${URL}${SUPPLY_QUERY}" >/dev/null || return 1
  fight_tick_at_least 1 120000 || { log "the supplies drill never stepped to P4 tick 1"; return 1; }
  click_at "$LOADOUT_INVENTORY_TAB_X" "$LOADOUT_INVENTORY_TAB_Y" || return 1
  ab wait 600 >/dev/null
  probe "snapshot().fight.player.inventory" >"$VERIFY_DIR/supplies-inventory.json"
  right_click_inventory_slot "$SUPPLY_NAMED_SLOT" || return 1
  ab wait 300 >/dev/null
  probe "snapshot().menu" >"$VERIFY_DIR/item-menu.json"
  ab screenshot "$VERIFY_DIR/item-menu.png" >/dev/null || { log "item menu screenshot failed"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  ab mouse move "$CX" "$CY" >/dev/null && ab wait 200 >/dev/null || return 1
  probe "snapshot().menu" >"$VERIFY_DIR/item-menu-closed.json"
  probe "snapshot().fight.run.tick" >"$VERIFY_DIR/brew-click.json"
  click_inventory_slot "$SUPPLY_BREW_SLOT" || return 1
  ab wait --fn "window.__archiveOcellusProbe.log().rows.some((row) => row.playerAtPostTick.hp > 99)" --timeout 15000 >/dev/null || log "the brew never raised the player's hitpoints"
  probe "log().rows.map((row) => [row.tick, row.playerAtPostTick.hp])" >"$VERIFY_DIR/brew-hp.json"
  ab wait 600 >/dev/null
  ab screenshot "$VERIFY_DIR/brew-heal.png" >/dev/null || { log "brew screenshot failed"; return 1; }
  ab console >"$VERIFY_DIR/supplies-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/supplies-page-errors.json" || { log "page error capture failed"; return 1; }
}

bind_inventory_key() {
  open_settings && ab click "#keybinds" >/dev/null && ab wait 300 >/dev/null && click_at "$KEYBIND_INVENTORY_BUTTON_X" "$KEYBIND_INVENTORY_BUTTON_Y" && ab press "$1" >/dev/null && ab wait 300 >/dev/null
}

drive_keybinds() {
  open_settings && ab click "#keybinds" >/dev/null && ab wait 300 >/dev/null || { log "the Keybinds button did not respond"; return 1; }
  probe "snapshot().panel" >"$VERIFY_DIR/keybinds-open.json"
  ab screenshot "$VERIFY_DIR/keybinds.png" >/dev/null || { log "key bindings screenshot failed"; return 1; }
  bind_inventory_key "$KEYBIND_NEW_KEY" || { log "the inventory key was not bound"; return 1; }
  probe "snapshot().panel" >"$VERIFY_DIR/keybinds-bound.json"
  ab --json eval "localStorage.getItem('${SOUND_SETTINGS_KEY}')" | json data.result >"$VERIFY_DIR/keybinds-saved.json" || { log "saved settings capture failed"; return 1; }
  ab open "${URL}${SUPPLY_QUERY}" >/dev/null || return 1
  fight_tick_at_least 1 120000 || { log "the reloaded drill never stepped to P4 tick 1"; return 1; }
  ab press "$KEYBIND_DEFAULT_KEY" >/dev/null && ab wait 300 >/dev/null || return 1
  probe "snapshot().panel" >"$VERIFY_DIR/keybinds-old-key.json"
  ab press "$KEYBIND_NEW_KEY" >/dev/null && ab wait 300 >/dev/null || return 1
  probe "snapshot().panel" >"$VERIFY_DIR/keybinds-reloaded.json"
  ab screenshot "$VERIFY_DIR/keybinds-reloaded.png" >/dev/null || { log "reloaded key screenshot failed"; return 1; }
  bind_inventory_key "$KEYBIND_DEFAULT_KEY" || { log "the default inventory key was not restored"; return 1; }
  probe "snapshot().panel" >"$VERIFY_DIR/keybinds-restored.json"
  ab console >"$VERIFY_DIR/keybinds-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/keybinds-page-errors.json" || { log "page error capture failed"; return 1; }
}

seed_run() {
  local box seed search
  open_settings || return 1
  box="$(ab --json get value "#seed" | json data.value)" || return 1
  seed="$(probe "log().header.seed")" || return 1
  search="$(ab --json eval "location.search" | json data.result)" || return 1
  node -e 'console.log(JSON.stringify({ box: process.argv[1], seed: Number(process.argv[2]), search: process.argv[3] }))' "$box" "$seed" "$search"
}

restart_run() {
  local loaded
  loaded="$(ab --json eval "performance.timeOrigin" | json data.result)" || return 1
  ab click "#restart" >/dev/null || return 1
  ab wait --fn "performance.timeOrigin !== ${loaded} && (window.__archiveOcellusProbe?.snapshot().fight?.run.tick ?? -1) >= 0" --timeout 120000 >/dev/null || { log "Restart never loaded a new run"; return 1; }
}

drive_seed() {
  local fresh restarted typed
  ab open "$URL" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the unseeded run never took its first P4 step"; return 1; }
  fresh="$(seed_run)" || return 1
  ab screenshot "$VERIFY_DIR/seed-fresh.png" >/dev/null || { log "fresh seed screenshot failed"; return 1; }
  restart_run || return 1
  restarted="$(seed_run)" || return 1
  ab fill "#seed" "$(json box <<<"$fresh")" >/dev/null || { log "the seed box did not take the typed seed"; return 1; }
  restart_run || return 1
  typed="$(seed_run)" || return 1
  echo "{\"fresh\":${fresh},\"restarted\":${restarted},\"typed\":${typed}}" >"$VERIFY_DIR/seed.json"
  ab screenshot "$VERIFY_DIR/seed.png" >/dev/null || { log "typed seed screenshot failed"; return 1; }
  ab console >"$VERIFY_DIR/seed-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/seed-page-errors.json" || { log "page error capture failed"; return 1; }
}

wait_until_ticking() {
  ab wait --fn "window.__archiveOcellusProbe?.snapshot().ticking === true && window.__archiveOcellusProbe.snapshot().tick >= 8" --timeout 90000 >/dev/null || { log "the drill never started ticking"; return 1; }
}

tile_pixel() {
  local page="$1" tile="$2" after="$3" read
  read="$(ab --json eval "new Promise((done) => {
    const probe = window.__archiveOcellusProbe, ready = () => '${after}' === 'now' || (probe.snapshot().fight?.run.tick ?? -1) >= Number('${after}');
    const read = () => {
      if (!ready()) return requestAnimationFrame(read);
      const at = probe.tileCentre(${tile}), box = document.querySelector('#world').getBoundingClientRect();
      done({ at: at && { x: Math.round(box.x + at.x), y: Math.round(box.y + at.y) }, orders: probe.log().rows.flatMap((row) => row.inputs).filter((i) => i.kind === 'walk-ordered').length });
    };
    read();
  })" | json data.result)" || return 1
  [[ "$(json at <<<"$read")" != null ]] || { log "${page}: tile ${tile} is not on the canvas"; return 1; }
  CLICK_X="$(json at.x <<<"$read")" CLICK_Y="$(json at.y <<<"$read")" WALK_ORDERS="$(json orders <<<"$read")"
}

click_tile() {
  local page="$1" tile="$2" modifier="${4:-none}"
  tile_pixel "$page" "$tile" "$3" || return 1
  case "$modifier" in
    none) printf '[["mouse","move","%d","%d"],["mouse","down","left"],["mouse","up","left"]]' "$CLICK_X" "$CLICK_Y" | ab batch --bail >/dev/null ;;
    control) control_click_at "$CLICK_X" "$CLICK_Y" ;;
  esac || { log "${page}: the click on ${tile} was not sent"; return 1; }
  ab wait --fn "window.__archiveOcellusProbe.log().rows.flatMap((row) => row.inputs).filter((i) => i.kind === 'walk-ordered').length > ${WALK_ORDERS}" --timeout 5000 >/dev/null ||
    log "${page}: the click on ${tile} ordered no walk"
  ab --json eval "(() => {
    const orders = window.__archiveOcellusProbe.log().rows.flatMap((row) => row.inputs).filter((i) => i.kind === 'walk-ordered');
    return { page: '${page}', tile: ${tile}, at: { x: ${CLICK_X}, y: ${CLICK_Y} }, ordered: orders[${WALK_ORDERS}]?.destination ?? null };
  })()" | json data.result >>"$VERIFY_DIR/tile-clicks.jsonl" && echo >>"$VERIFY_DIR/tile-clicks.jsonl"
}

walk_to_tile() {
  click_tile "$1" "$2" now "${4:-none}" || return 1
  ab wait --fn "(() => { const s = window.__archiveOcellusProbe.snapshot(), to = $3; return s.player.x === to.x && s.player.y === to.y; })()" \
    --timeout 15000 >/dev/null || log "player never stood on $3"
}

drive_walkway() {
  local arrived
  ab open "${URL}${WALKWAY_QUERY}" >/dev/null && wait_until_ticking || return 1
  walk_to_tile walkway "$WALKWAY_ORDER_TILE" "$WALKWAY_STOP_TILE" || return 1
  echo "{\"x\":${CLICK_X},\"y\":${CLICK_Y}}" >"$VERIFY_DIR/walkway-click.json"
  arrived="$(probe "snapshot()")"
  echo "$arrived" >"$VERIFY_DIR/walkway-arrived.json"
  ab wait --fn "window.__archiveOcellusProbe.snapshot().tick >= $(json tick <<<"$arrived") + ${EDGE_HOLD_TICKS}" --timeout 15000 >/dev/null
  probe "snapshot()" >"$VERIFY_DIR/walkway.json"
  probe "log()" >"$VERIFY_DIR/walkway-log.json"
  ab screenshot "$VERIFY_DIR/walkway.png" >/dev/null || { log "walkway screenshot failed"; return 1; }
  ab console >"$VERIFY_DIR/walkway-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/walkway-page-errors.json" || { log "page error capture failed"; return 1; }
  ab open "${URL}${WALKWAY_QUERY}" >/dev/null && wait_until_ticking || return 1
  walk_to_tile walkway-run-end "$WALKWAY_RUN_END_TILE" "$WALKWAY_RUN_END_TILE" || return 1
  arrived="$(probe "snapshot()")"
  ab wait --fn "window.__archiveOcellusProbe.snapshot().tick >= $(json tick <<<"$arrived") + ${EDGE_HOLD_TICKS}" --timeout 15000 >/dev/null
  probe "snapshot()" >"$VERIFY_DIR/walkway-run-end.json"
  probe "log()" >"$VERIFY_DIR/walkway-run-end-log.json"
  ab screenshot "$VERIFY_DIR/walkway-run-end.png" >/dev/null || { log "walkway run end screenshot failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/walkway-run-end-page-errors.json" || { log "page error capture failed"; return 1; }
}

# agent-browser's mouse commands take no modifier keys, so the Control-click goes through CDP's Input domain as they do.
control_click_at() {
  local cdp
  cdp="$(ab get cdp-url)" || return 1
  node -e '
    const [cdp, page, x, y, modifiers] = process.argv.slice(1);
    const socket = new WebSocket(cdp);
    let id = 0;
    const pending = new Map();
    const send = (method, params, sessionId) =>
      new Promise((resolve, reject) => {
        pending.set(++id, (reply) => (reply.error ? reject(new Error(`${method}: ${reply.error.message}`)) : resolve(reply.result)));
        socket.send(JSON.stringify({ id, method, params, sessionId }));
      });
    socket.onmessage = ({ data }) => {
      const reply = JSON.parse(data);
      pending.get(reply.id)?.(reply);
      pending.delete(reply.id);
    };
    socket.onopen = async () => {
      try {
        const pages = (await send("Target.getTargets", {})).targetInfos.filter((t) => t.type === "page" && t.url.startsWith(page));
        if (pages.length !== 1) throw new Error(`expected one page at ${page}, found ${pages.length}`);
        const { sessionId } = await send("Target.attachToTarget", { targetId: pages[0].targetId, flatten: true });
        const at = { x: Number(x), y: Number(y), modifiers: Number(modifiers) };
        await send("Input.dispatchMouseEvent", { ...at, type: "mouseMoved" }, sessionId);
        await send("Input.dispatchMouseEvent", { ...at, type: "mousePressed", button: "left", buttons: 1, clickCount: 1 }, sessionId);
        await send("Input.dispatchMouseEvent", { ...at, type: "mouseReleased", button: "left", buttons: 0, clickCount: 1 }, sessionId);
        process.exit(0);
      } catch (error) {
        console.error(`verify: ${error.message}`);
        process.exit(1);
      }
    };
  ' "$cdp" "$URL" "$1" "$2" "$CONTROL_MODIFIER"
}

drive_control_walk() {
  ab open "${URL}${WALKWAY_QUERY}" >/dev/null && wait_until_ticking && canvas_centre || return 1
  ab eval '(() => { window.__contextMenus = 0; document.querySelector("#world").addEventListener("contextmenu", () => window.__contextMenus++); return true; })()' >/dev/null || return 1
  click_tile control-walk "$WALKWAY_ORDER_TILE" now control || return 1
  ab wait --fn "window.__archiveOcellusProbe.snapshot().player.x >= 8" --timeout 15000 >/dev/null || log "player never passed x 8 after the Control-click"
  ab screenshot "$VERIFY_DIR/control-walk.png" >/dev/null || { log "control walk screenshot failed"; return 1; }
  ab wait --fn "(() => { const s = window.__archiveOcellusProbe.snapshot(), to = ${WALKWAY_STOP_TILE}; return s.player.x === to.x && s.player.y === to.y; })()" \
    --timeout 15000 >/dev/null || log "player never stood on ${WALKWAY_STOP_TILE} after the Control-click"
  ab --json eval '({ platform: navigator.platform, contextMenus: window.__contextMenus, menu: window.__archiveOcellusProbe.snapshot().menu })' | json data.result >"$VERIFY_DIR/control-walk-menu.json"
  probe "log()" >"$VERIFY_DIR/control-walk-log.json"
  ab mouse move $((CX - WALK_CLICK_LEFT_PX)) $((CY - WALK_CLICK_UP_PX)) >/dev/null && ab mouse down right >/dev/null && ab mouse up right >/dev/null || return 1
  ab wait 300 >/dev/null
  probe "snapshot().menu" >"$VERIFY_DIR/control-walk-right-click.json"
  ab console >"$VERIFY_DIR/control-walk-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/control-walk-page-errors.json" || { log "page error capture failed"; return 1; }
}

click_twice_in_one_tick() {
  local from
  from="$(probe "snapshot().tick")" || return 1
  printf '[["wait","--fn","((t, s) => t > %d && s !== undefined && performance.now() - s >= %d)(window.__archiveOcellusProbe.snapshot().tick, window.__worldTickStarts[window.__archiveOcellusProbe.snapshot().tick])","--timeout","10000"],["mouse","move","%d","%d"],["mouse","down","left"],["mouse","up","left"],["wait","--fn","((d) => window.__archiveOcellusProbe.snapshot().tick > d.tick || performance.now() - window.__worldTickStarts[d.tick] >= %d)(window.__correctionDowns[0])","--timeout","10000"],["mouse","move","%d","%d"],["mouse","down","left"],["mouse","up","left"]]' \
    "$from" "$CORRECTION_FIRST_MS" $1 "$CORRECTION_LATE_MS" $2 | ab batch --bail >/dev/null
}

drive_click_correction() {
  local first last attempt downs
  for attempt in $(seq 1 "$CORRECTION_ATTEMPTS"); do
    ab open "${URL}${WALKWAY_QUERY}" >/dev/null && wait_until_ticking || return 1
    record_tick_starts
    tile_pixel correction "$CORRECTION_FIRST_TILE" now || return 1
    first="$CLICK_X $CLICK_Y"
    tile_pixel correction "$CORRECTION_LAST_TILE" now || return 1
    last="$CLICK_X $CLICK_Y"
    ab eval '(() => {
      const downs = window.__correctionDowns = [];
      document.querySelector("#world").addEventListener("mousedown", () => {
        const tick = window.__archiveOcellusProbe.snapshot().tick;
        downs.push({ tick, intoTickMs: Math.round(performance.now() - window.__worldTickStarts[tick]) });
      }, true);
    })()' >/dev/null || return 1
    click_twice_in_one_tick "$first" "$last" || { log "the two correction clicks were not sent"; return 1; }
    downs="$(ab --json eval "window.__correctionDowns" | json data.result)" || return 1
    [[ "$(json '0.tick' <<<"$downs")" == "$(json '1.tick' <<<"$downs")" ]] && break
    log "correction attempt ${attempt}: the second click fell after the tick boundary (${downs}); reloading"
  done
  ab wait --fn "window.__archiveOcellusProbe.snapshot().tick >= window.__correctionDowns[0].tick + 4" --timeout 15000 >/dev/null || return 1
  ab --json eval '(() => {
    const rows = window.__archiveOcellusProbe.log().rows, ordered = rows.filter((row) => row.inputs.some((input) => input.kind === "walk-ordered"));
    const at = rows.indexOf(ordered[0]);
    return {
      downs: window.__correctionDowns,
      orderRows: ordered.map((row) => ({ worldTick: row.worldTick, orders: row.inputs.filter((input) => input.kind === "walk-ordered").map((input) => input.destination) })),
      tiles: at < 0 ? [] : rows.slice(at, at + 3).map((row) => row.playerAtPostTick.tile),
    };
  })()' | json data.result >"$VERIFY_DIR/click-correction.json" || return 1
  ab screenshot "$VERIFY_DIR/click-correction.png" >/dev/null || { log "click correction screenshot failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/click-correction-page-errors.json" || { log "page error capture failed"; return 1; }
}

top_down_view() {
  local step
  ab mouse move "$CX" $((CY - BACK_WALL_TOP_DOWN_DRAG_PX / 2)) >/dev/null && ab mouse down middle >/dev/null || return 1
  for step in 1 2 3 4 5 6; do
    ab mouse move "$CX" $((CY - BACK_WALL_TOP_DOWN_DRAG_PX / 2 + step * BACK_WALL_TOP_DOWN_DRAG_PX / 6)) >/dev/null || return 1
  done
  ab mouse up middle >/dev/null && ab wait "$CAMERA_SETTLE_MS" >/dev/null
}

drive_back_wall() {
  ab open "${URL}${WALKWAY_QUERY}" >/dev/null && wait_until_ticking && canvas_centre || return 1
  walk_to_tile back-wall-view "$BACK_WALL_START_TILE" "$BACK_WALL_START_TILE" || return 1
  top_down_view || return 1
  ab screenshot "$VERIFY_DIR/back-wall-top-down.png" >/dev/null || { log "back wall screenshot failed"; return 1; }
  ab open "${URL}${WALKWAY_QUERY}" >/dev/null && wait_until_ticking || return 1
  walk_to_tile back-wall "$BACK_WALL_START_TILE" "$BACK_WALL_START_TILE" || return 1
  ab wait "$CAMERA_SETTLE_MS" >/dev/null
  walk_to_tile back-wall-toward "$BACK_WALL_END_TILE" "$BACK_WALL_END_TILE" control || return 1
  ab wait "$CAMERA_SETTLE_MS" >/dev/null
  walk_to_tile back-wall-back "$BACK_WALL_START_TILE" "$BACK_WALL_START_TILE" control || return 1
  probe "log()" >"$VERIFY_DIR/back-wall-log.json"
  top_down_view || return 1
  ab screenshot "$VERIFY_DIR/back-wall-flood.png" >/dev/null || { log "back wall flood screenshot failed"; return 1; }
  ab console >"$VERIFY_DIR/back-wall-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/back-wall-page-errors.json" || { log "page error capture failed"; return 1; }
}

drive_corner() {
  local step
  ab open "${URL}${CORNER_QUERY}" >/dev/null && wait_until_ticking && canvas_centre || return 1
  walk_to_tile corner-hole "$CORNER_HOLE_TILE" "$CORNER_HOLE_TILE" || return 1
  probe "snapshot()" >"$VERIFY_DIR/corner-hole.json"
  probe "log()" >"$VERIFY_DIR/corner-hole-log.json"
  ab wait 1000 >/dev/null && ab screenshot "$VERIFY_DIR/corner-hole.png" >/dev/null || { log "corner screenshot failed"; return 1; }
  ab open "${URL}${CORNER_QUERY}" >/dev/null && wait_until_ticking || return 1
  walk_to_tile corner-nub "$CORNER_NUB_TILE" "$CORNER_NUB_TILE" || return 1
  probe "snapshot()" >"$VERIFY_DIR/corner-nub.json"
  probe "log()" >"$VERIFY_DIR/corner-nub-log.json"
  ab console >"$VERIFY_DIR/corner-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/corner-page-errors.json" || { log "page error capture failed"; return 1; }
  ab open "${URL}${CORNER_QUERY}" >/dev/null && wait_until_ticking || return 1
  walk_to_tile corner-view "$CORNER_VIEW_TILE" "$CORNER_VIEW_TILE" || return 1
  ab mouse move "$CX" $((CY + 100)) >/dev/null && ab mouse down middle >/dev/null || return 1
  for step in 1 2 3 4 5; do
    ab mouse move $((CX - step * CORNER_VIEW_DRAG_LEFT_PX / 5)) $((CY + 100)) >/dev/null || return 1
  done
  ab mouse up middle >/dev/null && ab wait 1500 >/dev/null || return 1
  ab screenshot "$VERIFY_DIR/corner-view.png" >/dev/null || { log "corner view screenshot failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/corner-view-page-errors.json" || { log "page error capture failed"; return 1; }
}

drive_boss_pathing() {
  ab open "${URL}${PATHING_QUERY}" >/dev/null && fight_tick_at_least 0 120000 || return 1
  walk_to_tile pathing "$PATHING_WEST_TILE" "$PATHING_WEST_TILE" || return 1
  click_tile pathing "$PATHING_EAST_TILE" "$PATHING_UNDER_TICK" || return 1
  click_tile pathing "$PATHING_BACK_TILE" "$PATHING_AROUND_TICK" || return 1
  shot_after_tick $((PATHING_AROUND_TICK + 2)) 300 pathing-around.png || { log "the pathing drill never reached P4 tick $((PATHING_AROUND_TICK + 2))"; return 1; }
  fight_tick_at_least "$PATHING_LAST_TICK" 30000 || { log "the pathing drill never stepped to P4 tick ${PATHING_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/pathing.json"
  ab console >"$VERIFY_DIR/pathing-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/pathing-page-errors.json" || { log "page error capture failed"; return 1; }
  ab open "${URL}${PATHING_QUERY}" >/dev/null && fight_tick_at_least 0 120000 || return 1
  click_tile pathing-reroute "$PATHING_EDGE_TILE" "$PATHING_REROUTE_TICK" || return 1
  fight_tick_at_least $((PATHING_REROUTE_TICK + 4)) 30000 || { log "the reroute drill never stepped to P4 tick $((PATHING_REROUTE_TICK + 4))"; return 1; }
  probe "log()" >"$VERIFY_DIR/pathing-reroute.json"
  ab console >"$VERIFY_DIR/pathing-reroute-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/pathing-reroute-page-errors.json" || { log "page error capture failed"; return 1; }
  ab open "${URL}${PATHING_QUERY}" >/dev/null && fight_tick_at_least 0 120000 || return 1
  click_tile pathing-control "$PATHING_EDGE_TILE" "$PATHING_REROUTE_TICK" control || return 1
  fight_tick_at_least $((PATHING_REROUTE_TICK + 4)) 30000 || { log "the Control-click reroute drill never stepped to P4 tick $((PATHING_REROUTE_TICK + 4))"; return 1; }
  probe "log()" >"$VERIFY_DIR/pathing-control.json"
  ab console >"$VERIFY_DIR/pathing-control-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/pathing-control-page-errors.json" || { log "page error capture failed"; return 1; }
  ab open "${URL}${PATHING_QUERY}" >/dev/null && fight_tick_at_least 0 120000 || return 1
  walk_to_tile pathing-out "$PATHING_UNDER_TILE" "$PATHING_UNDER_TILE" || return 1
  click_tile pathing-out "$PATHING_OUT_TILE" "$PATHING_OUT_TICK" || return 1
  shot_after_tick $((PATHING_OUT_TICK + 1)) 300 pathing-out.png || { log "the walk-out drill never reached P4 tick $((PATHING_OUT_TICK + 1))"; return 1; }
  fight_tick_at_least $((PATHING_OUT_TICK + 4)) 30000 || { log "the walk-out drill never stepped to P4 tick $((PATHING_OUT_TICK + 4))"; return 1; }
  probe "log()" >"$VERIFY_DIR/pathing-out.json"
  ab console >"$VERIFY_DIR/pathing-out-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/pathing-out-page-errors.json" || { log "page error capture failed"; return 1; }
}

drive_floor_holes() {
  ab open "${URL}${HOLES_QUERY}" >/dev/null && wait_until_ticking || return 1
  ab wait 1200 >/dev/null && ab screenshot "$VERIFY_DIR/holes-drawn.png" >/dev/null || { log "holes screenshot failed"; return 1; }
  shot_after_tick "$HOLE_FLOOD_SHOT_TICK" 300 holes-flood.png || { log "the holes drill never reached P4 tick ${HOLE_FLOOD_SHOT_TICK}"; return 1; }
  walk_to_tile holes "$HOLE_TILE" "$HOLE_TILE" || return 1
  echo "{\"x\":${CLICK_X},\"y\":${CLICK_Y}}" >"$VERIFY_DIR/hole-click.json"
  ab wait --fn "window.__archiveOcellusProbe.log().rows.flatMap((row) => row.events).filter((e) => e.kind === 'hole-hit').length >= ${HOLE_HITS}" \
    --timeout 15000 >/dev/null || log "the player on the hole never took ${HOLE_HITS} hits"
  ab screenshot "$VERIFY_DIR/hole-hit.png" >/dev/null || { log "hole hit screenshot failed"; return 1; }
  probe "log()" >"$VERIFY_DIR/holes.json"
  ab console >"$VERIFY_DIR/holes-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/holes-page-errors.json" || { log "page error capture failed"; return 1; }
}

drive_orb_off_holes() {
  ab open "${URL}${ORB_HOLES_QUERY}" >/dev/null && wait_until_ticking || return 1
  shot_after_tick "$ORB_HOLES_SHOT_TICK" 300 orb-off-holes.png || { log "the full fight never reached P4 tick ${ORB_HOLES_SHOT_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/orb-off-holes.json"
  ab console >"$VERIFY_DIR/orb-off-holes-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/orb-off-holes-page-errors.json" || { log "page error capture failed"; return 1; }
}

drive_orb_late_and_entry() {
  ab open "${URL}?seed=${ORB_SEED}&focus=${ORB_DRILL}" >/dev/null && wait_until_ticking && canvas_centre || return 1
  shot_after_tick "$ORB_LATE_SHOT_TICK" 300 orb-late.png || { log "the orb drill never reached P4 tick ${ORB_LATE_SHOT_TICK}"; return 1; }
  click_at $((CX + ORB_CLICK_RIGHT_PX)) $((CY - ORB_CLICK_UP_PX)) || return 1
  fight_tick_at_least "$ORB_LATE_LAST_TICK" 30000 || { log "the orb drill never stepped to P4 tick ${ORB_LATE_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/orb-late.json"
  ab --json errors | json data.errors >"$VERIFY_DIR/orb-late-page-errors.json" || { log "page error capture failed"; return 1; }

  ab open "${URL}?seed=${ORB_SEED}&focus=${ORB_DRILL}" >/dev/null && wait_until_ticking && canvas_centre || return 1
  click_after_tick "$ORB_ENTRY_CLICK_TICK" "$ORB_ENTRY_CLICK_RIGHT_PX" "-$ORB_ENTRY_CLICK_UP_PX" || { log "the walk into the 5x5 was not clicked"; return 1; }
  shot_after_tick "$ORB_ENTRY_LAST_TICK" 300 orb-entry.png || { log "the orb drill never reached P4 tick ${ORB_ENTRY_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/orb-entry.json"
  ab console >"$VERIFY_DIR/orb-entry-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/orb-entry-page-errors.json" || { log "page error capture failed"; return 1; }
}

drive_void_floor() {
  choose_focus "$VOID_DRILL" || return 1
  fight_tick_at_least "$VOID_INNER_SHOT_TICK" 120000 || { log "the reloaded boss never stepped to P4 tick ${VOID_INNER_SHOT_TICK}"; return 1; }
  ab screenshot "$VERIFY_DIR/void-inner.png" >/dev/null || { log "inner void screenshot failed"; return 1; }
  fight_tick_at_least "$VOID_FLOOD_SHOT_TICK" 60000 || { log "the reloaded boss never stepped to P4 tick ${VOID_FLOOD_SHOT_TICK}"; return 1; }
  ab screenshot "$VERIFY_DIR/void-flood.png" >/dev/null || { log "flood screenshot failed"; return 1; }
  ab wait --fn "window.__archiveOcellusProbe.snapshot().fight?.run.kind === 'ended'" --timeout 60000 >/dev/null || { log "the player standing on the flood never died"; return 1; }
  probe "log()" >"$VERIFY_DIR/void-floor.json"
  ab console >"$VERIFY_DIR/void-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/void-page-errors.json" || { log "page error capture failed"; return 1; }
}

drive_lifeforce_orb() {
  local box ox oy frame
  choose_focus "$ORB_DRILL" "$ORB_SEED" || return 1
  fight_tick_at_least 12 120000 || { log "the orb drill never reached the lifeforce hit"; return 1; }
  ab screenshot "$VERIFY_DIR/orb-hit.png" >/dev/null || { log "lifeforce hit screenshot failed"; return 1; }
  box="$(ab --json get box "#world")"
  ox=$(( $(json data.x <<<"$box") + $(json data.width <<<"$box") / 2 + ORB_CLICK_RIGHT_PX ))
  oy=$(( $(json data.y <<<"$box") + $(json data.height <<<"$box") / 2 - ORB_CLICK_UP_PX ))
  # The orb's teal pulses within a tick, so each look is a burst of frames. The player stays on spawn until the glow burst, because on the orb it hides the glow.
  fight_tick_at_least "$ORB_DORMANT_TICK" 30000 || { log "the boss never stepped to P4 tick ${ORB_DORMANT_TICK}"; return 1; }
  for frame in $(seq 1 "$ORB_FRAMES"); do
    ab screenshot "$VERIFY_DIR/orb-dormant-${frame}.png" >/dev/null || { log "dormant orb screenshot failed"; return 1; }
  done
  fight_tick_at_least "$ORB_GLOW_TICK" 30000 || { log "the boss never stepped to P4 tick ${ORB_GLOW_TICK}"; return 1; }
  for frame in $(seq 1 "$ORB_FRAMES"); do
    ab screenshot "$VERIFY_DIR/orb-glow-${frame}.png" >/dev/null || { log "glowing orb screenshot failed"; return 1; }
  done
  click_at "$ox" "$oy" || return 1
  ab wait --fn "(() => { const d = window.__archiveOcellusProbe.snapshot().destination, spawn = ${SPAWN_TILE}; return d !== null && (d.x !== spawn.x || d.y !== spawn.y); })()" \
    --timeout 5000 >/dev/null || log "the orb click set no new destination"
  echo "{\"x\":${ox},\"y\":${oy},\"snapshot\":$(probe "snapshot()")}" >"$VERIFY_DIR/orb-click.json"
  fight_tick_at_least "$ORB_LAST_TICK" 30000 || { log "the boss never stepped to P4 tick ${ORB_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/orb.json"
  ab console >"$VERIFY_DIR/orb-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/orb-page-errors.json" || { log "page error capture failed"; return 1; }

  ab open "${URL}?seed=${ORB_SEED}&focus=${ORB_DRILL}" >/dev/null || return 1
  fight_tick_at_least "$ORB_SKIP_LAST_TICK" 120000 || { log "the orb-skipping drill never stepped to P4 tick ${ORB_SKIP_LAST_TICK}"; return 1; }
  ab screenshot "$VERIFY_DIR/orb-skip.png" >/dev/null || { log "skipped orb screenshot failed"; return 1; }
  probe "log()" >"$VERIFY_DIR/orb-skip.json"
  ab console >"$VERIFY_DIR/orb-skip-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/orb-skip-page-errors.json" || { log "page error capture failed"; return 1; }
}

drive_explosions() {
  local inner=($EXPLOSION_INNER_MARKS) outer=($EXPLOSION_OUTER_MARKS) shards_shown
  shards_shown="$(node --import tsx --input-type=module -e 'const { OCELLUS_P4 } = await import("./src/content/ocellus/js/OcellusTimings.ts"); console.log(OCELLUS_P4.explosion.look.value.mark.shardsFadeIn)')" ||
    { log "the explosion mark's look was unreadable"; return 1; }
  save_sound_settings true || { log "the sound settings were not saved"; return 1; }
  choose_focus "$EXPLOSION_DRILL" || return 1
  fight_tick_at_least 0 120000 || { log "the explosions drill never started"; return 1; }
  record_audio_starts || { log "the audio probe was not installed"; return 1; }
  record_tick_starts || { log "the tick watch was not installed"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick $((inner[0] - 1)) "$DODGE_CLICK_SIDE_PX" "$STEP_CLICK_DOWN_PX" || { log "the first dodge was not clicked"; return 1; }
  shot_after_tick "${inner[0]}" "$MARKER_SHOT_DELAY_MS" explosion-left.png || { log "left marker screenshot failed"; return 1; }
  step_on_marks "-$DODGE_CLICK_SIDE_PX" "${inner[@]:1}" || { log "the other dodges were not clicked"; return 1; }
  # The mark's shards give way to its glow from look.mark.glowFrom, so the shot waits only until they have faded in on the same mark tick.
  printf '[["wait","--fn","(window.__archiveOcellusProbe?.snapshot().fight?.run.tick ?? -1) >= %d","--timeout","60000"],["mouse","move","%d","%d"],["mouse","down","left"],["mouse","up","left"],["wait","--fn","window.__archiveOcellusProbe?.snapshot().fight?.run.tick === %d && (performance.now() - (window.__tickStarts[%d] ?? Infinity)) / 600 >= %s","--timeout","5000"],["screenshot","%s"]]' \
    "${outer[0]}" $((CX + DODGE_CLICK_SIDE_PX)) $((CY + STEP_CLICK_DOWN_PX)) "${outer[0]}" "${outer[0]}" "$shards_shown" "$VERIFY_DIR/explosion-standing.png" | ab batch --bail >/dev/null ||
    { log "the late step was not clicked or its mark tick passed before the shot"; return 1; }
  fight_tick_at_least "$EXPLOSION_LAST_TICK" 30000 || { log "the explosions drill never stepped to P4 tick ${EXPLOSION_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/explosions.json"
  ab --json eval "window.__cueAudio" | json data.result >"$VERIFY_DIR/explosion-audio.json" || { log "audio capture failed"; return 1; }
  ab console >"$VERIFY_DIR/explosion-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/explosion-page-errors.json" || { log "page error capture failed"; return 1; }
  save_sound_settings false || { log "the sound settings were not restored"; return 1; }

  ab open "${URL}?seed=1&focus=${EXPLOSION_DRILL}&drillStart=cycle-start" >/dev/null || return 1
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick 0 0 "-$UNDER_BOSS_CLICK_UP_PX" || { log "the walk under the hidden boss was not clicked"; return 1; }
  shot_after_tick "${inner[0]}" "$MARKER_SHOT_DELAY_MS" explosion-under.png || { log "under-boss screenshot failed"; return 1; }
  fight_tick_at_least "$EXPLOSION_UNDER_LAST_TICK" 30000 || { log "the camping drill never stepped to P4 tick ${EXPLOSION_UNDER_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/explosions-under.json"
  ab console >"$VERIFY_DIR/explosion-under-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/explosion-under-page-errors.json" || { log "page error capture failed"; return 1; }
}

# The camera trails each step, so the step waits for it to settle; a click past the north edge always stops on row 1.
drive_dodge_speedup() {
  local north=0 mark
  ab open "${URL}?seed=1&focus=${EXPLOSION_DRILL}" >/dev/null || return 1
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick "$DODGE_BOSS_CLICK_TICK" 0 "-$HOVER_BOSS_BODY_UP_PX" || { log "the hovering boss was not clicked"; return 1; }
  for mark in $EXPLOSION_INNER_MARKS; do
    printf '[["wait","--fn","(window.__archiveOcellusProbe?.snapshot().fight?.run.tick ?? -1) >= %d","--timeout","30000"],["wait","%d"],["mouse","move","%d","%d"],["mouse","down","left"],["mouse","up","left"],["wait","--fn","(window.__archiveOcellusProbe?.snapshot().fight?.run.tick ?? -1) >= %d","--timeout","30000"],["mouse","move","%d","%d"],["mouse","down","left"],["mouse","up","left"]]' \
      $((mark - 1)) "$DODGE_SETTLE_MS" "$CX" $((north ? CY + EDGE_CLICK_DOWN_PX : CY - DODGE_SOUTH_CLICK_UP_PX)) "$mark" "$CX" $((CY - HOVER_BOSS_BODY_UP_PX)) |
      ab batch --bail >/dev/null || { log "the dodge on mark ${mark} was not clicked"; return 1; }
    north=$((1 - north))
  done
  fight_tick_at_least "$DODGE_SPEEDUP_LAST_TICK" 30000 || { log "the dodging drill never stepped to P4 tick ${DODGE_SPEEDUP_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/dodge-speedup.json"
  ab console >"$VERIFY_DIR/dodge-speedup-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/dodge-speedup-page-errors.json" || { log "page error capture failed"; return 1; }
}

# In 2D the player's square covers a mark on its own tile, so each page steps off the mark before a screenshot looks for it.
drive_explosion_views() {
  local inner=($EXPLOSION_INNER_MARKS) outer=($EXPLOSION_OUTER_MARKS) i tile mode frame ended
  save_settings "{ use3dView: false }" || { log "the 2D view setting was not saved"; return 1; }
  ab open "${URL}?seed=1&focus=${EXPLOSION_DRILL}" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the 2D explosions drill never started"; return 1; }
  record_tick_starts || { log "the tick watch was not installed"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  tile_pixel explosions-2d "$EXPLOSION_2D_SIDE_TILE" 0 || return 1
  click_after_tick $((inner[0] - 1)) $((CLICK_X - CX)) $((CLICK_Y - CY)) || { log "the first 2D dodge was not clicked"; return 1; }
  shot_in_fight_tick "${inner[0]}" "$EXPLOSION_GLOW_SHOT_FRACTION" explosion-2d-left.png || { log "2D marker screenshot failed"; return 1; }
  ab --json eval "(() => { const probe = window.__archiveOcellusProbe; return { marked: probe.tileCentre(${SPAWN_TILE}), stepped: probe.tileCentre(${EXPLOSION_2D_SIDE_TILE}) }; })()" |
    json data.result >"$VERIFY_DIR/explosion-2d-tiles.json" || { log "2D tile capture failed"; return 1; }
  for i in "${!inner[@]}"; do
    (( i == 0 )) && continue
    (( i % 2 == 0 )) && tile="$EXPLOSION_2D_SIDE_TILE" || tile="$SPAWN_TILE"
    click_tile explosions-2d "$tile" $((inner[i] - 1)) || { log "the 2D dodge on mark ${inner[i]} was not clicked"; return 1; }
  done
  click_tile explosions-2d "$EXPLOSION_2D_SIDE_TILE" "${outer[0]}" || { log "the late 2D step was not clicked"; return 1; }
  fight_tick_at_least "$EXPLOSION_2D_LAST_TICK" 30000 || { log "the 2D explosions drill never stepped to P4 tick ${EXPLOSION_2D_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/explosions-2d.json"
  ab console >"$VERIFY_DIR/explosion-2d-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/explosion-2d-page-errors.json" || { log "page error capture failed"; return 1; }

  for mode in 2d 3d; do
    ab open "${URL}${EXPLOSION_RUN_END_QUERY}" >/dev/null || return 1
    fight_tick_at_least 0 120000 || { log "the ${mode} run-end drill never started"; return 1; }
    record_tick_starts || { log "the tick watch was not installed"; return 1; }
    canvas_centre || { log "canvas box unreadable"; return 1; }
    if [[ "$mode" == 2d ]]; then
      tile_pixel "explosion-run-end-${mode}" "$EXPLOSION_2D_BOSS_TILE" 0 || return 1
      click_after_tick "$EXPLOSION_KILL_CLICK_TICK" $((CLICK_X - CX)) $((CLICK_Y - CY)) || { log "the boss's 2D tile was not clicked"; return 1; }
      tile_pixel "explosion-run-end-${mode}" "$EXPLOSION_2D_SIDE_TILE" 0 || return 1
      click_after_tick $((inner[0] - 1)) $((CLICK_X - CX)) $((CLICK_Y - CY)) || { log "the 2D step off the mark was not clicked"; return 1; }
    else
      click_after_tick "$EXPLOSION_KILL_CLICK_TICK" 0 "-$HOVER_BOSS_BODY_UP_PX" || { log "the hovering boss was not clicked"; return 1; }
      click_after_tick $((inner[0] - 1)) "$DODGE_CLICK_SIDE_PX" "$STEP_CLICK_DOWN_PX" || { log "the step off the mark was not clicked"; return 1; }
    fi
    frame=0
    for fraction in $EXPLOSION_MARKED_SHOT_FRACTIONS; do
      frame=$((frame + 1))
      shot_in_fight_tick "${inner[0]}" "$fraction" "explosion-run-end-${mode}-marked-${frame}.png" || { log "${mode} marked screenshot failed"; return 1; }
    done
    ab wait --fn "window.__archiveOcellusProbe.snapshot().fight?.run.kind === 'ended'" --timeout 30000 >/dev/null || { log "the ${mode} run-end drill never ended"; return 1; }
    ended="$(probe "snapshot().tick")" || return 1
    for frame in $(seq 1 "$EXPLOSION_RUN_END_FRAMES"); do
      shot_in_world_tick $((ended + frame)) "$EXPLOSION_GLOW_SHOT_FRACTION" "explosion-run-end-${mode}-${frame}.png" || { log "${mode} run-end screenshot failed"; return 1; }
    done
    probe "log()" >"$VERIFY_DIR/explosion-run-end-${mode}.json"
    ab console >"$VERIFY_DIR/explosion-run-end-${mode}-console.log" 2>&1 || { log "console capture failed"; return 1; }
    ab --json errors | json data.errors >"$VERIFY_DIR/explosion-run-end-${mode}-page-errors.json" || { log "page error capture failed"; return 1; }
    [[ "$mode" == 3d ]] || save_settings "{ use3dView: true }" || { log "the 3D view setting was not restored"; return 1; }
  done
}

drive_transition_attack() {
  ab open "${URL}${SPECIAL_QUERY}" >/dev/null || return 1
  canvas_centre || { log "canvas box unreadable"; return 1; }
  shot_after_tick "$SPECIAL_BEFORE_SHOT_TICK" 0 special-before.png || { log "pre-tell screenshot failed"; return 1; }
  click_after_tick "$SPECIAL_PRAY_TICK" "$PROTECT_MAGIC_RIGHT_PX" "$PROTECT_DOWN_PX" || { log "Protect from Magic was not clicked before the landing"; return 1; }
  shot_after_tick "$SPECIAL_VORTEX_SHOT_TICK" 0 special-vortex.png || { log "vortex screenshot failed"; return 1; }
  fight_tick_at_least "$SOUL_SPLIT_HEAL_TICK" 30000 || { log "the transition drill never stepped to the Soul Split heal at P4 tick ${SOUL_SPLIT_HEAL_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/special.json"
  ab console >"$VERIFY_DIR/special-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/special-page-errors.json" || { log "page error capture failed"; return 1; }

  save_sound_settings true || { log "the sound settings were not saved"; return 1; }
  keep_seed && ab click "#restart" >/dev/null || { log "Restart was not clicked"; return 1; }
  ab wait --fn "new URLSearchParams(location.search).has('setup')" --timeout 30000 >/dev/null || { log "Restart did not reload the transition drill"; return 1; }
  fight_tick_at_least 0 120000 || { log "the late-prayer drill never started"; return 1; }
  record_audio_starts || { log "the audio probe was not installed"; return 1; }
  click_after_tick "$SPECIAL_HIT_TICK" "$PROTECT_MAGIC_RIGHT_PX" "$PROTECT_DOWN_PX" || { log "the late Protect from Magic was not clicked"; return 1; }
  shot_after_tick "$SOUL_SPLIT_HEAL_TICK" 0 special-heal.png || { log "Soul Split heal screenshot failed"; return 1; }
  shot_after_tick "$SPECIAL_SPIKE_SHOT_TICK" 0 special-spike-disk.png || { log "spike disk screenshot failed"; return 1; }
  shot_after_tick "$SPECIAL_SEMICIRCLE_SHOT_TICK" 0 special-semicircle.png || { log "semicircle screenshot failed"; return 1; }
  shot_after_tick "$SPECIAL_BLACK_SHOT_TICK" 0 special-black-disk.png || { log "black disk screenshot failed"; return 1; }
  ab wait --fn "window.__archiveOcellusProbe.snapshot().fight?.run.kind === 'ended'" --timeout 60000 >/dev/null || { log "the player who prayed late never died"; return 1; }
  ab wait 1000 >/dev/null
  probe "log()" >"$VERIFY_DIR/special-late.json"
  ab --json eval "window.__cueAudio" | json data.result >"$VERIFY_DIR/special-audio.json" || { log "audio capture failed"; return 1; }
  ab console >"$VERIFY_DIR/special-late-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/special-late-page-errors.json" || { log "page error capture failed"; return 1; }
  save_sound_settings false || { log "the sound settings were not restored"; return 1; }
}

drive_overheads_rifts() {
  local shot
  ab open "${URL}${RIFT_QUERY}" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the rifts drill never loaded"; return 1; }
  save_sound_settings true || { log "the sound settings were not saved"; return 1; }
  keep_seed && ab click "#restart" >/dev/null || { log "Restart was not clicked"; return 1; }
  ab wait --fn "new URLSearchParams(location.search).has('setup')" --timeout 30000 >/dev/null || { log "Restart did not reload the rifts drill"; return 1; }
  fight_tick_at_least 0 120000 || { log "the rifts drill never started"; return 1; }
  record_audio_starts || { log "the audio probe was not installed"; return 1; }
  record_overhead_draws || { log "the overhead draw probe was not installed"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  for shot in $OVERHEAD_SHOT_TICKS; do
    shot_after_tick "$shot" 0 "overhead-${shot}.png" || { log "overhead screenshot at P4 tick ${shot} failed"; return 1; }
  done
  shot_after_tick "$RIFT_CLICK_TICK" 0 rift-spawned.png || { log "rift spawn screenshot failed"; return 1; }
  click_after_tick "$RIFT_CLICK_TICK" "-$NORTH_EAST_RIFT_CLICK_LEFT_PX" "-$NORTH_EAST_RIFT_CLICK_UP_PX" || { log "the north-east rift was not clicked"; return 1; }
  ab wait --fn "window.__archiveOcellusProbe.log().rows.some((row) => row.events.some((e) => e.kind === 'rift-destroyed'))" --timeout 30000 >/dev/null || { log "no rift was destroyed after the click"; return 1; }
  ab wait "$CHAT_POLL_WAIT_MS" >/dev/null
  ab screenshot "$VERIFY_DIR/rift-destroyed.png" >/dev/null || { log "rift kill screenshot failed"; return 1; }
  ab --json get text "#game_chat" >"$VERIFY_DIR/rift-chat.json" || { log "chat text capture failed"; return 1; }
  shot_after_tick "$RIFT_CHARGED_SHOT_TICK" 0 rift-charged.png || { log "charged rift screenshot failed"; return 1; }
  shot_after_tick "$RIFT_BURST_TICK" 0 rift-burst.png || { log "rift burst screenshot failed"; return 1; }
  fight_tick_at_least $((RIFT_BURST_TICK + 1)) 30000 || { log "the rifts drill never stepped past the burst at P4 tick ${RIFT_BURST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/rifts.json"
  ab --json eval "window.__cueAudio" | json data.result >"$VERIFY_DIR/rift-audio.json" || { log "audio capture failed"; return 1; }
  ab --json eval "window.__overheadDraws" | json data.result >"$VERIFY_DIR/overhead-draws.json" || { log "overhead draw capture failed"; return 1; }
  ab console >"$VERIFY_DIR/rift-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/rift-page-errors.json" || { log "page error capture failed"; return 1; }
  save_sound_settings false || { log "the sound settings were not restored"; return 1; }

  ab open "${URL}${RIFT_QUERY}" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the Ralos rifts drill never loaded"; return 1; }
  click_at "$LOADOUT_INVENTORY_TAB_X" "$LOADOUT_INVENTORY_TAB_Y" || return 1
  ab wait 600 >/dev/null
  click_inventory_slot "$LOADOUT_SPECIAL_SLOT" || { log "Ralos was not wielded"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick "$RIFT_CLICK_TICK" "-$NORTH_EAST_RIFT_CLICK_LEFT_PX" "-$NORTH_EAST_RIFT_CLICK_UP_PX" || { log "the north-east rift was not clicked with Ralos"; return 1; }
  fight_tick_at_least "$RIFT_RALOS_LAST_TICK" 30000 || { log "the Ralos rifts drill never stepped to P4 tick ${RIFT_RALOS_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/rift-ralos.json"
  ab console >"$VERIFY_DIR/rift-ralos-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/rift-ralos-page-errors.json" || { log "page error capture failed"; return 1; }

  ab open "${URL}${RIFT_QUERY}&setup=melee" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the melee rifts drill never loaded"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick "$RIFT_CLICK_TICK" "-$NORTH_EAST_RIFT_CLICK_LEFT_PX" "-$NORTH_EAST_RIFT_CLICK_UP_PX" || { log "the north-east rift was not clicked with the scythe"; return 1; }
  shot_after_tick "$RIFT_MELEE_SPLAT_TICK" 0 rift-melee-hit.png || { log "melee rift hit screenshot failed"; return 1; }
  fight_tick_at_least "$RIFT_MELEE_LAST_TICK" 30000 || { log "the melee rifts drill never stepped to P4 tick ${RIFT_MELEE_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/rift-melee.json"
  ab console >"$VERIFY_DIR/rift-melee-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/rift-melee-page-errors.json" || { log "page error capture failed"; return 1; }

  ab open "${URL}${DEFLECT_QUERY}" >/dev/null || return 1
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick "$DEFLECT_CLICK_TICK" "$RISEN_BOSS_CLICK_RIGHT_PX" "$RISEN_BOSS_CLICK_DOWN_PX" || { log "the risen boss was not clicked"; return 1; }
  shot_after_tick "$DEFLECT_HOVER_SHOT_TICK" 0 hover-out-of-reach.png || { log "hovering boss screenshot failed"; return 1; }
  shot_after_tick "$DEFLECT_BLOCKED_SHOT_TICK" 0 deflect-blocked.png || { log "deflected attack screenshot failed"; return 1; }
  fight_tick_at_least "$DEFLECT_LAST_TICK" 60000 || { log "the deflect drill never stepped to P4 tick ${DEFLECT_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/deflect.json"
  ab console >"$VERIFY_DIR/deflect-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/deflect-page-errors.json" || { log "page error capture failed"; return 1; }

  ab open "${URL}${REFLECT_QUERY}" >/dev/null || return 1
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick "$REFLECT_CLICK_TICK" 0 "-$REFLECT_BOSS_CLICK_UP_PX" || { log "the landed boss was not clicked"; return 1; }
  shot_after_tick "$REFLECT_NONE_SHOT_TICK" 0 reflect-none.png || { log "unreflected hit screenshot failed"; return 1; }
  shot_after_tick "$REFLECT_HIT_SHOT_TICK" 0 reflect-hit.png || { log "reflected hit screenshot failed"; return 1; }
  fight_tick_at_least "$REFLECT_LAST_TICK" 60000 || { log "the reflect drill never stepped to P4 tick ${REFLECT_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/reflect.json"
  ab console >"$VERIFY_DIR/reflect-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/reflect-page-errors.json" || { log "page error capture failed"; return 1; }
}

invincible_toggle() {
  open_settings || return 1
  printf '{"visible":%s,"checked":%s}\n' "$(ab --json is visible "#invincible" | json data.visible)" "$(ab --json is checked "#invincible" | json data.checked)"
}

drive_invincible() {
  local search toggle
  ab open "${URL}${DRILL_QUERY}" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the default drill never took its first P4 step"; return 1; }
  invincible_toggle >"$VERIFY_DIR/invincible-default.json" || { log "invincible toggle capture failed"; return 1; }
  ab open "${URL}${INVINCIBLE_QUERY}" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the invincible drill never took its first P4 step"; return 1; }
  invincible_toggle >"$VERIFY_DIR/invincible-linked.json" || { log "invincible toggle capture failed"; return 1; }
  fight_tick_at_least "$INVINCIBLE_LAST_TICK" 90000 || { log "the invincible drill never stepped to P4 tick ${INVINCIBLE_LAST_TICK}"; return 1; }
  ab wait "$CHAT_POLL_WAIT_MS" >/dev/null
  ab screenshot "$VERIFY_DIR/invincible.png" >/dev/null || { log "invincible screenshot failed"; return 1; }
  ab --json get text "#game_chat" >"$VERIFY_DIR/invincible-chat.json" || { log "chat text capture failed"; return 1; }
  probe "log()" >"$VERIFY_DIR/invincible.json"
  ab console >"$VERIFY_DIR/invincible-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/invincible-page-errors.json" || { log "page error capture failed"; return 1; }
  restart_run || return 1
  search="$(ab --json eval "location.search" | json data.result)" || return 1
  toggle="$(invincible_toggle)" || { log "invincible toggle capture failed"; return 1; }
  node -e 'console.log(JSON.stringify({ search: process.argv[1], toggle: JSON.parse(process.argv[2]) }))' "$search" "$toggle" >"$VERIFY_DIR/invincible-restarted.json"

  ab open "${URL}${INVINCIBLE_ORB_QUERY}" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the invincible full fight never took its first P4 step"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_at "$CX" $((CY - INVINCIBLE_ORB_UNDER_BOSS_CLICK_UP_PX)) || { log "the walk under the boss was not clicked"; return 1; }
  click_after_tick "$INVINCIBLE_ORB_CLICK_TICK" "$INVINCIBLE_ORB_CLICK_RIGHT_PX" "-$INVINCIBLE_ORB_CLICK_UP_PX" || { log "the walk to the orb was not clicked"; return 1; }
  fight_tick_at_least "$INVINCIBLE_ORB_LAST_TICK" 30000 || { log "the invincible full fight never stepped to P4 tick ${INVINCIBLE_ORB_LAST_TICK}"; return 1; }
  ab screenshot "$VERIFY_DIR/invincible-orb.png" >/dev/null || { log "invincible orb screenshot failed"; return 1; }
  probe "log()" >"$VERIFY_DIR/invincible-orb.json"
  ab console >"$VERIFY_DIR/invincible-orb-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/invincible-orb-page-errors.json" || { log "page error capture failed"; return 1; }
}

audio_contexts() {
  ab --json eval "(window.__audioContexts ?? []).map((context) => context.state)" | json data.result
}

sound_toggles() {
  open_settings || return 1
  printf '{"sound":{"visible":%s,"checked":%s},"areaSound":{"visible":%s,"checked":%s}}\n' \
    "$(ab --json is visible "#sound" | json data.visible)" "$(ab --json is checked "#sound" | json data.checked)" \
    "$(ab --json is visible "#area_sound" | json data.visible)" "$(ab --json is checked "#area_sound" | json data.checked)"
}

audio_resumed() {
  ab wait --fn "(window.__audioContexts ?? []).length > 0 && window.__audioContexts.every((context) => context.state === 'running')" --timeout 5000 >/dev/null
}

drive_cues() {
  local BROWSER_SESSION="${BROWSER_SESSION}-autoplay"
  echo "$AUTOPLAY_POLICY_JS" >"$VERIFY_DIR/autoplay-policy.js"
  ab --init-script "$VERIFY_DIR/autoplay-policy.js" set viewport 1280 800 >/dev/null || { log "the autoplay session did not start"; return 1; }
  ab open "${URL}${CUE_QUERY}" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the fresh cue drill never started"; return 1; }
  record_audio_starts || { log "the audio probe was not installed"; return 1; }
  audio_contexts >"$VERIFY_DIR/cue-contexts-fresh.json" || { log "audio context capture failed"; return 1; }
  sound_toggles >"$VERIFY_DIR/cue-toggles-fresh.json" || { log "sound toggle capture failed"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick 0 0 0 || { log "the canvas was not clicked"; return 1; }
  probe "snapshot().fight.run.tick" >"$VERIFY_DIR/cue-fresh-click.json"
  audio_resumed || log "the audio context did not resume after the canvas click"
  audio_contexts >"$VERIFY_DIR/cue-contexts-fresh-clicked.json" || { log "audio context capture failed"; return 1; }
  fight_tick_at_least "$CUE_TOGGLE_TICK" 30000 || { log "the fresh cue drill never stepped to P4 tick ${CUE_TOGGLE_TICK}"; return 1; }
  ab --json eval "window.__cueAudio" | json data.result >"$VERIFY_DIR/cue-fresh-audio.json" || { log "audio capture failed"; return 1; }
  open_settings && ab click "#area_sound" >/dev/null && ab click "#sound" >/dev/null || { log "the sound toggles were not unticked"; return 1; }
  ab --json eval "localStorage.getItem('${SOUND_SETTINGS_KEY}')" | json data.result >"$VERIFY_DIR/cue-sound-off-saved.json" || { log "saved settings capture failed"; return 1; }
  ab console >"$VERIFY_DIR/cue-fresh-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/cue-fresh-page-errors.json" || { log "page error capture failed"; return 1; }

  keep_seed && restart_run || { log "Restart did not reload the fresh cue drill"; return 1; }
  record_audio_starts || { log "the audio probe was not installed"; return 1; }
  probe "snapshot().fight.run.tick" >"$VERIFY_DIR/cue-recording-from.json"
  audio_contexts >"$VERIFY_DIR/cue-contexts-loaded.json" || { log "audio context capture failed"; return 1; }
  sound_toggles >"$VERIFY_DIR/cue-toggles-off.json" || { log "sound toggle capture failed"; return 1; }
  fight_tick_at_least "$CUE_TOGGLE_TICK" 30000 || { log "the cue drill never stepped to P4 tick ${CUE_TOGGLE_TICK}"; return 1; }
  open_settings && ab click "#area_sound" >/dev/null && ab click "#sound" >/dev/null || { log "the sound toggles were not clicked"; return 1; }
  probe "snapshot().fight.run.tick" >"$VERIFY_DIR/cue-toggle-click.json"
  audio_resumed || log "the audio context did not resume after the toggle click"
  audio_contexts >"$VERIFY_DIR/cue-contexts-toggled.json" || { log "audio context capture failed"; return 1; }
  sound_toggles >"$VERIFY_DIR/cue-toggles-on.json" || { log "sound toggle capture failed"; return 1; }
  ab --json eval "localStorage.getItem('${SOUND_SETTINGS_KEY}')" | json data.result >"$VERIFY_DIR/cue-sound-saved.json" || { log "saved settings capture failed"; return 1; }
  fight_tick_at_least "$CUE_LAST_TICK" 60000 || { log "the cue drill never stepped to P4 tick ${CUE_LAST_TICK}"; return 1; }
  ab --json eval "window.__cueAudio" | json data.result >"$VERIFY_DIR/cue-toggle-audio.json" || { log "audio capture failed"; return 1; }
  ab console >"$VERIFY_DIR/cue-toggle-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/cue-toggle-page-errors.json" || { log "page error capture failed"; return 1; }

  keep_seed && restart_run || { log "Restart did not reload the cue drill"; return 1; }
  record_audio_starts || { log "the audio probe was not installed"; return 1; }
  audio_contexts >"$VERIFY_DIR/cue-contexts-reloaded.json" || { log "audio context capture failed"; return 1; }
  sound_toggles >"$VERIFY_DIR/cue-toggles-reloaded.json" || { log "sound toggle capture failed"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick 0 0 0 || { log "the canvas was not clicked"; return 1; }
  audio_resumed || log "the audio context did not resume after the canvas click"
  audio_contexts >"$VERIFY_DIR/cue-contexts-clicked.json" || { log "audio context capture failed"; return 1; }
  fight_tick_at_least "$CUE_CHAT_BEFORE_TICK" 30000 || { log "the cue drill never stepped to P4 tick ${CUE_CHAT_BEFORE_TICK}"; return 1; }
  ab --json get text "#game_chat" >"$VERIFY_DIR/cue-chat-before.json" || { log "chat text capture failed"; return 1; }
  fight_tick_at_least "$CUE_CHAT_TICK" 30000 || { log "the cue drill never stepped to the lifeforce tell at P4 tick ${CUE_CHAT_TICK}"; return 1; }
  ab wait "$CHAT_POLL_WAIT_MS" >/dev/null
  ab --json get text "#game_chat" >"$VERIFY_DIR/cue-chat.json" || { log "chat text capture failed"; return 1; }
  fight_tick_at_least "$CUE_LAST_TICK" 60000 || { log "the reloaded cue drill never stepped to P4 tick ${CUE_LAST_TICK}"; return 1; }
  probe "log()" >"$VERIFY_DIR/cues.json"
  ab --json eval "window.__cueAudio" | json data.result >"$VERIFY_DIR/cue-audio.json" || { log "audio capture failed"; return 1; }
  ab console >"$VERIFY_DIR/cue-console.log" 2>&1 || { log "console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/cue-page-errors.json" || { log "page error capture failed"; return 1; }
  ab close >/dev/null 2>&1
}

menu_state() {
  ab --json eval "(() => {
    const visible = (id) => document.getElementById(id)?.checkVisibility() === true;
    const box = (id) => { const r = document.getElementById(id)?.getBoundingClientRect(); return r ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : null; };
    return {
      expanded: document.getElementById('settings')?.getAttribute('aria-expanded') ?? null,
      menu: visible('settings_menu'),
      controls: Object.fromEntries(${MENU_CONTROLS}.map((id) => [id, visible(id)])),
      buttons: { settings: visible('settings'), restart: visible('restart') },
      credit: visible('credit_line'),
      menuBox: box('settings_menu'),
      viewport: { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth },
    };
  })()" | json data.result
}

menu_open_close() {
  local name=$1 closed opened second
  ab open "${URL}${MENU_QUERY}" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the ${name} menu page never took its first P4 step" >&2; return 1; }
  closed="$(menu_state)" || return 1
  ab screenshot "$VERIFY_DIR/menu-closed-${name}.png" >/dev/null || { log "closed ${name} menu screenshot failed" >&2; return 1; }
  ab click "#settings" >/dev/null && ab wait 300 >/dev/null || { log "the ${name} Settings button was not clicked" >&2; return 1; }
  opened="$(menu_state)" || return 1
  ab screenshot "$VERIFY_DIR/menu-open-${name}.png" >/dev/null || { log "open ${name} menu screenshot failed" >&2; return 1; }
  ab click "#settings" >/dev/null && ab wait 300 >/dev/null || { log "the ${name} Settings button was not clicked again" >&2; return 1; }
  second="$(menu_state)" || return 1
  printf '{"closed":%s,"open":%s,"secondClick":%s}\n' "$closed" "$opened" "$second"
}

drive_settings_menu() {
  local desktop small mobile escape outside inside
  desktop="$(menu_open_close desktop)" || return 1
  open_settings && ab wait 300 >/dev/null && ab press Escape >/dev/null && ab wait 300 >/dev/null || { log "Escape was not pressed on the open menu"; return 1; }
  escape="$(menu_state)" || return 1
  open_settings && ab wait 300 >/dev/null && ab click "#seed" >/dev/null && ab wait 300 >/dev/null || { log "the seed box was not clicked in the open menu"; return 1; }
  inside="$(menu_state)" || return 1
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_at "$CX" "$CY" && ab wait 300 >/dev/null || { log "the canvas was not clicked with the menu open"; return 1; }
  outside="$(menu_state)" || return 1
  ab --json errors | json data.errors >"$VERIFY_DIR/menu-page-errors.json" || { log "page error capture failed"; return 1; }

  ab set viewport $MENU_SMALL_VIEWPORT >/dev/null || return 1
  small="$(menu_open_close small)" || return 1
  ab --json errors | json data.errors >"$VERIFY_DIR/menu-small-page-errors.json" || { log "page error capture failed"; return 1; }
  ab set viewport 1280 800 >/dev/null || return 1

  local BROWSER_SESSION="${BROWSER_SESSION}-mobile"
  ab set device "$MENU_MOBILE_DEVICE" >/dev/null || { log "the mobile session did not start"; return 1; }
  mobile="$(menu_open_close mobile)" || return 1
  ab --json errors | json data.errors >"$VERIFY_DIR/menu-mobile-page-errors.json" || { log "page error capture failed"; return 1; }
  ab close >/dev/null 2>&1

  printf '{"desktop":%s,"small":%s,"mobile":%s,"escape":%s,"inside":%s,"outside":%s}\n' "$desktop" "$small" "$mobile" "$escape" "$inside" "$outside" >"$VERIFY_DIR/menu.json"
  node -e '
    const fs = require("fs"), dir = process.argv[1], controls = JSON.parse(process.argv[2]);
    const menu = JSON.parse(fs.readFileSync(`${dir}/menu.json`, "utf8"));
    const errors = ["menu-page-errors.json", "menu-small-page-errors.json", "menu-mobile-page-errors.json"].map((file) => JSON.parse(fs.readFileSync(`${dir}/${file}`, "utf8")));
    const views = [menu.desktop, menu.small, menu.mobile];
    const closed = (s) => s.expanded === "false" && s.menu === false && controls.every((id) => s.controls[id] === false) && s.buttons.settings && s.buttons.restart && s.credit;
    const noPageScroll = (s) => s.viewport.scrollWidth <= s.viewport.width;
    const inViewport = (s) => s.menuBox.left >= 0 && s.menuBox.top >= 0 && s.menuBox.right <= s.viewport.width && s.menuBox.bottom <= s.viewport.height;
    const checks = {
      menuHiddenUntilOpened: views.every((view) => closed(view.closed) && noPageScroll(view.closed)),
      menuOpensWithEveryControl: views.every((view) => view.open.expanded === "true" && view.open.menu && controls.every((id) => view.open.controls[id] === true) && view.open.buttons.restart && view.open.credit),
      menuFitsEveryViewport: views.every((view) => inViewport(view.open) && noPageScroll(view.open)) && menu.small.open.viewport.width === 800 && menu.mobile.open.viewport.width < 500,
      menuClosesOnSecondClick: views.every((view) => closed(view.secondClick)),
      menuClosesOnEscape: closed(menu.escape),
      menuStaysOpenOnInsideClick: menu.inside.expanded === "true" && menu.inside.menu === true,
      menuClosesOnOutsideClick: closed(menu.outside),
      noMenuPageErrors: errors.every((list) => list.length === 0),
    };
    console.log(JSON.stringify(checks, null, 2));
    process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
  ' "$VERIFY_DIR" "$MENU_CONTROLS" >"$VERIFY_DIR/menu-checks.json"
  local verdict=$?
  cat "$VERIFY_DIR/menu-checks.json"
  [[ $verdict -eq 0 ]] || log "a settings menu check failed"
  return $verdict
}

result_panel() {
  ab --json eval "(() => {
    const panel = document.getElementById('run_result');
    return {
      visible: panel?.checkVisibility() === true,
      lines: panel ? [...panel.querySelectorAll('h2, p')].map((line) => line.textContent) : [],
      buttons: panel ? [...panel.querySelectorAll('button')].map((button) => button.textContent) : [],
      run: window.__archiveOcellusProbe.snapshot().fight?.run ?? null,
    };
  })()" | json data.result
}

next_run() {
  ab --json eval "(() => { const probe = window.__archiveOcellusProbe; return { search: location.search, seed: probe.log().header.seed, bossHp: probe.snapshot().fight?.boss.hp ?? null, panel: document.getElementById('run_result') !== null }; })()" | json data.result
}

click_result() {
  local loaded
  loaded="$(ab --json eval "performance.timeOrigin" | json data.result)" || return 1
  ab click "#$1" >/dev/null || return 1
  ab wait --fn "performance.timeOrigin !== ${loaded} && (window.__archiveOcellusProbe?.snapshot().fight?.run.tick ?? -1) >= 0" --timeout 120000 >/dev/null || { log "#$1 never loaded a new run"; return 1; }
}

drive_run_results() {
  local start
  ab open "${URL}${DEATH_RESULT_QUERY}" >/dev/null || return 1
  ab wait --fn "window.__archiveOcellusProbe?.snapshot().fight?.run.kind === 'ended'" --timeout 120000 >/dev/null || { log "the player on the flood never died"; return 1; }
  ab wait "$CHAT_POLL_WAIT_MS" >/dev/null
  result_panel >"$VERIFY_DIR/death-result.json" || { log "death result capture failed"; return 1; }
  ab screenshot "$VERIFY_DIR/death-result.png" >/dev/null || { log "death result screenshot failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/death-result-page-errors.json" || { log "page error capture failed"; return 1; }
  click_result result_restart || return 1
  next_run >"$VERIFY_DIR/death-restart.json" || { log "restarted run capture failed"; return 1; }

  ab open "${URL}${KILL_RESULT_QUERY}" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the bosshp drill never took its first P4 step"; return 1; }
  start="$(next_run)" || return 1
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick "$KILL_RESULT_CLICK_TICK" "$RISEN_BOSS_CLICK_RIGHT_PX" "$RISEN_BOSS_CLICK_DOWN_PX" || { log "the boss was not clicked"; return 1; }
  ab wait --fn "window.__archiveOcellusProbe.snapshot().fight?.run.kind === 'ended'" --timeout 60000 >/dev/null || { log "the bosshp run never ended"; return 1; }
  ab wait "$CHAT_POLL_WAIT_MS" >/dev/null
  result_panel >"$VERIFY_DIR/kill-result.json" || { log "kill result capture failed"; return 1; }
  ab screenshot "$VERIFY_DIR/kill-result.png" >/dev/null || { log "kill result screenshot failed"; return 1; }
  ab set viewport $MENU_SMALL_VIEWPORT >/dev/null && ab wait 600 >/dev/null && ab screenshot "$VERIFY_DIR/kill-result-small.png" >/dev/null || { log "small kill result screenshot failed"; return 1; }
  ab set viewport 1280 800 >/dev/null && ab wait 600 >/dev/null || return 1
  ab --json errors | json data.errors >"$VERIFY_DIR/kill-result-page-errors.json" || { log "page error capture failed"; return 1; }
  click_result result_retry || return 1
  printf '{"start":%s,"retry":%s}\n' "$start" "$(next_run)" >"$VERIFY_DIR/kill-retry.json" || { log "retried run capture failed"; return 1; }

  node -e '
    const fs = require("fs"), [dir, deathLines, killLines, buttons, killBossHp] = process.argv.slice(1);
    const read = (file) => JSON.parse(fs.readFileSync(`${dir}/${file}`, "utf8"));
    const [death, restart, kill, retry] = ["death-result.json", "death-restart.json", "kill-result.json", "kill-retry.json"].map(read);
    const params = (search) => Object.fromEntries(new URLSearchParams(search));
    const same = (a, b) => JSON.stringify(a) === b;
    const checks = {
      deathResultShown: death.visible && same(death.lines, deathLines) && same(death.buttons, buttons) && death.run?.kind === "ended" && death.run.reason === "death" && death.run.at === 54,
      resultRestartDrawsFreshSeed: same(params(restart.search), JSON.stringify({ focus: "void-floor", setup: "ranged" })) && restart.seed !== 1 && restart.panel === false,
      bossHpLinkStartsLow: retry.start.bossHp === Number(killBossHp) && same(params(retry.start.search), JSON.stringify({ seed: "4", bosshp: killBossHp })),
      killResultShown: kill.visible && same(kill.lines, killLines) && same(kill.buttons, buttons) && kill.run?.kind === "ended" && kill.run.reason === "kill" && kill.run.at === 16,
      retryReplaysSeedAndBossHp: same(params(retry.retry.search), JSON.stringify({ seed: "4", bosshp: killBossHp, setup: "ranged", focus: "full-fight" })) &&
        retry.retry.seed === 4 && retry.retry.bossHp === Number(killBossHp) && retry.retry.panel === false,
      noResultPageErrors: ["death-result-page-errors.json", "kill-result-page-errors.json"].map(read).every((list) => list.length === 0),
    };
    console.log(JSON.stringify(checks, null, 2));
    process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
  ' "$VERIFY_DIR" "$DEATH_RESULT_LINES" "$KILL_RESULT_LINES" "$RESULT_BUTTONS" "$KILL_RESULT_BOSS_HP" >"$VERIFY_DIR/result-checks.json"
  local verdict=$?
  cat "$VERIFY_DIR/result-checks.json"
  [[ $verdict -eq 0 ]] || log "a run result check failed"
  return $verdict
}

telemetry_box() {
  ab --json eval "({ checked: document.getElementById('perf_data')?.checked ?? null, saved: localStorage.getItem('archive-ocellus:perf-data'), version: document.getElementById('app_version')?.textContent ?? null, search: location.search })" | json data.result
}

kill_and_wait_for_beacon() {
  fight_tick_at_least 0 120000 || { log "the telemetry page never took its first P4 step"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick "$KILL_RESULT_CLICK_TICK" "$RISEN_BOSS_CLICK_RIGHT_PX" "$RISEN_BOSS_CLICK_DOWN_PX" || { log "the boss was not clicked on the telemetry page"; return 1; }
  ab wait --fn "window.__archiveOcellusProbe.snapshot().fight?.run.kind === 'ended'" --timeout 60000 >/dev/null || { log "the telemetry run never ended"; return 1; }
  ab wait "$TELEMETRY_BEACON_WAIT_MS" >/dev/null
}

drive_telemetry() {
  local before after restored
  ab network route "**/telemetry.json" --body '{"sampleRate":1}' >/dev/null && ab network route "**/t" --body '' >/dev/null || { log "the telemetry routes were not set"; ab network unroute >/dev/null; return 1; }
  ab network requests --clear >/dev/null || return 1
  ab open "${URL}${KILL_RESULT_QUERY}" >/dev/null || return 1
  kill_and_wait_for_beacon || { ab network unroute >/dev/null; return 1; }
  open_settings && ab wait 300 >/dev/null || { ab network unroute >/dev/null; return 1; }
  before="$(telemetry_box)" || return 1
  ab click "#perf_data" >/dev/null && ab press Escape >/dev/null || { log "the performance data box was not clicked"; ab network unroute >/dev/null; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/telemetry-page-errors.json" || { log "page error capture failed"; return 1; }
  click_result result_retry || { ab network unroute >/dev/null; return 1; }
  after="$(telemetry_box)" || return 1
  kill_and_wait_for_beacon || { ab network unroute >/dev/null; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/telemetry-opted-out-page-errors.json" || { log "page error capture failed"; return 1; }
  ab --json network requests | json data.requests >"$VERIFY_DIR/telemetry-requests.json" || { log "telemetry request capture failed"; return 1; }
  open_settings && ab wait 300 >/dev/null && ab click "#perf_data" >/dev/null && ab press Escape >/dev/null || { log "the performance data box was not ticked again"; ab network unroute >/dev/null; return 1; }
  restored="$(telemetry_box)" || return 1
  ab network unroute >/dev/null || { log "the telemetry routes were not lifted"; return 1; }
  printf '{"before":%s,"after":%s,"restored":%s}\n' "$before" "$after" "$restored" >"$VERIFY_DIR/telemetry-box.json"

  node -e '
    const fs = require("fs"), [dir, fields, query] = process.argv.slice(1);
    const read = (file) => JSON.parse(fs.readFileSync(`${dir}/${file}`, "utf8"));
    const [requests, box, errors, optedOutErrors] = ["telemetry-requests.json", "telemetry-box.json", "telemetry-page-errors.json", "telemetry-opted-out-page-errors.json"].map(read);
    const page = (request) => new URL(request.headers.Referer ?? request.headers.referer ?? "http://unknown/").search;
    const beacons = requests.filter((request) => request.method === "POST" && new URL(request.url).pathname === "/t").map((request) => ({ page: page(request), summary: JSON.parse(request.postData) }));
    const configReads = requests.filter((request) => new URL(request.url).pathname === "/telemetry.json").map(page);
    fs.writeFileSync(`${dir}/telemetry-beacons.json`, JSON.stringify(beacons, null, 2));
    const [beacon] = beacons, summary = beacon?.summary ?? {};
    const optedOutPage = box.after.search;
    const checks = {
      finishedRunSendsExactlyOneBeacon: beacons.length === 1 && beacon.page === query,
      beaconHasOnlyTheDocumentedFields: JSON.stringify(Object.keys(summary)) === fields,
      beaconDescribesTheKill: summary.end === "kill" && summary.runTicks === 16 && summary.view === "3d" && summary.sampleRate === 1 && summary.browser === "chrome" &&
        `v${summary.version}` === box.before.version && summary.frames > 0 && summary.frameMedianMs > 0 && summary.tickMedianMs > 0 && summary.tickMaxMs >= summary.tickMedianMs,
      optOutIsSavedAndShownAfterReload: box.before.checked === true && box.before.saved === null && box.after.checked === false && box.after.saved === "off" && optedOutPage !== query,
      optedOutPageReadsNoConfigAndSendsNothing: !configReads.includes(optedOutPage) && !beacons.some((sent) => sent.page === optedOutPage),
      tickingTheBoxAgainClearsTheChoice: box.restored.checked === true && box.restored.saved === null,
      noTelemetryPageErrors: errors.length === 0 && optedOutErrors.length === 0,
    };
    console.log(JSON.stringify(checks, null, 2));
    process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
  ' "$VERIFY_DIR" "$TELEMETRY_FIELDS" "$KILL_RESULT_QUERY" >"$VERIFY_DIR/telemetry-checks.json"
  local verdict=$?
  cat "$VERIFY_DIR/telemetry-checks.json"
  [[ $verdict -eq 0 ]] || log "a telemetry check failed"
  return $verdict
}

record_get_ready() {
  ab eval '(() => {
    const now = () => window.__archiveOcellusProbe?.snapshot() ?? null;
    const record = { installedAt: now(), clickTick: null, overlay: {}, player: {} };
    window.__getReady = record;
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...rest) {
      const count = /^GET READY\.\.\.(\d+)$/.exec(String(text))?.[1];
      const t = count === undefined ? undefined : now()?.tick;
      if (t !== undefined && !(record.overlay[t] ??= []).includes(Number(count))) record.overlay[t].push(Number(count));
      return fillText.call(this, text, ...rest);
    };
    document.addEventListener("mousedown", () => { record.clickTick ??= now()?.tick ?? null; }, true);
    const frame = () => {
      const snapshot = now();
      if (snapshot?.player) record.player[snapshot.tick] = snapshot.player;
      requestAnimationFrame(frame);
    };
    frame();
  })()' >/dev/null
}

drive_get_ready() {
  ab open "${URL}${GET_READY_QUERY}" >/dev/null || return 1
  record_get_ready || { log "the GET READY probe was not installed"; return 1; }
  ab wait --fn "window.__archiveOcellusProbe?.snapshot().ticking === true && window.__archiveOcellusProbe.snapshot().tick >= ${GET_READY_CLICK_TICK}" \
    --timeout 90000 >/dev/null || { log "the GET READY page never started ticking"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_at $((CX - WALK_CLICK_LEFT_PX)) $((CY - WALK_CLICK_UP_PX)) || return 1
  fight_tick_at_least 1 30000 || { log "the boss never stepped to P4 tick 1 after GET READY"; return 1; }
  ab --json eval "window.__getReady" | json data.result >"$VERIFY_DIR/get-ready.json" || { log "GET READY capture failed"; return 1; }
  probe "log()" >"$VERIFY_DIR/get-ready-log.json"
  ab --json errors | json data.errors >"$VERIFY_DIR/get-ready-page-errors.json" || { log "page error capture failed"; return 1; }

  node -e '
    const fs = require("fs"), [dir, spawn, readyTicks] = process.argv.slice(1);
    const read = (name) => JSON.parse(fs.readFileSync(`${dir}/${name}`, "utf8"));
    const [ready, log, errors] = ["get-ready.json", "get-ready-log.json", "get-ready-page-errors.json"].map(read);
    const from = JSON.parse(spawn), countdown = Number(readyTicks);
    const overlay = Object.entries(ready.overlay).map(([tick, counts]) => [Number(tick), counts]).sort(([a], [b]) => a - b);
    const firstStep = Object.entries(ready.player).map(([tick, at]) => [Number(tick), at]).sort(([a], [b]) => a - b)
      .find(([, at]) => at.x !== from.x || at.y !== from.y)?.[0] ?? null;
    const firstBossStep = log.rows[0] ? [log.rows[0].tick, log.rows[0].worldTick] : null;
    const checks = {
      getReadyRecordedFromWorldTickZero: ready.installedAt?.tick === 0,
      getReadyCountsDownOncePerWorldTick: JSON.stringify(overlay) === JSON.stringify(Array.from({ length: countdown }, (_, tick) => [tick, [countdown - tick]])),
      firstBossStepEndsGetReady: JSON.stringify(firstBossStep) === JSON.stringify([0, countdown]),
      clickDuringGetReadyWalksBeforeItEnds: ready.clickTick !== null && ready.clickTick < countdown && firstStep !== null && firstStep > ready.clickTick && firstStep < countdown,
      noGetReadyPageErrors: errors.length === 0,
    };
    console.log(JSON.stringify({ overlay, clickTick: ready.clickTick, firstStep, firstBossStep, checks }, null, 2));
    process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
  ' "$VERIFY_DIR" "$SPAWN_TILE" "$GET_READY_TICKS" >"$VERIFY_DIR/get-ready-checks.json"
  local verdict=$?
  cat "$VERIFY_DIR/get-ready-checks.json"
  [[ $verdict -eq 0 ]] || log "a GET READY check failed"
  return $verdict
}

drive_load_retry() {
  local file opened deadline
  file="$(node -p 'require(process.argv[1]).assets["npc-" + process.argv[2]].file' "$MANIFEST" "$BOSS_NPC")" || { log "the boss asset is not in the manifest"; return 1; }
  ab open about:blank >/dev/null || return 1
  ab network har start --content none >/dev/null || { log "HAR recording did not start"; return 1; }
  ab network route "**/osrs-assets/${file}" --abort >/dev/null || { log "the boss asset route was not set"; return 1; }
  ab network requests --clear >/dev/null || return 1
  ab open "${URL}${LOAD_RETRY_QUERY}" >/dev/null &
  opened=$!
  deadline=$((SECONDS + 90))
  until [[ "$(ab --json network requests --filter "$file" | json data.requests.length)" -gt 0 ]]; do
    (( SECONDS < deadline )) || { log "the page never requested the boss asset"; ab network unroute >/dev/null; wait "$opened"; return 1; }
  done
  ab network unroute >/dev/null || { log "the boss asset route was not lifted"; return 1; }
  wait "$opened" || return 1
  ab wait --fn "window.__archiveOcellusProbe?.snapshot().tick >= 8" --timeout 90000 >/dev/null || log "the trainer never started ticking after the dropped boss asset"
  ab network har stop "$VERIFY_DIR/load-retry.har" >/dev/null || { log "HAR capture failed"; return 1; }
  ab --json network requests --filter "favicon.ico" | json data.requests >"$VERIFY_DIR/load-favicon-requests.json" || { log "favicon request capture failed"; return 1; }
  ab --json eval "({ text: document.body.innerText, tick: window.__archiveOcellusProbe?.snapshot().tick ?? null })" | json data.result >"$VERIFY_DIR/load-retry.json" || { log "load state capture failed"; return 1; }
  ab screenshot "$VERIFY_DIR/load-retry.png" >/dev/null || { log "load retry screenshot failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/load-retry-page-errors.json" || { log "page error capture failed"; return 1; }

  node -e '
    const fs = require("fs"), [dir, file] = process.argv.slice(1);
    const read = (name) => JSON.parse(fs.readFileSync(`${dir}/${name}`, "utf8"));
    const attempts = read("load-retry.har").log.entries.filter((entry) => entry.request.url.endsWith(`/osrs-assets/${file}`)).map((entry) => entry.response.status);
    const [page, favicon, errors] = ["load-retry.json", "load-favicon-requests.json", "load-retry-page-errors.json"].map(read);
    const checks = {
      droppedBossAssetRetried: attempts.length >= 2 && attempts[0] === 0 && attempts[attempts.length - 1] === 200,
      trainerLoadsAfterTheDrop: page.tick >= 8 && !page.text.includes("Loading failed"),
      noFaviconRequest: favicon.length === 0,
      noLoadRetryPageErrors: errors.length === 0,
    };
    console.log(JSON.stringify({ attempts, favicon: favicon.map((request) => request.url), checks }, null, 2));
    process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
  ' "$VERIFY_DIR" "$file" >"$VERIFY_DIR/load-checks.json"
  local verdict=$?
  cat "$VERIFY_DIR/load-checks.json"
  [[ $verdict -eq 0 ]] || log "a load check failed"
  return $verdict
}

whats_new_state() {
  ab --json eval "(() => {
    const visible = (element) => element?.checkVisibility() === true;
    const box = (id) => { const r = document.getElementById(id)?.getBoundingClientRect(); return r ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : null; };
    const panel = document.getElementById('whats_new_panel');
    const version = document.getElementById('app_version');
    return {
      settingsDot: visible(document.querySelector('#settings .unseen_dot')),
      menuDot: visible(document.querySelector('#whats_new .unseen_dot')),
      whatsNewButton: visible(document.getElementById('whats_new')),
      menu: visible(document.getElementById('settings_menu')),
      panel: visible(panel),
      releases: [...(panel?.querySelectorAll('article') ?? [])].map((release) => ({ version: release.querySelector('h3')?.textContent ?? null, notes: [...release.querySelectorAll('li')].map((note) => note.textContent) })),
      panelBox: box('whats_new_panel'),
      credit: document.getElementById('credit_line')?.textContent ?? null,
      version: visible(version) ? version.textContent : null,
      creditBox: box('credit_line'),
      versionBox: box('app_version'),
      seen: localStorage.getItem('archive-ocellus:seen-release'),
      focused: document.activeElement?.id || null,
      focusedVisible: visible(document.activeElement),
      viewport: { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth },
    };
  })()" | json data.result
}

open_whats_new_page() {
  ab open "${URL}${MENU_QUERY}" >/dev/null && fight_tick_at_least 0 120000 || { log "the What's new page never took its first P4 step"; return 1; }
}

drive_whats_new() {
  local notes first menu opened small phone closed escape key_menu key_opened key_closed key_escaped reloaded reopened
  notes="$(node scripts/release-notes.mjs)" || { log "release-notes.mjs rejected the changelog"; return 1; }
  open_whats_new_page || return 1
  first="$(whats_new_state)" || return 1
  ab screenshot "$VERIFY_DIR/whats-new-unseen.png" >/dev/null || { log "unseen What's new screenshot failed"; return 1; }
  ab click "#settings" >/dev/null && ab wait 300 >/dev/null || { log "the Settings button was not clicked"; return 1; }
  menu="$(whats_new_state)" || return 1
  ab click "#whats_new" >/dev/null && ab wait 300 >/dev/null || { log "the What's new button was not clicked"; return 1; }
  opened="$(whats_new_state)" || return 1
  ab screenshot "$VERIFY_DIR/whats-new-open.png" >/dev/null || { log "open What's new screenshot failed"; return 1; }
  ab set viewport $MENU_SMALL_VIEWPORT >/dev/null && ab wait 300 >/dev/null || return 1
  small="$(whats_new_state)" || return 1
  ab screenshot "$VERIFY_DIR/whats-new-small.png" >/dev/null || { log "small What's new screenshot failed"; return 1; }
  ab set viewport $WHATS_NEW_PHONE_VIEWPORT >/dev/null && ab wait 300 >/dev/null || return 1
  phone="$(whats_new_state)" || return 1
  ab screenshot "$VERIFY_DIR/whats-new-phone.png" >/dev/null || { log "phone What's new screenshot failed"; return 1; }
  ab set viewport 1280 800 >/dev/null && ab wait 300 >/dev/null || return 1
  ab click "#whats_new_close" >/dev/null && ab wait 300 >/dev/null || { log "the What's new Close button was not clicked"; return 1; }
  closed="$(whats_new_state)" || return 1
  open_settings && ab click "#whats_new" >/dev/null && ab wait 300 >/dev/null && ab press Escape >/dev/null && ab wait 300 >/dev/null || { log "Escape was not pressed on the open What's new panel"; return 1; }
  escape="$(whats_new_state)" || return 1
  ab focus "#settings" >/dev/null && ab press Enter >/dev/null && ab press Shift+Tab >/dev/null && ab wait 300 >/dev/null || { log "Settings was not opened from the keyboard"; return 1; }
  key_menu="$(whats_new_state)" || return 1
  ab press Enter >/dev/null && ab wait 300 >/dev/null || { log "Enter was not pressed on What's new"; return 1; }
  key_opened="$(whats_new_state)" || return 1
  ab focus "#whats_new_close" >/dev/null && ab press Enter >/dev/null && ab wait 300 >/dev/null || { log "Enter was not pressed on Close"; return 1; }
  key_closed="$(whats_new_state)" || return 1
  ab focus "#settings" >/dev/null && ab press Enter >/dev/null && ab press Shift+Tab >/dev/null && ab press Enter >/dev/null && ab wait 300 >/dev/null && ab press Escape >/dev/null && ab wait 300 >/dev/null || { log "Escape was not pressed on the keyboard-opened panel"; return 1; }
  key_escaped="$(whats_new_state)" || return 1
  ab --json errors | json data.errors >"$VERIFY_DIR/whats-new-page-errors.json" || { log "page error capture failed"; return 1; }
  open_whats_new_page || return 1
  reloaded="$(whats_new_state)" || return 1
  ab screenshot "$VERIFY_DIR/whats-new-seen.png" >/dev/null || { log "seen What's new screenshot failed"; return 1; }
  ab click "#settings" >/dev/null && ab wait 300 >/dev/null || { log "the reloaded Settings button was not clicked"; return 1; }
  reopened="$(whats_new_state)" || return 1
  ab --json errors | json data.errors >"$VERIFY_DIR/whats-new-reload-page-errors.json" || { log "page error capture failed"; return 1; }
  ab press Escape >/dev/null

  printf '{"first":%s,"menu":%s,"opened":%s,"small":%s,"phone":%s,"closed":%s,"escape":%s,"keyMenu":%s,"keyOpened":%s,"keyClosed":%s,"keyEscaped":%s,"reloaded":%s,"reopened":%s}\n' \
    "$first" "$menu" "$opened" "$small" "$phone" "$closed" "$escape" "$key_menu" "$key_opened" "$key_closed" "$key_escaped" "$reloaded" "$reopened" >"$VERIFY_DIR/whats-new.json"
  node -e '
    const fs = require("fs"), [dir, notes, credit] = process.argv.slice(1);
    const read = (file) => JSON.parse(fs.readFileSync(`${dir}/${file}`, "utf8"));
    const w = read("whats-new.json");
    const [heading, , ...items] = notes.trimEnd().split("\n");
    const newest = { version: heading.replace(/^## /, ""), notes: items.map((item) => item.replace(/^- /, "")) };
    const inViewport = (s) => s.panelBox.left >= 0 && s.panelBox.top >= 0 && s.panelBox.right <= s.viewport.width && s.panelBox.bottom <= s.viewport.height;
    const noPageScroll = (s) => s.viewport.scrollWidth <= s.viewport.width;
    const beside = (s) => s.versionBox.left >= s.creditBox.right && s.versionBox.top < s.creditBox.bottom && s.versionBox.bottom > s.creditBox.top;
    const checks = {
      dotShownBeforeOpening: w.first.seen === null && w.first.settingsDot && !w.first.menu && !w.first.panel && w.menu.menu && w.menu.whatsNewButton && w.menu.menuDot,
      whatsNewListsNewestRelease: w.opened.panel && !w.opened.menu && w.opened.releases[0]?.version === newest.version && JSON.stringify(w.opened.releases[0].notes) === JSON.stringify(newest.notes),
      dotClearsOnOpen: !w.opened.settingsDot && w.opened.seen === newest.version,
      panelFitsEveryViewport: [w.opened, w.small, w.phone].every((s) => s.panel && inViewport(s) && noPageScroll(s)) && w.small.viewport.width === 800 && w.phone.viewport.width < 500,
      panelClosesOnCloseAndEscape: !w.closed.panel && !w.closed.menu && !w.escape.panel && !w.escape.menu,
      keyboardOpenFocusesPanelTitle: w.keyMenu.menu && w.keyMenu.focused === "whats_new" && w.keyOpened.panel && w.keyOpened.focused === "whats_new_title" && w.keyOpened.focusedVisible,
      keyboardCloseAndEscapeFocusSettings: [w.keyClosed, w.keyEscaped].every((s) => !s.panel && !s.menu && s.focused === "settings" && s.focusedVisible),
      dotStaysClearedAfterReload: w.reloaded.seen === newest.version && !w.reloaded.settingsDot && w.reopened.whatsNewButton && !w.reopened.menuDot,
      versionBesideCredit: w.first.credit === credit && w.first.version === `v${newest.version}` && beside(w.first) && w.phone.version === `v${newest.version}`,
      noWhatsNewPageErrors: ["whats-new-page-errors.json", "whats-new-reload-page-errors.json"].map(read).every((list) => list.length === 0),
    };
    console.log(JSON.stringify(checks, null, 2));
    process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
  ' "$VERIFY_DIR" "$notes" "$CREDIT_LINE" >"$VERIFY_DIR/whats-new-checks.json"
  local verdict=$?
  cat "$VERIFY_DIR/whats-new-checks.json"
  [[ $verdict -eq 0 ]] || log "a What's new check failed"
  return $verdict
}

p3_page_done() {
  probe "log()" >"$VERIFY_DIR/$1.json" || { log "$1: fight log capture failed"; return 1; }
  ab console >"$VERIFY_DIR/$1-console.log" 2>&1 || { log "$1: console capture failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/$1-page-errors.json" || { log "$1: page error capture failed"; return 1; }
}

p3_tile_samples() {
  ab --json eval "(() => {
    const probe = window.__archiveOcellusProbe, box = document.querySelector('#world').getBoundingClientRect();
    const at = (tile) => { const p = probe.tileCentre(tile); return p && { x: Math.round(box.x + p.x), y: Math.round(box.y + p.y) }; };
    return Object.fromEntries(Object.entries(${P3_ARENA_TILES}).map(([kind, tiles]) => [kind, tiles.map((tile) => ({ tile, at: at(tile) }))]));
  })()" | json data.result
}

p3_arena_page() {
  local mode=$1 samples
  save_settings "{ use3dView: $([[ "$mode" == 3d ]] && echo true || echo false) }" || { log "the ${mode} view setting was not saved"; return 1; }
  ab open "${URL}${P3_QUERY}" >/dev/null || return 1
  fight_tick_at_least "$P3_ARENA_SHOT_TICK" 120000 || { log "the ${mode} P3 drill never reached P3 tick ${P3_ARENA_SHOT_TICK}"; return 1; }
  samples="$(p3_tile_samples)" || { log "the ${mode} P3 tile pixels were not read"; return 1; }
  ab screenshot "$VERIFY_DIR/p3-arena-${mode}.png" >/dev/null || { log "the ${mode} P3 arena screenshot failed"; return 1; }
  echo "$samples" >"$VERIFY_DIR/p3-arena-${mode}-tiles.json"
}

drive_p3_drill() {
  ab open "${URL}${P3_QUERY}" >/dev/null || return 1
  p3_arena_page 2d || return 1
  ab --json errors | json data.errors >"$VERIFY_DIR/p3-arena-2d-page-errors.json" || { log "page error capture failed"; return 1; }
  p3_arena_page 3d || return 1
  record_boss_bar || { log "the boss bar probe was not installed"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick "$P3_PRAY_TICK" "$PROTECT_MELEE_RIGHT_PX" "$PROTECT_DOWN_PX" || { log "Protect from Melee was not clicked in P3"; return 1; }
  fight_tick_at_least "$P3_SWINGS_LAST_TICK" 60000 || { log "the P3 drill never reached P3 tick ${P3_SWINGS_LAST_TICK}"; return 1; }
  probe "snapshot()" >"$VERIFY_DIR/p3-snapshot.json"
  ab --json eval "window.__bossBar" | json data.result >"$VERIFY_DIR/p3-boss-bar.json" || { log "P3 boss bar capture failed"; return 1; }
  p3_page_done p3-swings || return 1

  ab open "${URL}${P3_QUERY}" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the P3 void shot page never started"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick "$P3_PRAY_TICK" "$PROTECT_MELEE_RIGHT_PX" "$PROTECT_DOWN_PX" || { log "Protect from Melee was not clicked on the void shot page"; return 1; }
  if tile_pixel p3-void-shot "$P3_FAR_EAST_TILE" "$P3_ESCAPE_TICK"; then
    click_after_tick "$P3_ESCAPE_TICK" $((CLICK_X - CX)) $((CLICK_Y - CY)) || { log "the run to the far east was not clicked"; return 1; }
  fi
  fight_tick_at_least "$P3_VOID_SHOT_LAST_TICK" 30000 || { log "the void shot page never reached P3 tick ${P3_VOID_SHOT_LAST_TICK}"; return 1; }
  p3_page_done p3-void-shot || return 1

  ab open "${URL}${P3_CLEAR_QUERY}" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the P3 interim clear page never started"; return 1; }
  tile_pixel p3-clear "$P3_BOSS_TILE" "$P3_BOSS_CLICK_TICK" || return 1
  canvas_centre || { log "canvas box unreadable"; return 1; }
  click_after_tick "$P3_BOSS_CLICK_TICK" $((CLICK_X - CX)) $((CLICK_Y - CY)) || { log "the P3 boss was not clicked"; return 1; }
  ab wait --fn "window.__archiveOcellusProbe.snapshot().fight?.run.kind === 'ended'" --timeout 30000 >/dev/null || log "the P3 run never reached the 75% break"
  ab wait "$CHAT_POLL_WAIT_MS" >/dev/null
  result_panel >"$VERIFY_DIR/p3-clear-panel.json" || { log "P3 result panel capture failed"; return 1; }
  ab screenshot "$VERIFY_DIR/p3-clear.png" >/dev/null || { log "P3 result screenshot failed"; return 1; }
  p3_page_done p3-clear || return 1
  click_result result_start_p4 || log "Start P4 loaded no new run"
  ab --json eval "(() => { const probe = window.__archiveOcellusProbe, box = document.getElementById('phase'); return { search: location.search, logPhase: probe.log().header.phase ?? null, bossHp: probe.snapshot().fight?.boss.hp ?? null, rejected: probe.snapshot().rejected, phaseBox: box ? box.value : null }; })()" |
    json data.result >"$VERIFY_DIR/p3-start-p4.json" || { log "the P4 page after Start P4 was not read"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/p3-start-p4-page-errors.json" || { log "page error capture failed"; return 1; }

  local capture
  for capture in p3-arena-2d.png p3-arena-2d-tiles.json p3-arena-2d-page-errors.json p3-arena-3d.png p3-arena-3d-tiles.json p3-snapshot.json p3-boss-bar.json \
    p3-swings.json p3-swings-console.log p3-swings-page-errors.json p3-void-shot.json p3-void-shot-console.log p3-void-shot-page-errors.json \
    p3-clear-panel.json p3-clear.png p3-clear.json p3-clear-console.log p3-clear-page-errors.json p3-start-p4.json p3-start-p4-page-errors.json; do
    [[ -s "$VERIFY_DIR/$capture" ]] || { log "required capture ${capture} is missing or empty"; return 1; }
  done

  node -e '
    const fs = require("fs"), png = require("./scripts/png-pixels.cjs"), [dir, bossNpc, swings, voidShot, clear, startP4] = process.argv.slice(1);
    const read = (file) => JSON.parse(fs.readFileSync(`${dir}/${file}`, "utf8"));
    const decode = (file) => png.decode(`${dir}/${file}`);
    const tileColours = (mode) => {
      const { width, channels, px } = decode(`p3-arena-${mode}.png`);
      const mean = ({ at }) => {
        if (!at) return null;
        const sum = [0, 0, 0];
        for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) for (let c = 0; c < 3; c++) sum[c] += px[((at.y + dy) * width + at.x + dx) * channels + c];
        return sum.map((v) => Math.round(v / 49));
      };
      return Object.fromEntries(Object.entries(read(`p3-arena-${mode}-tiles.json`)).map(([kind, tiles]) => [kind, tiles.map(mean)]));
    };
    const lum = (rgb) => (rgb[0] + rgb[1] + rgb[2]) / 3;
    const grey = (rgb) => rgb !== null && Math.abs(rgb[1] - rgb[2]) < 20;
    const arena = Object.fromEntries(["2d", "3d"].map((mode) => [mode, tileColours(mode)]));
    const arenaDrawn = ({ open, closed, rim }) => [...open, ...closed].every(grey) && rim.every((rgb) => rgb !== null && rgb[1] - rgb[2] >= 20) &&
      Math.min(...open.map(lum)) >= Math.max(...closed.map(lum)) + 12;
    const hits = (log) => log.rows.flatMap((row) => row.events).filter((event) => event.kind === "player-hit").map(({ at, hit, receipt }) => [at, hit.kind, receipt.requested, receipt.applied, receipt.prayer]);
    const [snapshot, bar, swingLog, voidLog, clearLog, panel, p4] = ["p3-snapshot.json", "p3-boss-bar.json", "p3-swings.json", "p3-void-shot.json", "p3-clear.json", "p3-clear-panel.json", "p3-start-p4.json"].map(read);
    const expectedClear = JSON.parse(clear), expectedStart = JSON.parse(startP4);
    const clearedAt = clearLog.rows.find((row) => row.events.some((event) => event.kind === "run-ended"));
    const observed = {
      arena,
      bossBar: [...new Set(Object.values(bar).flat())],
      swings: hits(swingLog).filter(([at]) => at <= 20),
      prayerOrders: swingLog.rows.flatMap((row) => row.inputs.filter((input) => input.kind === "prayer-published").map((input) => [row.tick, input.prayer])),
      voidShot: hits(voidLog).filter(([at]) => at <= 10),
      escape: voidLog.rows.flatMap((row) => row.inputs.filter((input) => input.kind === "walk-ordered").map((input) => [row.tick, input.destination])),
      clear: { panel: { lines: panel.lines, buttons: panel.buttons }, run: panel.run, row: clearedAt && { tick: clearedAt.tick, bossHp: clearedAt.bossHp, events: clearedAt.events.map((event) => event.kind) } },
      startP4: p4,
    };
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const checks = {
      p3BossIsNpc16677: swingLog.header.phase === "p3" && snapshot.fight?.boss.npcId === Number(bossNpc) && snapshot.fight.boss.visible && observed.bossBar.includes("5250 / 5250 (100.0%)"),
      p3ArenaDrawn: arenaDrawn(arena["2d"]) && arenaDrawn(arena["3d"]),
      p3SwingsChipUnderMeleePrayer: observed.prayerOrders.length > 0 && observed.prayerOrders[0][0] < 7 && observed.prayerOrders[0][1] === "melee" && same(observed.swings, JSON.parse(swings)),
      p3VoidShotOutOfReach: same(observed.voidShot, JSON.parse(voidShot)) && observed.escape.length === 1,
      p3InterimClear: same(observed.clear.panel, expectedClear.panel) && observed.clear.run?.kind === "ended" && observed.clear.run.reason.kind === "quadrant-cleared" &&
        observed.clear.row?.tick === expectedClear.tick && observed.clear.run.at === expectedClear.tick && observed.clear.row.bossHp.atPostTick === expectedClear.bossHp && observed.clear.row.events.includes("run-ended"),
      p3StartP4OpensP4: p4.search === expectedStart.search && p4.bossHp === expectedStart.bossHp && same(p4.rejected, []) && p4.logPhase === null && p4.phaseBox === "p4",
      noP3PageErrors: ["p3-arena-2d-page-errors.json", "p3-swings-page-errors.json", "p3-void-shot-page-errors.json", "p3-clear-page-errors.json", "p3-start-p4-page-errors.json"].map(read).every((list) => list.length === 0),
    };
    console.log(JSON.stringify({ observed, checks }, null, 2));
    process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
  ' "$VERIFY_DIR" "$BOSS_NPC" "$P3_SWINGS" "$P3_VOID_SHOT" "$P3_CLEAR" "$P3_START_P4" >"$VERIFY_DIR/p3-checks.json"
  local verdict=$?
  cat "$VERIFY_DIR/p3-checks.json"
  [[ $verdict -eq 0 ]] || log "a P3 drill check failed"
  return $verdict
}

p3_smite_page() {
  local name=$1 start=$2 last=$3 query="$P3_SMITE_QUERY" after
  shift 3
  [[ "$start" == 1 ]] || query="${query}&start=${start}"
  ab open "${URL}${query}" >/dev/null || return 1
  fight_tick_at_least 0 120000 || { log "the P3 smite ${name} page never started"; return 1; }
  canvas_centre || { log "canvas box unreadable"; return 1; }
  for after in "$@"; do
    click_after_tick "$after" "$PROTECT_MELEE_RIGHT_PX" "$PROTECT_DOWN_PX" || { log "Protect from Melee was not clicked after P3 tick ${after} on the ${name} page"; return 1; }
  done
  fight_tick_at_least "$last" 30000 || { log "the P3 smite ${name} page never reached P3 tick ${last}"; return 1; }
  ab wait "$CHAT_POLL_WAIT_MS" >/dev/null
  ab --json eval "[...document.querySelectorAll('#game_chat li')].map((line) => line.textContent)" | json data.result >"$VERIFY_DIR/p3-smite-${name}-chat.json" || { log "the ${name} chat was not read"; return 1; }
  p3_page_done "p3-smite-${name}"
}

p3_blades_page() {
  local mode=$1
  save_settings "{ use3dView: $([[ "$mode" == 3d ]] && echo true || echo false) }" || { log "the ${mode} view setting was not saved"; return 1; }
  ab open "${URL}${P3_SMITE_QUERY}" >/dev/null || return 1
  fight_tick_at_least "$P3_BLADES_CONTROL_TICK" 120000 || { log "the ${mode} blades page never reached P3 tick ${P3_BLADES_CONTROL_TICK}"; return 1; }
  ab screenshot "$VERIFY_DIR/p3-blades-${mode}-${P3_BLADES_CONTROL_TICK}.png" >/dev/null || return 1
  fight_tick_at_least "$P3_BLADES_TICK" 30000 || { log "the ${mode} blades page never reached P3 tick ${P3_BLADES_TICK}"; return 1; }
  ab screenshot "$VERIFY_DIR/p3-blades-${mode}-${P3_BLADES_TICK}.png" >/dev/null || return 1
  ab --json errors | json data.errors >"$VERIFY_DIR/p3-blades-${mode}-page-errors.json" || { log "page error capture failed"; return 1; }
}

drive_p3_smite() {
  local page args
  ab open "${URL}${P3_SMITE_QUERY}" >/dev/null || return 1
  save_settings "{ use3dView: true }" || { log "the 3D view setting was not saved"; return 1; }
  for page in "${P3_SMITE_PAGES[@]}"; do
    read -ra args <<<"$page"
    p3_smite_page "${args[@]}" || return 1
  done
  p3_blades_page 3d || return 1
  p3_blades_page 2d || return 1
  canvas_centre || { log "canvas box unreadable"; return 1; }

  local capture
  for capture in p3-smite-{flick,held,late,two-spins,three-spins}{.json,-chat.json,-page-errors.json} p3-blades-{3d,2d}-{"$P3_BLADES_CONTROL_TICK","$P3_BLADES_TICK"}.png p3-blades-{3d,2d}-page-errors.json; do
    [[ -s "$VERIFY_DIR/$capture" ]] || { log "required capture ${capture} is missing or empty"; return 1; }
  done

  node -e '
    const fs = require("fs"), { pixelShare } = require("./scripts/png-pixels.cjs"), [dir, spinsJson, chatJson, controlTick, bladesTick, boxJson, minJson, maxJson, cx, cy] = process.argv.slice(1);
    const read = (file) => JSON.parse(fs.readFileSync(`${dir}/${file}`, "utf8"));
    const [expectedSpins, expectedChat, box, minShare, maxControl] = [spinsJson, chatJson, boxJson, minJson, maxJson].map((text) => JSON.parse(text));
    const pages = Object.keys(expectedSpins);
    const said = (verdict) => (verdict.kind === "blocked" ? "blocked" : `struck ${verdict.why}`);
    const spins = (log) => log.rows.flatMap((row) => row.events).filter((event) => event.kind === "player-hit" && event.hit.kind === "spin").map(({ at, hit, receipt }) => [at, hit.spin.nth, hit.spin.of, said(hit.verdict), receipt.requested, receipt.applied, receipt.prayer]);
    const prayerOrders = (log) => log.rows.flatMap((row) => row.inputs.filter((input) => input.kind === "prayer-published").map((input) => [row.tick, input.prayer]));
    const area = { minX: Number(cx) - box.left, maxX: Number(cx) + box.right, minY: Number(cy) - box.up, maxY: Number(cy) + box.down };
    const looks = {
      "3d": (r, g, b) => b >= 150 && r >= 90 && g <= 90 && b - g >= 100,
      "2d": (r, g, b) => Math.abs(r - 0xb4) <= 24 && Math.abs(g - 0x8c) <= 24 && Math.abs(b - 0xff) <= 24,
    };
    const blades = Object.fromEntries(["3d", "2d"].map((mode) => [mode, Object.fromEntries([controlTick, bladesTick].map((t) => [t, pixelShare(`${dir}/p3-blades-${mode}-${t}.png`, looks[mode], area)]))]));
    const observed = Object.fromEntries(pages.map((page) => {
      const log = read(`p3-smite-${page}.json`);
      return [page, { spins: spins(log), prayerOrders: prayerOrders(log), chat: read(`p3-smite-${page}-chat.json`) }];
    }));
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const spun = (page) => same(observed[page].spins, expectedSpins[page]);
    const drawn = (mode) => blades[mode][bladesTick] >= minShare[mode] && blades[mode][controlTick] <= maxControl[mode];
    const checks = {
      p3SmiteFlickedOnPrayerTab: spun("flick") && observed.flick.prayerOrders.length === 3,
      p3HeldPrayerTakesSpin: spun("held") && observed.held.chat.includes(expectedChat.held),
      p3LateFlickTakesSpin: spun("late") && observed.late.chat.includes(expectedChat.late),
      p3TwoSpinFlick: spun("two-spins"),
      p3ThreeSpinFlick: spun("three-spins"),
      smiteBladesDrawn: drawn("3d") && drawn("2d"),
      noP3SmitePageErrors: [...pages.map((page) => `p3-smite-${page}-page-errors.json`), "p3-blades-3d-page-errors.json", "p3-blades-2d-page-errors.json"].map(read).every((list) => list.length === 0),
    };
    console.log(JSON.stringify({ observed: { ...observed, blades, area }, checks }, null, 2));
    process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
  ' "$VERIFY_DIR" "$P3_SMITE_SPINS" "$P3_SMITE_CHAT" "$P3_BLADES_CONTROL_TICK" "$P3_BLADES_TICK" "$P3_BLADES_BOX" "$P3_BLADES_MIN_SHARE" "$P3_BLADES_MAX_CONTROL_SHARE" "$CX" "$CY" >"$VERIFY_DIR/p3-smite-checks.json"
  local verdict=$?
  cat "$VERIFY_DIR/p3-smite-checks.json"
  [[ $verdict -eq 0 ]] || log "a P3 smite check failed"
  return $verdict
}

drive() {
  ab set viewport 1280 800 >/dev/null || return 1
  # A new browser's first screenshot takes about 10 s, longer than the hidden lead-in, so it goes to a blank page.
  ab open about:blank >/dev/null && ab screenshot "$VERIFY_DIR/warm-up.png" >/dev/null || { log "warm-up screenshot failed"; return 1; }
  drive_load_retry && drive_get_ready && drive_settings_menu && drive_run_results && drive_whats_new && drive_telemetry || return 1
  ab open "${URL}${DRILL_QUERY}" >/dev/null || return 1
  drive_lead_in || return 1
  ab wait --fn "window.__archiveOcellusProbe?.snapshot().ticking === true && window.__archiveOcellusProbe.snapshot().tick >= 8" \
    --timeout 90000 >/dev/null || { log "trainer never started ticking"; return 1; }
  drive_walk && drive_edge && drive_cycle && drive_focus && drive_void_floor && drive_lifeforce_orb && drive_orb_late_and_entry && drive_explosions && drive_dodge_speedup && drive_explosion_views && drive_void_shot && drive_transition_attack && drive_loadouts && drive_defence_floor && drive_supplies && drive_keybinds && drive_overheads_rifts && drive_seed && drive_floor_holes && drive_orb_off_holes && drive_walkway && drive_control_walk && drive_click_correction && drive_back_wall && drive_corner && drive_boss_pathing && drive_invincible && drive_cues || return 1

  local capture
  for capture in hidden.json hidden.png before.json before.png after.json after.png edge-click.json edge-arrived.json edge.json edge.png boss.png boss-bar.json cycle-ring-click.json cycle-snapshot.json cycle.json console.log page-errors.json focus.json focus-audio.json focus.png focus-console.log focus-page-errors.json \
    void-inner.png void-flood.png void-floor.json void-console.log void-page-errors.json \
    attack-click.json ring-click.json flood-ring.png void-shot.json void-shot-console.log void-shot-page-errors.json \
    orb-hit.png $(seq -f "orb-dormant-%g.png" 1 "$ORB_FRAMES") $(seq -f "orb-glow-%g.png" 1 "$ORB_FRAMES") orb-click.json orb.json orb-console.log orb-page-errors.json orb-skip.png orb-skip.json orb-skip-console.log orb-skip-page-errors.json \
    orb-late.png orb-late.json orb-late-page-errors.json orb-entry.png orb-entry.json orb-entry-console.log orb-entry-page-errors.json \
    explosion-left.png explosion-standing.png explosions.json explosion-audio.json explosion-console.log explosion-page-errors.json explosion-under.png explosions-under.json explosion-under-console.log explosion-under-page-errors.json \
    dodge-speedup.json dodge-speedup-console.log dodge-speedup-page-errors.json \
    explosion-2d-left.png explosion-2d-tiles.json explosions-2d.json explosion-2d-console.log explosion-2d-page-errors.json \
    $(for mode in 2d 3d; do echo "explosion-run-end-${mode}-marked-1.png explosion-run-end-${mode}-marked-2.png explosion-run-end-${mode}.json explosion-run-end-${mode}-console.log explosion-run-end-${mode}-page-errors.json"; seq -f "explosion-run-end-${mode}-%g.png" 1 "$EXPLOSION_RUN_END_FRAMES"; done) \
    special-before.png special-vortex.png special-spike-disk.png special-semicircle.png special-black-disk.png special.json special-console.log special-page-errors.json special-late.json special-audio.json special-late-console.log special-late-page-errors.json \
    loadout-before.json loadout-ranged.png icons.json equipment-ranged.png loadout-after.json loadout-melee.png loadout-spec.json loadout-spec-log.json loadout-spec.png equipment-melee.png \
    loadout-console.log loadout-page-errors.json loadout-selector.json loadout-selector-page-errors.json \
    defence-floor-start.json defence-floor-first.json defence-floor.json defence-floor-log.json defence-floor.png defence-floor-console.log defence-floor-page-errors.json \
    supplies-inventory.json item-menu.json item-menu.png item-menu-closed.json brew-click.json brew-hp.json brew-heal.png supplies-console.log supplies-page-errors.json \
    keybinds-open.json keybinds.png keybinds-bound.json keybinds-saved.json keybinds-old-key.json keybinds-reloaded.json keybinds-reloaded.png keybinds-restored.json keybinds-console.log keybinds-page-errors.json special-heal.png \
    $(printf 'overhead-%s.png ' $OVERHEAD_SHOT_TICKS) overhead-draws.json rift-spawned.png rift-destroyed.png rift-chat.json rift-burst.png rifts.json rift-audio.json rift-console.log rift-page-errors.json rift-ralos.json rift-ralos-console.log rift-ralos-page-errors.json rift-melee-hit.png rift-melee.json rift-melee-console.log rift-melee-page-errors.json \
    hover-out-of-reach.png deflect-blocked.png deflect.json deflect-console.log deflect-page-errors.json \
    rift-charged.png reflect-none.png reflect-hit.png reflect.json reflect-console.log reflect-page-errors.json \
    seed-fresh.png seed.json seed.png seed-console.log seed-page-errors.json \
    holes-drawn.png holes-flood.png hole-click.json hole-hit.png holes.json holes-console.log holes-page-errors.json \
    orb-off-holes.png orb-off-holes.json orb-off-holes-console.log orb-off-holes-page-errors.json \
    tile-clicks.jsonl walkway-click.json walkway-arrived.json walkway.json walkway-log.json walkway.png walkway-console.log walkway-page-errors.json \
    walkway-run-end.json walkway-run-end-log.json walkway-run-end.png walkway-run-end-page-errors.json \
    control-walk.png control-walk-menu.json control-walk-log.json control-walk-right-click.json control-walk-console.log control-walk-page-errors.json \
    click-correction.json click-correction.png click-correction-page-errors.json \
    back-wall-log.json back-wall-top-down.png back-wall-flood.png back-wall-console.log back-wall-page-errors.json \
    corner-hole.json corner-hole-log.json corner-hole.png corner-nub.json corner-nub-log.json corner-console.log corner-page-errors.json corner-view.png corner-view-page-errors.json \
    pathing-around.png pathing.json pathing-console.log pathing-page-errors.json pathing-reroute.json pathing-reroute-console.log pathing-reroute-page-errors.json pathing-control.json pathing-control-console.log pathing-control-page-errors.json pathing-out.png pathing-out.json pathing-out-console.log pathing-out-page-errors.json \
    invincible-default.json invincible-linked.json invincible.png invincible-chat.json invincible.json invincible-console.log invincible-page-errors.json invincible-restarted.json \
    invincible-orb.png invincible-orb.json invincible-orb-console.log invincible-orb-page-errors.json \
    autoplay-policy.js cue-contexts-fresh.json cue-toggles-fresh.json cue-fresh-click.json cue-contexts-fresh-clicked.json cue-fresh-audio.json cue-sound-off-saved.json cue-fresh-console.log cue-fresh-page-errors.json \
    cue-recording-from.json cue-contexts-loaded.json cue-toggles-off.json cue-toggle-click.json cue-contexts-toggled.json cue-toggles-on.json cue-sound-saved.json cue-toggle-audio.json cue-toggle-console.log cue-toggle-page-errors.json \
    cue-contexts-reloaded.json cue-toggles-reloaded.json cue-contexts-clicked.json cue-chat-before.json cue-chat.json cues.json cue-audio.json cue-console.log cue-page-errors.json; do
    [[ -s "$VERIFY_DIR/$capture" ]] || { log "required capture ${capture} is missing or empty"; return 1; }
  done

  node -e '
    const [dir, spawn, target, edgeOrder, edgeStop, holdTicks, bossNpc, lastHiddenTick, lastTick, stages, overheads, specials, focusKey, focusExpected, square, floodDamage, floodLast, voidHits, voidEnd, voidPixel, rangedWorn, meleeWorn, drain, orbExpected, orbBox, orbFrames,
      innerMarks, lateMark, explosionPixel, explosionExpected, soundSamples, explosionSounds, centreX, centreY, tellBox, specialExpected,
      tellCentreBox, transitionSamples, landingSounds, landingWindows, styleSounds, styleWindows, soundTolerance,
      supplyInventory, namedMenu, hpAfterBrew, defaultKey, newKey, trainerIcons, brewY, hoverNamePixel, overheadShots, iconBox, riftExpected, burstTick, soulSplitExpected, killChat,
      riftSoundSamples, riftSpawnSounds, riftKillSound, riftBurstSounds, riftSoundWindow, gapDraws, hoverTile, hoverTicks, firstMeleeTick,
      walkwayOrder, walkwayStop, walkwayPixel, walkwayMinShare, walkwayRunEnd, walkwayRunTiles, controlWalkTiles, cornerHole, cornerNub,
      holeLayout, holePixels, holeFreePixels, holeBoxHalf, holeMinDark, holeMaxDark, holeTile, holeHits, holeDamage,
      cueSoundSamples, cueSounds, cueSoundWindow, cueChat, floorSteps, invincibleLastTick, invincibleExpected, invincibleOrbExpected,
      riftTimerBox, riftTimerMaxEarly, riftTimerMinFull, riftOneHit, riftRalosHits, riftMeleeHits, reflectExpected, reflectSplatBox, reflectMinSplat, reflectMaxClear,
      dodgeLastTick, dodgeAttacks, explosionGlowBox, explosionGlowMinShare, focusEntryTicks, bossPoseSamples, pathingWest, pathingEast, pathingBack, pathingExpected, pathingRerouteExpected, pathingOutExpected, pathingControlExpected, orbHolesExpected, orbHolesLayout,
      orbInnerClear, orbInnerExpiry, orbEntryTile, orbOppositeExpected, projectedTileClicks, bossBarAtEntry, explosionReduction, backWallStart, backWallEnd, backWallToward, backWallBack,
      explosion2dGlowBox, explosion2dExpected, explosionRunEndExpected, explosionGlowMaxShare, explosionRunEndFrames, correctionExpected] = process.argv.slice(1);
    const fs = require("fs");
    const read = (file) => JSON.parse(fs.readFileSync(`${dir}/${file}`, "utf8"));
    const tileClicks = fs.readFileSync(`${dir}/tile-clicks.jsonl`, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
    const [hidden, before, after, edgeArrived, edge, errors, cycle, snapshot, focus, focusAudio, focusErrors, voidLog, voidErrors, shot, shotErrors] =
      ["hidden.json", "before.json", "after.json", "edge-arrived.json", "edge.json", "page-errors.json", "cycle.json", "cycle-snapshot.json", "focus.json", "focus-audio.json", "focus-page-errors.json", "void-floor.json", "void-page-errors.json", "void-shot.json", "void-shot-page-errors.json"].map(read);
    const [dressed, switched, spec, selector, loadoutErrors, selectorErrors] =
      ["loadout-before.json", "loadout-after.json", "loadout-spec.json", "loadout-selector.json", "loadout-page-errors.json", "loadout-selector-page-errors.json"].map(read);
    const [orbLog, orbClick, orbErrors, orbSkip, orbSkipErrors] = ["orb.json", "orb-click.json", "orb-page-errors.json", "orb-skip.json", "orb-skip-page-errors.json"].map(read);
    const [explosionLog, explosionAudio, explosionErrors, underLog, underErrors] = ["explosions.json", "explosion-audio.json", "explosion-page-errors.json", "explosions-under.json", "explosion-under-page-errors.json"].map(read);
    const [dodgeLog, dodgeErrors] = ["dodge-speedup.json", "dodge-speedup-page-errors.json"].map(read);
    const [explosion2dLog, explosion2dTiles, explosion2dErrors] = ["explosions-2d.json", "explosion-2d-tiles.json", "explosion-2d-page-errors.json"].map(read);
    const runEndPages = Object.fromEntries(["2d", "3d"].map((mode) => [mode, { log: read(`explosion-run-end-${mode}.json`), errors: read(`explosion-run-end-${mode}-page-errors.json`) }]));
    const [specialLog, specialErrors, lateLog, lateErrors, transitionAudio] = ["special.json", "special-page-errors.json", "special-late.json", "special-late-page-errors.json", "special-audio.json"].map(read);
    const [carried, itemMenu, itemMenuClosed, brewClick, brewHp, suppliesErrors] = ["supplies-inventory.json", "item-menu.json", "item-menu-closed.json", "brew-click.json", "brew-hp.json", "supplies-page-errors.json"].map(read);
    const icons = read("icons.json");
    const seeds = read("seed.json");
    const [walkwayArrived, walkwayHeld, walkwayLog, walkwayRunEndHeld, walkwayRunEndLog, cornerAtHole, cornerHoleLog, cornerAtNub, cornerNubLog] =
      ["walkway-arrived.json", "walkway.json", "walkway-log.json", "walkway-run-end.json", "walkway-run-end-log.json", "corner-hole.json", "corner-hole-log.json", "corner-nub.json", "corner-nub-log.json"].map(read);
    const [seedErrors, walkwayErrors, walkwayRunEndErrors, cornerErrors, cornerViewErrors] = ["seed-page-errors.json", "walkway-page-errors.json", "walkway-run-end-page-errors.json", "corner-page-errors.json", "corner-view-page-errors.json"].map(read);
    const [controlWalkMenu, controlWalkLog, controlWalkRightClick, controlWalkErrors] = ["control-walk-menu.json", "control-walk-log.json", "control-walk-right-click.json", "control-walk-page-errors.json"].map(read);
    const [correction, correctionErrors] = ["click-correction.json", "click-correction-page-errors.json"].map(read);
    const [backWallLog, backWallErrors] = ["back-wall-log.json", "back-wall-page-errors.json"].map(read);
    const [holesLog, holesErrors] = ["holes.json", "holes-page-errors.json"].map(read);
    const [pathingLog, pathingErrors] = ["pathing.json", "pathing-page-errors.json"].map(read);
    const [rerouteLog, rerouteErrors, outLog, outErrors] = ["pathing-reroute.json", "pathing-reroute-page-errors.json", "pathing-out.json", "pathing-out-page-errors.json"].map(read);
    const [controlRerouteLog, controlRerouteErrors] = ["pathing-control.json", "pathing-control-page-errors.json"].map(read);
    const [orbHolesLog, orbHolesErrors] = ["orb-off-holes.json", "orb-off-holes-page-errors.json"].map(read);
    const [orbLateLog, orbLateErrors, orbEntryLog, orbEntryErrors] = ["orb-late.json", "orb-late-page-errors.json", "orb-entry.json", "orb-entry-page-errors.json"].map(read);
    const [floorStart, floorFirst, floorLast, floorLog, floorErrors] = ["defence-floor-start.json", "defence-floor-first.json", "defence-floor.json", "defence-floor-log.json", "defence-floor-page-errors.json"].map(read);
    const floorGlaives = floorLog.rows.flatMap((row) => row.events.filter((event) => event.kind === "player-hit-judged")).slice(0, 4);
    const [keysOpen, keysBound, keysSaved, keysOldKey, keysReloaded, keysRestored, keybindsErrors] = ["keybinds-open.json", "keybinds-bound.json", "keybinds-saved.json", "keybinds-old-key.json", "keybinds-reloaded.json", "keybinds-restored.json", "keybinds-page-errors.json"].map(read);
    const [riftLog, riftChat, riftAudio, riftErrors, deflectLog, deflectErrors, overheadDraws] = ["rifts.json", "rift-chat.json", "rift-audio.json", "rift-page-errors.json", "deflect.json", "deflect-page-errors.json", "overhead-draws.json"].map(read);
    const [reflectLog, reflectErrors] = ["reflect.json", "reflect-page-errors.json"].map(read);
    const [ralosLog, ralosErrors] = ["rift-ralos.json", "rift-ralos-page-errors.json"].map(read);
    const [meleeRiftLog, meleeRiftErrors] = ["rift-melee.json", "rift-melee-page-errors.json"].map(read);
    const [cueLog, cueToggleAudio, cueAudio, cueToggleErrors, cueErrors, cueSaved, cueChatBefore, cueChatAfter] =
      ["cues.json", "cue-toggle-audio.json", "cue-audio.json", "cue-toggle-page-errors.json", "cue-page-errors.json", "cue-sound-saved.json", "cue-chat-before.json", "cue-chat.json"].map(read);
    const [recordingFrom, toggledAt, freshClickedAt, freshAudio, freshErrors, savedOff] =
      ["cue-recording-from.json", "cue-toggle-click.json", "cue-fresh-click.json", "cue-fresh-audio.json", "cue-fresh-page-errors.json", "cue-sound-off-saved.json"].map(read);
    const [invincibleDefault, invincibleLinked, invincibleChat, invincibleLog, invincibleErrors, invincibleRestarted, invincibleOrbLog, invincibleOrbErrors] =
      ["invincible-default.json", "invincible-linked.json", "invincible-chat.json", "invincible.json", "invincible-page-errors.json", "invincible-restarted.json", "invincible-orb.json", "invincible-orb-page-errors.json"].map(read);
    const contexts = Object.fromEntries(["fresh", "fresh-clicked", "loaded", "toggled", "reloaded", "clicked"].map((when) => [when, read(`cue-contexts-${when}.json`)]));
    const toggles = Object.fromEntries(["fresh", "off", "on", "reloaded"].map((when) => [when, read(`cue-toggles-${when}.json`)]));
    const [spawnTile, targetTile, edgeOrderTile, edgeStopTile, nearSquare] = [spawn, target, edgeOrder, edgeStop, square].map((tile) => JSON.parse(tile));
    const same = (a, b) => a?.x === b.x && a?.y === b.y;
    const inSquare = (t) => t.x >= nearSquare.minX && t.x <= nearSquare.maxX && t.y >= nearSquare.minY && t.y <= nearSquare.maxY;
    const upTo = (rows, last) => rows.filter((row) => row.tick <= last);
    const between = (rows, from, to) => rows.filter((row) => row.tick >= Number(from) && row.tick <= Number(to));
    const events = (rows, kind, pick) => upTo(rows, Number(lastTick)).flatMap((row) => row.events.filter((e) => e.kind === kind).map(pick));
    const rowAt = (rows, t) => rows.find((row) => row.tick === Number(t));
    const png = require("./scripts/png-pixels.cjs");
    const decode = (file) => png.decode(`${dir}/${file}`);
    const pixelShare = (file, matches, area) => png.pixelShare(`${dir}/${file}`, matches, area);
    const shardRgb = [1, 3, 5].map((i) => parseInt(explosionPixel.slice(i, i + 2), 16));
    function spot(file, matches, area) {
      const { width, height, channels, px } = decode(file);
      const { minX, maxX, minY, maxY } = area ?? { minX: Math.floor(width * 0.4), maxX: Math.ceil(width * 0.6) - 1, minY: Math.floor(height * 0.45), maxY: Math.ceil(height * 0.6) - 1 };
      let hits = 0, sumX = 0;
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const i = (y * width + x) * channels;
          if (matches(px[i], px[i + 1], px[i + 2])) [hits, sumX] = [hits + 1, sumX + x];
        }
      }
      return { share: Math.round((100000 * hits) / ((maxX - minX + 1) * (maxY - minY + 1))) / 1000, dx: hits ? Math.round((1000 * (sumX / hits - (width - 1) / 2)) / width) / 1000 : null };
    }
    const shards = (file) => spot(file, (...rgb) => shardRgb.every((v, c) => Math.abs(rgb[c] - v) <= 12));
    const nameRgb = [1, 3, 5].map((i) => parseInt(hoverNamePixel.slice(i, i + 2), 16));
    function hoverText(file) {
      const { width, channels, px } = decode(file);
      const columns = (rgb) => {
        const xs = [];
        for (let y = Number(brewY) + 19; y <= Number(brewY) + 40; y++) {
          for (let x = 0; x < width; x++) if (rgb.every((v, c) => px[(y * width + x) * channels + c] === v)) xs.push(x);
        }
        return xs.length ? [Math.min(...xs), Math.max(...xs)] : null;
      };
      return { width, action: columns([255, 255, 255]), name: columns(nameRgb) };
    }
    const readsInFull = (text) => text.action !== null && text.name !== null && text.action[1] < text.name[0] && text.name[1] <= text.width - 5;
    const want = [1, 3, 5].map((i) => parseInt(voidPixel.slice(i, i + 2), 16));
    const voidShare = (file) => pixelShare(file, (...rgb) => want.every((v, c) => Math.abs(rgb[c] - v) <= 10));
    const walkwayRgb = [1, 3, 5].map((i) => parseInt(walkwayPixel.slice(i, i + 2), 16));
    const walkOrders = (log) => log.rows.flatMap((row) => row.inputs.filter((i) => i.kind === "walk-ordered").map((i) => i.destination));
    const orderTicks = (log) => log.rows.filter((row) => row.inputs.some((i) => i.kind === "walk-ordered")).map((row) => row.tick);
    const walks = (log) => {
      const starts = log.rows.flatMap((row, i) => (row.inputs.some((input) => input.kind === "walk-ordered") ? [i] : []));
      return starts.map((start, n) => {
        const tiles = log.rows.slice(start, starts[n + 1]).map((row) => row.playerAtPostTick.tile);
        return [log.rows[start].phase.stage, tiles.filter((at, i) => i === 0 || !same(at, tiles[i - 1]))];
      });
    };
    const walkPaces = (log) => log.rows.flatMap((row) => row.inputs.filter((i) => i.kind === "walk-ordered").map((i) => i.pace));
    const tilesUntilStop = (log, stop, order = 0) => {
      const ordered = log.rows.flatMap((row, at) => (row.inputs.some((i) => i.kind === "walk-ordered") ? [at] : []));
      const tiles = log.rows.slice(ordered[order]).map((row) => row.playerAtPostTick.tile);
      return tiles.slice(0, tiles.findIndex((tile) => same(tile, stop)) + 1);
    };
    const seedInUrl = (run) => new URLSearchParams(run.search).get("seed");
    const offset = JSON.parse(orbBox);
    const around = { minX: orbClick.x + offset.minX, maxX: orbClick.x + offset.maxX, minY: orbClick.y + offset.minY, maxY: orbClick.y + offset.maxY };
    const orbTeal = (look) => Array.from({ length: Number(orbFrames) }, (_, i) => pixelShare(`orb-${look}-${i + 1}.png`, (r, g, b) => g >= 120 && g - r >= 60 && b - r >= 30, around));
    const expectedOrb = JSON.parse(orbExpected);
    const kindOf = (rows, kind) => rows.flatMap((row) => row.events.filter((e) => e.kind === kind));
    const orbTile = expectedOrb.spawned[0][1];
    const flood = between(shot.rows, floodDamage, floodLast);
    const floorHit = (row) => row.events.some((e) => e.kind === "floor-hit" && same(e.tile, row.playerAtBossStep.tile));
    const launch = flood.find((row) => row.combatDraws > 0);
    const landing = flood.flatMap((row) => row.events.filter((e) => e.kind === "player-hit-judged" && e.style === "ranged").map((e) => ({ ...e, bossHp: row.bossHp })))[0];
    const expectedExplosions = JSON.parse(explosionExpected);
    const stepped = (rows, t) => rowAt(rows, t)?.inputs.some((input) => input.kind === "walk-ordered") ?? false;
    const markedAt = (rows, t) => kindOf(rows, "explosion-marked").find((e) => e.at === t);
    const resolvedAt = (rows, t) => kindOf(rows, "explosion-resolved").find((e) => e.at === t);
    const late = Number(lateMark);
    const fromCentre = (box) => { const o = JSON.parse(box); return { minX: Number(centreX) + o.minX, maxX: Number(centreX) + o.maxX, minY: Number(centreY) + o.minY, maxY: Number(centreY) + o.maxY }; };
    const [tellArea, centreArea] = [fromCentre(tellBox), fromCentre(tellCentreBox)];
    const tellShare = (file) => pixelShare(file, (r, g, b) => b >= 150 && r >= 90 && g <= 90 && b - g >= 100, tellArea);
    const centreShares = (file) => ({ white: pixelShare(file, (r, g, b) => r >= 235 && g >= 235 && b >= 235, centreArea), black: pixelShare(file, (r, g, b) => Math.max(r, g, b) <= 40, centreArea) });
    const samplesOf = JSON.parse(transitionSamples);
    const timed = (list) => JSON.parse(list).map(([at, id]) => [at, samplesOf[id]]);
    const heardIn = (windows, expected) => {
      const lengths = new Set(expected.map(([, samples]) => samples));
      return transitionAudio
        .filter((s) => s.rate === 22050 && s.tick !== null && lengths.has(s.samples) && JSON.parse(windows).some(([from, to]) => s.tick + s.phase >= from && s.tick + s.phase < to))
        .map((s) => [Math.round((s.tick + s.phase) * 100) / 100, s.samples]);
    };
    const onSchedule = (heard, expected) => heard.length === expected.length && heard.every(([at, samples], i) => samples === expected[i][1] && Math.abs(at - expected[i][0]) <= Number(soundTolerance));
    const [landingExpected, styleExpected] = [timed(landingSounds), timed(styleSounds)];
    const prayedAt = (rows) => rows.find((row) => row.inputs.some((input) => input.kind === "prayer-published" && input.prayer === "magic"))?.tick ?? null;
    const hitsOf = (rows) => kindOf(rows, "special-hit").map((e) => [e.at, e.style, e.receipt]);
    const expectedSpecial = JSON.parse(specialExpected);
    const soundBySamples = Object.fromEntries(Object.entries(JSON.parse(soundSamples)).map(([id, samples]) => [samples, Number(id)]));
    const iconArea = fromCentre(iconBox);
    const iconColours = {
      blue: (r, g, b) => r <= 80 && g <= 190 && b >= 200,
      red: (r, g, b) => r >= 150 && r <= 240 && g <= 80 && b <= 80,
      orange: (r, g, b) => r >= 170 && g >= 100 && g <= 165 && b <= 100,
    };
    function iconIn(file) {
      const share = Object.fromEntries(Object.entries(iconColours).map(([name, matches]) => [name, pixelShare(file, matches, iconArea)]));
      const icon = share.blue >= 0.2 ? (share.red >= 0.2 ? "deflect-melee" : share.orange >= 0.06 ? "deflect-range" : "unknown") : share.red >= 0.2 ? "soul-split" : null;
      return { ...share, icon };
    }
    const overheadAt = (rows, t) => rowAt(rows, t)?.phase.overhead;
    const expectedRifts = JSON.parse(riftExpected);
    const riftSamplesOf = JSON.parse(riftSoundSamples);
    const [riftFrom, riftTo] = JSON.parse(riftSoundWindow);
    const riftTimed = (list) => list.map(([at, id]) => [at, riftSamplesOf[id]]);
    const riftHeard = (ids) => {
      const lengths = new Set(ids.map((id) => riftSamplesOf[id]));
      return riftAudio
        .filter((s) => s.rate === 22050 && s.tick !== null && lengths.has(s.samples) && s.tick + s.phase >= riftFrom && s.tick + s.phase < riftTo)
        .map((s) => [Math.round((s.tick + s.phase) * 100) / 100, s.samples]);
    };
    const [killOffset, killId] = JSON.parse(riftKillSound);
    const destroyedAt = kindOf(riftLog.rows, "rift-destroyed")[0]?.at ?? null;
    const riftExpectedSounds = {
      spawn: riftTimed(JSON.parse(riftSpawnSounds)),
      kill: destroyedAt === null ? [] : riftTimed([[destroyedAt + killOffset, killId]]),
      burst: riftTimed(JSON.parse(riftBurstSounds)),
    };
    const timerShare = (file) => pixelShare(file, (r, g, b) => r >= 180 && g >= 140 && b <= 90 && r - b >= 120, fromCentre(riftTimerBox));
    const splatShare = (file) => pixelShare(file, (r, g, b) => r >= 120 && g <= 40 && b <= 40, fromCentre(reflectSplatBox));
    const isGlow = (r, g, b) => b >= 120 && b - g >= 80 && r - g >= 50;
    const glow = (file, box = explosionGlowBox) => spot(file, isGlow, fromCentre(box));
    const markDrawn = (file, box) => spot(file, (...rgb) => isGlow(...rgb) || shardRgb.every((v, c) => Math.abs(rgb[c] - v) <= 12), fromCentre(box)).share;
    const viewBox = (mode) => (mode === "2d" ? explosion2dGlowBox : explosionGlowBox);
    const holeTiles = JSON.parse(holeLayout).tiles;
    const onHole = (tile) => holeTiles.some((hole) => same(tile, hole));
    const darkAround = (file, [, dx, dy]) => {
      const half = Number(holeBoxHalf), x = Number(centreX) + dx, y = Number(centreY) + dy;
      return pixelShare(file, (r, g, b) => Math.max(r, g, b) <= 30, { minX: x - half, maxX: x + half, minY: y - half, maxY: y + half });
    };
    const cueSamplesOf = JSON.parse(cueSoundSamples);
    const cueLengths = new Set(Object.values(cueSamplesOf));
    const [cueFrom, cueTo] = JSON.parse(cueSoundWindow);
    const cueHeard = (audio) => audio
      .filter((s) => s.rate === 22050 && s.tick !== null && cueLengths.has(s.samples) && s.tick + s.phase >= cueFrom && s.tick + s.phase < cueTo)
      .map((s) => [Math.round((s.tick + s.phase) * 100) / 100, s.samples, s.state]);
    const cueExpected = JSON.parse(cueSounds).map(([at, id]) => [at, cueSamplesOf[id]]);
    const savedSound = cueSaved?.values ?? {};
    const savedSoundOff = savedOff?.values ?? {};
    const bossBar = Object.entries(read("boss-bar.json")).map(([t, texts]) => [Number(t), texts]).sort(([a], [b]) => a - b);
    const observed = {
      bossBar,
      firstWalkOrders: cycle.rows.flatMap((row) => row.inputs.filter((i) => i.kind === "walk-ordered").map((i) => i.destination)).slice(0, 2),
      edge: { arrived: [edgeArrived.tick, edgeArrived.player], held: [edge.tick, edge.player] },
      stageEntries: events(cycle.rows, "stage-entered", (e) => [e.at, e.stage]),
      overheadSwitches: events(cycle.rows, "overhead-switched", (e) => [e.at, e.overhead]),
      specialHits: upTo(cycle.rows, Number(lastTick)).flatMap((row) => row.beats.filter((b) => b.kind === "special-hit").map((b) => [row.tick, b.variant])),
      focus: { start: focus.rows[0]?.tick ?? null, beats: [...new Set(focus.rows.flatMap((row) => row.beats.map((b) => b.kind)))].sort() },
      focusEntrySounds: focusAudio.filter((s) => s.tick !== null && s.tick >= JSON.parse(focusEntryTicks)[0] && s.tick < JSON.parse(focusEntryTicks)[1]).map((s) => [s.tick, s.phase, s.samples, s.state]),
      floodShot: {
        launch: launch && { at: launch.tick, startedOn: launch.playerAtBossStep.tile, firedFrom: launch.playerAtPostTick.tile, floorHitOnStart: floorHit(launch) },
        landing: landing && { at: landing.at, style: landing.style, outcome: landing.outcome, damage: landing.requested, bossHp: [landing.bossHp.atBossStep, landing.bossHp.atPostTick] },
        walk: flood.flatMap((row) => row.inputs.filter((i) => i.kind === "walk-ordered").map((i) => [row.tick, i.destination])),
      },
      floodRows: flood.map((row) => [row.tick, row.playerAtBossStep.tile, floorHit(row)]),
      voidHits: voidLog.rows.flatMap((row) => row.events.filter((e) => e.kind === "floor-hit").map((e) => [e.at, e.receipt.applied])),
      voidHitTiles: [...new Set(voidLog.rows.flatMap((row) => row.events.filter((e) => e.kind === "floor-hit").map((e) => JSON.stringify(e.tile))))],
      voidRunEnd: voidLog.rows.flatMap((row) => row.events.filter((e) => e.kind === "run-ended").map((e) => [e.at, e.reason])),
      voidPixelShare: { "before.png": voidShare("before.png"), "void-inner.png": voidShare("void-inner.png"), "void-flood.png": voidShare("void-flood.png"), "flood-ring.png": voidShare("flood-ring.png") },
      loadout: {
        worn: [dressed.player.equipped, switched.player.equipped, selector.player.equipped],
        specialEnergy: [switched.player.specialEnergy, spec.player.specialEnergy],
        bossDefence: [switched.boss.defence, spec.boss.defence],
      },
      defenceFloor: {
        bossDefence: [floorStart.boss.defence, floorFirst.boss.defence, floorLast.boss.defence],
        glaives: floorGlaives.map((event) => [event.at, event.outcome, event.requested]),
      },
      orb: {
        told: kindOf(orbLog.rows, "lifeforce-told").map((e) => [e.at, e.void]),
        drained: kindOf(orbLog.rows, "lifeforce-drained").map((e) => [e.at, e.receipt.applied, e.receipt.afterHp]),
        spawned: kindOf(orbLog.rows, "orb-spawned").map((e) => [e.at, e.tile, e.credit]),
        clicked: orbClick.snapshot?.destination ?? null,
        arrivedAt: orbLog.rows.find((row) => same(row.playerAtPostTick.tile, orbTile))?.tick ?? null,
        matured: kindOf(orbLog.rows, "orb-matured").map((e) => [e.at, e.tile]),
        returned: kindOf(orbLog.rows, "orb-returned").map((e) => [e.at, e.receipt]),
        skipExpired: kindOf(orbSkip.rows, "orb-expired").map((e) => [e.at, e.void]),
        skipHeal: kindOf(orbSkip.rows, "boss-healed").map((e) => [e.at, e.cause, e.receipt]),
        skipReturned: kindOf(orbSkip.rows, "orb-returned").length,
        tealShare: { box: around, dormant: orbTeal("dormant"), glow: orbTeal("glow") },
      },
      explosions: {
        dodges: JSON.parse(innerMarks).map((t) => ({ mark: t, stepped: stepped(explosionLog.rows, t), tile: markedAt(explosionLog.rows, t)?.tile ?? null, outcome: resolvedAt(explosionLog.rows, t + 1)?.outcome.kind ?? null })),
        late: {
          standing: rowAt(explosionLog.rows, late)?.playerAtBossStep.tile ?? null,
          marked: markedAt(explosionLog.rows, late)?.tile ?? null,
          steppedOnMark: stepped(explosionLog.rows, late),
          steppedOnImpact: stepped(explosionLog.rows, late + 1),
          resolved: resolvedAt(explosionLog.rows, late + 1) ?? null,
          endTile: rowAt(explosionLog.rows, late + 1)?.playerAtPostTick.tile ?? null,
        },
        under: kindOf(underLog.rows, "explosion-resolved").map((e) => [e.at, e.tile, e.underBoss, e.outcome.kind, e.outcome.receipt?.afterHp ?? null]),
        speedup: {
          attacks: dodgeLog.rows.filter((row) => row.tick <= Number(dodgeLastTick) && row.combatDraws > 0).map((row) => row.tick),
          dodges: kindOf(dodgeLog.rows, "explosion-resolved").map((e) => [e.at, e.tile, e.outcome.kind, e.outcome.attackDelay ?? null]),
          steps: dodgeLog.rows.filter((row) => row.inputs.length > 0).map((row) => [row.tick, row.inputs.map((input) => input.destination ?? input.prayer)]),
          bossHits: dodgeLog.rows.flatMap((row) => row.events.filter((e) => e.kind === "player-hit-judged").map((e) => [e.at, e.outcome, e.requested, row.bossHp.atBossStep - row.bossHp.atPostTick])),
        },
        shards: { "explosion-left.png": shards("explosion-left.png"), "explosion-standing.png": shards("explosion-standing.png") },
        glow: { "explosion-left.png": glow("explosion-left.png"), "explosion-under.png": glow("explosion-under.png") },
        twoD: {
          marks: kindOf(explosion2dLog.rows, "explosion-marked").filter((e) => e.at < late).map((e) => [e.at, e.tile]),
          dodges: JSON.parse(innerMarks).map((t) => ({ mark: t, stepped: stepped(explosion2dLog.rows, t), outcome: resolvedAt(explosion2dLog.rows, t + 1)?.outcome.kind ?? null })),
          late: {
            steppedOnImpact: stepped(explosion2dLog.rows, late + 1),
            hit: ((e) => e && [e.at, e.tile, e.outcome.receipt ?? null])(resolvedAt(explosion2dLog.rows, late + 1)),
          },
          glow: glow("explosion-2d-left.png", explosion2dGlowBox),
          tiles: explosion2dTiles,
        },
        runEnd: Object.fromEntries(Object.entries(runEndPages).map(([mode, { log }]) => [mode, {
          marked: kindOf(log.rows, "explosion-marked").map((e) => [e.at, e.tile]),
          ended: kindOf(log.rows, "run-ended").map((e) => [e.at, e.reason]),
          resolved: kindOf(log.rows, "explosion-resolved").map((e) => e.at),
          drawnWhileMarked: Math.max(...[1, 2].map((frame) => markDrawn(`explosion-run-end-${mode}-marked-${frame}.png`, viewBox(mode)))),
          drawnAfterTheEnd: Array.from({ length: Number(explosionRunEndFrames) }, (_, frame) => markDrawn(`explosion-run-end-${mode}-${frame + 1}.png`, viewBox(mode))),
        }])),
        sounds: {
          heard: explosionAudio.filter((s) => s.rate === 22050 && soundBySamples[s.samples] !== undefined).map((s) => [s.tick, soundBySamples[s.samples]]),
          contexts: [...new Set(explosionAudio.map((s) => s.state))],
          starts: explosionAudio.length,
        },
      },
      special: {
        prayedAt: prayedAt(specialLog.rows),
        hits: hitsOf(specialLog.rows),
        latePrayedAt: prayedAt(lateLog.rows),
        lateHits: hitsOf(lateLog.rows),
        lateRunEnd: kindOf(lateLog.rows, "run-ended").map((e) => [e.at, e.reason]),
        told: kindOf(lateLog.rows, "special-told").map((e) => [e.at, e.variant, e.style]),
        tellShare: { box: tellArea, ...Object.fromEntries(["special-before.png", "special-vortex.png", "special-spike-disk.png", "special-semicircle.png"].map((file) => [file, tellShare(file)])) },
        centreShares: { box: centreArea, ...Object.fromEntries(["special-vortex.png", "special-spike-disk.png", "special-black-disk.png"].map((file) => [file, centreShares(file)])) },
        landingSounds: heardIn(landingWindows, landingExpected),
        styleSounds: heardIn(styleWindows, styleExpected),
        contexts: [...new Set(transitionAudio.map((s) => s.state))],
      },
      supplies: {
        carried,
        itemMenu: [itemMenu, itemMenuClosed],
        brew: { clickedAt: brewClick, hp: brewHp.filter(([tick]) => tick >= brewClick - 1 && tick <= brewClick + 3) },
      },
      icons: Object.fromEntries(Object.keys(JSON.parse(trainerIcons)).map((id) => [id, icons[id] ?? null])),
      hoverText: { "brew-heal.png": hoverText("brew-heal.png"), "keybinds.png": hoverText("keybinds.png") },
      seeds,
      walkway: {
        orders: walkOrders(walkwayLog),
        arrived: [walkwayArrived.tick, walkwayArrived.player],
        held: [walkwayHeld.tick, walkwayHeld.player],
        share: pixelShare("walkway.png", (...rgb) => walkwayRgb.every((v, c) => Math.abs(rgb[c] - v) <= 4)),
        runEnd: { orders: walkOrders(walkwayRunEndLog), held: [walkwayRunEndHeld.tick, walkwayRunEndHeld.player] },
        paces: walkPaces(walkwayLog),
        tiles: tilesUntilStop(walkwayLog, JSON.parse(walkwayStop)),
      },
      controlWalk: {
        orders: walkOrders(controlWalkLog),
        paces: walkPaces(controlWalkLog),
        tiles: tilesUntilStop(controlWalkLog, JSON.parse(walkwayStop)),
        ...controlWalkMenu,
        rightClickMenu: controlWalkRightClick,
      },
      backWall: {
        orders: walkOrders(backWallLog),
        paces: walkPaces(backWallLog),
        toward: tilesUntilStop(backWallLog, JSON.parse(backWallEnd), 1),
        back: tilesUntilStop(backWallLog, JSON.parse(backWallStart), 2),
      },
      corner: { orders: [...walkOrders(cornerHoleLog), ...walkOrders(cornerNubLog)], stood: [cornerAtHole.player, cornerAtNub.player] },
      pathing: { orders: walkOrders(pathingLog), walks: walks(pathingLog) },
      pathingReroute: { orders: walkOrders(rerouteLog), orderTicks: orderTicks(rerouteLog), walks: walks(rerouteLog) },
      pathingOut: { orders: walkOrders(outLog), orderTicks: orderTicks(outLog), walks: walks(outLog) },
      pathingControl: { orders: walkOrders(controlRerouteLog), paces: walkPaces(controlRerouteLog), orderTicks: orderTicks(controlRerouteLog), walks: walks(controlRerouteLog) },
      holes: {
        layout: { key: holesLog.header.choices.floorHoleLayout.key, tiles: holesLog.header.choices.floorHoleLayout.option.value.tiles },
        darkShare: JSON.parse(holePixels).map((box) => ({ tile: box[0], drawn: darkAround("holes-drawn.png", box), flood: darkAround("holes-flood.png", box) })),
        freeDarkShare: JSON.parse(holeFreePixels).map((box) => ({ tile: box[0], drawn: darkAround("holes-drawn.png", box) })),
        rows: holesLog.rows.map((row) => ({
          tick: row.tick,
          stage: row.phase.stage,
          startedOn: row.playerAtBossStep.tile,
          hits: row.events.filter((e) => e.kind === "hole-hit").map((e) => ({ at: e.at, tile: e.tile, requested: e.receipt.requested })),
        })),
      },
      orbLate: {
        returned: kindOf(orbLateLog.rows, "orb-returned").map((e) => [e.at, e.void, e.receipt]),
        innerExpired: kindOf(orbLateLog.rows, "orb-expired").filter((e) => e.void === "inner-void").map((e) => e.at),
      },
      orbEntry: {
        walks: orbEntryLog.rows.flatMap((row) => row.inputs.filter((i) => i.kind === "walk-ordered").map((i) => i.destination)),
        outer: kindOf(orbEntryLog.rows, "orb-spawned").filter((e) => e.void === "outer-void").map((e) => [e.at, e.tile]),
      },
      orbOffHoles: {
        layout: { key: orbHolesLog.header.choices.floorHoleLayout.key, tiles: orbHolesLog.header.choices.floorHoleLayout.option.value.tiles },
        spawned: orbHolesLog.rows.flatMap((row) => row.events.filter((e) => e.kind === "orb-spawned").map((e) => [e.at, e.void, e.tile])),
      },
      keybinds: {
        tabs: [keysOpen.tab, keysBound.tab, keysOldKey.tab, keysReloaded.tab],
        inventoryKey: [keysOpen.keys.inventory, keysBound.keys.inventory, keysSaved.values?.inventory_key ?? null, keysReloaded.keys.inventory, keysRestored.keys.inventory],
      },
      overheads: {
        box: iconArea,
        shots: overheadShots.split(" ").map(Number).map((t) => ({ tick: t, logged: [overheadAt(riftLog.rows, t), overheadAt(riftLog.rows, t + 1)], ...iconIn(`overhead-${t}.png`) })),
        gapDraws: Object.keys(JSON.parse(gapDraws)).map((t) => ({ tick: Number(t), logged: overheadAt(riftLog.rows, t) ?? null, frames: overheadDraws[t]?.frames ?? 0, sprites: [...(overheadDraws[t]?.sprites ?? [])].sort() })),
        hover: {
          standsOn: [...new Set(between(deflectLog.rows, ...JSON.parse(hoverTicks)).map((row) => JSON.stringify(row.playerAtPostTick.tile)))].map((tile) => JSON.parse(tile)),
          bossHp: [rowAt(deflectLog.rows, JSON.parse(hoverTicks)[0])?.bossHp.atBossStep, rowAt(deflectLog.rows, Number(firstMeleeTick) - 1)?.bossHp.atPostTick],
        },
        meleeJudged: kindOf(deflectLog.rows, "player-hit-judged").filter((e) => e.style === "melee").map((e) => {
          const hp = rowAt(deflectLog.rows, e.at)?.bossHp;
          return { at: e.at, overhead: overheadAt(deflectLog.rows, e.at), outcome: e.outcome, taken: hp ? hp.atBossStep - hp.atPostTick : null };
        }),
      },
      soulSplit: {
        protectedRunReached: rowAt(specialLog.rows, expectedSpecial.protected[0] + 2) !== undefined,
        protectedHeals: kindOf(specialLog.rows, "boss-healed").map((e) => [e.at, e.cause, e.receipt]),
        lateHeals: kindOf(lateLog.rows, "boss-healed").map((e) => [e.at, e.cause, e.receipt]),
      },
      rifts: {
        spawned: kindOf(riftLog.rows, "rift-spawned").map((e) => [e.at, e.rift, e.tile]),
        destroyed: kindOf(riftLog.rows, "rift-destroyed").map((e) => [e.at, e.rift]),
        bursts: kindOf(riftLog.rows, "rift-burst").map((e) => [e.at, e.rift, e.receipt]),
        hits: kindOf(riftLog.rows, "rift-hit").map((e) => [e.at, e.rift, e.style, e.damage]),
        ralosHits: kindOf(ralosLog.rows, "rift-hit").map((e) => [e.at, e.rift, e.style, e.damage]),
        meleeHits: kindOf(meleeRiftLog.rows, "rift-hit").map((e) => [e.at, e.rift, e.style, e.damage]),
        timerShares: { beforeSpawn: timerShare("overhead-45.png"), spawned: timerShare("rift-spawned.png"), charged: timerShare("rift-charged.png") },
        chat: riftChat.data?.text ?? null,
        sounds: {
          spawn: riftHeard(JSON.parse(riftSpawnSounds).map(([, id]) => id)),
          kill: riftHeard([killId]),
          burst: riftHeard(JSON.parse(riftBurstSounds).map(([, id]) => id)),
          contexts: [...new Set(riftAudio.map((s) => s.state))],
        },
      },
      reflect: {
        judged: kindOf(reflectLog.rows, "player-hit-judged").map((e) => [e.at, e.style, e.outcome, e.requested]),
        reflected: kindOf(reflectLog.rows, "deflect-reflected").map((e) => [e.at, e.style, e.receipt.applied]),
        hpAfter: rowAt(reflectLog.rows, JSON.parse(reflectExpected).judged.at(-1)[0])?.playerAtPostTick.hp ?? null,
        splatShares: { unreflected: splatShare("reflect-none.png"), reflected: splatShare("reflect-hit.png") },
      },
      cues: {
        toggles,
        saved: { playsAudio: savedSound.playsAudio ?? null, playsAreaAudio: savedSound.playsAreaAudio ?? null },
        savedOff: { playsAudio: savedSoundOff.playsAudio ?? null, playsAreaAudio: savedSoundOff.playsAreaAudio ?? null },
        freshClickedAt,
        freshHeard: cueHeard(freshAudio),
        contexts,
        recordingFrom,
        toggledAt,
        beforeToggle: cueHeard(cueToggleAudio).filter(([at]) => at < toggledAt),
        afterToggle: cueHeard(cueToggleAudio).filter(([at]) => at >= toggledAt),
        heard: cueHeard(cueAudio),
        chat: [cueChatBefore.data?.text ?? null, cueChatAfter.data?.text ?? null],
        told: kindOf(cueLog.rows, "lifeforce-told").map((e) => e.at),
        spawned: kindOf(cueLog.rows, "orb-spawned").map((e) => [e.at, e.void, e.tile]),
      },
      invincible: {
        defaultToggle: invincibleDefault,
        linkedToggle: invincibleLinked,
        floorHits: kindOf(invincibleLog.rows, "floor-hit").map((e) => [e.at, e.receipt.applied]),
        prevented: kindOf(invincibleLog.rows, "death-prevented").map((e) => [e.at, e.source]),
        hp: invincibleLog.rows.filter((row) => row.tick === 53 || row.tick === 54).map((row) => [row.tick, row.playerAtPostTick.hp]),
        ended: kindOf(invincibleLog.rows, "run-ended").map((e) => [e.at, e.reason]),
        lastTick: invincibleLog.rows[invincibleLog.rows.length - 1]?.tick ?? -1,
        chat: invincibleChat.data?.text ?? null,
        preventedWithoutTheParameter: kindOf(voidLog.rows, "death-prevented").map((e) => [e.at, e.source]),
        restarted: invincibleRestarted,
        orb: {
          walks: invincibleOrbLog.rows.flatMap((row) => row.inputs.filter((i) => i.kind === "walk-ordered").map((i) => [row.tick, i.destination])),
          prevented: kindOf(invincibleOrbLog.rows, "death-prevented").map((e) => [e.at, e.source, e.clearedOrbCredit]),
          returned: kindOf(invincibleOrbLog.rows, "orb-returned").map((e) => [e.at, e.receipt]),
          hp: invincibleOrbLog.rows.map((row) => [row.tick, row.playerAtPostTick.hp]),
        },
      },
    };
    const sameJson = (a, b) => require("util").isDeepStrictEqual(a, JSON.parse(b));
    const share = observed.voidPixelShare;
    const orb = observed.orb;
    const { dodges, late: lateStep, under, shards: shardSpots, sounds, speedup } = observed.explosions;
    const [leftGlow, standing] = [observed.explosions.glow["explosion-left.png"], shardSpots["explosion-standing.png"]];
    const special = observed.special;
    const { shots: iconShots, gapDraws: drawnAroundGaps, hover, meleeJudged } = observed.overheads;
    const { soulSplit, rifts, cues, invincible } = observed;
    const expectedInvincible = JSON.parse(invincibleExpected);
    const expectedRevival = JSON.parse(invincibleOrbExpected);
    const allIn = (states, state) => states.length > 0 && states.every((s) => s === state);
    const timedOnly = (heard) => heard.map(([at, samples]) => [at, samples]);
    const readyAt = Math.max(orb.arrivedAt ?? Infinity, orb.matured[0]?.[0] ?? Infinity);
    const checks = {
      spawnedOnSpawnTile: same(before.player, spawnTile),
      clickTargetedExpectedTile: same(after.destination, targetTile),
      arrivedAtExpectedTile: same(after.player, targetTile),
      worldTicked: after.tick > before.tick,
      edgeClickOrderedOffThePlatform: require("util").isDeepStrictEqual(observed.firstWalkOrders, [targetTile, edgeOrderTile]),
      stoppedAtTheEdge: same(edgeArrived.player, edgeStopTile) && same(edge.player, edgeStopTile) && edge.tick - edgeArrived.tick >= Number(holdTicks),
      bossIsExpectedNpc: snapshot.fight?.boss.npcId === Number(bossNpc),
      bossHiddenInLeadIn: hidden.fight?.run.kind === "running" && hidden.fight.run.tick <= Number(lastHiddenTick) && hidden.fight.boss.visible === false,
      bossDrawnOncePresent: snapshot.fight?.boss.visible === true,
      bossBarReadsEntryHpOncePresent: bossBar.some(([t]) => t === 12) && bossBar.filter(([t]) => t <= 12).every(([, texts]) => sameJson(texts, JSON.stringify([bossBarAtEntry]))),
      logHasEveryTick: cycle.rows.every((row, index) => row.tick === index) && cycle.rows.length > Number(lastTick),
      stagesOnSchedule: sameJson(observed.stageEntries, stages),
      overheadsOnSchedule: sameJson(observed.overheadSwitches, overheads),
      transitionAttacksReplayed: sameJson(observed.specialHits, specials),
      focusApplied: focus.header.choices.focus.key === focusKey && sameJson(observed.focus, focusExpected),
      focusBossHoversAtEntry: observed.focusEntrySounds.some(([, , samples, state]) => samples === JSON.parse(bossPoseSamples).hover && state === "running") &&
        !observed.focusEntrySounds.some(([, , samples]) => samples === JSON.parse(bossPoseSamples).rise),
      rangedShotFromTheFlood: launch !== undefined && !inSquare(edgeStopTile) && same(launch.playerAtBossStep.tile, edgeStopTile) && same(launch.playerAtPostTick.tile, edgeStopTile) && floorHit(launch),
      rangedShotLanded: launch !== undefined && landing !== undefined && landing.at > launch.tick && landing.outcome === "passed" && landing.requested > 0 &&
        landing.bossHp.atBossStep - landing.bossHp.atPostTick === landing.requested,
      ringSparedInFlood: flood.length === Number(floodLast) - Number(floodDamage) + 1 && flood.every((row) => floorHit(row) === !inSquare(row.playerAtBossStep.tile)) &&
        flood.some(floorHit) && inSquare(flood[flood.length - 1].playerAtBossStep.tile),
      floodHitsStandingStill: sameJson(observed.voidHits, voidHits) && sameJson(observed.voidHitTiles, JSON.stringify([JSON.stringify(spawnTile)])) && sameJson(observed.voidRunEnd, voidEnd),
      noVoidBeforeTheFight: share["before.png"] < 0.3,
      innerVoidDrawn: share["void-inner.png"] > 0.6 && share["void-inner.png"] < 3,
      floodDrawn: share["void-flood.png"] > 3 && share["flood-ring.png"] > 3,
      rangedSetupWorn: sameJson(dressed.player.equipped, rangedWorn),
      switchesWornByClick: sameJson(switched.player.equipped, meleeWorn),
      divisionSpentHalfTheBar: switched.player.specialEnergy === 100 && spec.player.specialEnergy === 50,
      divisionDrainedBossDefence: (() => {
        const kept = (e) => (e.outcome === "passed" ? e.requested : e.outcome === "reduced" ? Math.floor((e.requested * (100 - Number(explosionReduction))) / 100) : 0);
        const glaives = read("loadout-spec-log.json").rows.flatMap((row) => row.events.filter((e) => e.kind === "player-hit-judged")).slice(0, 2);
        return glaives.length === 2 && switched.boss.defence - spec.boss.defence === Number(drain) * glaives.filter((e) => kept(e) > 0).length;
      })(),
      setupSelectorApplied: sameJson(selector.player.equipped, meleeWorn),
      divisionStopsAtDefenceFloor: sameJson(observed.defenceFloor.bossDefence, floorSteps) && floorGlaives.length === 4 && floorGlaives.every((event) => (event.outcome === "passed" || event.outcome === "reduced") && event.requested > 0),
      orbToldAndDrained: sameJson(orb.told, JSON.stringify(expectedOrb.told)) && sameJson(orb.drained, JSON.stringify(expectedOrb.drained)),
      orbSpawnedDormant: sameJson(orb.spawned, JSON.stringify(expectedOrb.spawned)),
      orbClickTargetedOrb: same(orb.clicked, orbTile),
      orbGlowsOnSchedule: sameJson(orb.matured, JSON.stringify(expectedOrb.matured)),
      orbReturnedTickAfterArrival: orb.returned.length === 1 && orb.returned[0][0] === readyAt + 1 && sameJson(orb.returned[0][1], JSON.stringify(expectedOrb.returned)),
      orbGlowDrawn: Math.max(...orb.tealShare.glow) - Math.max(...orb.tealShare.dormant) >= 3,
      skippedOrbHealsBoss: sameJson(orb.skipExpired, JSON.stringify(expectedOrb.skipExpired)) && sameJson(orb.skipHeal, JSON.stringify(expectedOrb.skipHeal)) && orb.skipReturned === 0,
      explosionsDodgedOnMarkTicks: dodges.every((d) => d.stepped && d.outcome === "avoided") && same(dodges[0].tile, spawnTile),
      lateStepHitOnMarkedTile: lateStep.standing !== null && lateStep.resolved?.outcome.kind === "hit" && sameJson(lateStep.resolved.outcome.receipt, JSON.stringify(expectedExplosions.lateHit)) &&
        same(lateStep.marked, lateStep.standing) && same(lateStep.resolved.tile, lateStep.standing) && !lateStep.steppedOnMark && lateStep.steppedOnImpact && !same(lateStep.endTile, lateStep.standing),
      campingUnderBossHit: sameJson(under, JSON.stringify(expectedExplosions.under)),
      hitsDuringTheExplosionsLoseTheReduction: (() => {
        const marks = JSON.parse(innerMarks);
        const during = (at) => at >= marks[0] && at <= marks[marks.length - 1] + 1;
        const kept = (requested) => Math.floor((requested * (100 - Number(explosionReduction))) / 100);
        return speedup.bossHits.some(([at, , requested]) => during(at) && requested > 0 && kept(requested) < requested) &&
          speedup.bossHits.every(([at, outcome, requested, lost]) => (during(at) ? outcome === "reduced" && lost === kept(requested) : outcome === "passed" && lost === requested));
      })(),
      bowTwoTicksOnOneTileDodges: sameJson(speedup.attacks, dodgeAttacks) && speedup.dodges.length === JSON.parse(innerMarks).length && speedup.dodges.every(([, , kind]) => kind === "dodged"),
      explosionSoundsOnSchedule: sameJson(sounds.heard, explosionSounds) && sameJson(sounds.contexts, JSON.stringify(["running"])),
      markGlowsBrightPurple: Object.values(observed.explosions.glow).every((g) => g.share >= Number(explosionGlowMinShare)),
      explosionsDodgedIn2d: sameJson(observed.explosions.twoD.marks, JSON.stringify(JSON.parse(explosion2dExpected).marks)) && observed.explosions.twoD.dodges.every((d) => d.stepped && d.outcome === "dodged"),
      lateStepHitIn2d: observed.explosions.twoD.late.steppedOnImpact && sameJson(observed.explosions.twoD.late.hit, JSON.stringify(JSON.parse(explosion2dExpected).lateHit)),
      markGlowsIn2d: observed.explosions.twoD.glow.share >= Number(explosionGlowMinShare),
      markLeftBehindIn2d: ((g, tiles) => g.dx !== null && Math.abs(g.dx) >= 0.01 && Math.sign(g.dx) === Math.sign(tiles.marked.x - tiles.stepped.x))(observed.explosions.twoD.glow, observed.explosions.twoD.tiles),
      markGoneWhenTheRunEnds: Object.values(observed.explosions.runEnd).every(({ marked, ended, resolved, drawnWhileMarked, drawnAfterTheEnd }) =>
        sameJson({ marked, ended, resolved }, explosionRunEndExpected) && drawnWhileMarked >= Number(explosionGlowMinShare) && drawnAfterTheEnd.every((share) => share <= Number(explosionGlowMaxShare))),
      markerStaysOnCapturedTile: leftGlow.dx !== null && leftGlow.dx <= -0.01 && standing.share >= 0.1 && standing.dx !== null && Math.abs(standing.dx) <= 0.016,
      prayerBeforeLandingProtects: special.prayedAt !== null && special.prayedAt < expectedSpecial.protected[0] && sameJson(special.hits, JSON.stringify([expectedSpecial.protected])),
      lateClickTakesFullHit: special.latePrayedAt !== null && special.latePrayedAt > expectedSpecial.late[0] && sameJson(special.lateHits[0], JSON.stringify(expectedSpecial.late)),
      tellsToldOnSchedule: sameJson(special.told, JSON.stringify(expectedSpecial.told)),
      tellsDrawn: special.tellShare["special-before.png"] < 0.3 && ["special-vortex.png", "special-spike-disk.png", "special-semicircle.png"].every((file) => special.tellShare[file] >= 1),
      tellCentresDark: ["special-vortex.png", "special-spike-disk.png", "special-black-disk.png"].every((file) => special.centreShares[file].white < 1),
      landingSoundsOnSchedule: onSchedule(special.landingSounds, landingExpected) && sameJson(special.contexts, JSON.stringify(["running"])),
      styleSoundsOnSchedule: onSchedule(special.styleSounds, styleExpected) && sameJson(special.contexts, JSON.stringify(["running"])),
      itemNamedInMenu: sameJson(itemMenu, namedMenu) && itemMenuClosed === null,
      suppliesCarried: sameJson(carried, supplyInventory),
      brewHealedNextTick: (() => {
        const healed = brewHp.find(([, hp]) => hp !== 99);
        return healed !== undefined && healed[1] === Number(hpAfterBrew) && healed[0] > brewClick && healed[0] <= brewClick + 2;
      })(),
      keybindsButtonOpensSettings: keysOpen.tab === "SETTINGS" && keysOpen.keys.inventory === defaultKey,
      keyBoundAndSaved: keysBound.keys.inventory === newKey && keysSaved.values?.inventory_key === newKey,
      boundKeyOpensTabAfterReload: keysOldKey.tab === "PRAYER" && keysReloaded.tab === "INVENTORY" && keysReloaded.keys.inventory === newKey,
      defaultKeyRestored: keysRestored.keys.inventory === defaultKey,
      trainerItemsShowCacheIcons: Object.entries(JSON.parse(trainerIcons)).every(([id, size]) => icons[id]?.path === `/osrs-assets/item-icons/${id}.png` && icons[id].size === size),
      hoverTextOnCanvas: readsInFull(observed.hoverText["brew-heal.png"]) &&
        (readsInFull(observed.hoverText["keybinds.png"]) || (observed.hoverText["keybinds.png"].action === null && observed.hoverText["keybinds.png"].name === null)),
      overheadIconsDrawn: iconShots.every((shot) => shot.logged[0] !== undefined && shot.logged[0] === shot.logged[1] && shot.icon === shot.logged[0]),
      overheadDroppedBeforeEachVoid: drawnAroundGaps.every(({ tick, frames, sprites }) => frames > 0 && sameJson(sprites, JSON.stringify(JSON.parse(gapDraws)[tick]))) &&
        drawnAroundGaps.filter(({ sprites }) => sprites.length === 0).every(({ logged }) => logged === null),
      meleeCannotReachHoveringBoss: sameJson(hover.standsOn, `[${hoverTile}]`) && hover.bossHp[0] !== undefined && hover.bossHp[0] === hover.bossHp[1] &&
        meleeJudged.length > 0 && meleeJudged[0].at === Number(firstMeleeTick) && meleeJudged.every((e) => e.at >= Number(firstMeleeTick)),
      deflectBlocksMeleeUntilSoulSplit: meleeJudged.filter((e) => e.outcome === "blocked").length >= 2 && meleeJudged.filter((e) => e.outcome === "passed").length >= 2 &&
        meleeJudged.every((e) => e.outcome === (e.overhead === "deflect-melee" ? "blocked" : "passed") && (e.outcome === "passed" || e.taken === 0)) &&
        meleeJudged.reduce((sum, e) => sum + (e.outcome === "passed" ? e.taken : 0), 0) > 0,
      soulSplitHealsUnprotected: soulSplit.protectedRunReached && soulSplit.protectedHeals.length === 0 && sameJson(soulSplit.lateHeals, soulSplitExpected),
      riftsSpawnBesideBoss: sameJson(rifts.spawned, JSON.stringify(expectedRifts.spawned)),
      riftKilledByClick: rifts.destroyed.length === 1 && rifts.destroyed[0][1] === expectedRifts.destroyed && rifts.destroyed[0][0] <= Number(burstTick),
      killChatShown: rifts.chat === killChat,
      standingRiftBursts: sameJson(rifts.bursts, JSON.stringify(expectedRifts.bursts)),
      riftsTakeStandardRangedMaxHits: sameJson(rifts.hits, riftOneHit) && sameJson(rifts.ralosHits, riftRalosHits),
      riftsTakeStandardMeleeMaxHits: sameJson(rifts.meleeHits, riftMeleeHits),
      riftTimerBarFills: rifts.timerShares.beforeSpawn === 0 && rifts.timerShares.spawned > 0 && rifts.timerShares.spawned <= Number(riftTimerMaxEarly) && rifts.timerShares.charged >= Number(riftTimerMinFull),
      deflectReflectsATenth: sameJson({ judged: observed.reflect.judged, reflected: observed.reflect.reflected, hpAfter: observed.reflect.hpAfter }, reflectExpected) &&
        observed.reflect.judged.every(([at, style, outcome, requested]) => observed.reflect.reflected.filter((r) => r[0] === at).length === (outcome === "blocked" && Math.floor(requested / 10) > 0 ? 1 : 0)),
      reflectHitsplatOnPlayer: observed.reflect.splatShares.reflected >= Number(reflectMinSplat) && observed.reflect.splatShares.unreflected <= Number(reflectMaxClear),
      riftSpawnSoundsOnFrame: onSchedule(rifts.sounds.spawn, riftExpectedSounds.spawn) && sameJson(rifts.sounds.contexts, JSON.stringify(["running"])),
      riftKillSoundOnFrame: riftExpectedSounds.kill.length === 1 && onSchedule(rifts.sounds.kill, riftExpectedSounds.kill) && sameJson(rifts.sounds.contexts, JSON.stringify(["running"])),
      riftBurstSoundsOnFrames: onSchedule(rifts.sounds.burst, riftExpectedSounds.burst) && sameJson(rifts.sounds.contexts, JSON.stringify(["running"])),
      seedFreshAndShown: /^\d+$/.test(seeds.fresh.box) && Number(seeds.fresh.box) === seeds.fresh.seed && seeds.fresh.seed !== 1 && seedInUrl(seeds.fresh) === null,
      restartDrawsFreshSeed: seedInUrl(seeds.restarted) === null && seeds.restarted.seed !== seeds.fresh.seed && Number(seeds.restarted.box) === seeds.restarted.seed,
      typedSeedReplays: seedInUrl(seeds.typed) === seeds.fresh.box && seeds.typed.seed === seeds.fresh.seed && seeds.typed.box === seeds.fresh.box,
      walkwayClickStaysOnFloor: sameJson(observed.walkway.orders, `[${walkwayOrder}]`) && same(walkwayArrived.player, JSON.parse(walkwayStop)) && same(walkwayHeld.player, JSON.parse(walkwayStop)) &&
        walkwayHeld.tick - walkwayArrived.tick >= Number(holdTicks),
      walkwayDrawn: observed.walkway.share >= Number(walkwayMinShare),
      eastEdgeRunsStraight: sameJson(observed.walkway.runEnd.orders, `[${walkwayRunEnd}]`) && same(walkwayRunEndHeld.player, JSON.parse(walkwayRunEnd)),
      bossBlocksOnlyInOuterVoid: sameJson(observed.pathing.orders, `[${pathingWest},${pathingEast},${pathingBack}]`) && sameJson(observed.pathing.walks.slice(1), pathingExpected),
      walkOntoBossReroutesAsTheFloodStarts: sameJson([observed.pathingReroute.orders, observed.pathingReroute.orderTicks, observed.pathingReroute.walks], pathingRerouteExpected),
      walkOutFromUnderBossInTheFlood: sameJson([observed.pathingOut.orders, observed.pathingOut.orderTicks.slice(1), observed.pathingOut.walks], pathingOutExpected),
      controlClickOntoBossReroutesAtWalkPace: sameJson([observed.pathingControl.orders, observed.pathingControl.paces, observed.pathingControl.orderTicks, observed.pathingControl.walks], pathingControlExpected),
      plainClickRunsTwoTilesATick: sameJson(observed.walkway.paces, JSON.stringify(["run-setting"])) && sameJson(observed.walkway.tiles, walkwayRunTiles),
      controlClickWalksOneTileATick: sameJson(observed.controlWalk.orders, `[${walkwayOrder}]`) && sameJson(observed.controlWalk.paces, JSON.stringify(["walk"])) &&
        sameJson(observed.controlWalk.tiles, controlWalkTiles),
      lastClickInATickWins: correction.downs.length === 2 && correction.downs[0].tick === correction.downs[1].tick &&
        sameJson(correction.orderRows, JSON.stringify([{ worldTick: correction.downs[0].tick + 1, orders: JSON.parse(correctionExpected).orders }])) &&
        sameJson(correction.tiles, JSON.stringify(JSON.parse(correctionExpected).tiles)),
      controlClickOpensNoMenu: observed.controlWalk.menu === null && (!observed.controlWalk.platform.startsWith("Mac") || observed.controlWalk.contextMenus > 0),
      rightClickStillOpensMenu: Array.isArray(observed.controlWalk.rightClickMenu) && observed.controlWalk.rightClickMenu.includes("Walk Here"),
      backWallWalksDiagonally: sameJson(observed.backWall.orders, `[${backWallStart},${backWallEnd},${backWallStart}]`) &&
        sameJson(observed.backWall.paces, JSON.stringify(["run-setting", "walk", "walk"])) && sameJson(observed.backWall.toward, backWallToward) && sameJson(observed.backWall.back, backWallBack),
      cornerFilled: sameJson(observed.corner.orders, `[${cornerHole},${cornerNub}]`) && sameJson(observed.corner.stood, `[${cornerHole},${cornerNub}]`),
      holesDrawnOnLayout: sameJson(observed.holes.layout, holeLayout) && observed.holes.darkShare.every((box) => onHole(box.tile) && box.drawn >= Number(holeMinDark)) &&
        observed.holes.freeDarkShare.every((box) => !onHole(box.tile) && box.drawn <= Number(holeMaxDark)),
      orbPickedUpAfterTheClear: observed.orbLate.returned.length === 1 && observed.orbLate.returned[0][0] > Number(orbInnerClear) &&
        observed.orbLate.returned[0][0] <= Number(orbInnerExpiry) && observed.orbLate.returned[0][1] === "inner-void" &&
        sameJson(observed.orbLate.returned[0][2], JSON.stringify(expectedOrb.returned)) && observed.orbLate.innerExpired.length === 0,
      outerOrbOppositeEntry: sameJson(observed.orbEntry.walks, `[${orbEntryTile}]`) && sameJson(observed.orbEntry.outer, orbOppositeExpected),
      orbFormsOffTheHoles: sameJson(observed.orbOffHoles.layout, orbHolesLayout) && sameJson(observed.orbOffHoles.spawned, orbHolesExpected) &&
        observed.orbOffHoles.spawned.every(([, , tile]) => !JSON.parse(orbHolesLayout).tiles.some((hole) => same(tile, hole))),
      holesHiddenUnderFlood: observed.holes.darkShare.every((box) => box.flood <= Number(holeMaxDark)),
      holeHitsStandingOnIt: (() => {
        const { rows } = observed.holes, hits = rows.flatMap((row) => row.hits), damage = JSON.parse(holeDamage);
        return rows.every((row) => row.hits.length === (onHole(row.startedOn) ? 1 : 0) && row.hits.every((hit) => hit.at === row.tick)) && rows.some((row) => !onHole(row.startedOn)) &&
          hits.length >= Number(holeHits) && hits.every((hit) => same(hit.tile, JSON.parse(holeTile)) && hit.requested >= damage.min && hit.requested <= damage.max);
      })(),
      soundTogglesShownOnWhenFresh: cues.toggles.fresh.sound.visible && cues.toggles.fresh.areaSound.visible && cues.toggles.fresh.sound.checked && cues.toggles.fresh.areaSound.checked,
      defaultSoundPlaysCueAfterFirstClick: cues.freshClickedAt < 5 && allIn(cues.contexts.fresh, "suspended") && allIn(cues.contexts["fresh-clicked"], "running") &&
        onSchedule(timedOnly(cues.freshHeard), cueExpected.filter(([at]) => at < toggledAt)) && cues.freshHeard.every(([, , state]) => state === "running"),
      soundOffChoiceSaved: cues.savedOff.playsAudio === false && cues.savedOff.playsAreaAudio === false,
      soundTogglesShownOff: cues.toggles.off.sound.visible && cues.toggles.off.areaSound.visible && !cues.toggles.off.sound.checked && !cues.toggles.off.areaSound.checked,
      soundTogglesTurnOnCues: recordingFrom < 5 && cues.beforeToggle.length === 0 && cues.toggles.on.sound.checked && cues.toggles.on.areaSound.checked &&
        onSchedule(timedOnly(cues.afterToggle), cueExpected.filter(([at]) => at >= toggledAt)) && cues.afterToggle.every(([, , state]) => state === "running"),
      soundChoiceSaved: cues.saved.playsAudio === true && cues.saved.playsAreaAudio === true && cues.toggles.reloaded.sound.checked && cues.toggles.reloaded.areaSound.checked,
      audioResumesOnFirstPointerdown: allIn(cues.contexts.loaded, "suspended") && allIn(cues.contexts.toggled, "running") && allIn(cues.contexts.reloaded, "suspended") && allIn(cues.contexts.clicked, "running"),
      cueSoundsOnSchedule: onSchedule(timedOnly(cues.heard), cueExpected) && cues.heard.every(([, , state]) => state === "running"),
      lifeforceChatOnTell: cues.chat[0] === "" && cues.chat[1] === cueChat && sameJson(cues.told, "[11,42]"),
      invincibleStartsUnchecked: invincible.defaultToggle.visible === true && invincible.defaultToggle.checked === false,
      invincibleLinkSurvivesTheLethalHit: invincible.linkedToggle.checked === true && sameJson(invincible.floorHits.filter(([at]) => at <= 54), voidHits) &&
        sameJson(invincible.prevented, JSON.stringify(expectedInvincible.prevented)) && sameJson(invincible.hp, JSON.stringify(expectedInvincible.hp)) &&
        invincible.ended.length === 0 && invincible.lastTick >= Number(invincibleLastTick),
      invincibleChatShown: invincible.chat === expectedInvincible.chat,
      mortalWithoutTheParameter: invincible.preventedWithoutTheParameter.length === 0 && sameJson(observed.voidRunEnd, voidEnd),
      restartKeepsInvincible: new URLSearchParams(invincible.restarted.search).get("invincible") === "on" && invincible.restarted.toggle.checked === true,
      invincibleOrbReturnsNothingAfterRevival: sameJson(invincible.orb.prevented[0], JSON.stringify(expectedRevival.revived)) &&
        sameJson(invincible.orb.returned, JSON.stringify(expectedRevival.returned)) &&
        sameJson(invincible.orb.hp.find(([t]) => t === expectedRevival.hp[0]), JSON.stringify(expectedRevival.hp)) &&
        invincible.orb.hp.every(([, hp]) => hp <= expectedRevival.maxHp),
      projectedClicksOrderTheirTiles: tileClicks.length === Number(projectedTileClicks) && tileClicks.every(({ tile, ordered }) => same(ordered, tile)),
      noPageErrors: [errors, focusErrors, voidErrors, shotErrors, orbErrors, orbSkipErrors, explosionErrors, underErrors, dodgeErrors, explosion2dErrors, runEndPages["2d"].errors, runEndPages["3d"].errors, specialErrors, lateErrors, loadoutErrors, selectorErrors, floorErrors, suppliesErrors, keybindsErrors, riftErrors, ralosErrors, meleeRiftErrors, deflectErrors, reflectErrors, seedErrors, holesErrors, orbHolesErrors, orbLateErrors, orbEntryErrors, walkwayErrors, walkwayRunEndErrors, controlWalkErrors, correctionErrors, backWallErrors, cornerErrors, cornerViewErrors, pathingErrors, rerouteErrors, controlRerouteErrors, outErrors, invincibleErrors, invincibleOrbErrors, freshErrors, cueToggleErrors, cueErrors].every((list) => list.length === 0),
    };
    if (!checks.clickTargetedExpectedTile) {
      console.error(`verify: the click resolved to ${JSON.stringify(after.destination)}, not ${JSON.stringify(targetTile)}; the click-to-tile mapping for this viewport and camera changed`);
    }
    console.log(JSON.stringify({ hidden, before, after, target: targetTile, edge: { order: edgeOrderTile, stop: edgeStopTile }, observed, tileClicks, checks }, null, 2));
    process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
  ' "$VERIFY_DIR" "$SPAWN_TILE" "$WALK_TARGET_TILE" "$EDGE_ORDER_TILE" "$EDGE_STOP_TILE" "$EDGE_HOLD_TICKS" "$BOSS_NPC" "$CYCLE_LAST_HIDDEN_TICK" "$CYCLE_LAST_TICK" "$CYCLE_STAGE_ENTRIES" "$CYCLE_OVERHEAD_SWITCHES" "$CYCLE_SPECIAL_HITS" "$FOCUS_DRILL" "$FOCUS_EXPECTED" \
    "$NEAR_SQUARE" "$FLOOD_DAMAGE_TICK" "$FLOOD_LAST_TICK" "$VOID_FLOOR_HITS" "$VOID_RUN_END" "$VOID_PIXEL" \
    "$LOADOUT_RANGED_WORN" "$LOADOUT_MELEE_WORN" "$LOADOUT_DIVISION_DRAIN" "$ORB_EXPECTED" "$ORB_BOX" "$ORB_FRAMES" \
    "[${EXPLOSION_INNER_MARKS// /,}]" "${EXPLOSION_OUTER_MARKS%% *}" "$EXPLOSION_PIXEL" "$EXPLOSION_EXPECTED" "$SOUND_SAMPLES" "$EXPLOSION_SOUNDS" "$CX" "$CY" "$TELL_BOX" "$SPECIAL_EXPECTED" \
    "$TELL_CENTRE_BOX" "$TRANSITION_SOUND_SAMPLES" "$LANDING_SOUNDS" "$LANDING_WINDOWS" "$STYLE_SOUNDS" "$STYLE_WINDOWS" "$SOUND_TOLERANCE_TICKS" \
    "$SUPPLY_INVENTORY" "$SUPPLY_NAMED_MENU" "$SUPPLY_HP_AFTER_BREW" "$KEYBIND_DEFAULT_KEY" "$KEYBIND_NEW_KEY" \
    "$LOADOUT_TRAINER_ICONS" "$((LOADOUT_SLOT_Y + SUPPLY_BREW_SLOT / 4 * LOADOUT_SLOT_DY))" "$SUPPLY_HOVER_NAME_PIXEL" \
    "$OVERHEAD_SHOT_TICKS" "$ICON_BOX" "$RIFT_EXPECTED" "$RIFT_BURST_TICK" "$SOUL_SPLIT_EXPECTED" "$KILL_CHAT" \
    "$RIFT_SOUND_SAMPLES" "$RIFT_SPAWN_SOUNDS" "$RIFT_KILL_SOUND" "$RIFT_BURST_SOUNDS" "$RIFT_SOUND_WINDOW" "$OVERHEAD_GAP_DRAWS" \
    "$DEFLECT_HOVER_TILE" "$DEFLECT_HOVER_TICKS" "$DEFLECT_FIRST_MELEE_TICK" \
    "$WALKWAY_ORDER_TILE" "$WALKWAY_STOP_TILE" "$WALKWAY_PIXEL" "$WALKWAY_MIN_SHARE" "$WALKWAY_RUN_END_TILE" "$WALKWAY_RUN_TILES" "$CONTROL_WALK_TILES" "$CORNER_HOLE_TILE" "$CORNER_NUB_TILE" \
    "$HOLE_LAYOUT" "$HOLE_PIXELS" "$HOLE_FREE_PIXELS" "$HOLE_BOX_HALF_PX" "$HOLE_MIN_DARK_SHARE" "$HOLE_MAX_DARK_SHARE" "$HOLE_TILE" "$HOLE_HITS" "$HOLE_DAMAGE" \
    "$CUE_SOUND_SAMPLES" "$CUE_SOUNDS" "$CUE_SOUND_WINDOW" "$CUE_CHAT" "$DEFENCE_FLOOR_STEPS" "$INVINCIBLE_LAST_TICK" "$INVINCIBLE_EXPECTED" "$INVINCIBLE_ORB_EXPECTED" \
    "$RIFT_TIMER_BOX" "$RIFT_TIMER_MAX_EARLY_SHARE" "$RIFT_TIMER_MIN_FULL_SHARE" "$RIFT_ONE_HIT" "$RIFT_RALOS_HITS" "$RIFT_MELEE_HITS" "$REFLECT_EXPECTED" "$REFLECT_SPLAT_BOX" "$REFLECT_MIN_SPLAT_SHARE" "$REFLECT_MAX_CLEAR_SHARE" \
    "$DODGE_SPEEDUP_LAST_TICK" "$DODGE_SPEEDUP_ATTACKS" "$EXPLOSION_GLOW_BOX" "$EXPLOSION_GLOW_MIN_SHARE" "$FOCUS_ENTRY_TICKS" "$BOSS_POSE_SOUND_SAMPLES" \
    "$PATHING_WEST_TILE" "$PATHING_EAST_TILE" "$PATHING_BACK_TILE" "$PATHING_EXPECTED" "$PATHING_REROUTE_EXPECTED" "$PATHING_OUT_EXPECTED" "$PATHING_CONTROL_EXPECTED" "$ORB_HOLES_EXPECTED" "$ORB_HOLES_LAYOUT" \
    "$ORB_INNER_CLEAR_TICK" "$ORB_INNER_EXPIRY_TICK" "$ORB_ENTRY_TILE" "$ORB_OPPOSITE_EXPECTED" "$PROJECTED_TILE_CLICKS" "$BOSS_BAR_AT_ENTRY" "$EXPLOSION_DAMAGE_REDUCTION_PERCENT" \
    "$BACK_WALL_START_TILE" "$BACK_WALL_END_TILE" "$BACK_WALL_TOWARD_TILES" "$BACK_WALL_BACK_TILES" \
    "$EXPLOSION_2D_GLOW_BOX" "$EXPLOSION_2D_EXPECTED" "$EXPLOSION_RUN_END_EXPECTED" "$EXPLOSION_GLOW_MAX_SHARE" "$EXPLOSION_RUN_END_FRAMES" "$CORRECTION_EXPECTED" >"$VERIFY_DIR/observed.json"
  local verdict=$?
  cat "$VERIFY_DIR/observed.json"
  drive_p3_drill || verdict=1
  drive_p3_smite || verdict=1
  return $verdict
}

release_browser() {
  ab close >/dev/null 2>&1
  agent-browser --session "${BROWSER_SESSION}-autoplay" close >/dev/null 2>&1
  agent-browser --session "${BROWSER_SESSION}-mobile" close >/dev/null 2>&1
  [[ -n "$LAUNCHED_PID" && -f "$STATE_FILE" && "$(state pid)" == "$LAUNCHED_PID" ]] || return 0
  stop
}

stage_browser() {
  BROWSER_SESSION="archive-ocellus-verify-$(basename "$VERIFY_DIR")"
  LAUNCHED_PID=
  local result=1
  trap 'release_browser; exit 130' INT TERM
  if serve && doctor; then
    drive
    result=$?
  fi
  release_browser || result=1
  trap - INT TERM
  return $result
}

production_listener() {
  VERIFY_PORT=$PRODUCTION_PORT port_listener
}

watch_production_page() {
  local name=$1
  ab wait --fn "window.__orbs?.first !== null" --timeout 90000 >/dev/null || log "${name}: the minimap orbs never drew their numbers"
  sleep "$PRODUCTION_WATCH_SECONDS"
  ab --json eval "({ text: document.body.innerText, orbs: window.__orbs })" | json data.result >"$VERIFY_DIR/${name}.json" || { log "${name}: page state capture failed"; return 1; }
  ab screenshot "$VERIFY_DIR/${name}.png" >/dev/null || { log "${name}: screenshot failed"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/${name}-page-errors.json" || { log "${name}: page error capture failed"; return 1; }
}

drive_production() {
  local url="http://127.0.0.1:${PRODUCTION_PORT}/${PRODUCTION_QUERY}" opened deadline
  echo "$PRODUCTION_ORBS_JS" >"$VERIFY_DIR/production-orbs.js"
  ab --init-script "$VERIFY_DIR/production-orbs.js" set viewport 1280 800 >/dev/null || { log "the production session did not start"; return 1; }
  ab open "$url" >/dev/null || return 1
  watch_production_page production || return 1

  ab open about:blank >/dev/null || return 1
  ab network har start --content none >/dev/null || { log "HAR recording did not start"; return 1; }
  ab network route "http://127.0.0.1:${PRODUCTION_PORT}/*.png" --abort >/dev/null || { log "the SDK image route was not set"; return 1; }
  ab network requests --clear >/dev/null || return 1
  ab open "$url" >/dev/null &
  opened=$!
  deadline=$((SECONDS + 90))
  until [[ "$(ab --json network requests --filter ".png" | json data.requests.length)" -gt 0 ]]; do
    (( SECONDS < deadline )) || { log "the page never requested an SDK image"; ab network unroute >/dev/null; wait "$opened"; return 1; }
  done
  ab network unroute >/dev/null || { log "the SDK image route was not lifted"; return 1; }
  wait "$opened" || return 1
  watch_production_page production-dropped-images || return 1
  ab network har stop "$VERIFY_DIR/production-dropped-images.har" >/dev/null || { log "HAR capture failed"; return 1; }

  node -e '
    const fs = require("fs"), [dir, port, expectedOrbs] = process.argv.slice(1);
    const read = (name) => JSON.parse(fs.readFileSync(`${dir}/${name}`, "utf8"));
    const statuses = {};
    for (const { request, response } of read("production-dropped-images.har").log.entries) {
      if (new RegExp(`^http://127\\.0\\.0\\.1:${port}/[^/]+\\.png$`).test(request.url)) (statuses[request.url] ??= []).push(response.status);
    }
    const dropped = Object.entries(statuses).filter(([, attempts]) => attempts[0] === 0);
    const page = (name) => {
      const { text, orbs } = read(`${name}.json`);
      return {
        loaded: !text.includes("Loading failed"),
        orbs,
        errors: read(`${name}-page-errors.json`).map((error) => error.text ?? error.message ?? String(error)).slice(0, 3),
        errorCount: read(`${name}-page-errors.json`).length,
      };
    };
    const [clean, retried] = ["production", "production-dropped-images"].map(page);
    const orbsDrawn = ({ orbs }) => orbs.first !== null && JSON.stringify(orbs.first) === expectedOrbs && orbs.last.length === 4 && orbs.blankSinceFirst === 0;
    const checks = {
      productionLoads: clean.loaded,
      productionOrbsShowNumbers: orbsDrawn(clean),
      noProductionPageErrors: clean.errorCount === 0,
      droppedSdkImagesRetried: dropped.length > 0 && dropped.every(([, attempts]) => attempts[attempts.length - 1] === 200),
      productionLoadsAfterDroppedImages: retried.loaded,
      orbsShowNumbersAfterDroppedImages: orbsDrawn(retried),
      noPageErrorsAfterDroppedImages: retried.errorCount === 0,
    };
    console.log(JSON.stringify({ clean, retried, dropped: dropped.map(([url, attempts]) => ({ url, attempts })), checks }, null, 2));
    process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
  ' "$VERIFY_DIR" "$PRODUCTION_PORT" "$PRODUCTION_ORBS" >"$VERIFY_DIR/production-checks.json"
  local verdict=$?
  cat "$VERIFY_DIR/production-checks.json"
  [[ $verdict -eq 0 ]] || log "a production check failed"
  drive_production_hidden_p3 || verdict=1
  return $verdict
}

drive_production_hidden_p3() {
  ab open "http://127.0.0.1:${PRODUCTION_PORT}/${PRODUCTION_P3_QUERY}" >/dev/null || return 1
  ab eval '(() => {
    const bars = window.__bossBars = [];
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...rest) {
      if (/^\d+ \/ \d+ \(\d+\.\d%\)$/.test(String(text)) && !bars.includes(String(text))) bars.push(String(text));
      return fillText.call(this, text, ...rest);
    };
  })()' >/dev/null || { log "the production boss bar probe was not installed"; return 1; }
  ab wait --fn "window.__bossBars.length > 0" --timeout 90000 >/dev/null || log "the production page never drew a boss bar"
  ab click "#settings" >/dev/null && ab wait 300 >/dev/null || { log "the production Settings button was not clicked"; return 1; }
  ab --json eval "({ search: location.search, bars: window.__bossBars, menuOpen: document.getElementById('settings_menu')?.checkVisibility() === true, setupBox: document.getElementById('setup') !== null, phaseBox: document.getElementById('phase') !== null })" |
    json data.result >"$VERIFY_DIR/production-phase-p3.json" || { log "the production phase=p3 page was not read"; return 1; }
  ab --json errors | json data.errors >"$VERIFY_DIR/production-phase-p3-page-errors.json" || { log "page error capture failed"; return 1; }
  node -e '
    const fs = require("fs"), [dir, entryBar] = process.argv.slice(1);
    const page = JSON.parse(fs.readFileSync(`${dir}/production-phase-p3.json`, "utf8"));
    const errors = JSON.parse(fs.readFileSync(`${dir}/production-phase-p3-page-errors.json`, "utf8"));
    const checks = {
      phaseP3OpensP4: page.search === "?phase=p3&seed=1" && page.bars[0] === entryBar && errors.length === 0,
      noPhaseBox: page.menuOpen && page.setupBox && !page.phaseBox,
    };
    console.log(JSON.stringify({ page, errors: errors.length, checks }, null, 2));
    process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
  ' "$VERIFY_DIR" "$BOSS_BAR_AT_ENTRY" >"$VERIFY_DIR/production-phase-p3-checks.json"
  local verdict=$?
  cat "$VERIFY_DIR/production-phase-p3-checks.json"
  [[ $verdict -eq 0 ]] || log "a hidden P3 production check failed"
  return $verdict
}

release_production() {
  ab close >/dev/null 2>&1
  [[ -n "$PRODUCTION_PID" ]] || return 0
  kill "$PRODUCTION_PID" 2>/dev/null
  wait "$PRODUCTION_PID" 2>/dev/null
  [[ -z "$(production_listener)" ]] || { log "port ${PRODUCTION_PORT} is still held by $(production_listener)"; return 1; }
  log "production: static server PID ${PRODUCTION_PID} is gone"
}

stage_production() {
  case "$PRODUCTION_PORT" in 8000 | 8001 | "$VERIFY_PORT")
    log "port ${PRODUCTION_PORT} belongs to another server; refusing to use it"
    return 1
    ;;
  esac
  [[ -z "$(production_listener)" ]] || { log "port ${PRODUCTION_PORT} is already in use by PID $(production_listener)"; return 1; }
  manifest_ready || { log "assets missing: run scripts/verify.sh assets"; return 1; }
  ARCHIVE_P3=off node node_modules/.bin/webpack --mode production --output-path "$VERIFY_DIR/production" >"$VERIFY_DIR/production-build.log" 2>&1 || { log "the production build failed"; return 1; }

  local BROWSER_SESSION="archive-ocellus-verify-$(basename "$VERIFY_DIR")-production" result=1
  python3 -m http.server "$PRODUCTION_PORT" --bind 127.0.0.1 --directory "$VERIFY_DIR/production" >"$VERIFY_DIR/production-server.log" 2>&1 &
  PRODUCTION_PID=$!
  trap 'release_production; exit 130' INT TERM
  log "started static server PID ${PRODUCTION_PID} on http://127.0.0.1:${PRODUCTION_PORT}/"
  for _ in $(seq 1 30); do
    curl -sf -o /dev/null "http://127.0.0.1:${PRODUCTION_PORT}/" && break
    sleep 0.5
  done
  if curl -sf -o /dev/null "http://127.0.0.1:${PRODUCTION_PORT}/"; then
    drive_production
    result=$?
  else
    log "the static server never answered"
  fi
  release_production || result=1
  trap - INT TERM
  return $result
}

case "${1:-}" in
  serve) mkdir -p "$VERIFY_DIR" && ensure_deps && serve && doctor && log "drive ${URL}; evidence in ${VERIFY_DIR}; stop with scripts/verify.sh stop"; exit $? ;;
  doctor) doctor; exit $? ;;
  stop) stop; exit $? ;;
esac

stages=("$@")
[[ ${#stages[@]} -gt 0 ]] || stages=(build types test assets browser production)
for stage in "${stages[@]}"; do
  case "$stage" in build | types | test | assets | browser | production) ;; *) log "unknown stage: ${stage}"; exit 2 ;; esac
done

mkdir -p "$VERIFY_DIR"
ensure_deps || { echo "FAIL deps" | tee "$VERIFY_DIR/summary.txt"; exit 1; }
log "evidence: ${VERIFY_DIR}"
failed=0
: >"$VERIFY_DIR/summary.txt"
for stage in "${stages[@]}"; do
  if "stage_$stage"; then
    echo "PASS $stage" | tee -a "$VERIFY_DIR/summary.txt"
  else
    echo "FAIL $stage" | tee -a "$VERIFY_DIR/summary.txt"
    failed=1
  fi
done
exit $failed
