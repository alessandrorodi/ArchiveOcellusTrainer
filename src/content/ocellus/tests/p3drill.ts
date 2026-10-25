import { Settings, TrainerInstance, Viewport } from "osrs-sdk";
import type { Mob, Player } from "osrs-sdk";
import type { P3Event, P3Row } from "../js/P3Types";
import type { At } from "./drill";
import { clickTile } from "./drill";

export const footprintCentre = ({ location, size }: Mob): At => ({ x: location.x + Math.floor(size / 2), y: location.y - Math.floor(size / 2) });

export type P3DrillOptions = Readonly<{ seed?: number; bossHp?: number; reach?: string; flick?: string; start?: number; invincible?: boolean }>;
type ProtectionPrayer = "Protect from Magic" | "Protect from Range" | "Protect from Melee";

export async function startP3Drill(options: P3DrillOptions = {}) {
  const { P3Region } = await vi.importActual<typeof import("../js/P3Region")>("../js/P3Region");
  const { parseRequest } = await vi.importActual<typeof import("../js/OcellusTimings")>("../js/OcellusTimings");
  Settings.readFromStorage();
  const link = new URL("http://localhost/?phase=p3");
  link.searchParams.set("seed", String(options.seed ?? 1));
  if (options.bossHp !== undefined) link.searchParams.set("bosshp", String(options.bossHp));
  if (options.reach !== undefined) link.searchParams.set("reach", options.reach);
  if (options.flick !== undefined) link.searchParams.set("flick", options.flick);
  if (options.start !== undefined) link.searchParams.set("start", String(options.start));
  const request = parseRequest(link, () => {
    throw new Error(`the drill link has no usable seed: ${link.search}`);
  }, { p3: true });
  if (request.phase !== "p3") throw new Error(`the drill link opened ${request.phase}: ${link.search}`);
  if (request.rejected.length > 0) throw new Error(`the drill link has options the trainer rejects: ${request.rejected.join(", ")}`);
  const region = new P3Region(request.config);
  region.invincible = options.invincible ?? false;
  const trainer = new TrainerInstance(region, { force2d: true });
  trainer.mount(document.createElement("canvas"), document.createElement("div"));
  region.world.tickWorld(region.world.getReadyTimer - 1);
  Viewport.viewport.resize(800, 800);

  const rows = (): readonly P3Row[] => region.fightLog().rows;
  const player = (): Player => region.players[0];
  const boss = (): Mob => {
    if (!region.primaryBoss) throw new Error("the region has no boss");
    return region.primaryBoss;
  };
  const ended = () => region.snapshot()?.run.kind === "ended";
  const lastTick = () => {
    const all = rows();
    return all.length === 0 ? -1 : all[all.length - 1].tick;
  };

  return {
    region,
    rows,
    player,
    boss,
    tickTo(t: number) {
      for (let guard = 0; !ended() && lastTick() < t; guard++) {
        if (guard > t + 20) throw new Error(`the boss never reached P3 tick ${t}`);
        region.world.tickWorld();
      }
    },
    row(t: number): P3Row {
      const found = rows().find((row) => row.tick === t);
      if (!found) throw new Error(`no row for P3 tick ${t}`);
      return found;
    },
    events<K extends P3Event["kind"]>(kind: K) {
      return rows()
        .flatMap((row) => row.events)
        .filter((event): event is Extract<P3Event, { kind: K }> => event.kind === kind);
    },
    click: (on: At) => clickTile(region.world, on),
    pray: (name: ProtectionPrayer) => player().prayerController.findPrayerByName(name).toggle(player()),
    dispose() {
      trainer.dispose();
    },
  };
}
