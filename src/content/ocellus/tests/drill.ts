import { Projectile, Settings, TrainerInstance, Viewport } from "osrs-sdk";
import type { Mob, Player, Unit, World } from "osrs-sdk";
import { paintedFills } from "../../../../test/paintedTiles";
import { OcellusRegion } from "../js/OcellusRegion";
import type { DrillSelection } from "../js/OcellusTimings";
import { OCELLUS_P4, defaultLoadout, parseDrillRequest } from "../js/OcellusTimings";
import type { Style } from "../../../sim/combat";
import type { FightEvent, TickRow } from "../js/P4Types";

export type DrillOptions = Readonly<{ seed?: number; bossHp?: number; selection?: DrillSelection }>;
export type At = Readonly<{ x: number; y: number }>;

export const SPAWN_ON_FLOOD: At = OCELLUS_P4.geometry.playerSpawn.value;
export const UNDER_BOSS: At = { x: 5, y: 5 };
export const RING_NORTH: At = { x: 5, y: 3 };
export const FLOOD_NORTH_OF_RING: At = { x: 5, y: 2 };

type ProtectionPrayer = "Protect from Magic" | "Protect from Range" | "Protect from Melee";
const PROTECTS_FROM: Readonly<Record<Style, ProtectionPrayer>> = { magic: "Protect from Magic", ranged: "Protect from Range", melee: "Protect from Melee" };

const inNearSquare = ({ x, y }: At) => x >= 3 && x <= 7 && y >= 3 && y <= 7;
const underBoss = ({ x, y }: At) => x >= 4 && x <= 6 && y >= 4 && y <= 6;
const onPlatform = ({ x, y }: At) => OCELLUS_P4.geometry.platform.value[y]?.[x] === "#";

function besideOnSameFloor(home: At, insideSquare: boolean): At {
  const sides = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({ x: home.x + dx, y: home.y + dy }));
  return sides.find((side) => onPlatform(side) && !underBoss(side) && inNearSquare(side) === insideSquare) ?? home;
}

function pressTile(world: World, on: At, modifiers: Readonly<{ ctrlKey?: boolean }> = {}): void {
  const at = Viewport.viewport.projectTile(on, world);
  if (!at) throw new Error(`tile (${on.x}, ${on.y}) is not on the canvas`);
  const press = new MouseEvent("mousedown", { button: 0, ...modifiers });
  Object.defineProperties(press, { offsetX: { value: at.x }, offsetY: { value: at.y } });
  Viewport.viewport.canvas.dispatchEvent(press);
}

export async function clickTile(world: World, on: At, modifiers: Readonly<{ ctrlKey?: boolean }> = {}): Promise<void> {
  pressTile(world, on, modifiers);
  await new Promise((queued) => setTimeout(queued, Settings.inputDelay));
}

export function startDrill(options: DrillOptions = {}) {
  Settings.readFromStorage();
  const link = new URL("http://localhost/");
  link.searchParams.set("seed", String(options.seed ?? 1));
  if (options.bossHp !== undefined) link.searchParams.set("bosshp", String(options.bossHp));
  for (const [name, option] of Object.entries(options.selection ?? {})) if (option !== undefined) link.searchParams.set(name, option);
  const { config, rejected } = parseDrillRequest(link, () => {
    throw new Error(`the drill link has no usable seed: ${link.search}`);
  });
  if (rejected.length > 0) throw new Error(`the drill link has options the trainer rejects: ${rejected.join(", ")}`);
  const region = new OcellusRegion(config, defaultLoadout(config.choices.setup.option.value));
  const trainer = new TrainerInstance(region, { force2d: true });
  trainer.mount(document.createElement("canvas"), document.createElement("div"));
  // The world tick after the last held one ends GET READY and is the boss's first step, P4 tick 0.
  const tickThroughGetReady = () => region.world.tickWorld(region.world.getReadyTimer - 1);
  tickThroughGetReady();
  Viewport.viewport.resize(800, 800);

  const rows = (): readonly TickRow[] => region.fightLog().rows;
  const player = (): Player => region.players[0];
  const boss = (): Mob => {
    if (!region.primaryBoss) throw new Error("the region has no boss");
    return region.primaryBoss;
  };
  const walkTo = (to: At) => player().moveTo(to.x, to.y);
  const stepOffMarkedTile = (home: At, side: At) => {
    const at = player().location;
    if (at.x === home.x && at.y === home.y) walkTo(side);
    else if (at.x === side.x && at.y === side.y) walkTo(home);
  };
  const ended = () => region.snapshot()?.run.kind === "ended";
  const pray = (name: ProtectionPrayer | "Piety") => player().prayerController.findPrayerByName(name).toggle(player());
  const lastTick = () => {
    const all = rows();
    return all.length === 0 ? -1 : all[all.length - 1].tick;
  };
  const advance = (t: number, onRow: (row: TickRow) => void) => {
    for (let guard = 0; !ended() && lastTick() < t; guard++) {
      if (guard > t + 20) throw new Error(`the boss never reached P4 tick ${t}`);
      const before = lastTick();
      region.world.tickWorld();
      const all = rows();
      if (lastTick() !== before) onRow(all[all.length - 1]);
    }
  };

  return {
    region,
    player,
    boss,
    rows,
    tickTo(t: number) {
      advance(t, () => undefined);
    },
    async playCorrectlyTo(t: number) {
      const focus = region.fightLog().header.choices.focus.option.value;
      const dodging = focus.kind === "full-fight" || focus.mechanics.includes("explosions");
      let home: At = { ...player().location };
      const goHome = (to: At) => {
        home = to;
        walkTo(to);
      };
      while (!ended() && lastTick() < t) {
        let orb: At | null = null;
        advance(lastTick() + 1, (row) => {
          for (const event of row.events) {
            if (event.kind === "special-told" && row.playerAtPostTick.prayer !== event.style) pray(PROTECTS_FROM[event.style]);
            if (event.kind === "orb-spawned") {
              home = event.tile;
              orb = event.tile;
            }
            if (event.kind !== "stage-entered") continue;
            if (event.stage === "outer-void") goHome(RING_NORTH);
            if (event.stage === "after-outer") goHome(SPAWN_ON_FLOOD);
          }
          const stage = row.phase.stage;
          if (dodging && (stage === "inner-void" || stage === "outer-void")) stepOffMarkedTile(home, besideOnSameFloor(home, stage === "outer-void"));
        });
        if (orb) await clickTile(region.world, orb);
      }
    },
    innerOrb(): At {
      const spawned = this.events("orb-spawned").filter((event) => event.void === "inner-void");
      if (spawned.length === 0) throw new Error("no inner orb has formed");
      return spawned[spawned.length - 1].tile;
    },
    row(t: number): TickRow {
      const found = rows().find((row) => row.tick === t);
      if (!found) throw new Error(`no row for P4 tick ${t}`);
      return found;
    },
    events<K extends FightEvent["kind"]>(kind: K) {
      return rows()
        .flatMap((row) => row.events)
        .filter((event): event is Extract<FightEvent, { kind: K }> => event.kind === kind);
    },
    drawnHoles(): readonly At[] {
      const { rim } = OCELLUS_P4.floor.look.value;
      return paintedFills((context) => region.entities.forEach((entity) => entity.draw(0, context)))
        .filter((fill) => fill.style === rim)
        .map((fill) => ({ x: Math.floor(fill.x / Settings.tileSize), y: Math.floor(fill.y / Settings.tileSize) }))
        .sort((a, b) => a.x - b.x || a.y - b.y);
    },
    drawnShardReach(around: At, tickPercent: number): readonly number[] {
      const shard = OCELLUS_P4.explosion.shards.value;
      const scale = Settings.tileSize;
      return paintedFills((context) => region.entities.forEach((entity) => entity.draw(tickPercent, context)))
        .filter((fill) => fill.style === shard)
        .map((fill) => Math.hypot((fill.x + fill.width / 2) / scale - (around.x + 0.5), (fill.y + fill.height / 2) / scale - (around.y + 0.5)));
    },
    walkTo,
    click: (on: At, modifiers: Readonly<{ ctrlKey?: boolean }> = {}) => clickTile(region.world, on, modifiers),
    clickRightBeforeTick(on: At) {
      pressTile(region.world, on);
      region.world.tickWorld();
    },
    pray,
    clickInventory(cacheItemId: number) {
      const item = player().inventory.find((slot) => slot?.cacheItemId === cacheItemId);
      if (!item) throw new Error(`no inventory item ${cacheItemId}`);
      item.inventoryLeftClick(player());
    },
    hit(from: Unit, to: Unit, damage: number, style: "typeless" | "slash" | "range" = "typeless", delay = 1) {
      to.addProjectile(new Projectile(null, damage, from, to, style, { setDelay: delay }));
    },
    restart() {
      region.reset(false);
      tickThroughGetReady();
    },
    dispose() {
      trainer.dispose();
    },
  };
}
