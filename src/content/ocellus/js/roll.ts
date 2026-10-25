import type { DamageRange } from "./OcellusTimings";
import type { Seed, Tick } from "../../../sim/brands";

type RollStream = "orbTile" | "floorDamage" | "explosionDamage" | "specialDamage" | "specialVariant" | "riftBurst" | "holeLayout" | "holeDamage" | "swingDamage" | "p3Damage" | "p3Shout";

const STREAM_ID: Readonly<Record<RollStream, number>> = {
  orbTile: 1,
  floorDamage: 2,
  explosionDamage: 3,
  specialDamage: 4,
  specialVariant: 5,
  riftBurst: 6,
  holeLayout: 7,
  holeDamage: 8,
  swingDamage: 9,
  p3Damage: 10,
  p3Shout: 11,
};

export function roll(seed: Seed, stream: RollStream, at: Tick, draw: number): number {
  let h = (seed ^ Math.imul(STREAM_ID[stream], 0x9e3779b9) ^ Math.imul(at, 0x85ebca6b) ^ Math.imul(draw, 0xc2b2ae35)) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x21f0aaad);
  h ^= h >>> 15;
  h = Math.imul(h, 0x735a2d97);
  h ^= h >>> 15;
  return (h >>> 0) / 2 ** 32;
}

export function rollInt(seed: Seed, stream: RollStream, at: Tick, range: DamageRange, draw: number): number {
  return range.min + Math.floor(roll(seed, stream, at, draw) * (range.max - range.min + 1));
}
