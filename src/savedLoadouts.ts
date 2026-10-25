import type { Loadout } from "./content/ocellus/js/OcellusTimings";
import { parseLoadout } from "./content/ocellus/js/OcellusTimings";

export const SAVED_LOADOUTS_KEY = "archive-ocellus:loadouts";
const STORE_VERSION = 1;

type Setups = Readonly<Record<string, unknown>>;
type Store = Readonly<{ kind: "empty" }> | Readonly<{ kind: "read"; setups: Setups }> | Readonly<{ kind: "unreadable" }>;

export type SavedLoadout = Readonly<{ kind: "none" }> | Readonly<{ kind: "saved"; loadout: Loadout }> | Readonly<{ kind: "unreadable" }>;

function readStore(): Store {
  let text: string | null;
  try {
    text = localStorage.getItem(SAVED_LOADOUTS_KEY);
  } catch {
    return { kind: "empty" };
  }
  if (text === null) return { kind: "empty" };
  let stored: unknown;
  try {
    stored = JSON.parse(text);
  } catch {
    return { kind: "unreadable" };
  }
  if (typeof stored !== "object" || stored === null || !("version" in stored) || stored.version !== STORE_VERSION || !("setups" in stored)) return { kind: "unreadable" };
  const { setups }: { setups: unknown } = stored;
  return typeof setups === "object" && setups !== null && !Array.isArray(setups) ? { kind: "read", setups: { ...setups } } : { kind: "unreadable" };
}

export function readSavedLoadout(setup: string): SavedLoadout {
  const store = readStore();
  switch (store.kind) {
    case "empty":
      return { kind: "none" };
    case "unreadable":
      return { kind: "unreadable" };
    case "read": {
      if (!Object.prototype.hasOwnProperty.call(store.setups, setup)) return { kind: "none" };
      const loadout = parseLoadout(store.setups[setup]);
      return loadout ? { kind: "saved", loadout } : { kind: "unreadable" };
    }
    default: {
      const unhandled: never = store;
      return unhandled;
    }
  }
}
