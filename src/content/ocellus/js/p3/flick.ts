import type { FlickRule, SpinVerdict } from "../P3Types";

export type Flick = "unarmed" | "armed" | "lowered" | "raised";

export function armFlick(rule: FlickRule, meleeOn: boolean): Flick {
  if (meleeOn) return "armed";
  switch (rule) {
    case "on-off-on":
      return "unarmed";
    case "off-then-on":
    case "held-blocks":
      return "lowered";
    default: {
      const unhandled: never = rule;
      return unhandled;
    }
  }
}

export function stepFlick(flick: Flick, meleeOn: boolean): Flick {
  switch (flick) {
    case "unarmed":
      return "unarmed";
    case "armed":
    case "raised":
      return meleeOn ? flick : "lowered";
    case "lowered":
      return meleeOn ? "raised" : "lowered";
    default: {
      const unhandled: never = flick;
      return unhandled;
    }
  }
}

export function judgeSpin(rule: FlickRule, flick: Flick): SpinVerdict {
  switch (flick) {
    case "raised":
      return { kind: "blocked" };
    case "armed":
      return rule === "held-blocks" ? { kind: "blocked" } : { kind: "struck", why: "held" };
    case "lowered":
      return { kind: "struck", why: "late" };
    case "unarmed":
      return { kind: "struck", why: "early" };
    default: {
      const unhandled: never = flick;
      return unhandled;
    }
  }
}
