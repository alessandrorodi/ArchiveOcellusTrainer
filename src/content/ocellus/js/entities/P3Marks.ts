import * as THREE from "three";
import { CollisionType, Entity, GROUND_OVERLAY_Y, LineOfSightMask, Settings } from "osrs-sdk";
import type { Location3, Model, Region } from "osrs-sdk";
import type { Tick, Tile } from "../../../../sim/brands";
import type { BandAttack } from "../P3Types";

/** A practice marker, not a game graphic: where an aimed band will land, and his 3x3 through Untether. */
type Mark = Readonly<{ tiles: readonly Tile[]; colour: string; opacity: number }>;
type Band = Readonly<{ tiles: readonly Tile[]; attack: BandAttack; landsAt: Tick }>;

const BAND_COLOUR: Readonly<Record<BandAttack, string>> = { "shadow-slash": "#b01030", "superior-slash": "#7a1010" };
const BAND_OPACITY = 0.4;
const UNTETHER_COLOUR = "#9f48bd";
const UNTETHER_OPACITY = 0.3;
const INSET = 0.06;
const LIFT = 0.01;

class MarksModel implements Model {
  private readonly group = new THREE.Group();
  private readonly plane = new THREE.PlaneGeometry(1 - 2 * INSET, 1 - 2 * INSET).rotateX(-Math.PI / 2);
  private readonly materials = new Map<string, THREE.MeshBasicMaterial>();
  private drawn: readonly Mark[] = [];

  constructor(private readonly marks: () => readonly Mark[]) {}

  draw(scene: THREE.Scene, clockDelta: number, tickPercent: number, location: Location3, angleRadians: number, pitchRadians: number, visible: boolean): void {
    if (this.group.parent !== scene) scene.add(this.group);
    this.group.visible = visible;
    const marks = this.marks();
    if (marks === this.drawn) return;
    this.drawn = marks;
    this.group.clear();
    for (const { tiles, colour, opacity } of marks) {
      const material = this.material(colour, opacity);
      for (const { x, y } of tiles) {
        const mesh = new THREE.Mesh(this.plane, material);
        mesh.position.set(x + 0.5, GROUND_OVERLAY_Y + LIFT, y - 0.5);
        this.group.add(mesh);
      }
    }
  }

  destroy(scene: THREE.Scene): void {
    scene.remove(this.group);
    this.plane.dispose();
    this.materials.forEach((material) => material.dispose());
  }

  getWorldPosition(): THREE.Vector3 {
    return this.group.getWorldPosition(new THREE.Vector3());
  }

  async preload(): Promise<void> {}

  private material(colour: string, opacity: number): THREE.MeshBasicMaterial {
    const key = `${colour}:${opacity}`;
    const cached = this.materials.get(key);
    if (cached) return cached;
    const material = new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity, depthWrite: false });
    this.materials.set(key, material);
    return material;
  }
}

export class P3Marks extends Entity {
  private bands: readonly Band[] = [];
  private zone: readonly Tile[] = [];
  private marks: readonly Mark[] = [];

  constructor(region: Region) {
    super(region, { x: 0, y: 0 });
  }

  aim(attack: BandAttack, tiles: readonly Tile[], landsAt: Tick): void {
    this.bands = [...this.bands, { tiles, attack, landsAt }];
    this.refresh();
  }

  /** Called once a tick ends: a band that has landed goes, and the Untether zone follows his body. */
  settle(at: Tick, zone: readonly Tile[]): void {
    this.bands = this.bands.filter((band) => band.landsAt > at);
    this.zone = zone;
    this.refresh();
  }

  clear(): void {
    this.bands = [];
    this.zone = [];
    this.refresh();
  }

  private refresh(): void {
    this.marks = [
      ...(this.zone.length > 0 ? [{ tiles: this.zone, colour: UNTETHER_COLOUR, opacity: UNTETHER_OPACITY }] : []),
      ...this.bands.map(({ tiles, attack }) => ({ tiles, colour: BAND_COLOUR[attack], opacity: BAND_OPACITY })),
    ];
  }

  override get collisionType(): CollisionType {
    return CollisionType.NONE;
  }

  override get lineOfSight(): LineOfSightMask {
    return LineOfSightMask.NONE;
  }

  override get drawOutline(): boolean {
    return false;
  }

  override draw(tickPercent: number, context: OffscreenCanvasRenderingContext2D): void {
    const scale = Settings.tileSize;
    context.save();
    for (const { tiles, colour, opacity } of this.marks) {
      context.globalAlpha = opacity;
      context.fillStyle = colour;
      for (const { x, y } of tiles) context.fillRect((x + INSET) * scale, (y + INSET) * scale, (1 - 2 * INSET) * scale, (1 - 2 * INSET) * scale);
    }
    context.restore();
  }

  protected override create3dModel(): Model {
    return new MarksModel(() => this.marks);
  }
}
