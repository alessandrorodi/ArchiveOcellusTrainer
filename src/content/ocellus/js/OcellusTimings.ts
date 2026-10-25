import type { TwistedBow } from "osrs-sdk";
import type { BuildFlags } from "../../../flags";
import type { Cycle, HpFraction, Seed, SoundId, TickSpan, Tile } from "../../../sim/brands";
import { cycle, hpFraction, seed, soundId, span, tick, tile } from "../../../sim/brands";
import type { Style } from "../../../sim/combat";
import type { Basis, Citations, Evidence, WikiRef } from "../../../sim/provenance";
import { noWiki, wiki } from "../../../sim/provenance";
import type { DrillStart, Focus } from "../../../sim/schedule";
import type { BossOverhead, HoveringBoss, Mechanic, Special, Stage, TransitionKind, VoidKind } from "./P4Types";
import type { P3Special, Quadrant, ReachRule } from "./P3Types";
import { roll } from "./roll";

type Scale = "unscaled" | "team-4" | "team-5" | "team-4-and-5" | "solo";

const VODS = {
  V1: { streamer: "Molgoatkirby", url: "https://www.twitch.tv/videos/2906214879", tickPrefix: "G", clipTickAtP4Zero: 25 },
  V2: { streamer: "Molgoatkirby", url: "https://www.twitch.tv/videos/2906214879", tickPrefix: "k", clipTickAtP4Zero: 40 },
} as const;
type Vod = keyof typeof VODS;

type OwnerDate = "2026-10-21" | "2026-10-22" | "2026-10-23" | "2026-10-24";

type Source =
  | Readonly<{ kind: "vod"; vod: Vod; at: string }>
  | Readonly<{ kind: "news"; url: string }>
  | Readonly<{ kind: "cache"; build: 2746; record: string }>
  | Readonly<{ kind: "owner"; date: OwnerDate; topic: string }>
  | Readonly<{ kind: "guide"; url: string; at: string }>
  | Readonly<{ kind: "fight-log"; recorded: "2026-10-23"; at: string }>;

type Selected<T> = Readonly<{ kind: "selected"; value: T; evidence: Evidence<Source, Scale> }>;

function selected<T>(value: T, basis: Basis, scale: Scale, note: string, ...sources: Citations<Source>): Selected<T> {
  return { kind: "selected", value, evidence: { status: "unverified", basis, scale, note, sources } };
}

type Options = Readonly<Record<string, Selected<unknown>>>;
type Choice<O extends Options> = Readonly<{ default: keyof O & string; options: Readonly<O> }>;
function choice<O extends Options>(defaultKey: keyof O & string, options: O): Choice<O> {
  return { default: defaultKey, options };
}

const vod = (which: Vod, at: string): Source => ({ kind: "vod", vod: which, at });
const news = (url: string): Source => ({ kind: "news", url });
const cache = (record: string): Source => ({ kind: "cache", build: 2746, record });
const owner = (topic: string, date: OwnerDate = "2026-10-21"): Source => ({ kind: "owner", date, topic });
const guide = (url: string, at: string): Source => ({ kind: "guide", url, at });
/** RuneLite fight logs recorded on 2026-10-23, eight fights numbered in the order they were recorded; S is the tick he lands in his corner, U the tick Untether starts. */
const fightLog = (at: string): Source => ({ kind: "fight-log", recorded: "2026-10-23", at });
const STRATEGIES_P4 = wiki("https://oldschool.runescape.wiki/w/The_Fractured_Archive/Strategies", 15381030);
const BOSS_INFOBOX = wiki("https://oldschool.runescape.wiki/w/Ocellus", 15380968);
const VOID_RIFT_PAGE = wiki("https://oldschool.runescape.wiki/w/Void_Rift", 15380527);
const NO_WIKI_TICKS = noWiki("the wiki's phase 4 steps give the order of events but no tick counts (Strategies rev 15381030)");
const NO_WIKI_P4 = noWiki("the wiki's phase 4 steps do not state it (Strategies rev 15381030)");
const NO_WIKI_ARENA = noWiki("the wiki has no tile layout of the phase 4 platform (Strategies rev 15381030, Ocellus rev 15380968)");
const NO_WIKI_PRESENTATION = noWiki("presentation from the cache or footage, not a game rule");
const NO_WIKI_PRACTICE = noWiki("a trainer option, not game data");
const pose = (id: number, name: string, basis: Basis, note: string): Selected<number> =>
  selected(id, basis, "unscaled", note, NO_WIKI_PRESENTATION, cache(`seq ${id} ${name}`));
const DEFLECT_MELEE_SEEN = [vod("V1", "G53, G55 to G57, G109, G115 to G117, G153, G154, G175 to G177"), vod("V2", "k48, k60, k70 to k72, k131, k132, k168, k170, k250 to k252")] as const;
const DEFLECT_RANGE_SEEN = [vod("V1", "G64 to G85 but G74, G124 to G145 but G133, G184 to G186, G189 to G193"), vod("V2", "k79 to k93, k143 to k153, k199, k200, k214 to k217, k259 to k273 but k266")] as const;
const SOUL_SPLIT_SEEN = [vod("V1", "G58 to G62, G86 to G91, G118 to G122, G146 to G151, G178 to G182"), vod("V2", "k73 to k77, k133 to k136, k161 to k166, k253 to k257")] as const;
const STRATEGIES = wiki("https://oldschool.runescape.wiki/w/The_Fractured_Archive/Strategies", 15378365);
const BOSS_PAGE = wiki("https://oldschool.runescape.wiki/w/Ocellus", 15379038);
const ORB_OFF_HOLES = owner("healing orbs never spawn on a floor hole; community feedback", "2026-10-23");
const STRATEGIES_RIFTS = wiki("https://oldschool.runescape.wiki/w/The_Fractured_Archive/Strategies", 15379263);
const STRATEGIES_VOID_POOLS = wiki("https://oldschool.runescape.wiki/w/The_Fractured_Archive/Strategies", 15380016);
const DEFLECT_MELEE_PAGE = wiki("https://oldschool.runescape.wiki/w/Deflect_Melee", 15124245);
const DEFENCE_REDUCTION_TABLE = wiki("https://oldschool.runescape.wiki/w/The_Fractured_Archive/Strategies", 15379033);
const HOTFIX_NEWS = news("https://secure.runescape.com/m=news/the-fractured-archive---out-today?oldschool=1");
const SOLO_SCALE = news("https://secure.runescape.com/m=news/the-fractured-archive---everything-you-need-to-know?oldschool=1");

type AmmunitionClass = "light" | "standard" | "heavy";
type Footprint = "blocks-movement" | "walkable";

type BossRecipe = Readonly<{
  npcId: Selected<number>;
  size: Selected<number>;
  combatLevel: Selected<number>;
  stats: Selected<Readonly<{ attack: number; strength: number; defence: number; range: number; magic: number }>>;
  defenceBonuses: Selected<Readonly<{ stab: number; slash: number; crush: number; magic: number }>>;
  rangedDefence: Selected<Readonly<Record<AmmunitionClass, number>>>;
  lowestDefencePercent: Selected<number>;
  footprint: Selected<Readonly<Record<Stage, Footprint>>>;
}>;

type LeadInRecipe = Readonly<{
  hiddenFor: Selected<TickSpan>;
  presentFor: Selected<TickSpan>;
  shout: Selected<Readonly<{ text: string; at: TickSpan; lasts: TickSpan }>>;
}>;

export type DamageRange = Readonly<{ min: number; max: number }>;

export type VoidRecipe<K extends VoidKind> = Readonly<{
  kind: K;
  duration: Selected<TickSpan>;
  orbMaturesAfterHit: Selected<TickSpan>;
  orbLingersAfterClear: Selected<TickSpan>;
}>;

export type TransitionRecipe<K extends TransitionKind> = Readonly<{
  kind: K;
  duration: Selected<TickSpan>;
  tellAfterStart: Selected<TickSpan>;
  hitAfterStart: Selected<TickSpan>;
  soulSplitAfterTell: Selected<TickSpan>;
}>;

type CycleRecipe = readonly [
  VoidRecipe<"inner-void">,
  TransitionRecipe<"after-inner">,
  VoidRecipe<"outer-void">,
  TransitionRecipe<"after-outer">,
];

type OverheadRecipe = Readonly<{
  "inner-void": Selected<"deflect-melee">;
  "outer-void": Selected<"deflect-range">;
  transition: Selected<"soul-split">;
  offBeforeVoid: Selected<TickSpan>;
}>;

type LifeforceRecipe = Readonly<{ tellAfterOnset: Selected<TickSpan>; hitAfterOnset: Selected<TickSpan>; tellChat: Selected<string> }>;
type ExplosionRecipe = Readonly<{
  firstMarkAfterHit: TickSpan;
  count: number;
  period: TickSpan;
  impactAfterMark: TickSpan;
  damage: DamageRange;
}>;

export type SpecialSelection =
  | Readonly<{ kind: "random-uniform" }>
  | Readonly<{ kind: "rotation"; order: readonly [Special, ...Special[]] }>
  | Readonly<{ kind: "replay"; order: readonly [Special, ...Special[]] }>;

export type UnclaimedOrbRule = Readonly<{ kind: "heals-boss"; afterHit: TickSpan }> | Readonly<{ kind: "off" }>;
type SpecialRecipe = Readonly<{
  styles: Readonly<{ "black-disk": Selected<"melee">; "spike-disk": Selected<"ranged">; vortex: Selected<"magic"> }>;
  protectedDamage: Selected<DamageRange>;
  unprotectedDamage: Selected<DamageRange>;
  cues: Readonly<Record<Style, readonly Selected<TransitionCue>[]>>;
}>;
export type SpecialStyle<V extends Special> = SpecialRecipe["styles"][V]["value"];
type BossHealRecipe = Readonly<{ soulSplitAfterHit: Selected<TickSpan> }>;
type RiftOffset = Readonly<{ dx: number; dy: number }>;
type RiftPose = "idle" | "spawn" | "despawn" | "detonate";
type RiftRecipe = Readonly<{
  firstCycle: Selected<Cycle>;
  spawnBeforeOnset: Selected<TickSpan>;
  chargeAfterSpawn: Selected<TickSpan>;
  timerBar: Selected<Readonly<{ background: string; fill: string }>>;
  npcId: Selected<number>;
  name: Selected<string>;
  combatLevel: Selected<number>;
  size: Selected<number>;
  stats: Selected<Readonly<{ attack: number; strength: number; defence: number; range: number; magic: number; hitpoint: number }>>;
  defenceBonuses: Selected<Readonly<{ stab: number; slash: number; crush: number; magic: number; range: number }>>;
  offsetsFromBoss: Selected<readonly [RiftOffset, ...RiftOffset[]]>;
  burstDamage: Selected<DamageRange>;
  standardRangedAndMeleeRoll: Selected<Readonly<{ guaranteedHit: boolean; maxDamage: boolean }>>;
  killChat: Selected<string>;
  poses: Readonly<Record<RiftPose, Selected<number>>>;
  burstFlare: Selected<number>;
}>;

type WalkwayLook = Readonly<{ height: number; top: string; face: string; shade: string }>;
type BrazierRecipe = Readonly<{ loc: number; model: number; burning: number }>;

type GeometryRecipe = Readonly<{
  platform: Selected<readonly string[]>;
  bossAnchor: Selected<Tile>;
  playerSpawn: Selected<Tile>;
  walkway: Selected<WalkwayLook>;
  brazier: Selected<BrazierRecipe>;
}>;


type BossPose =
  | "idle"
  | "walk"
  | "deflectIn"
  | "deflectLoop"
  | "deflectOut"
  | "silentDeflectIn"
  | "silentDeflectLoop"
  | "silentDeflectOut"
  | "soulFragmentStart"
  | "soulFragmentEnd"
  | "prayerIn"
  | "prayerLoop"
  | "prayerOut"
  | "meleeHybrid"
  | "meleePrayer"
  | "unleashIn"
  | "unleashLoop"
  | "unleashOut";

export type TransitionSound = "meleeTell" | "meleeHit" | "rangedBeforeHit" | "rangedHit" | "magicWindUp";
export type TransitionCue = Readonly<{ sound: TransitionSound; afterTell: TickSpan; delayMs: number }>;
type CueSound = "endShout" | "flood" | "explosionSeriesStart" | "explosionMark" | TransitionSound;
type SoundPlayback = Readonly<{ volume: number; range: number; retain: number }>;

export type SpriteFrame = Readonly<{ archive: number; frame: number }>;

type PresentationRecipe = Readonly<{
  bossPoses: Readonly<Record<BossPose, Selected<number>>>;
  sounds: Readonly<Record<CueSound, Selected<SoundId>>>;
  soundPlayback: Selected<SoundPlayback>;
  landingBeforeInnerClears: Selected<TickSpan>;
  transitionTells: Readonly<Record<Special, Selected<number>>>;
  tellCentre: Selected<Readonly<{ faceColour: number; rgb: number }>>;
  overheadIcons: Readonly<Record<BossOverhead, Selected<SpriteFrame>>>;
  overheadIconBelowHpBar: Selected<number>;
}>;

const headIcon = (frame: number, note: string, seen: readonly Source[]): Selected<SpriteFrame> =>
  selected({ archive: 440, frame }, "footage-repeated", "unscaled", note, NO_WIKI_PRESENTATION, cache(`sprite 440 headicons_prayer frame ${frame}`), ...seen);

type StyleBonuses = Readonly<{ stab: number; slash: number; crush: number; magic: number; range: number }>;
export type ItemStats = Readonly<{
  attack: StyleBonuses;
  defence: StyleBonuses;
  other: Readonly<{ meleeStrength: number; rangedStrength: number; magicDamage: number; prayer: number }>;
}>;
type TrainerItem = Readonly<{ itemId: Selected<number>; stats: Selected<ItemStats> }>;

export const GEAR_SLOTS = ["weapon", "helmet", "chest", "legs", "gloves", "cape", "necklace", "feet", "ring", "ammo"] as const;
export type GearSlot = (typeof GEAR_SLOTS)[number];
export type GearKeys = Readonly<{
  weapon: "twistedBow" | "scytheOfVitur" | "tonalzticsOfRalos";
  helmet: "masoriMaskF" | "inquisitorsGreatHelm";
  chest: "masoriBodyF" | "inquisitorsHauberk";
  legs: "masoriChapsF" | "inquisitorsPlateskirt";
  gloves: "zaryteVambraces" | "ferociousGloves";
  cape: "dizanasQuiver" | "infernalCape";
  necklace: "necklaceOfRupture" | "amuletOfRancour";
  feet: "avernicTreadsMax";
  ring: "venatorRing" | "ultorRing";
  ammo: "dragonArrows";
}>;
export type Setup = Readonly<{ [S in GearSlot]: GearKeys[S] }>;
export type SupplyKey = "superCombatPotion" | "bastionPotion" | "saradominBrew" | "superRestore";
export type TrainerItemKey = "inquisitorsGreatHelm" | "inquisitorsHauberk" | "inquisitorsPlateskirt" | "tonalzticsOfRalos";
type SdkIconKey = "masoriMaskF" | "masoriBodyF" | "masoriChapsF" | "zaryteVambraces";
type InquisitorPiece = "inquisitorsGreatHelm" | "inquisitorsHauberk" | "inquisitorsPlateskirt";
export type StanceSpeeds<T extends number = TickSpan> = Readonly<{ rapidSpeed: T; otherSpeed: T }>;

type GearRecipe = Readonly<{
  items: Readonly<Record<TrainerItemKey, TrainerItem>>;
  sdkCacheIds: Readonly<{ necklaceOfRupture: Selected<number> }>;
  sdkIcons: Readonly<Record<SdkIconKey, Selected<number>>>;
  supplies: Selected<readonly SupplyKey[]>;
  twistedBow: Selected<StanceSpeeds<TwistedBow["attackSpeed"]>>;
  ralos: Selected<StanceSpeeds & Readonly<{ range: number; longrangeRange: number; hits: number; hitMaxFraction: number }>>;
  division: Selected<Readonly<{ energy: number; accuracyFactor: number; defenceDrainOfMagic: number }>>;
  ammunition: Selected<Readonly<{ twistedBow: AmmunitionClass; tonalzticsOfRalos: AmmunitionClass }>>;
  inquisitorCrushPerMille: Selected<Readonly<Record<InquisitorPiece, number>>>;
  scytheStance: Selected<"jab">;
  scytheMaxHitsOnOneTarget: Selected<number>;
  specialWeapon: Selected<GearKeys["weapon"]>;
}>;

const BOSS: BossRecipe = {
  npcId: selected(16677, "inferred", "unscaled", "tfa_ocellus_p3, the only combat form after phase 2; live level 1601 differs from cache 1197 (C7)", BOSS_PAGE, cache("npc 16677")),
  size: selected(3, "spec-confirmed", "unscaled", "3x3 marker in both clips", BOSS_INFOBOX, cache("npc 16677 size"), vod("V1", "G29"), vod("V2", "k44")),
  combatLevel: selected(1601, "footage-repeated", "unscaled", "hover text Attack Ocellus (level-1601)", BOSS_INFOBOX, vod("V1", "frame 3317"), vod("V2", "k44")),
  stats: selected({ attack: 325, strength: 250, defence: 250, range: 300, magic: 300 }, "spec-confirmed", "unscaled", "the wiki's phase 3 infobox, edited after the 21 October hotfix, lists the cache's levels", BOSS_PAGE, cache("npc 16677 stats [325, 250, 250, 5250, 300, 300]")),
  defenceBonuses: selected({ stab: 150, slash: 100, crush: 30, magic: 200 }, "spec-confirmed", "unscaled", "cache params 5 to 8 match the wiki's phase 3 infobox", BOSS_PAGE, cache("npc 16677 params 5, 6, 7, 8")),
  rangedDefence: selected({ light: 250, standard: 250, heavy: 250 }, "spec-single", "unscaled", "the wiki's phase 3 infobox; the cache decode has no ranged defence param", BOSS_PAGE),
  lowestDefencePercent: selected(60, "spec-single", "unscaled", "the 21 October hotfix caps Defence reduction at 60% of the level: phase 3 Defence stops at 150 of 250; how a fractional floor rounds is not stated, rounded up (inferred)", BOSS_PAGE, DEFENCE_REDUCTION_TABLE, HOTFIX_NEWS),
  footprint: selected(
    { "lead-in": "walkable", "inner-void": "walkable", "after-inner": "walkable", "outer-void": "blocks-movement", "after-outer": "walkable" },
    "community-tested",
    "unscaled",
    "community feedback 2026-10-23, unconfirmed: in the outer void, the melee phase, the boss's 3x3 blocks the player, who paths around his edge instead of under him; no report covers the other stages, so they keep the trainer's walkable footprint",
    NO_WIKI_P4, owner("a redditor's comment relayed by the owner: you can run under the boss during the melee phase whereas in game it will path you around the edge of the boss", "2026-10-23"),
  ),
};

const LEAD_IN: LeadInRecipe = {
  hiddenFor: selected(span(4), "footage-repeated", "team-4-and-5", "boss model gone from t = 0, back on the main platform at t = 4", NO_WIKI_TICKS, vod("V1", "G25 to G29"), vod("V2", "k40 to k44")),
  presentFor: selected(span(4), "footage-repeated", "team-4-and-5", "present from t = 4 but no splats until the first inner void at t = 8", NO_WIKI_TICKS, vod("V1", "G29 to G33, first hit G35"), vod("V2", "k44 to k48, first splats k48")),
  shout: selected({ text: "End...", at: span(5), lasts: span(3) }, "footage-repeated", "team-4-and-5", "overhead text from t = 5 for 3 ticks", STRATEGIES_P4, vod("V1", "G30 to G32"), vod("V2", "k45 to k47")),
};

const INNER_VOID: VoidRecipe<"inner-void"> = {
  kind: "inner-void",
  duration: selected(span(22), "footage-repeated", "team-4-and-5", "inner void visible 22 ticks", NO_WIKI_TICKS, vod("V1", "G33-G54, G93-G114, G153-G174"), vod("V2", "k48-k69, k108-k129, k168-k189, k228-k249")),
  orbMaturesAfterHit: selected(span(12), "footage-repeated", "team-4-and-5", "orb glows teal 12 ticks after the hit", NO_WIKI_TICKS, vod("V1", "G49"), vod("V2", "k64"), cache("spotanim 4311 soul_fragment_spawn_12_ticks")),
  orbLingersAfterClear: selected(
    span(5),
    "owner-estimated",
    "unscaled",
    "community feedback: an orb stays pickable a few seconds into the transition attack after its void; 5 ticks, 3.0 s, keeps it through S+26, past the tell at S+24 and before the hit at S+29; a pickup at S+21 returned at S+22 (V1 G175); a 1 fps guide shows the orb on clear floor about 1 s after the clear and gone 1 s later, a weak bound because the camera moved",
    NO_WIKI_TICKS, owner("healing orbs despawn almost instantly after a phase ends when usually you can grab it for a few seconds during the attack you need to pray against", "2026-10-23"),
    vod("V1", "G175"),
  ),
};

const AFTER_INNER: TransitionRecipe<"after-inner"> = {
  kind: "after-inner",
  duration: selected(span(9), "footage-repeated", "team-4-and-5", "inner void clears at S+22, outer forms at S+31", NO_WIKI_TICKS, vod("V1", "G55-G63"), vod("V2", "k70-k78")),
  tellAfterStart: selected(span(2), "footage-repeated", "team-4-and-5", "transition attack 1 starts at S+24", NO_WIKI_TICKS, vod("V1", "G57, G117, G177"), vod("V2", "k72, k132, k192, k252")),
  hitAfterStart: selected(span(7), "footage-repeated", "team-4-and-5", "transition attack 1 damage at S+29", NO_WIKI_TICKS, vod("V1", "G62, G122, G182"), vod("V2", "k77, k137, k197, k257")),
  soulSplitAfterTell: selected(span(1), "footage-repeated", "team-4-and-5", "Soul Split at S+25; Deflect Melee still up at S+24", NO_WIKI_TICKS, vod("V1", "frames 2741-2777, 4901-4937"), vod("V2", "k73")),
};

const OUTER_VOID: VoidRecipe<"outer-void"> = {
  kind: "outer-void",
  duration: selected(span(20), "footage-repeated", "team-4-and-5", "outer void visible 20 ticks", NO_WIKI_TICKS, vod("V1", "G64-G83, G124-G143"), vod("V2", "k79-k98, k139-k158, k199-k218")),
  orbMaturesAfterHit: selected(span(6), "footage-repeated", "team-4-and-5", "outer orb first glows 5 to 6 ticks after the hit", NO_WIKI_TICKS, vod("V1", "G74"), vod("V2", "k88, k149"), cache("spotanim 4309 soul_fragment_spawn_6_ticks")),
  orbLingersAfterClear: selected(
    span(2),
    "inferred",
    "team-4-and-5",
    "the flood clears at S+51 and an unclaimed outer orb heals the boss at hit + 19, S+54 (C17), so the last pickup is S+53, a tick into the tell; the community's few seconds would move that heal later than the footage shows",
    NO_WIKI_TICKS, vod("V1", "G147"),
    vod("V2", "k102, k222"),
    owner("healing orbs despawn almost instantly after a phase ends when usually you can grab it for a few seconds during the attack you need to pray against", "2026-10-23"),
  ),
};

const AFTER_OUTER: TransitionRecipe<"after-outer"> = {
  kind: "after-outer",
  duration: selected(span(9), "footage-repeated", "team-4-and-5", "outer void clears at S+51, next inner at S+60", NO_WIKI_TICKS, vod("V1", "G84-G92"), vod("V2", "k99-k107")),
  tellAfterStart: selected(span(1), "footage-repeated", "team-4-and-5", "transition attack 2 starts at S+52; one of five onsets came a tick late (k161), damage tick unchanged", NO_WIKI_TICKS, vod("V1", "G85, G145"), vod("V2", "k100, k220")),
  hitAfterStart: selected(span(6), "footage-repeated", "team-4-and-5", "transition attack 2 damage at S+57", NO_WIKI_TICKS, vod("V1", "G90, G150"), vod("V2", "k105, k165, k225")),
  soulSplitAfterTell: selected(span(1), "footage-once", "team-4", "Soul Split at S+53", NO_WIKI_TICKS, vod("V1", "frames 3749-3785")),
};

const CYCLE: CycleRecipe = [INNER_VOID, AFTER_INNER, OUTER_VOID, AFTER_OUTER];

const OVERHEADS: OverheadRecipe = {
  "inner-void": selected("deflect-melee", "footage-repeated", "team-4-and-5", "up from the rise at S+0 to S+24 in all 7 cycles filmed, and absent the tick before the rise; the hovering boss's icon is mostly above the frame, and S+21 is never in it", STRATEGIES, ...DEFLECT_MELEE_SEEN),
  "outer-void": selected("deflect-range", "footage-repeated", "team-4-and-5", "up with the flood from S+31 and through S+52, two ticks after it clears, in all 7 floods filmed", STRATEGIES, ...DEFLECT_RANGE_SEEN),
  transition: selected("soul-split", "footage-repeated", "team-4-and-5", "white star after each transition tell", STRATEGIES_P4, vod("V1", "frames 2777, 3785, 4937"), vod("V2", "k73")),
  offBeforeVoid: selected(span(1), "footage-repeated", "team-4-and-5", "no icon at S+30 in 5 cycles and at S+59 in 3, with the boss and his HP bar in frame and the icon up on the ticks either side", NO_WIKI_TICKS, vod("V1", "G63, G123, G183, G92, G152"), vod("V2", "k78, k258, k167")),
};

export type DeflectRule = Readonly<{ kind: "block"; reflectPercent: number }> | Readonly<{ kind: "none" }>;

const DEFLECTS: Readonly<Record<BossOverhead, Selected<Style | null>>> = {
  "deflect-melee": selected("melee", "inferred", "unscaled", "named for the style it turns away; no capture shows a melee hit landing during it (Q8)", STRATEGIES, vod("V2", "k60, k71")),
  "deflect-range": selected("ranged", "inferred", "unscaled", "named for the style it turns away; no capture shows a ranged hit landing during it (Q8)", STRATEGIES, vod("V2", "k80, k90")),
  "soul-split": selected(null, "inferred", "unscaled", "a healing prayer that turns no style away", STRATEGIES, vod("V2", "k73")),
};

const LIFEFORCE: LifeforceRecipe = {
  tellAfterOnset: selected(span(3), "footage-repeated", "team-4-and-5", "teal swirl and chat line", NO_WIKI_TICKS, vod("V1", "G36, G127"), vod("V2", "k51")),
  hitAfterOnset: selected(span(4), "footage-repeated", "team-4-and-5", "hit 4 ticks after each void forms", NO_WIKI_TICKS, vod("V1", "G37, G68, G97, G128, G157, G188"), vod("V2", "k52, k83, k112, k143, k172, k203")),
  tellChat: selected("Ocellus manipulates your lifeforce!", "footage-repeated", "team-4-and-5", "game chat line on the tell tick, first in the frame that shows the teal swirl", NO_WIKI_P4, vod("V1", "3:54:02.78, G36"), vod("V2", "5:20:25.87, k51")),
};

const cue = (sound: TransitionSound, afterTell: number, delayMs: number, note: string, first: Source, ...rest: Source[]): Selected<TransitionCue> =>
  selected({ sound, afterTell: span(afterTell), delayMs }, "footage-repeated", "team-4-and-5", note, NO_WIKI_PRESENTATION, first, ...rest);

const SPECIAL: SpecialRecipe = {
  styles: {
    "black-disk": selected("melee", "footage-repeated", "team-4-and-5", "Kirby on Protect from Melee takes 7 and a teammate 50; the streamer on Magic takes 43 while four others take 6", STRATEGIES_P4, vod("V1", "G62, G90"), vod("V2", "k137")),
    "spike-disk": selected("ranged", "footage-repeated", "team-4-and-5", "players on Protect from Missiles take 7, 5 and 9", STRATEGIES_P4, vod("V1", "G122"), vod("V2", "k105, k197")),
    vortex: selected("magic", "footage-repeated", "team-5", "players on Protect from Magic take 7 twice", STRATEGIES_P4, vod("V2", "k77, k165")),
  },
  protectedDamage: selected({ min: 5, max: 9 }, "footage-repeated", "team-4-and-5", "7, 6, 7, 6, 9 on Kirby and 7, 5, 7, 9 on the streamer under the matching prayer; the solo carry-over is inferred", STRATEGIES_P4, vod("V1", "G62, G90, G122, G150, G182"), vod("V2", "k77, k105, k165, k197")),
  unprotectedDamage: selected({ min: 43, max: 50 }, "footage-repeated", "team-4-and-5", "50 on a teammate whose prayer is not seen, 43 on the streamer under the wrong prayer; the solo carry-over is inferred", STRATEGIES_P4, vod("V1", "G62"), vod("V2", "k137")),
  cues: {
    melee: [
      cue("meleeTell", 0, 60, "tell + 0.1 in all 5 melee attacks; 0.1 tick is 60 ms", vod("V1", "3:54:32.45, t60.1")),
      cue("meleeHit", 5, 60, "tell + 5.1, on the hit tick, in all 5 melee attacks", vod("V1", "3:54:18.66, t37.1")),
    ],
    ranged: [
      cue("rangedBeforeHit", 4, 240, "tell + 4.4, the median of 4.4, 4.4 and 4.6 in 3 of 4 ranged attacks, about 0.6 tick before the hit; the fourth was at tell + 0.9; 0.4 tick is 240 ms", vod("V1", "3:54:54.23, t96.4"), vod("V2", "5:20:58.27, t64.6")),
      cue("rangedHit", 5, 60, "tell + 5.1, on the hit tick, in 3 of 4 ranged attacks", vod("V1", "t97.1, t157.1"), vod("V2", "t65.3")),
    ],
    magic: [
      cue("magicWindUp", 2, 120, "tell + 2.2, the median of 0.7, 2.2 and 2.3 in 3 of 3 magic attacks; 0.2 tick is 120 ms. The magic hit's 12553 is spotanim 4329's own frame sound", vod("V2", "5:20:39.13, t32.7"), vod("V2", "t122.3, t214.2")),
    ],
  },
};

const BOSS_HEALS: BossHealRecipe = {
  soulSplitAfterHit: selected(span(2), "footage-repeated", "team-4-and-5", "boss heals by wrong-prayer damage only: +50 and +43 while protected players took 7 and 6", NO_WIKI_TICKS, vod("V1", "G62 then G64"), vod("V2", "k137 then k139")),
};

const RIFTS: RiftRecipe = {
  firstCycle: selected(cycle(2), "footage-repeated", "team-5", "rifts before every inner void after the first (C5)", STRATEGIES, vod("V2", "k107, k167, k227")),
  spawnBeforeOnset: selected(span(1), "footage-repeated", "team-4-and-5", "rifts one tick before the next inner void", NO_WIKI_TICKS, vod("V1", "G152"), vod("V2", "k107, k167, k227")),
  chargeAfterSpawn: selected(
    span(23),
    "owner-estimated",
    "unscaled",
    "the owner reports that rifts last much longer than 6.6 s (11 ticks), that none of the footage they found shows one bursting, and that they watched two killed within about 10 s with about 4 s still on the timer: about 14 s, 23 ticks of 0.6 s (inferred); both clips show a rift standing after spawn + 11, V1 at G164 and V2 from k177 to k196",
    NO_WIKI_TICKS, owner("rift charge timer", "2026-10-22"),
    vod("V1", "G152 to G168"),
    vod("V2", "k167 to k196"),
  ),
  timerBar: selected(
    { background: "#1e1e0c", fill: "#e0c020" },
    "footage-once",
    "unscaled",
    "the owner's in-game picture, read by the lead: under each rift's green HP bar and touching it, a bar of the same width and height, dark olive background, yellow fill from the left, about a tenth full on both rifts; that the fill tracks the charge and is full on the burst tick is inferred from that one frame",
    NO_WIKI_PRESENTATION, owner("rift timer bar picture", "2026-10-22"),
  ),
  npcId: selected(16678, "spec-confirmed", "unscaled", "tfa_ocellus_p3_bombportal_basic, Void Rift", VOID_RIFT_PAGE, cache("npc 16678"), vod("V2", "k193")),
  name: selected("Void Rift", "spec-confirmed", "unscaled", "hover text Attack Void Rift (level-138)", VOID_RIFT_PAGE, cache("npc 16678 name"), vod("V2", "k193")),
  combatLevel: selected(138, "spec-confirmed", "unscaled", "cache level matches the hover text", VOID_RIFT_PAGE, cache("npc 16678 combat level"), vod("V2", "k193")),
  size: selected(1, "spec-confirmed", "unscaled", "one-tile shard", noWiki("the Void Rift infobox leaves size empty (rev 15380527)"), cache("npc 16678 size")),
  stats: selected({ attack: 1, strength: 1, defence: 175, range: 1, magic: 300, hitpoint: 44 }, "spec-confirmed", "unscaled", "the rift never attacks", VOID_RIFT_PAGE, cache("npc 16678 stats [1, 175, 1, 44, 1, 300]")),
  defenceBonuses: selected({ stab: 0, slash: 0, crush: 0, magic: 0, range: 0 }, "spec-confirmed", "unscaled", "params 5 to 8 are 0; the decode has no ranged defence param, taken as 0 (inferred)", VOID_RIFT_PAGE, cache("npc 16678 params 5, 6, 7, 8")),
  offsetsFromBoss: selected(
    [{ dx: -2, dy: -4 }, { dx: 6, dy: -4 }],
    "footage-once",
    "team-4-and-5",
    "(2, 2) and (10, 2), north of the 5x5: V1's two rifts, placed from their HP bars and carried onto the V2 platform by the east-west mirror; (2, 2) is the same tile under the 270-degree turn; the second carries to (11, 2), also a V2 second-spawn rift, and sits 1 tile west on (10, 2) so it stays off the middle of the 3 holes players stack against the east wall on x 11 (inferred, 2026-10-23); every observed rift is north of the 5x5, and V2's other rift tiles lie on the undrawn strip north of this grid",
    NO_WIKI_ARENA, vod("V1", "G152-G164"),
    vod("V2", "k167-k173"),
  ),
  burstDamage: selected({ min: 14, max: 14 }, "inferred", "team-5", "the streamer took 14 from an unseen source 11 ticks after the rifts appeared, with a rift still standing; taken as the burst's damage, though the burst now lands 23 ticks after spawn (inferred)", noWiki("the wiki says an unkilled rift damages all players but gives no amount (Strategies rev 15381030)"), vod("V2", "k118, k178")),
  standardRangedAndMeleeRoll: selected(
    { guaranteedHit: true, maxDamage: true },
    "community-tested",
    "unscaled",
    "the wiki: \"Ocellus will spawn void crystals that the player will always max hit with standard range attacks\"; the owner saw them almost always one-shot; a player who played the trainer on stream said melee attacks also always max-hit them in game; standard read as every ranged or melee attack but a special attack, and magic and special attacks roll as on any target (inferred)",
    BOSS_PAGE,
    owner("rifts almost always one-shot", "2026-10-22"),
    owner("Gnomonkey, playing the trainer on stream: melee attacks also always max-hit void rifts", "2026-10-24"),
  ),
  killChat: selected("Destroying the void rift empowers you!", "footage-repeated", "team-4-and-5", "game chat line when a rift dies; what the empower does is not shown", NO_WIKI_P4, vod("V1", "3:55:21.98"), vod("V2", "k116")),
  poses: {
    idle: pose(14895, "vfx_ocellus_voidflare_default_idle", "spec-confirmed", "rift stand and walk animation"),
    spawn: pose(14896, "vfx_ocellus_voidflare_default_spawn", "inferred", "rift appearing, 1 tick, frame sound 12643"),
    despawn: pose(14897, "vfx_ocellus_voidflare_default_despawn", "inferred", "rift dying, 1 tick, frame sound 12640"),
    detonate: pose(14898, "vfx_ocellus_voidflare_default_detonate", "inferred", "rift releasing its charge, 2 ticks, frame sounds 12641 and 12642"),
  },
  burstFlare: selected(4306, "inferred", "unscaled", "vfx_human_ocellus_voidflare_default shares the rift's model 62369; played on the player as the charge lands", NO_WIKI_PRESENTATION, cache("spotanim 4306 vfx_human_ocellus_voidflare_default")),
};

const FLOOD_FRAMES = vod("V2", "k86, k95, k142, k156, k205, k212, k262, k269");
const V1_FLOOD_FRAMES = vod("V1", "G66, G126, G130");

const GEOMETRY: GeometryRecipe = {
  platform: selected(
    [
      "...?........ww",
      ".?##########ww",
      ".###########ww",
      ".###########ww",
      ".##########/w.",
      ".#########/w..",
      ".########/w...",
      ".#######ww....",
      ".######wb.....",
      ".#####ww......",
      ".####ww.......",
      ".###ww........",
      "wwwww.........",
    ],
    "community-tested",
    "unscaled",
    "row y = 0 first, x = 0 leftmost; # is floor, . is not floor, ? is a tile the kills disagree on (±1 tile) and is left blocked, w is the raised brazier walkway, b its brazier and / a diagonal wall tile whose floor half is its north-west triangle, all drawn and never walkable; the walkway is the band 2 tiles past the floor's edge, ending where J1 ends it at y 12; cache 2746 stores map square 16472 unencrypted, and on its plane 1, at x = 32 + column and y = 40 - row, the blocked-floor flags give the east and diagonal edges: floor on x 11 for rows 1 to 3, where players stack the holes, then one tile in per row, x + y <= 14, from (10, 4) to (3, 11), which is J1's floor on (10, 4), (9, 5) and (8, 6) that V2's walkway base excluded; type 9 diagonal walls (loc 4451) stand on (11, 4), (10, 5) and (9, 6), so the wall runs straight from the end of the straight run to the jut, and the jut is loc 7261's L-shaped walls on (8, 7) and (7, 8) around the 5x5's corner beside the brazier on (8, 8), so no path runs behind the boss; a triangle with 2-tile bands north and west of the 5x5 and the brazier walkway on the diagonal; V2's drawn void and J1's rims agree on both legs, J1 adds the 6 floor tiles the boss hid south of the 5x5 in V2, and V2's north strip is left out because V1 and J1 drop away there; 84 floor tiles; seen with teams of 2 (J1), 4 (V1) and 5 (V2)",
    NO_WIKI_ARENA, owner("redditor: the tiles on the east side are 1 too close to the boss and need dragging out by 1", "2026-10-23"),
    owner("in-game picture: the wall runs straight 3 tiles in, then a smooth diagonal with 2 full tiles until the jut", "2026-10-23"),
    FLOOD_FRAMES,
    vod("V2", "k060 to k269, walkway base and strip rims, 18 frames"),
    vod("V2", "k080, bare floor south of the 5x5"),
    V1_FLOOD_FRAMES,
    owner("P4 platform screenshot: the triangle and the brazier walkway"),
    cache("map square 16472 plane 1: blocked-floor flags; locs 4451 (type 9) and 7261 (type 2)"),
  ),
  bossAnchor: selected(tile(4, 6), "footage-repeated", "team-4-and-5", "south-west tile of the boss's 3x3 at x 4-6, y 4-6, centred in the 5x5 at x 3-7, y 3-7; the cyan 3x3 marker sits inside the purple 5x5 rim in every fitted frame", NO_WIKI_ARENA, FLOOD_FRAMES, V1_FLOOD_FRAMES),
  playerSpawn: selected(tile(5, 1), "inferred", "team-4-and-5", "two tiles north of the 5x5, where players wait through the first inner void; no clip pins one tile", NO_WIKI_ARENA, vod("V2", "k49 to k52"), vod("V1", "G33")),
  walkway: selected(
    { height: 0.4, top: "#6b6c40", face: "#8e9a80", shade: "#3c4233" },
    "footage-once",
    "unscaled",
    "a raised curb about 0.4 tile high with an olive top and a light stone face toward the platform; colours are approximate medians of the curb in one frame; on a diagonal wall tile the curb fills the outer half and faces the floor along the diagonal, and the floor half is drawn as floor and floods with the floor beside it (inferred: the cache paints the whole tile with the band's overlay 656 and stands the raised wall on the diagonal, so the wall is the edge players see)",
    NO_WIKI_PRESENTATION, vod("V2", "k256, curb beside the 5x5"),
    owner("P4 platform screenshot: the triangle and the brazier walkway"),
    cache("map square 16472 plane 1: overlay 656 under locs 4451 (type 9)"),
  ),
  brazier: selected(
    { loc: 62697, model: 62440, burning: 14833 },
    "assumption",
    "unscaled",
    "a god censer hangs over the fire bowl in the curb's step; the purple one in V2 reads as the Zarosian Censer, one of the raid's four (62693 to 62700); P4 use of the censers is not seen, so it is scenery; the fire bowl and its stand are among the raid's unnamed locs and are not drawn",
    NO_WIKI_PRESENTATION, vod("V2", "k256, purple censer over the fire bowl on the curb"),
    vod("V1", "G146, fire bowl in the curb's step beside the 5x5"),
    cache("loc 62697 Zarosian Censer: model 62440, animation 14833"),
  ),
};

type FloorDamage = Readonly<{ kind: "damages"; afterOnset: TickSpan; perTick: DamageRange }>;
export type FloorRule = FloorDamage | Readonly<{ kind: "harmless" }>;
export type FloorShape = "near-square" | "platform-minus-near-square";

type FloorRecipe = Readonly<{
  squareSide: Selected<number>;
  shapes: Readonly<{ "inner-void": Selected<"near-square">; "outer-void": Selected<"platform-minus-near-square"> }>;
  outerDamage: Selected<FloorDamage>;
  look: Selected<Readonly<{ void: string; stars: string; rim: string }>>;
}>;

const FLOOD_PER_TICK: DamageRange = { min: 9, max: 11 };

const FLOOR: FloorRecipe = {
  squareSide: selected(5, "footage-repeated", "team-4-and-5", "the boss's 3x3 plus a 1-tile ring", STRATEGIES, vod("V1", "frame 4325"), vod("V2", "k86")),
  shapes: {
    "inner-void": selected("near-square", "footage-repeated", "team-4-and-5", "the 5x5 under and around the boss", STRATEGIES, vod("V1", "G33, G93, G153"), vod("V2", "k48, k108, k168, k228")),
    "outer-void": selected("platform-minus-near-square", "footage-repeated", "team-4-and-5", "all floor but the 5x5; floor the client leaves undrawn is not safe (C16), and the platform leaves out V2's undrawn strip north of it", STRATEGIES, vod("V1", "G64"), vod("V2", "k86, k93-k97")),
  },
  outerDamage: selected({ kind: "damages", afterOnset: span(5), perTick: FLOOD_PER_TICK }, "footage-once", "team-5", "standing on the flood from its onset, first damage at S+36; amounts 11, 9, 9, 9, 10, 11", NO_WIKI_P4, vod("V2", "k199 to k204"), vod("V2", "k92-k97")),
  look: selected({ void: "#1e2529", stars: "#babcc2", rim: "#9f48bd" }, "footage-repeated", "team-4", "starry near-black tiles inside a glowing purple rim; median colours of each in two frames", NO_WIKI_PRESENTATION, vod("V1", "G33, frame 1877"), vod("V1", "G64, frame 2993")),
};

const INNER_VOID_FLOOR = choice("one-tick-grace", {
  "one-tick-grace": selected<FloorRule>({ kind: "damages", afterOnset: span(2), perTick: FLOOD_PER_TICK }, "inferred", "team-5", "inside at S+0 and off by S+1 took no splat; the floor reads the tile a tick starts on, so S+2 is the earliest onset that capture allows; amounts copy the flood", STRATEGIES, vod("V2", "k48 to k49")),
  "outer-rule": selected<FloorRule>({ kind: "damages", afterOnset: span(5), perTick: FLOOD_PER_TICK }, "assumption", "team-5", "the flood's S+5 onset; no capture shows a player inside past one tick", NO_WIKI_P4, vod("V2", "k48 to k49")),
  harmless: selected<FloorRule>({ kind: "harmless" }, "assumption", "unscaled", "no capture shows inner-void damage", NO_WIKI_P4, vod("V2", "k48 to k49")),
});

export type HoleRule = Readonly<{ kind: "damages"; perTick: DamageRange }> | Readonly<{ kind: "harmless" }>;
type HoleLayout = Readonly<{ placement: "corner-stack" | "scattered"; tiles: readonly Tile[] }>;

type FloorHoleRecipe = Readonly<{
  lifetime: Selected<"whole-phase">;
  hiddenUnder: Selected<"outer-void">;
  look: Readonly<{ model: Selected<number>; idle: Selected<number> }>;
}>;

const HOLE_FRAMES = vod("V1", "seen G29 to G176 on 84 fitted ticks; the same tiles at t-42 (clip 0.40 s) and t-5 (clip 23.00 s)");

const FLOOR_HOLES: FloorHoleRecipe = {
  lifetime: selected("whole-phase", "footage-repeated", "team-4-and-5", "on the platform before P4 tick 0 and on the same tiles to the kill (V1) or the wipe (V2); no hole appears, moves or leaves during P4; the wiki puts void pools in phase 3", STRATEGIES, HOLE_FRAMES, vod("V2", "seen k49 to k270 on 85 fitted ticks")),
  hiddenUnder: selected("outer-void", "footage-repeated", "team-4", "V1's holes show on 0 of 99 in-view tile-ticks during the flood and 227 of 295 outside it; V2's stay visible on the strip the flood does not draw", NO_WIKI_P4, HOLE_FRAMES),
  look: {
    model: selected(62508, "inferred", "unscaled", "loc 62701 Void (tfa_ocellus_void_degen_bomb), shape 22; one tile, black starfield texture 215 in a purple rim, colour 50130; 62507 is the shape-10 twin; which shape the server spawns is unknown", NO_WIKI_PRESENTATION, cache("loc 62701 models 62507, 62508")),
    idle: selected(14891, "spec-confirmed", "unscaled", "the loc's own animation, 1.33-tick loop, no sounds", NO_WIKI_PRESENTATION, cache("loc 62701 animation 14891")),
  },
};

const HOLE_STACK_GUIDE = "https://www.youtube.com/watch?v=hR71l7hzuKM";
const scattered = (tiles: readonly Tile[]): HoleLayout => ({ placement: "scattered", tiles });

function cornerStack(platform: readonly string[], count: number): HoleLayout {
  const north = platform.findIndex((row) => row.includes("#"));
  const rows = platform.slice(north, north + count);
  const east = Math.min(...rows.map((row) => row.lastIndexOf("#")));
  return { placement: "corner-stack", tiles: rows.map((_, i) => tile(east, north + i)) };
}

const FLOOR_HOLE_LAYOUT = choice("corner-stack", {
  "corner-stack": selected<HoleLayout>(
    cornerStack(GEOMETRY.platform.value, 3),
    "community-tested",
    "unscaled",
    "void pools spawn under every player but the tank at the start of the third phase's first three quadrants, and a team that stacks on one corner tile in each quadrant leaves 3 pools in all; the guide's markers rag one tile of a 3-tile row in each quadrant, and the quarter turns carry all three onto the P4 quadrant's row, region 16472 x 43, y 37 to 39: a north-south line against the east wall, 6 tiles east of the boss's centre and 2 to 4 north; here that is the first 3 floor rows from the platform's north edge, on the easternmost column all three share, so the line sits against the brazier walkway and follows it when it moves",
    STRATEGIES_VOID_POOLS,
    guide(HOLE_STACK_GUIDE, "0:00 to 1:05 the method, 1:59 to 2:09 the 3 holes on the marked row in P4; the description's tile markers"),
    owner("picture: 3 holes in a row tucked in the corner against the brazier border", "2026-10-23"),
  ),
  "v1-turn": selected<HoleLayout>(scattered([tile(1, 5), tile(1, 6), tile(2, 8), tile(2, 9), tile(4, 9), tile(8, 5)]), "footage-repeated", "team-4", "V1's six holes carried by the quarter turn, x = 3 + v, y = 3 + u; (4, 9) is floor only on the rows that carry J1's floor south of the 5x5", NO_WIKI_ARENA, HOLE_FRAMES),
  "v1-mirror": selected<HoleLayout>(scattered([tile(5, 1), tile(6, 1), tile(8, 2), tile(9, 2), tile(9, 4), tile(5, 8)]), "footage-repeated", "team-4", "V1's six holes carried by the east-west mirror, x = 3 + u, y = 3 + v, the carry rift option A uses; (5, 1) is the player spawn, where a hole forms under a player standing there as P4 starts; (5, 8) is floor only on the rows that carry J1's floor south of the 5x5", NO_WIKI_ARENA, HOLE_FRAMES),
  "j1-mirror": selected<HoleLayout>(scattered([tile(9, 3), tile(9, 1), tile(2, 6), tile(2, 5), tile(2, 2)]), "footage-once", "unscaled", "five holes in the owner's screenshot, team of 2, mirror carry; (2, 2) is rift option A's first tile", NO_WIKI_ARENA, owner("P4 platform screenshot: five black hole blobs")),
  "j1-turn": selected<HoleLayout>(scattered([tile(3, 9), tile(1, 9), tile(6, 2), tile(5, 2), tile(2, 2)]), "footage-once", "unscaled", "the same five, quarter-turn carry; (5, 2) is a drill tile and (2, 2) is rift option A", NO_WIKI_ARENA, owner("P4 platform screenshot: five black hole blobs")),
});

const FLOOR_HOLE_DAMAGE = choice("flood-rate", {
  "flood-rate": selected<HoleRule>({ kind: "damages", perTick: FLOOD_PER_TICK }, "assumption", "unscaled", "the owner says they damage when stepped on, and the wiki's phase 3 void pools deal periodic damage; no capture shows anyone on a hole, so the amount copies the flood's 9 to 11 a tick, read on the tile a tick starts on, and a hole under a damaging flood hits as well as the flood", STRATEGIES, owner("black hole blobs damage if you step on them"), cache("loc 62701 tfa_ocellus_void_degen_bomb")),
  harmless: selected<HoleRule>({ kind: "harmless" }, "assumption", "unscaled", "no capture shows a hole's effect", NO_WIKI_P4, HOLE_FRAMES),
});

export type OuterOrbTile = Readonly<{ kind: "near-player" }> | Readonly<{ kind: "opposite-entry" }>;
type OrbVisual = "innerSpawn" | "outerSpawn" | "idle" | "despawn" | "tell" | "regain";

type LifeforceOrbRecipe = Readonly<{
  drainDivisor: Selected<number>;
  orbDistance: Selected<Readonly<{ min: number; max: number }>>;
  returnAfterStep: Selected<TickSpan>;
  look: Readonly<Record<OrbVisual, Selected<number>>>;
  marker: Selected<Readonly<{ dormant: string; ready: string }>>;
}>;

const spotAnim = (id: number, name: string, basis: Basis, note: string): Selected<number> =>
  selected(id, basis, "unscaled", note, NO_WIKI_PRESENTATION, cache(`spotanim ${id} ${name}`));

const LIFEFORCE_ORB: LifeforceOrbRecipe = {
  drainDivisor: selected(2, "footage-repeated", "team-4-and-5", "every player loses floor(current HP / 2); no overhead prayer reduces it", STRATEGIES, vod("V1", "G37 through Protect from Magic, G68 through Melee"), vod("V2", "k52 through Magic, k112 through Missiles")),
  orbDistance: selected({ min: 2, max: 5 }, "footage-repeated", "team-4-and-5", "a dark orb 2 to 5 tiles from its player, never under the boss or on a floor hole; with no allowed floor that close, the nearest allowed tiles, because the wiki puts the orb on a safe tile and no capture shows a player that far from one (inferred)", STRATEGIES, vod("V1", "G39"), vod("V2", "k53"), ORB_OFF_HOLES),
  returnAfterStep: selected(span(1), "footage-repeated", "team-4-and-5", "returns exactly the HP that hit took, the tick after the player steps on the orb, and can pass max HP (58 to 114)", NO_WIKI_TICKS, vod("V2", "k67 then k68, k95 then k96"), vod("V1", "G51, G79")),
  look: {
    innerSpawn: selected(
      4311,
      "footage-repeated",
      "unscaled",
      "inner orb from the lifeforce hit to its glow, 364 client cycles, about 12 ticks; it starts on the hit tick, because its chimes 12621, 12622 and 12623 sit 3.87, 7.8 and 10.8 ticks in and the clips hear them at hit + 3.9, 7.8 and 10.8; the dark orb is first seen 1 to 2 ticks after the hit",
      NO_WIKI_PRESENTATION, cache("spotanim 4311 vfx_ocellus_soul_fragment_spawn_12_ticks, seq 14915 frames 3, 40, 84 and 117"),
      vod("V1", "3:54:05.93, t15.9"),
      vod("V2", "5:20:29.03, t15.9; 5:21:09.20, t82.8"),
      vod("V2", "k53"),
      vod("V1", "G39"),
    ),
    outerSpawn: selected(
      4309,
      "footage-repeated",
      "unscaled",
      "outer orb from the lifeforce hit to its glow, 182 client cycles, about 6 ticks; it starts on the hit tick, because its chimes 12624, 12621, 12622 and 12623 sit 0.1, 1.7, 3.8 and 5.3 ticks in and the clips hear them at hit + 0.1, 1.7, 3.8 and 5.3, so the last chime plays before the glow",
      NO_WIKI_PRESENTATION, cache("spotanim 4309 vfx_ocellus_soul_fragment_spawn_6_ticks, seq 14913 frames 1, 18, 41 and 57"),
      vod("V1", "3:54:58.25, t103.1"),
    ),
    idle: spotAnim(4310, "soul_fragment_idle", "inferred", "the glowing orb, looped"),
    despawn: spotAnim(4312, "soul_fragment_despawn", "inferred", "the orb leaving its tile"),
    tell: spotAnim(4313, "soul_fragment_player_idle", "assumption", "played on the player at the lifeforce tell, where the footage shows a teal swirl; the spec pairs it with the pickup"),
    regain: spotAnim(4314, "soul_fragment_player_regain", "inferred", "the fragment returning to the player"),
  },
  marker: selected({ dormant: "#20251e", ready: "#7cecb2" }, "footage-repeated", "team-5", "the 2D orb: median of the darkest fifth of the new orb and the brightest fifth of the glowing one", NO_WIKI_PRESENTATION, vod("V2", "k53"), vod("V2", "k64")),
};

type ExplosionSeriesRecipe = Readonly<{
  seriesStartsAfterHit: Selected<TickSpan>;
  shards: Selected<string>;
  look: Selected<ExplosionLook>;
  dodge: Selected<Readonly<{ radius: number; attackDelayCut: TickSpan }>>;
}>;
type Between = readonly [from: number, to: number];
type ExplosionLook = Readonly<{
  glow: string;
  glowOpacity: number;
  glowTiles: number;
  dust: string;
  dustOpacity: number;
  dustTiles: number;
  shardTiles2d: number;
  mark: Readonly<{ shardsFadeIn: number; glowFrom: number; glowRamp: number; shardRadius: Between; shardLean: Between; glowScale: Between }>;
  impact: Readonly<{ glowFadeOut: number; shardRadius: Between; shardLean: Between; glowScale: Between; dustScale: Between }>;
}>;

const EXPLOSION: ExplosionSeriesRecipe = {
  seriesStartsAfterHit: selected(span(2), "footage-repeated", "team-4-and-5", "sound 12638 two ticks after the lifeforce hit, before the first mark of every option; what the server marks with it is inferred", NO_WIKI_TICKS, vod("V1", "3:54:04.77, t14"), vod("V2", "5:20:27.89, t14")),
  shards: selected(
    "#5e317b",
    "footage-repeated",
    "team-5",
    "dark purple shards stand around the player's tile on each mark tick; median colour of the shards on four mark ticks. The spec's cache candidate, spotanims 4299 to 4302 (model 62509), renders a white disc and a white flash, which the footage does not show",
    STRATEGIES, vod("V2", "k57, k59, k61, k65"),
  ),
  look: selected(
    {
      glow: "#761ba2",
      glowOpacity: 0.85,
      glowTiles: 1.2,
      dust: "#bcb6a2",
      dustOpacity: 0.55,
      dustTiles: 1.4,
      shardTiles2d: 0.12,
      mark: { shardsFadeIn: 0.1, glowFrom: 0.5, glowRamp: 0.2, shardRadius: [0.8, 0.25], shardLean: [1.2, 0.3], glowScale: [0.7, 1] },
      impact: { glowFadeOut: 0.2, shardRadius: [0.2, 1.2], shardLean: [0, -1], glowScale: [1, 1.2], dustScale: [0.6, 1.3] },
    },
    "footage-repeated",
    "unscaled",
    "each mark lasts the mark tick and the impact tick. In the mark tick, purple motes and thin shards fly in to the tile, and for its second half a translucent hexagonal purple glow fills the tile; on the impact tick the glow collapses, crystals burst outward and a grey dust puff fades. Three cycles at 20 fps put the glow from 6 to 8 of the tick's 12 frames, so it starts halfway and ramps in over about 2 frames. The glow colour and opacity solve the 120, 55, 150 glow seen over the 126, 140, 115 floor. The dust, the glow and dust sizes and the 2D view's shard squares in tiles, the shards' paths (radius in tiles, lean in radians) and the scale ranges are chosen by eye against the same frames; times are fractions of the tick. The SDK cannot play spotanims 4299 to 4302 instead: it makes a spotanim translucent only from base face alphas, model 62509's alphas all come from its animation, and it draws the 588 faces textured with 215 as white",
    NO_WIKI_PRESENTATION, owner("explosion mark in https://www.twitch.tv/videos/2907533010 from 8:38:50 to 8:38:53, frames at 20 fps", "2026-10-22"),
    owner("friends' screenshot of the explosion mark", "2026-10-22"),
    cache("model 62509: all 1176 faces in animated alpha groups, none with a base alpha; 588 faces textured with 215"),
  ),
  dodge: selected(
    { radius: 1, attackDelayCut: span(3) },
    "community-tested",
    "unscaled",
    "community-tested, unconfirmed: stepping off the marked tile on the mark tick to a tile within 1 of it cuts the player's attack delay by 3 at the impact, never below 0, so a 5-tick Scythe or Twisted bow attacks every 2 ticks while each pulse is dodged and a 6-tick weapon every 3; a 2-tile run avoids the hit without the cut. The wiki tester's flat-3 theory, from an Elder maul that did not 2-tick; halving was the other theory",
    wiki("https://oldschool.runescape.wiki/w/Ocellus", 15379685),
    wiki("https://oldschool.runescape.wiki/w/Ocellus", 15379561),
    wiki("https://oldschool.runescape.wiki/w/The_Fractured_Archive/Strategies", 15379780),
    wiki("https://oldschool.runescape.wiki/w/The_Fractured_Archive/Strategies", 15379373),
    owner("Scythe and Twisted bow on 2-tick gaps during the explosion series in the VOD", "2026-10-22"),
  ),
};

const sound = (id: number, note: string, first: Source, ...rest: Source[]): Selected<SoundId> =>
  selected(soundId(id), "footage-repeated", "team-4-and-5", note, NO_WIKI_PRESENTATION, first, ...rest, cache(`synth ${id}`));

const PRESENTATION: PresentationRecipe = {
  bossPoses: {
    idle: pose(14840, "phase3_idle", "spec-confirmed", "boss stand animation"),
    walk: pose(14849, "phase3_walk", "spec-confirmed", "boss walk animation"),
    deflectIn: pose(14863, "phase3_deflect_in", "inferred", "rise as the inner void forms, 2 ticks; name and the wiki's rise"),
    deflectLoop: pose(14864, "phase3_deflect_loop", "inferred", "hover high over the inner void, 2-tick loop, as V2 shows from k49 to k69"),
    deflectOut: pose(14865, "phase3_deflect_out", "inferred", "landing as the inner void clears, 4 ticks; the boss is on the ground again by S+23 (k71)"),
    silentDeflectIn: pose(14866, "silent deflect in", "inferred", "outer-void Deflect candidate, 2 ticks"),
    silentDeflectLoop: pose(14867, "silent deflect loop", "inferred", "outer-void Deflect candidate, 2-tick loop"),
    silentDeflectOut: pose(14868, "silent deflect out", "inferred", "outer-void Deflect candidate, 4 ticks"),
    soulFragmentStart: pose(14855, "phase3_soul_fragment_start", "inferred", "lifeforce cast, 3 ticks; 3 + 1 ticks matches the tell-to-hit gap"),
    soulFragmentEnd: pose(14856, "phase3_soul_fragment_end", "inferred", "lifeforce cast end, 1 tick"),
    prayerIn: pose(14869, "phase3_prayer_in", "inferred", "overhead switch, 5.6 ticks"),
    prayerLoop: pose(14870, "phase3_prayer_loop", "inferred", "overhead switch loop, 3 ticks"),
    prayerOut: pose(14871, "phase3_prayer_out", "inferred", "overhead switch end, 1.5 ticks"),
    meleeHybrid: pose(14844, "phase3_melee_hybrid", "inferred", "transition attack cast at each tell, 7 ticks; its melee, magic and ranged spotanims match the three tells"),
    meleePrayer: pose(14845, "phase3_melee_prayer", "inferred", "transition attack candidate, 3 ticks"),
    unleashIn: pose(14857, "phase3_unleash_in", "inferred", "transition attack candidate, 2 ticks"),
    unleashLoop: pose(14858, "phase3_unleash_loop", "inferred", "transition attack candidate, 2-tick loop"),
    unleashOut: pose(14861, "phase3_unleash_out", "inferred", "transition attack candidate, 4 ticks"),
  },
  sounds: {
    endShout: sound(12490, "the \"End...\" shout at t5, three ticks before the first inner void, in both clips; no sequence references it, so the server sends it", vod("V1", "3:53:59.39, t5.0"), vod("V2", "5:20:22.50, t5.0")),
    flood: sound(12497, "the outer flood at S + 31, five ticks before the floor hurts; heard in 1 V1 and 2 V2 floods, and 4 of 7 floods beat the null; the server sends it", vod("V1", "3:54:55.81, t99.0"), vod("V2", "5:20:42.89, t39.0")),
    explosionSeriesStart: sound(12638, "starts each explosion series, in 5 V1 and 5 V2 voids; no sequence references it, so the server sends it", vod("V1", "3:54:04.77, t14"), vod("V2", "5:20:27.89, t14")),
    explosionMark: sound(12537, "one per explosion mark, six per void every 2 ticks from hit + 5, in 3 V1 and 3 V2 cycles", vod("V1", "3:54:06.58, t17"), vod("V2", "5:20:29.70, t17")),
    meleeTell: sound(12572, "the melee transition tell, in all 5 melee attacks and none of the other 7; no sequence references it, so the server sends it", vod("V1", "3:54:32.45, t60.1")),
    meleeHit: sound(12567, "the melee transition hit, in all 5 melee attacks and none of the other 7; the server sends it", vod("V1", "3:54:18.66, t37.1")),
    rangedBeforeHit: sound(12555, "before the ranged transition hit, in all 4 ranged attacks, scoring at most 0.21 in the other styles; the server sends it", vod("V1", "3:54:54.23, t96.4"), vod("V2", "5:20:58.27, t64.6")),
    rangedHit: sound(12556, "the ranged transition hit, in 3 of 4 ranged attacks; the server sends it", vod("V1", "t97.1, t157.1"), vod("V2", "t65.3")),
    magicWindUp: sound(12554, "the magic transition wind-up, in 3 of 3 magic attacks, scoring at most 0.09 in the other styles; the server sends it", vod("V2", "5:20:39.13, t32.7")),
  },
  soundPlayback: selected({ volume: 0.1, range: 31, retain: 31 }, "inferred", "unscaled", "played as area sounds on the player's tile, so they share the area-sound toggle with the boss; range and retain copy the boss's own frame sounds and volume the SDK's level for them, because the clips cannot show the server's values", NO_WIKI_PRESENTATION, cache("seq 14863 frame sound 12613 location 31, retain 31")),
  landingBeforeInnerClears: selected(span(1), "footage-repeated", "team-4-and-5", "the landing's frame sounds 12584, 12587, 12586 and 12585 at S+21.1, S+21.8, S+23.0 and S+23.5 put its start at S+21, a tick before the inner void clears; 12586 is heard in 3 V1 and 3 V2 cycles", NO_WIKI_TICKS, vod("V1", "3:54:15.01, t31.0"), vod("V2", "5:20:38.13, t31.0"), cache("seq 14865 frames 3, 25, 61 and 74")),
  transitionTells: {
    vortex: selected(4329, "inferred", "unscaled", "a purple starburst over the footprint, then a purple-rimmed ring about 7 tiles across", NO_WIKI_PRESENTATION, cache("spotanim 4329 phase3_melee_hybrid_magic"), vod("V2", "k72 to k78")),
    "spike-disk": selected(4330, "inferred", "unscaled", "a dark disk with purple spikes radiating toward the players", NO_WIKI_PRESENTATION, cache("spotanim 4330 phase3_melee_hybrid_ranged"), vod("V2", "k100 to k106")),
    "black-disk": selected(4328, "inferred", "unscaled", "a purple semicircle, then a disk over the footprint", NO_WIKI_PRESENTATION, cache("spotanim 4328 phase3_melee_hybrid"), vod("V2", "k132 to k137")),
  },
  tellCentre: selected(
    { faceColour: 4, rgb: 0x020203 },
    "inferred",
    "unscaled",
    "the three tells share model 62698, whose centre is 144 faces of colour 4 textured with 215, a near-black starfield; the SDK draws spotanims without textures, so those faces show their lighting as near white, and recolouring colour 4 to the texture's mean texel draws them black as the footage does. The 296 untextured colour-4 faces were already near black",
    NO_WIKI_PRESENTATION, cache("model 62698 faces of colour 4 with texture 215"),
    cache("texture 215 sprite 8803, mean texel #020203"),
    vod("V2", "k72 to k78, k100 to k106, k132 to k137"),
  ),
  overheadIcons: {
    "deflect-melee": headIcon(15, "a sword over a purple badge with blue arrows; 25 of the 168 icon detections in both clips match this frame, each closer to it than to the arrowless Dampen frames 12 and 13", DEFLECT_MELEE_SEEN),
    "deflect-range": headIcon(16, "an arrow over the same badge; 96 of the 168 icon detections in both clips match this frame, each closer to it than to the arrowless Dampen frames 12 and 13", DEFLECT_RANGE_SEEN),
    "soul-split": headIcon(11, "a white star with red arrows over a purple badge; 47 of the 168 icon detections in both clips match this frame", SOUL_SPLIT_SEEN),
  },
  overheadIconBelowHpBar: selected(7, "inferred", "unscaled", "the boss's HP bar sits above its curse icon, not over it as the SDK draws player overheads; 7 px clears the bar at the SDK's overhead scale", NO_WIKI_PRESENTATION, vod("V2", "k60, k71, k73, k80, k90")),
};

const OSRS_WIKI = "https://oldschool.runescape.wiki/w/";
const INQUISITOR_SET = wiki(`${OSRS_WIKI}Inquisitor%27s_armour`, null);
const TWISTED_BOW_PAGE = wiki(`${OSRS_WIKI}Twisted_bow`, 15363157);
const RALOS_PAGE = wiki(`${OSRS_WIKI}Tonalztics_of_ralos`, 15368852);
const SCYTHE_PAGE = wiki(`${OSRS_WIKI}Scythe_of_Vitur`, 15372833);
const RUPTURE_PAGE = wiki(`${OSRS_WIKI}Necklace_of_rupture`, 15264776);
const ANGUISH_PAGE = wiki(`${OSRS_WIKI}Necklace_of_anguish`, 15301384);
const RANCOUR_PAGE = wiki(`${OSRS_WIKI}Amulet_of_rancour`, 15343231);
const TREADS_PAGE = wiki(`${OSRS_WIKI}Avernic_treads_(max)`, 15320239);
const MASORI_MASK_PAGE = wiki(`${OSRS_WIKI}Masori_mask_(f)`, 15190975);
const MASORI_BODY_PAGE = wiki(`${OSRS_WIKI}Masori_body_(f)`, 15190976);
const MASORI_CHAPS_PAGE = wiki(`${OSRS_WIKI}Masori_chaps_(f)`, 15190977);
const ZARYTE_VAMBRACES_PAGE = wiki(`${OSRS_WIKI}Zaryte_vambraces`, 15190607);
const RAID_INVENTORY = wiki(`${OSRS_WIKI}The_Fractured_Archive/Strategies`, 15378756);
const RANGED_SWITCH = wiki(`${OSRS_WIKI}The_Fractured_Archive/Strategies`, 15379033);
const RANGED_PAGE = wiki(`${OSRS_WIKI}Ranged`, 15373088);

type Five = readonly [stab: number, slash: number, crush: number, magic: number, range: number];
const stats = (attack: Five, defence: Five, other: readonly [meleeStrength: number, rangedStrength: number, magicDamage: number, prayer: number]): ItemStats => ({
  attack: { stab: attack[0], slash: attack[1], crush: attack[2], magic: attack[3], range: attack[4] },
  defence: { stab: defence[0], slash: defence[1], crush: defence[2], magic: defence[3], range: defence[4] },
  other: { meleeStrength: other[0], rangedStrength: other[1], magicDamage: other[2], prayer: other[3] },
});
const item = (itemId: number, page: string, oldid: number, itemStats: ItemStats): TrainerItem => ({
  itemId: selected(itemId, "spec-single", "unscaled", "infobox item id", wiki(`${OSRS_WIKI}${page}`, oldid)),
  stats: selected(itemStats, "spec-single", "unscaled", "infobox combat bonuses", wiki(`${OSRS_WIKI}${page}`, oldid)),
});
const sdkIcon = (itemId: number, page: WikiRef): Selected<number> =>
  selected(itemId, "spec-single", "unscaled", "infobox item id of an SDK item whose inventory icon the trainer draws from cache 2746; the SDK's bundled Masori body (f) image matches the wiki's 2022 upload and differs from the cache render in 107 pixels", page, cache(`item ${itemId} inventory model`));

const GEAR: GearRecipe = {
  items: {
    inquisitorsGreatHelm: item(24419, "Inquisitor%27s_great_helm", 15352822, stats([0, 0, 10, -5, -5], [19, 10, 21, 0, 12], [6, 0, 0, 1])),
    inquisitorsHauberk: item(24420, "Inquisitor%27s_hauberk", 15352823, stats([0, 0, 16, -11, -10], [67, 55, 71, 0, 35], [4, 0, 0, 2])),
    inquisitorsPlateskirt: item(24421, "Inquisitor%27s_plateskirt", 15352824, stats([0, 0, 12, -9, -5], [42, 30, 49, 0, 22], [2, 0, 0, 2])),
    tonalzticsOfRalos: item(28922, "Tonalztics_of_ralos", 15368852, stats([0, 0, 0, 0, 115], [0, 0, 0, 0, 0], [0, 55, 0, 2])),
  },
  sdkCacheIds: {
    necklaceOfRupture: selected(33639, "spec-confirmed", "unscaled", "the SDK's class carries anguish's id 19547 as a stand-in; cache 2746 holds item 33639 with male model 61426", RUPTURE_PAGE, cache("item 33639 maleModel0 61426")),
  },
  sdkIcons: {
    masoriMaskF: sdkIcon(27235, MASORI_MASK_PAGE),
    masoriBodyF: sdkIcon(27238, MASORI_BODY_PAGE),
    masoriChapsF: sdkIcon(27241, MASORI_CHAPS_PAGE),
    zaryteVambraces: sdkIcon(26235, ZARYTE_VAMBRACES_PAGE),
  },
  supplies: selected<readonly SupplyKey[]>(
    [
      "superCombatPotion", "bastionPotion", "saradominBrew", "superRestore",
      "superCombatPotion", "bastionPotion", "saradominBrew", "superRestore",
      "saradominBrew", "saradominBrew", "saradominBrew", "superRestore",
      "saradominBrew", "saradominBrew", "saradominBrew", "superRestore",
      "saradominBrew", "saradominBrew", "superRestore",
    ],
    "spec-single", "unscaled", "slots 9 to 27 of the wiki's recommended raid inventory, in its order: 2 super combat potions, 2 ranging potions, 10 Saradomin brews and 5 super restores, with no fish; the SDK has no ranging potion, so the Bastion potion stands in, with the same Ranged boost plus a Defence boost (inferred)",
    RAID_INVENTORY, wiki(`${OSRS_WIKI}Ranging_potion`, 15293943), wiki(`${OSRS_WIKI}Bastion_potion`, 15293966),
  ),
  twistedBow: selected({ rapidSpeed: 5, otherSpeed: 6 }, "spec-single", "unscaled", "attack speed by stance: 5 ticks on Rapid, 6 on Accurate and Longrange", TWISTED_BOW_PAGE),
  ralos: selected({ rapidSpeed: span(6), otherSpeed: span(7), range: 7, longrangeRange: 9, hits: 2, hitMaxFraction: 0.75 }, "spec-single", "unscaled", "charged, one-handed thrown: two independent hits, each 0 to 75% of the max ranged hit", RALOS_PAGE),
  division: selected({ energy: 50, accuracyFactor: 1.5, defenceDrainOfMagic: 0.125 }, "spec-single", "unscaled", "+50% accuracy; each hit that deals damage lowers Defence by 12.5% of Magic (10% before 2026-07-22) and, on NPCs, before the second roll; the drain applies as each glaive lands, so a hit the target rejects drains nothing (inferred); rounding not stated, floored (inferred)", RALOS_PAGE),
  ammunition: selected({ twistedBow: "standard", tonalzticsOfRalos: "light" }, "spec-single", "unscaled", "the Twisted Bow fires dragon arrows, and arrows roll against standard ranged defence; Ralos rolls against light", RANGED_PAGE, RALOS_PAGE),
  inquisitorCrushPerMille: selected({ inquisitorsGreatHelm: 5, inquisitorsHauberk: 10, inquisitorsPlateskirt: 10 }, "spec-single", "unscaled", "crush accuracy and damage per piece; the 2026-07-22 update moved the 1% set bonus onto the hauberk and plateskirt", wiki(`${OSRS_WIKI}Inquisitor%27s_hauberk`, 15352823), wiki(`${OSRS_WIKI}Inquisitor%27s_plateskirt`, 15352824), INQUISITOR_SET),
  scytheStance: selected("jab", "spec-single", "unscaled", "Jab is the scythe's crush style; the owner wants the Scythe setup on crush", SCYTHE_PAGE, owner("melee setup")),
  scytheMaxHitsOnOneTarget: selected(3, "spec-single", "unscaled", "one hit per tile of the target's width, up to three: a 1x1 target once, 2x2 twice, 3x3 or larger three times; other 1x1 targets in the 1x3 arc take their own hit", SCYTHE_PAGE),
  specialWeapon: selected("tonalzticsOfRalos", "assumption", "unscaled", "owner: players tend to use Ralos to spec the boss", NO_WIKI_PRACTICE, owner("special attack weapon")),
};

const PRACTICE = owner("practice one mechanic at a time; a drill option, not game data");
const drill = (first: Mechanic, ...rest: Mechanic[]): Selected<Focus<Mechanic>> =>
  selected<Focus<Mechanic>>({ kind: "drill", mechanics: [first, ...rest] }, "assumption", "unscaled", "the cycle runs from the drill's start; only these mechanics act", NO_WIKI_PRACTICE, PRACTICE);

export const OCELLUS_P4 = {
  vods: VODS,
  boss: BOSS,
  leadIn: LEAD_IN,
  cycle: CYCLE,
  overheads: OVERHEADS,
  deflects: DEFLECTS,
  lifeforce: LIFEFORCE,
  special: SPECIAL,
  bossHeals: BOSS_HEALS,
  rifts: RIFTS,
  geometry: GEOMETRY,
  floor: FLOOR,
  floorHoles: FLOOR_HOLES,
  lifeforceOrb: LIFEFORCE_ORB,
  explosion: EXPLOSION,
  presentation: PRESENTATION,
  gear: GEAR,
  choices: {
    setup: choice("ranged", {
      ranged: selected<Setup>(
        { weapon: "twistedBow", helmet: "masoriMaskF", chest: "masoriBodyF", legs: "masoriChapsF", gloves: "zaryteVambraces", cape: "dizanasQuiver", necklace: "necklaceOfRupture", feet: "avernicTreadsMax", ring: "venatorRing", ammo: "dragonArrows" },
        "assumption", "unscaled", "owner-named Twisted Bow with Masori mask, body and chaps (f) in place of elite void, the armour the wiki's ranged switch now lists first; Zaryte vambraces, the wiki's first ranged gloves, replace the void knight gloves, which had no bonus but the void set effect (inferred); the owner asked for the best-in-slot ranged necklace, which the wiki names as the Necklace of rupture, and Avernic treads (max) in both setups; arrows, cape and ring are SDK items (assumption); the default because the first void's Deflect Melee leaves ranged open",
        RANGED_SWITCH, MASORI_MASK_PAGE, MASORI_BODY_PAGE, MASORI_CHAPS_PAGE, ZARYTE_VAMBRACES_PAGE, ANGUISH_PAGE, RUPTURE_PAGE, TREADS_PAGE, owner("ranged setup"), owner("ranged armour"), owner("ranged necklace"), owner("boots"),
      ),
      melee: selected<Setup>(
        { weapon: "scytheOfVitur", helmet: "inquisitorsGreatHelm", chest: "inquisitorsHauberk", legs: "inquisitorsPlateskirt", gloves: "ferociousGloves", cape: "infernalCape", necklace: "amuletOfRancour", feet: "avernicTreadsMax", ring: "ultorRing", ammo: "dragonArrows" },
        "assumption", "unscaled", "owner-named Inquisitor's armour with the Scythe of Vitur on crush, the Amulet of rancour (the owner's first choice over blood fury; both are in cache 2746) and Avernic treads (max) in both setups; gloves, cape and ring are SDK items (assumption)",
        RANCOUR_PAGE, TREADS_PAGE, owner("melee setup"), owner("melee amulet"), owner("boots"),
      ),
    }),
    bossMaxHp: choice("cache", {
      "footage-fit": selected(5420, "inferred", "team-4-and-5", "9820 at 4 and 12020 at 5 is 2200 per player plus 1020, at the 2-player scale solo uses", noWiki("the Ocellus hitpoints table (rev 15380968) lists 9,820 at 4 and 12,020 at 5 but 5,250, not 5,420, for a team of 1 or 2"), vod("V1", "HUD 9820"), vod("V2", "HUD 12020"), SOLO_SCALE),
      cache: selected(5250, "spec-confirmed", "unscaled", "the Ocellus hitpoints table lists 5,250 after phase 1 for a team of 1 or 2, the size a solo trainer plays at, and the cache's hitpoints match; the footage's 4- and 5-player bars do not apply", BOSS_INFOBOX, cache("npc 16677 stats")),
    }),
    entryHpFraction: choice("quarter", {
      quarter: selected(0.25, "inferred", "team-4-and-5", "halfway between the two observations", NO_WIKI_P4, vod("V1", "2445 / 9820"), vod("V2", "3118 / 12020")),
      "v1-observed": selected(0.249, "footage-once", "team-4", "V1 entry bar", NO_WIKI_P4, vod("V1", "3:53:54")),
      "v2-observed": selected(0.259, "footage-once", "team-5", "V2 entry bar", NO_WIKI_P4, vod("V2", "5:20:18")),
    }),
    explosions: choice("v2-tell-then-six", {
      "wiki-six": selected<ExplosionRecipe>({ firstMarkAfterHit: span(3), count: 6, period: span(2), impactAfterMark: span(1), damage: { min: 16, max: 16 } }, "spec-single", "unscaled", "six marks every 2 ticks, damage a tick later; first mark from k55; 16 from one teammate splat (inferred)", STRATEGIES, vod("V2", "k55-k65, k62")),
      "v2-tell-then-six": selected<ExplosionRecipe>({ firstMarkAfterHit: span(5), count: 6, period: span(2), impactAfterMark: span(1), damage: { min: 16, max: 16 } }, "inferred", "team-4-and-5", "k55 read as a tell, marks k57 to k67 (C4); the default because sound 12537 plays at hit + 5 to hit + 15 in every void of both clips and the marks are taken to sit on it", STRATEGIES_P4, vod("V2", "k55-k67"), vod("V1", "3:54:06.58, t17"), vod("V2", "5:20:29.70, t17")),
    }),
    explosionDamageReduction: choice("wiki-60", {
      "wiki-60": selected(
        60,
        "spec-single",
        "unscaled",
        "the boss takes 60% less damage while the explosions are occurring: from the first mark, when the first explosion begins on the player's tile, to the last impact, when the last one deals its damage; the series start before it only signals the attack; a hit counts on the tick it lands, and each hit rounds down; the window's ends, the landing tick and the rounding are inferred; the wiki tags the figure citation needed and says it is for 5-tick weapons and may differ with attack speed, so every weapon takes it here (inferred)",
        STRATEGIES_P4,
      ),
      "wiki-50": selected(50, "spec-single", "unscaled", "the Ocellus page: Ocellus takes 50% reduced damage while the void explosions are happening; the same window, landing tick and rounding as wiki-60 (inferred)", BOSS_INFOBOX),
    }),
    specialSelection: choice("random-uniform", {
      "random-uniform": selected<SpecialSelection>({ kind: "random-uniform" }, "inferred", "unscaled", "V1 repeats melee, so no fixed rotation explains both clips (C3)", NO_WIKI_P4, vod("V1", "G62, G90"), vod("V2", "k77-k257")),
      "rotation-magic-ranged-melee": selected<SpecialSelection>({ kind: "rotation", order: ["vortex", "spike-disk", "black-disk"] }, "footage-once", "team-5", "V2 strict rotation over 7 attacks", NO_WIKI_P4, vod("V2", "k77, k105, k137, k165, k197, k225, k257")),
      "replay-v1": selected<SpecialSelection>({ kind: "replay", order: ["black-disk", "black-disk", "spike-disk", "black-disk", "spike-disk"] }, "footage-once", "team-4", "melee, melee, ranged; the last two only look like melee and ranged (Q1)", NO_WIKI_P4, vod("V1", "G62, G90, G122, G150, G182")),
      "replay-v2": selected<SpecialSelection>({ kind: "replay", order: ["vortex", "spike-disk", "black-disk", "vortex", "spike-disk", "black-disk", "vortex"] }, "footage-once", "team-5", "as V2 ran it", NO_WIKI_P4, vod("V2", "k77, k105, k137, k165, k197, k225, k257")),
    }),
    unclaimedOuterOrb: choice("heals-boss", {
      "heals-boss": selected<UnclaimedOrbRule>({ kind: "heals-boss", afterHit: span(19) }, "inferred", "team-4-and-5", "three heals 19 ticks after an outer hit; +51 equals a teammate's 51 (C17)", NO_WIKI_P4, vod("V1", "G147"), vod("V2", "k102, k222")),
      off: selected<UnclaimedOrbRule>({ kind: "off" }, "assumption", "unscaled", "the mechanism is inferred only", NO_WIKI_P4, vod("V1", "G147")),
    }),
    innerVoidFloor: INNER_VOID_FLOOR,
    floorHoleLayout: FLOOR_HOLE_LAYOUT,
    floorHoleDamage: FLOOR_HOLE_DAMAGE,
    deflect: choice("block-and-reflect", {
      "block-and-reflect": selected<DeflectRule>(
        { kind: "block", reflectPercent: 10 },
        "owner-estimated",
        "unscaled",
        "blocked as under block-at-launch, and the player takes 10% of the damage the blocked hit would have dealt, rounded down, as its own hitsplat, and nothing when that is 0; the owner named Nex's Deflect, about 10%; the wiki says Nex's Deflect Melee turns back the damage a melee hit would have dealt but gives no fraction, and the Ocellus pages name the prayers without saying what they do; the rounding is inferred",
        DEFLECT_MELEE_PAGE, BOSS_PAGE, STRATEGIES_RIFTS, owner("deflect reflects about 10%, as on Nex", "2026-10-22"),
      ),
      "block-at-launch": selected<DeflectRule>({ kind: "block", reflectPercent: 0 }, "inferred", "unscaled", "a hit of the deflected style lands as 0, judged by the overhead up when it was launched: three ranged hits launched before Deflect Range rose landed in full under it, and no capture shows a hit launched into a deflect of its own style (Q8); nothing comes back to the player", NO_WIKI_P4, vod("V1", "G182 to G184"), vod("V2", "k78 to k81, k137 to k140")),
      none: selected<DeflectRule>({ kind: "none" }, "assumption", "unscaled", "the wiki names the prayers without saying what they do", STRATEGIES),
    }),
    hoverMeleeReach: choice("unreachable", {
      unreachable: selected<HoveringBoss>("present-out-of-melee-reach", "inferred", "unscaled", "melee cannot reach the boss while he hovers, from S+0 to S+21: all 28 of Kirby's attacks in 6 hovers are ranged, every player stands off the 5x5 while he hovers, and the owner believes melee cannot reach him in the air; whether the void ring or his height stops it is not filmed", NO_WIKI_P4, vod("V1", "G33 to G54, G93 to G114, G153 to G174"), vod("V2", "k48 to k69, k108 to k129, k168 to k189"), owner("melee reach while airborne")),
      reachable: selected<HoveringBoss>("present-damageable", "assumption", "unscaled", "melee reaches the hovering boss as it reaches the landed one; no capture shows a melee attack while he hovers", NO_WIKI_P4, vod("V1", "G33 to G54, G93 to G114, G153 to G174"), vod("V2", "k48 to k69, k108 to k129, k168 to k189")),
    }),
    orbPickupRadius: choice("on-tile", {
      "on-tile": selected(0, "footage-repeated", "team-5", "the streamer stands on the orb tile a tick before each heal (C9)", STRATEGIES_P4, vod("V2", "k67, k95")),
      adjacent: selected(1, "footage-once", "team-4", "pickups read from an adjacent tile, with about 1 tile of perspective error (C9)", NO_WIKI_P4, vod("V1", "G51, G135, G175")),
    }),
    outerOrbTile: choice("opposite-entry", {
      "opposite-entry": selected<OuterOrbTile>(
        { kind: "opposite-entry" },
        "spec-single",
        "unscaled",
        "on the 5x5 rim tile farthest in a straight line from the tile where the player last stepped into the 5x5, or from the player when they are outside it at the hit, never on a hole; ties are a seeded pick; a guide says the orb is pretty much always on the opposite side of where you enter, and its frame shows the orb on the far edge",
        NO_WIKI_P4, owner("the orb opposite of where you enter", "2026-10-23"),
      ),
      "safe-floor": selected<OuterOrbTile>({ kind: "near-player" }, "footage-repeated", "team-4", "safe floor: outer orbs on the 5x5 edge, off the void and off the holes, collected without leaving the square", STRATEGIES_P4, vod("V1", "G74, G79, G128, G135"), ORB_OFF_HOLES),
    }),
    focus: choice("full-fight", {
      "full-fight": selected<Focus<Mechanic>>({ kind: "full-fight" }, "assumption", "unscaled", "every mechanic acts", NO_WIKI_PRACTICE, PRACTICE),
      "void-floor": drill("void-floor"),
      "lifeforce-orb": drill("lifeforce-orb"),
      "orb-retrieval": drill("lifeforce-orb", "void-floor"),
      explosions: drill("explosions"),
      "transition-attacks": drill("transition-attacks"),
      "boss-heals": drill("transition-attacks", "lifeforce-orb"),
      rifts: drill("rifts"),
      "floor-holes": drill("floor-holes"),
    }),
    drillStart: choice("at-mechanic", {
      "at-mechanic": selected<DrillStart>({ kind: "before-first-beat", lead: span(5) }, "assumption", "unscaled", "a drill starts 5 ticks before its first focused beat, or at tick 0 when it has none, as floor holes do; the full fight always starts at 0", NO_WIKI_PRACTICE, owner("jumping straight to a mechanic", "2026-10-22")),
      "cycle-start": selected<DrillStart>({ kind: "cycle-start" }, "assumption", "unscaled", "a drill starts at P4 tick 0 with the full fight", NO_WIKI_PRACTICE, PRACTICE),
    }),
  },
} as const;

const STRATEGIES_P3 = wiki("https://oldschool.runescape.wiki/w/The_Fractured_Archive/Strategies", 15381236);
const BOSS_PAGE_P3 = wiki("https://oldschool.runescape.wiki/w/Ocellus", 15381233);
const NO_WIKI_P3_TICKS = noWiki("the wiki's phase 3 text gives the order and damage but no tick counts (Strategies rev 15381236)");
const NO_WIKI_P3_ARENA = noWiki("the wiki has no tile layout of the phase 3 arena (Strategies rev 15381236, Ocellus rev 15381233)");
const KIRBY_GUIDE = "https://www.youtube.com/watch?v=GU8_yiucWtk";
const ROBINHOOD_GUIDE = "https://www.youtube.com/watch?v=9sji2HBjI98";
const DEFBIGBEAST_GUIDE = "https://www.youtube.com/watch?v=lT4DVmgDJak";
const PANFLEET_SOLO = "https://www.youtube.com/watch?v=_upW4hBgHbA";
const P3_CYCLE_FRAMES = guide(PANFLEET_SOLO, "5:20 to 5:45 at 1x: swings f114, f168, f294, f348, slashes landing f240, f421, the spin f478 (raid timer 30:13.00 at f0)");
const P3_CHIP_FRAMES = guide(DEFBIGBEAST_GUIDE, "20:28 to 21:12 at 1x: slashes landing f310 and f490, the tank's chips red 2 at f363 and red 1 at f417");
const DUO_GUIDE = "https://www.youtube.com/watch?v=HAgq_qg0OIY";
const P3_CHAIN_LOGS = fightLog("fights 1 to 7, quadrant 1 from his landing S: swings S+4 and S+7, slash S+10, swings S+14 and S+17, slash S+20, the spin S+24, its end S+29 and his next swing S+33; fight 8 the same 3 ticks late after a panic at S+4");
const P3_PANIC_LOGS = fightLog("fight 8: panic S+4, swing S+10, slash S+13; fight 3: swing S+33, panic S+36, slash S+42; fight 6: swing S+119, panic S+122, slash S+128");
const P3_SPECIAL_LOGS = fightLog("fights 4 and 8, quadrant 1: spin S+24, Untether S+53 (fight 8: S+59 after two panics), spin, Insolence, spin, Untether, spin, Insolence, spin; fights 5 to 7 the same up to the fall");
const RSPROX_PLAN = "https://github.com/MRobertEvers/oldschool-clientc/blob/HEAD/docs/rsprox-analysis/guthixian_archive/ocellus_plan.md";
const P3_DAMAGE_AUDIT = guide(RSPROX_PLAN, "damage audit, p3 rows: packet captures of six recorded fights");
const P3_UNTETHER_LOGS = fightLog("fights 1 to 8: Untether U, the slam U+29, a fall shout U+31 in fights 1 and 2, and with the quadrant standing a swing or panic at U+37 in fights 3 to 8");
const P3_RIFT_LOGS = fightLog("fights 3 to 8, quadrant 1: no rift before the first Untether, then rifts at U+32 and 48 ticks later after each Untether; fight 4 at S+85 and S+133, at S+188 with his first move after the spin at S+179 instead of S+181, then S+240 and S+288 after Untether at S+208, and at S+343 after the spin at S+334; fight 8 the same around its spins at S+185 and S+343");

type ChainStep = "afterSwing" | "afterSlash" | "afterPanic";
type P3BossPose = "swing" | "panic" | "shadowSlash" | "spinStarts" | "spinLoops" | "spinEnds" | "untetherStarts" | "untetherLoops" | "slam" | "superiorSlash" | "quadrantFalls" | "quadrantFallsLoop" | "escape";
/** Untether and Insolence, in the order they take turns within a quadrant. */
type OtherSpecials = readonly [Exclude<P3Special, "spin">, Exclude<P3Special, "spin">];
/** Quadrant 1, or the two after it. */
export type QuadrantKind = "first" | "later";

type VineStats = Readonly<{ attack: number; strength: number; defence: number; range: number; magic: number; hitpoint: number }>;

type P3Recipe = Readonly<{
  arena: Readonly<{ grid: Selected<readonly string[]>; playerSpawn: Selected<Tile>; bossAnchor: Selected<Tile> }>;
  thresholds: Selected<Readonly<Record<Quadrant, HpFraction>>>;
  firstAttackAfterStart: Selected<TickSpan>;
  chain: Readonly<Record<ChainStep, Selected<TickSpan>>> & Readonly<{ setsBeforeSpecial: Selected<number> }>;
  swing: Readonly<{ protectedDamage: Selected<DamageRange>; unprotectedDamage: Selected<DamageRange> }>;
  panic: Readonly<{ shout: Selected<string>; landsAfter: Selected<TickSpan>; damage: Selected<DamageRange> }>;
  shadowSlash: Readonly<{ landsAfter: Selected<TickSpan>; width: Selected<number>; damage: Selected<DamageRange> }>;
  specials: Selected<Readonly<{ firstQuadrant: OtherSpecials; laterQuadrants: OtherSpecials }>>;
  spin: Readonly<{
    saws: Selected<Readonly<Record<Quadrant, number>>>;
    firstCut: Selected<TickSpan>;
    cutEvery: Selected<TickSpan>;
    nextMoveAfterLastCut: Selected<TickSpan>;
    damage: Selected<DamageRange>;
    severedFor: Selected<TickSpan>;
    severChat: Selected<readonly string[]>;
  }>;
  untether: Readonly<{
    shout: Selected<string>;
    magic: Selected<readonly TickSpan[]>;
    magicDamage: Selected<DamageRange>;
    slam: Selected<TickSpan>;
    slamDamage: Selected<DamageRange>;
    aftershockDamage: Selected<DamageRange>;
    fallsOrStandsAt: Selected<TickSpan>;
    swingsAgain: Selected<TickSpan>;
  }>;
  insolence: Readonly<{
    shout: Selected<string>;
    slashes: Selected<readonly TickSpan[]>;
    landsAfter: Selected<TickSpan>;
    width: Selected<number>;
    damage: Selected<DamageRange>;
    swingsAgain: Selected<TickSpan>;
  }>;
  fallShouts: Selected<readonly string[]>;
  quadrants: Readonly<{
    corners: Selected<Readonly<Record<Quadrant, Tile>>>;
    stones: Selected<readonly number[]>;
    escapeShoutAt: Selected<TickSpan>;
    escapeShouts: Selected<readonly string[]>;
    fadesAt: Selected<TickSpan>;
    goneAt: Selected<TickSpan>;
    nextJumpAt: Selected<TickSpan>;
    leftOnIt: Selected<DamageRange>;
  }>;
  bombs: Readonly<{ shows: Selected<Readonly<Record<QuadrantKind, readonly TickSpan[]>>>; dropsAfter: Selected<TickSpan>; damage: Selected<DamageRange> }>;
  voids: Readonly<{ every: Selected<TickSpan>; damage: Selected<DamageRange> }>;
  rubble: Readonly<{ intoSpin: Selected<Readonly<Record<QuadrantKind, TickSpan>>>; fallsAfter: Selected<TickSpan>; damage: Selected<DamageRange> }>;
  vine: Readonly<{
    afterSpins: Selected<readonly number[]>;
    shouts: Selected<readonly string[]>;
    rootsAfter: Selected<TickSpan>;
    npcId: Selected<number>;
    name: Selected<string>;
    combatLevel: Selected<number>;
    stats: Selected<VineStats>;
  }>;
  rifts: Readonly<{
    afterLanding: Selected<TickSpan>;
    afterUntether: Selected<TickSpan>;
    every: Selected<TickSpan>;
    perSpawn: Selected<number>;
    clearOfBoss: Selected<number>;
    detonatesAfter: Selected<TickSpan>;
    detonationDamage: Selected<DamageRange>;
  }>;
  shoutLasts: Selected<TickSpan>;
  bossPoses: Readonly<Record<P3BossPose, Selected<number>>>;
}>;

const P3: P3Recipe = {
  arena: {
    grid: selected(
      [
        ".........bbbbbbbbbbbbb.........",
        ".......bbbb222+++111bbbb.......",
        "......bbbb2222+++1111bbbb......",
        ".....bbbb22222+++11111bbbb.....",
        "....bbBb222222+++111111bBbb....",
        "...bbbb2222222+++1111111bbbb...",
        "...bbb22222222+++11111111bbb...",
        "..bbb222222222+++111111111bbb..",
        "..bb2222222222+++1111111111bb..",
        "..b22222222222+++11111111111b..",
        "..b22222222222+++11111111111b..",
        "..b22222222222+++11111111111b..",
        "..b+++++++++++++++++++++++++b..",
        "..b+++++++++++++++++++++++++b..",
        "..b+++++++++++++++++++++++++b..",
        "..b33333333333+++44444444444b..",
        "..b33333333333+++44444444444b..",
        "..b33333333333+++44444444444b..",
        "..bb3333333333+++4444444444bb..",
        "..bbb333333333+++444444444bbb..",
        "...bbb33333333+++44444444bbb...",
        "...bbbb3333333+++4444444bbbb...",
        "....bbBb333333+++444444bBbb....",
        ".....bbbb33333+++44444bbbb.....",
        "......bbbb3333+++4444bbbb......",
        ".......bbbb333+++444bbbb.......",
        ".........bbbbb+++bbbbb.........",
      ],
      "spec-single",
      "unscaled",
      "row y = 0 first, x = 0 leftmost, at cache x = 16 + column and y = 54 - row; 1 to 4 are the north-east, north-west, south-west and south-east wedges of 85 floor tiles each, + the 3-wide cross between them, b the raised rim, B a brazier on the rim, . not floor; every floor tile of the map square is in the grid, and a quarter turn about The Blade at cache (31, 41) maps each wedge onto the next",
      NO_WIKI_P3_ARENA, cache("map square 16472 plane 1: floor overlay 657, rim 656, brazier locs 62894"),
    ),
    playerSpawn: selected(tile(19, 9), "assumption", "unscaled", "a floor tile of the north-east wedge two tiles south-west of the boss; no clip pins where the phase starts", NO_WIKI_P3_ARENA),
    bossAnchor: selected(tile(21, 7), "assumption", "unscaled", "south-west tile of the boss's 3x3, which covers x 21 to 23 and y 5 to 7, all on the north-east wedge; no clip pins where the phase starts", NO_WIKI_P3_ARENA),
  },
  thresholds: selected(
    { 1: hpFraction(0.75), 2: hpFraction(0.5), 3: hpFraction(0.25) },
    "community-tested",
    "team-4-and-5",
    "a quadrant falls on the tick after the first tick the boss is at or below the fraction of his max HP, whatever he is doing, except that during Untether it waits for its end; the wiki says only enough damage",
    NO_WIKI_P3_TICKS, guide(ROBINHOOD_GUIDE, "0:06:13"), guide(KIRBY_GUIDE, "5:37"),
    fightLog("fight 7: swings S+169 and S+172, slash S+175, the fall shout S+178, a tick before his next move; fight 5: swing S+172 and the fall shout S+173; the logs show his HP only as a whole percentage, so the tick it reached the floor is not on record"),
  ),
  firstAttackAfterStart: selected(span(4), "footage-repeated", "unscaled", "P3 tick 0 is the tick he lands in his first corner; his first move comes 4 ticks later, 10 after phase 3 begins", NO_WIKI_P3_TICKS, P3_CHAIN_LOGS),
  chain: {
    afterSwing: selected(span(3), "footage-repeated", "unscaled", "a set is two swings and a shadow slash, each move timed from the one before: the second swing 3 ticks after the first and the slash 3 after the second; the wiki infobox's attack speed of 6 is not this gap", STRATEGIES_P3, BOSS_PAGE_P3, P3_CHAIN_LOGS, P3_CYCLE_FRAMES, P3_CHIP_FRAMES),
    afterSlash: selected(span(4), "footage-repeated", "unscaled", "his next move, a swing or a special, 4 ticks after the slash's animation; the slash lands 1 tick after its animation, so footage shows it landing 3 ticks before the next swing", NO_WIKI_P3_TICKS, P3_CHAIN_LOGS, P3_CYCLE_FRAMES, P3_CHIP_FRAMES),
    afterPanic: selected(span(6), "footage-repeated", "unscaled", "a panic shot takes a swing's place and his next move comes 6 ticks after it, so the rest of the chain runs 3 ticks late", NO_WIKI_P3_TICKS, P3_PANIC_LOGS),
    setsBeforeSpecial: selected(2, "footage-repeated", "unscaled", "two sets, then a special, then two sets again", NO_WIKI_P3_TICKS, P3_CHAIN_LOGS, guide(KIRBY_GUIDE, "4:18")),
  },
  swing: {
    protectedDamage: selected<DamageRange>({ min: 0, max: 6 }, "footage-repeated", "solo", "chip through Protect from Melee: red 6, blue 0, red 6, blue 0 in panfleet's solo and red 2 and red 1 on DefBigbeast's tank; 6 is the most seen", NO_WIKI_P3_TICKS, P3_CYCLE_FRAMES, P3_CHIP_FRAMES, guide(ROBINHOOD_GUIDE, "0:02:09")),
    unprotectedDamage: selected<DamageRange>({ min: 0, max: 26 }, "inferred", "unscaled", "the monster melee max hit ⌊0.5 + (250 + 9) × (0 + 64) / 640⌋ = 26 at the cache's Strength 250 with no strength bonus (assumption); no clip shows an unprotected swing", noWiki("no wiki page gives the phase 3 swing's max hit (Ocellus rev 15381233)"), cache("npc 16677 stats [325, 250, 250, 5250, 300, 300]")),
  },
  panic: {
    shout: selected("Your panic... is futile...", "footage-repeated", "unscaled", "his shout with a panic shot", NO_WIKI_P3_TICKS, fightLog("fights 3 to 8")),
    landsAfter: selected(span(2), "footage-repeated", "unscaled", "a magic shot that lands 2 ticks after his animation, when nobody is in his melee reach as a swing comes; Protect from Magic blocks it", STRATEGIES_P3, fightLog("fights 1 and 3 to 8: every panic's hits land 2 ticks after its animation, 0 on each raider under Protect from Magic")),
    damage: selected<DamageRange>({ min: 20, max: 26 }, "spec-single", "unscaled", "without Protect from Magic, from the wiki's 20+; the logs' unprotected hits as it lands run from 10 to 33, with other hits on the same tick, so they do not pin it", STRATEGIES_P3, guide(ROBINHOOD_GUIDE, "0:02:26 to 0:02:31"), fightLog("fights 1 and 3 to 8")),
  },
  shadowSlash: {
    landsAfter: selected(span(1), "footage-repeated", "unscaled", "the slash's floor graphic and its hits come the tick after his animation", NO_WIKI_P3_TICKS, fightLog("fights 1 to 8: spotanim 4335 on the floor and the hits on the tick after each animation 14846")),
    width: selected(3, "footage-repeated", "unscaled", "a band 3 tiles wide toward his tank, snapped to the nearest of the 8 directions from his middle tile, from the ring touching his body to the wedge's edge; straight bands are the 3 tiles in line with his body, diagonal ones start at his corner; solo, his tank is you", NO_WIKI_P3_TICKS, fightLog("fights 3 to 8: 111 bands of spotanim 4335, each aimed at the raider his swings hit")),
    damage: selected<DamageRange>({ min: 25, max: 28 }, "footage-repeated", "unscaled", "typeless, so a protection prayer does not help", NO_WIKI_P3_TICKS, P3_DAMAGE_AUDIT, fightLog("fights 1 to 8: 57 of the 75 hits on raiders the tick after a slash's animation are 25 to 28")),
  },
  specials: selected<Readonly<{ firstQuadrant: OtherSpecials; laterQuadrants: OtherSpecials }>>(
    { firstQuadrant: ["untether", "insolence"], laterQuadrants: ["insolence", "untether"] },
    "footage-repeated",
    "unscaled",
    "after every two sets: the spin every other special through the whole phase, across each quadrant's fall, and between spins Untether and Insolence in turn within a quadrant, Untether first in quadrant 1 and Insolence first after it; so a quadrant that falls after a spin opens with Untether or Insolence, and one that falls after another special opens with the spin; his HP plays no part",
    NO_WIKI_P3_TICKS, P3_SPECIAL_LOGS, guide(RSPROX_PLAN, "phase 3: a segment opens with Insolence if the quadrant before fell right after a spin"),
    fightLog("fight 1: quadrant 2 opens with the spin after Untether, quadrant 3 with the spin after Insolence; fight 2: quadrant 3 opens with Insolence after a spin; fights 5 to 7: quadrant 2 spin, Insolence, spin, Untether"),
  ),
  spin: {
    saws: selected<Readonly<Record<Quadrant, number>>>({ 1: 1, 2: 2, 3: 3 }, "footage-repeated", "unscaled", "one saw, and one more for each quadrant fallen: a loop animation for each extra saw, then the end animation", NO_WIKI_P3_TICKS, guide(RSPROX_PLAN, "phase 3: one prayer loop per quadrant fallen, 3 ticks apart, then the out at 5 + 3 x loops"), fightLog("fights 1 to 8: one cut in quadrant 1, two in quadrant 2 and three in quadrant 3")),
    firstCut: selected(span(5), "footage-repeated", "unscaled", "the first saw cuts 5 ticks after the spin starts, on the tick his loop animation, or for the last saw his end animation, plays", NO_WIKI_P3_TICKS, P3_CHAIN_LOGS, fightLog("fight 2: per-tick overheads through each spin")),
    cutEvery: selected(span(3), "footage-repeated", "unscaled", "each later saw 3 ticks after the one before", NO_WIKI_P3_TICKS, fightLog("fight 2, quadrant 3: loops at P+5 and P+8, the end at P+11")),
    nextMoveAfterLastCut: selected(span(4), "footage-repeated", "unscaled", "his next move 4 ticks after the last cut", NO_WIKI_P3_TICKS, P3_CHAIN_LOGS),
    damage: selected<DamageRange>({ min: 15, max: 27 }, "spec-single", "unscaled", "melee, 0 through Protect from Melee", NO_WIKI_P3_TICKS, P3_DAMAGE_AUDIT, fightLog("fights 1 to 8: zeros through Protect from Melee on each cut, and 11 to 29 on raiders with no overhead")),
    severedFor: selected(span(3), "footage-once", "unscaled", "an overhead up on the tick before a cut is severed and stays off for 3 ticks, so the cut lands; turn it off for that tick and back on for the cut", NO_WIKI_P3_TICKS, guide(DUO_GUIDE, "18:53 to 18:55"), fightLog("fight 2: every raider's overhead off the tick before each cut and on for it")),
    severChat: selected(
      ["Ocellus disrupts your concentration, severing your prayer!", "You've been injured and can't use protection prayers!"],
      "footage-once",
      "unscaled",
      "the game chat as a prayer is severed",
      NO_WIKI_P3_TICKS, guide(DUO_GUIDE, "18:53"), fightLog("fight 4: the second line in the chat"),
    ),
  },
  untether: {
    shout: selected("Untether...", "footage-repeated", "unscaled", "his shout as Untether starts", STRATEGIES_P3, P3_UNTETHER_LOGS),
    
    magic: selected([span(10), span(14), span(18), span(22)], "footage-repeated", "unscaled", "magic lands on everyone 10, 14, 18 and 22 ticks in, so Untether is prayed with Protect from Magic", NO_WIKI_P3_TICKS, guide(KIRBY_GUIDE, "4:37"), fightLog("fights 1 to 8: zeros on every raider under Protect from Magic at U+10, U+14, U+18 and U+22")),
    magicDamage: selected<DamageRange>({ min: 14, max: 29 }, "spec-single", "unscaled", "without Protect from Magic, from 12 unprayed hits; nearly every hit through Protect from Magic was 0", NO_WIKI_P3_TICKS, P3_DAMAGE_AUDIT),
    slam: selected(span(29), "footage-repeated", "unscaled", "the slam hits whoever is not under his 3x3 at the end of the tick before; the aftershock a tick later hits whoever is still under him at the end of the slam's tick; so be under him by U+28 and one tile out on U+29", NO_WIKI_P3_TICKS, guide(KIRBY_GUIDE, "5:00"), fightLog("fight 1: 36 on the one raider outside at U+29, 21 and 41 at U+30 on the two still under")),
    slamDamage: selected<DamageRange>({ min: 34, max: 39 }, "footage-repeated", "unscaled", "typeless; the logs' slams run 34 to 41", NO_WIKI_P3_TICKS, P3_DAMAGE_AUDIT, fightLog("fights 1 to 8: hits at U+29")),
    aftershockDamage: selected<DamageRange>({ min: 18, max: 41 }, "footage-repeated", "unscaled", "typeless; 18 and 19 on the tick after the slam in the packet captures, 18 to 42 in the logs", NO_WIKI_P3_TICKS, P3_DAMAGE_AUDIT, fightLog("fights 1 to 8: hits at U+30")),
    fallsOrStandsAt: selected(span(31), "footage-repeated", "unscaled", "the quadrant falls 31 ticks after Untether starts if his HP is at its floor by then; otherwise it stands", NO_WIKI_P3_TICKS, P3_UNTETHER_LOGS),
    swingsAgain: selected(span(37), "footage-repeated", "unscaled", "with the quadrant standing, his next move 37 ticks after Untether starts", NO_WIKI_P3_TICKS, P3_UNTETHER_LOGS),
  },
  insolence: {
    shout: selected("Insolence...", "footage-repeated", "unscaled", "his shout as Insolence starts", NO_WIKI_P3_TICKS, fightLog("fights 1 to 8")),
    slashes: selected([span(2), span(7), span(12)], "footage-repeated", "unscaled", "three superior slashes animate 2, 7 and 12 ticks after the shout; solo, all three come at you", NO_WIKI_P3_TICKS, fightLog("fights 1 and 5 to 7: animation 14848 at I+2, I+7 and I+12; the other fights log two of the three on those ticks")),
    landsAfter: selected(span(3), "footage-repeated", "unscaled", "each lands 3 ticks after its animation", NO_WIKI_P3_TICKS, fightLog("fights 1, 2 and 4 to 8: hits of 38 to 48 three ticks after animation 14848")),
    width: selected(3, "footage-once", "unscaled", "a band 3 tiles wide from just outside his body to the wedge's edge, at any angle, not snapped", NO_WIKI_P3_TICKS, guide(DUO_GUIDE, "20:24")),
    damage: selected<DamageRange>({ min: 38, max: 46 }, "footage-repeated", "unscaled", "typeless; 39 to 41 in the packet captures, 38 to 48 in the logs, 46, 43 and 38 on one band in fight 1", NO_WIKI_P3_TICKS, P3_DAMAGE_AUDIT, fightLog("fights 1, 2 and 4 to 8")),
    swingsAgain: selected(span(20), "footage-repeated", "unscaled", "his next move 20 ticks after the shout", NO_WIKI_P3_TICKS, fightLog("fights 1, 2, 4, 5, 7 and 8")),
  },
  fallShouts: selected(["Obliteration...", "Run... It matters not..."], "footage-repeated", "unscaled", "one of these as the quadrant falls", NO_WIKI_P3_TICKS, fightLog("fights 1 to 8")),
  bombs: {
    shows: selected<Readonly<Record<QuadrantKind, readonly TickSpan[]>>>(
      { first: [span(4), span(7)], later: [span(4)] },
      "footage-repeated",
      "solo",
      "a void bomb shows over the player 4 and 7 ticks after he lands in quadrant 1 and 4 ticks after he lands in a later one, on the quadrant's clock, so a panic does not move them, with one on the same tile turned into each other standing quadrant; in a raid they fall on raiders but the tank, and solo on you; the logs show the wave at S+4 in all eight fights and the one at S+7 in fight 1",
      NO_WIKI_P3_TICKS, guide(RSPROX_PLAN, "phase 3 segments: a bomb 6 (and 9 in the first) after each jump"), guide(KIRBY_GUIDE, "8:55"), fightLog("fights 1 to 8: spotanim 4299 over raiders at S+4, and in fight 1 at S+7; fight 8 at S+4 through its panic; fight 6, quadrant 2: at S+4 over three raiders and on the same tiles turned into the other two standing quadrants"),
    ),
    dropsAfter: selected(span(2), "footage-repeated", "unscaled", "it drops 2 ticks after it shows, on the tile it showed over", NO_WIKI_P3_TICKS, guide(RSPROX_PLAN, "phase 3 segments: the bomb's drop and impact at +2"), fightLog("fights 1 to 8: spotanims 4300 and 4301 2 ticks after each 4299")),
    damage: selected<DamageRange>({ min: 6, max: 11 }, "spec-single", "unscaled", "typeless, on the bomb's tile as it drops; it leaves a void that stays until the quadrant falls, so for the rest of the drill", NO_WIKI_P3_TICKS, P3_DAMAGE_AUDIT),
  },
  voids: {
    every: selected(span(2), "spec-single", "unscaled", "a bomb's void hits a player on it every 2 ticks from the tick it forms, never the tick after", NO_WIKI_P3_TICKS, P3_DAMAGE_AUDIT),
    damage: selected<DamageRange>({ min: 6, max: 7 }, "spec-single", "unscaled", "typeless", NO_WIKI_P3_TICKS, P3_DAMAGE_AUDIT),
  },
  rubble: {
    intoSpin: selected<Readonly<Record<QuadrantKind, TickSpan>>>({ first: span(3), later: span(6) }, "footage-repeated", "solo", "rubble shows over each raider 3 ticks into a spin in quadrant 1 and 6 in later quadrants; solo, over you", NO_WIKI_P3_TICKS, guide(KIRBY_GUIDE, "7:20"), fightLog("fights 1 to 8: spotanim 4346 over raiders at P+3 in every quadrant 1 spin; fights 1 and 2: at P+6 in quadrant 2")),
    fallsAfter: selected(span(5), "footage-repeated", "unscaled", "it falls 5 ticks after it shows, so one step off its tile clears it", NO_WIKI_P3_TICKS, guide(KIRBY_GUIDE, "7:20"), fightLog("fights 1 to 8: hits on raiders still on their rubble tile 5 ticks after spotanim 4346")),
    damage: selected<DamageRange>({ min: 14, max: 16 }, "footage-repeated", "unscaled", "typeless; 14 to 16 on nearly every raider still on the tile, through any prayer; no log shows a void left where it fell", NO_WIKI_P3_TICKS, fightLog("fights 1 to 8: 14, 15 and 16 on raiders still on their rubble tile")),
  },
  vine: {
    afterSpins: selected([1, 3], "footage-repeated", "unscaled", "its shout comes with his first move after a quadrant's first and third spins, never an even one", NO_WIKI_P3_TICKS, fightLog("fights 2 to 8: with his first move after quadrant 1's first spin, a panic's shout in its place in fights 3, 4, 6 and 7; fights 4 and 8 again after the third spin")),
    shouts: selected(["The void... will take you...", "Await... the void..."], "footage-repeated", "unscaled", "one of these; a panic's shout on the same tick shows in its place", NO_WIKI_P3_TICKS, fightLog("fights 1 to 8")),
    rootsAfter: selected(
      span(3),
      "footage-repeated",
      "solo",
      "3 ticks after the shout the vine roots its target where they stand and holds them until it dies, with no hit for staying; in a raid it takes anyone but the tank and a teammate cuts it, and solo it takes you and you cut it",
      noWiki("the Void Vine page says a teammate must break it or it deals upwards of 50 (Void Vine rev 15377692); the logs show no such hit"),
      guide(RSPROX_PLAN, "phase 3: the vine 3 ticks after its line"),
      fightLog("fights 2 and 6: npc 16681 3 ticks after the shout; vines lived 7 to 32 ticks with no hit on their target"),
    ),
    npcId: selected(16681, "spec-confirmed", "unscaled", "Void Vine", wiki("https://oldschool.runescape.wiki/w/Void_Vine", 15377692), fightLog("fights 1 to 8: npc 16681")),
    name: selected("Void Vine", "spec-confirmed", "unscaled", "its name in game", wiki("https://oldschool.runescape.wiki/w/Void_Vine", 15377692)),
    combatLevel: selected(0, "spec-confirmed", "unscaled", "level 0 on its hover text", wiki("https://oldschool.runescape.wiki/w/Void_Vine", 15377692), fightLog("fights 3 to 5: npc 16681 at level 0")),
    stats: selected<VineStats>({ attack: 1, strength: 1, defence: 1, range: 1, magic: 1, hitpoint: 44 }, "spec-single", "unscaled", "44 hitpoints; the wiki lists no other stat, so the rest are 1 (assumption)", wiki("https://oldschool.runescape.wiki/w/Void_Vine", 15377692), guide(RSPROX_PLAN, "the rifts and vine row: 44 health")),
  },
  rifts: {
    afterLanding: selected(span(3), "footage-repeated", "unscaled", "in quadrants 2 and 3 the first rift comes 3 ticks after he lands, then the same clock as in quadrant 1", NO_WIKI_P3_TICKS, guide(RSPROX_PLAN, "phase 3 rifts: 3, 51, 99 in later segments"), fightLog("fights 6 to 8: rifts at S+3 of quadrants 2 and 3, then 48 ticks later")),
    afterUntether: selected(span(32), "footage-repeated", "unscaled", "none before quadrant 1's first Untether; after each Untether the quadrant stands through, a Void Rift 32 ticks after Untether starts", NO_WIKI_P3_TICKS, guide(RSPROX_PLAN, "phase 3 rifts: U+32 during Untether"), P3_RIFT_LOGS),
    every: selected(span(48), "footage-repeated", "unscaled", "then one every 48 ticks; one due while he spins comes with his first move after the spin, and the next is timed from when it was due (assumption: no log has one between a late rift and the next Untether)", NO_WIKI_P3_TICKS, guide(RSPROX_PLAN, "phase 3 rifts: 3, 51, 99, and one due in a spin at the swing after it"), P3_RIFT_LOGS),
    perSpawn: selected(1, "spec-confirmed", "solo", "max(1, living raiders / 2), so one solo; each quadrant has one kind, and this drill places Void Rifts only", NO_WIKI_P3_TICKS, guide("https://github.com/MRobertEvers/oldschool-clientc/blob/HEAD/docs/rsprox-analysis/guthixian_archive/RAID_PLAN.md", "void rifts, phase 3: one at three raiders, two at four, max(1, living / 2)")),
    clearOfBoss: selected(2, "assumption", "unscaled", "a random floor tile of the wedge at least 2 tiles from his 3x3; the logs place them all over the wedge", NO_WIKI_P3_ARENA, P3_RIFT_LOGS),
    detonatesAfter: selected(span(30), "footage-repeated", "unscaled", "a rift left alive detonates 30 ticks after it appears, its flare on the player and its hit on the same tick; destroying one first resets the player's attack cooldown, and standard ranged and melee attacks max-hit it, as in phase 4", VOID_RIFT_PAGE, guide(RSPROX_PLAN, "phase 3 rifts: detonates 30 ticks from its add"), fightLog("fight 3: a Void Rift from S+88 detonated at S+118; fight 5: two Void Augmenters 30 ticks after they appeared")),
    detonationDamage: selected<DamageRange>({ min: 39, max: 41 }, "footage-repeated", "unscaled", "typeless; 39 from a Void Rift and 40, 40 and 41 from a Void Augmenter; one raider under Protect from Magic took 18", noWiki("the Void Rift page does not say what an unkilled rift does (Void Rift rev 15380527)"), fightLog("fights 3 and 5")),
  },
  shoutLasts: selected(span(3), "assumption", "unscaled", "how long his overhead text shows", NO_WIKI_PRESENTATION),
  quadrants: {
    corners: selected<Readonly<Record<Quadrant, Tile>>>(
      { 1: tile(21, 7), 2: tile(9, 7), 3: tile(9, 19) },
      "footage-repeated",
      "unscaled",
      "he takes the quadrants counter-clockwise from the north-east, landing in each one's corner, where he also rises for Untether: the south-west tile of his 3x3 at cache (37, 47), (25, 47) and (25, 35)",
      NO_WIKI_P3_ARENA, guide(RSPROX_PLAN, "phase 3: each later segment goes to the next quadrant counter-clockwise; recorded orders NE, NW, SW"),
      fightLog("fights 3 to 5: Untether at cache (37, 47) in quadrant 1, (25, 47) in quadrant 2 and (25, 35) in quadrant 3; fight 5: his first swing in quadrant 2 from (25, 47)"),
    ),
    stones: selected(
      [4, 7, 10],
      "footage-repeated",
      "unscaled",
      "the cross between the wedges is a chasm, with each wedge's inner corner, leaving 84 tiles a wedge; three stepping stones sit on each arm's middle line 4, 7 and 10 tiles out, the only way over: a jump from the bank beside the near stone, a hop to each stone, and a jump to the bank beside the far one, one a tick",
      NO_WIKI_P3_ARENA, guide(RSPROX_PLAN, "phase 3: three stepping stones at 4, 7 and 10 out on each arm, four hops a crossing; each quadrant's 84 tiles"),
      fightLog("fight 3: raiders on the stones at cache (31, 37) and (38, 41); no other raider on the cross in 2,588 phase 3 positions"),
    ),
    escapeShoutAt: selected(span(11), "footage-repeated", "unscaled", "his second line 11 ticks after the quadrant starts to fall", NO_WIKI_P3_TICKS, guide(RSPROX_PLAN, "phase 3: D+11"), fightLog("fights 1, 2 and 4 to 8: animation 14862 at D+11, with the line in fights 6 to 8")),
    escapeShouts: selected(["You can't... escape... the end...", "This end... comes...", "Everything... ends..."], "footage-repeated", "unscaled", "one of these", NO_WIKI_P3_TICKS, guide(RSPROX_PLAN, "phase 3: D+11"), fightLog("fights 6 to 8")),
    fadesAt: selected(span(12), "spec-single", "unscaled", "he fades out 12 ticks after the quadrant starts to fall and is gone until he lands in the next one", NO_WIKI_P3_TICKS, guide(RSPROX_PLAN, "phase 3: D+12")),
    goneAt: selected(span(13), "spec-single", "unscaled", "the quadrant's floor is gone 13 ticks after it starts to fall", NO_WIKI_P3_TICKS, guide(RSPROX_PLAN, "phase 3: D+13, its 84 tiles become blocking")),
    nextJumpAt: selected(span(17), "footage-repeated", "unscaled", "he lands in the next quadrant 17 ticks after the last one starts to fall; after the third, phase 4 starts then", NO_WIKI_P3_TICKS, guide(RSPROX_PLAN, "phase 3: D+17"), fightLog("fights 1, 2 and 4 to 8: the next segment 17 ticks after each fall; fights 1, 2 and 6: phase 4 17 ticks after the third")),
    leftOnIt: selected<DamageRange>({ min: 255, max: 255 }, "assumption", "unscaled", "a player still on the quadrant as its floor goes is lost to the void; the packet captures say only that its tiles become blocking", NO_WIKI_P3_ARENA, guide(RSPROX_PLAN, "phase 3: D+13")),
  },
  bossPoses: {
    swing: pose(14842, "npc_ocellus_phase3_melee_basic", "inferred", "the swing, 2 ticks; by its name"),
    panic: pose(14851, "npc_ocellus_phase3_basic_projectile_all", "footage-repeated", "the panic shot, 3 ticks; on every panic in the logs"),
    shadowSlash: pose(14846, "npc_ocellus_phase3_melee_slash", "footage-repeated", "the shadow slash, 3 ticks; on every slash in the logs"),
    spinStarts: pose(14869, "npc_ocellus_phase3_prayer_in", "footage-repeated", "the spin's start; on every spin in the logs"),
    spinLoops: pose(14870, "npc_ocellus_phase3_prayer_loop", "footage-repeated", "a saw's cut before the last; in the logs' later quadrants"),
    spinEnds: pose(14871, "npc_ocellus_phase3_prayer_out", "footage-repeated", "the last saw's cut; on every spin in the logs"),
    untetherStarts: pose(14857, "npc_ocellus_phase3_unleash_in", "footage-repeated", "Untether's rise, 2 ticks; on every Untether in the logs"),
    untetherLoops: pose(14858, "npc_ocellus_phase3_unleash_loop", "footage-repeated", "hovering through Untether, a 2-tick loop"),
    slam: pose(14861, "npc_ocellus_phase3_unleash_out", "footage-repeated", "the slam, 4 ticks; at U+29 in the logs"),
    superiorSlash: pose(14848, "npc_ocellus_phase3_superior_slash", "footage-repeated", "a superior slash of Insolence; in the logs"),
    quadrantFalls: pose(14859, "npc_ocellus_phase3_quadrant_destroy_in", "footage-repeated", "the fall's start, with its shout; in the logs"),
    quadrantFallsLoop: pose(14860, "npc_ocellus_phase3_quadrant_destroy_loop", "footage-repeated", "the fall's loop from 2 ticks in; in the logs"),
    escape: pose(14862, "npc_ocellus_phase3_unleash_out_90", "footage-repeated", "with his second line 11 ticks into the fall; in the logs"),
  },
};

export const OCELLUS_P3 = {
  ...P3,
  choices: {
    reach: choice("melee-range", {
      "melee-range": selected<ReachRule>("melee-range", "community-tested", "team-4-and-5", "a swing becomes a panic shot when the player is not in the SDK's melee range of the boss's 3x3 after his step; the wiki's unable to reach read as melee range", STRATEGIES_P3, guide(ROBINHOOD_GUIDE, "0:02:26")),
      "within-two": selected<ReachRule>("within-two", "spec-single", "unscaled", "a panic shot when the player is more than 2 tiles from the boss's 3x3", BOSS_PAGE_P3),
    }),
  },
} as const;

type Choices = typeof OCELLUS_P4.choices;
type ChoiceName = keyof Choices;
type OptionsOf<K extends ChoiceName> = Choices[K]["options"];
type OptionKey<K extends ChoiceName> = keyof OptionsOf<K> & string;
const SCATTERED = "scattered";
export type DrillSelection = { readonly [K in Exclude<ChoiceName, "floorHoleLayout">]?: OptionKey<K> } & Readonly<{ floorHoleLayout?: OptionKey<"floorHoleLayout"> | typeof SCATTERED }>;
const CHOICES: { readonly [K in ChoiceName]: Readonly<{ default: OptionKey<K>; options: OptionsOf<K> }> } = OCELLUS_P4.choices;

class ResolvedChoice<K extends ChoiceName> {
  readonly #name: K;
  readonly option: OptionsOf<K>[OptionKey<K>];

  constructor(name: K, readonly key: OptionKey<K>) {
    this.#name = name;
    this.option = CHOICES[name].options[key];
  }
}
export type ResolvedChoices = { readonly [K in ChoiceName]: ResolvedChoice<K> };

export type DrillConfig = Readonly<{ seed: Seed; choices: ResolvedChoices; bossEntryHp: number | null }>;
type ParsedDrill = Readonly<{ config: DrillConfig; invincible: boolean; rejected: readonly string[] }>;

function hasKey<O extends object>(record: O, key: string): key is keyof O & string {
  return Object.prototype.hasOwnProperty.call(record, key);
}

const HOLE_LAYOUTS = CHOICES.floorHoleLayout.options;
const SCATTERED_HOLE_LAYOUTS = Object.keys(HOLE_LAYOUTS).filter(
  (key): key is OptionKey<"floorHoleLayout"> => hasKey(HOLE_LAYOUTS, key) && HOLE_LAYOUTS[key].value.placement === SCATTERED,
);

function scatteredHoleLayout(runSeed: Seed): OptionKey<"floorHoleLayout"> {
  return SCATTERED_HOLE_LAYOUTS[Math.floor(roll(runSeed, "holeLayout", tick(0), 0) * SCATTERED_HOLE_LAYOUTS.length)] ?? CHOICES.floorHoleLayout.default;
}

function resolveChoices(lookup: (name: ChoiceName) => string | undefined, rejected: string[], runSeed: Seed): ResolvedChoices {
  const pick = <K extends ChoiceName>(name: K): ResolvedChoice<K> => {
    const raw = lookup(name);
    const { options } = CHOICES[name];
    if (raw !== undefined && hasKey(options, raw)) return new ResolvedChoice(name, raw);
    if (raw !== undefined) rejected.push(`${name}=${raw}`);
    return new ResolvedChoice(name, CHOICES[name].default);
  };
  return {
    setup: pick("setup"),
    bossMaxHp: pick("bossMaxHp"),
    entryHpFraction: pick("entryHpFraction"),
    explosions: pick("explosions"),
    explosionDamageReduction: pick("explosionDamageReduction"),
    specialSelection: pick("specialSelection"),
    unclaimedOuterOrb: pick("unclaimedOuterOrb"),
    innerVoidFloor: pick("innerVoidFloor"),
    floorHoleLayout: lookup("floorHoleLayout") === SCATTERED ? new ResolvedChoice("floorHoleLayout", scatteredHoleLayout(runSeed)) : pick("floorHoleLayout"),
    floorHoleDamage: pick("floorHoleDamage"),
    deflect: pick("deflect"),
    hoverMeleeReach: pick("hoverMeleeReach"),
    orbPickupRadius: pick("orbPickupRadius"),
    outerOrbTile: pick("outerOrbTile"),
    focus: pick("focus"),
    drillStart: pick("drillStart"),
  };
}

function isChoiceName(name: string): name is ChoiceName {
  return hasKey(OCELLUS_P4.choices, name);
}

type SeedRead = Readonly<{ seed: Seed; rejected: string | null }>;

function readSeed(url: URL, freshSeed: () => number): SeedRead {
  const raw = url.searchParams.get("seed");
  const parsed = raw !== null && /^\d{1,10}$/.test(raw) && Number(raw) <= 0xffffffff ? Number(raw) : null;
  return { seed: seed(parsed ?? freshSeed()), rejected: raw !== null && parsed === null ? `seed=${raw}` : null };
}

function readInvincible(url: URL, rejected: string[]): boolean {
  const invincible = url.searchParams.get("invincible");
  if (invincible !== null && invincible !== "on") rejected.push(`invincible=${invincible}`);
  return invincible === "on";
}

function readBossHp(url: URL, maxHp: number, rejected: string[]): number | null {
  const raw = url.searchParams.get("bosshp");
  const bossHp = raw !== null && /^\d{1,6}$/.test(raw) && Number(raw) >= 1 && Number(raw) <= maxHp ? Number(raw) : null;
  if (raw !== null && bossHp === null) rejected.push(`bosshp=${raw}`);
  return bossHp;
}

function rejectUnknownKeys(url: URL, known: (key: string) => boolean, rejected: string[]): void {
  for (const [key, value] of url.searchParams) {
    if (key !== "seed" && key !== "invincible" && key !== "bosshp" && !known(key)) rejected.push(`${key}=${value}`);
  }
}

export function parseDrillRequest(url: URL, freshSeed: () => number): ParsedDrill {
  const rejected: string[] = [];
  rejectUnknownKeys(url, isChoiceName, rejected);
  const invincible = readInvincible(url, rejected);
  const run = readSeed(url, freshSeed);
  const choices = resolveChoices((name) => url.searchParams.get(name) ?? undefined, rejected, run.seed);
  if (run.rejected !== null) rejected.push(run.rejected);
  const bossEntryHp = readBossHp(url, choices.bossMaxHp.option.value, rejected);
  return { config: { seed: run.seed, choices, bossEntryHp }, invincible, rejected };
}

type P3ChoiceName = keyof typeof OCELLUS_P3.choices;
type P3OptionsOf<K extends P3ChoiceName> = (typeof OCELLUS_P3.choices)[K]["options"];
type P3OptionKey<K extends P3ChoiceName> = keyof P3OptionsOf<K> & string;
const P3_CHOICES: { readonly [K in P3ChoiceName]: Readonly<{ default: P3OptionKey<K>; options: P3OptionsOf<K> }> } = OCELLUS_P3.choices;

class ResolvedP3Choice<K extends P3ChoiceName> {
  readonly #name: K;
  readonly option: P3OptionsOf<K>[P3OptionKey<K>];

  constructor(name: K, readonly key: P3OptionKey<K>) {
    this.#name = name;
    this.option = P3_CHOICES[name].options[key];
  }
}

export type P3Choices = Readonly<{ setup: ResolvedChoice<"setup">; bossMaxHp: ResolvedChoice<"bossMaxHp">; reach: ResolvedP3Choice<"reach"> }>;
export type P3Config = Readonly<{ seed: Seed; choices: P3Choices; bossEntryHp: number | null }>;
type ParsedP3 = Readonly<{ config: P3Config; invincible: boolean; rejected: readonly string[] }>;

const P3_KEYS: readonly string[] = ["setup", "bossMaxHp", ...Object.keys(OCELLUS_P3.choices)];

function parseP3Request(url: URL, freshSeed: () => number): ParsedP3 {
  const rejected: string[] = [];
  rejectUnknownKeys(url, (key) => P3_KEYS.includes(key), rejected);
  const invincible = readInvincible(url, rejected);
  const run = readSeed(url, freshSeed);
  const p4Choice = <K extends "setup" | "bossMaxHp">(name: K): ResolvedChoice<K> => {
    const raw = url.searchParams.get(name);
    const { options } = CHOICES[name];
    if (raw !== null && hasKey(options, raw)) return new ResolvedChoice(name, raw);
    if (raw !== null) rejected.push(`${name}=${raw}`);
    return new ResolvedChoice(name, CHOICES[name].default);
  };
  const p3Choice = <K extends P3ChoiceName>(name: K): ResolvedP3Choice<K> => {
    const raw = url.searchParams.get(name);
    const { options } = P3_CHOICES[name];
    if (raw !== null && hasKey(options, raw)) return new ResolvedP3Choice(name, raw);
    if (raw !== null) rejected.push(`${name}=${raw}`);
    return new ResolvedP3Choice(name, P3_CHOICES[name].default);
  };
  const choices: P3Choices = { setup: p4Choice("setup"), bossMaxHp: p4Choice("bossMaxHp"), reach: p3Choice("reach") };
  if (run.rejected !== null) rejected.push(run.rejected);
  const bossEntryHp = readBossHp(url, choices.bossMaxHp.option.value, rejected);
  return { config: { seed: run.seed, choices, bossEntryHp }, invincible, rejected };
}

export type DrillRequest = (Readonly<{ phase: "p4" }> & ParsedDrill) | (Readonly<{ phase: "p3" }> & ParsedP3);

export function parseRequest(url: URL, freshSeed: () => number, flags: BuildFlags): DrillRequest {
  if (!flags.p3) return { phase: "p4", ...parseDrillRequest(url, freshSeed) };
  const phase = url.searchParams.get("phase");
  const rest = new URL(url.href);
  rest.searchParams.delete("phase");
  if (phase === "p3") return { phase: "p3", ...parseP3Request(rest, freshSeed) };
  const p4 = parseDrillRequest(rest, freshSeed);
  return { phase: "p4", ...p4, rejected: phase === null || phase === "p4" ? p4.rejected : [`phase=${phase}`, ...p4.rejected] };
}
