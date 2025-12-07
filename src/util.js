import { init as initCuid2 } from "@paralleldrive/cuid2";
import { DEFAULT_MOODS } from "./const.js";
import { fetch$ } from "./db.js";
import crypto from "node:crypto";

export const createId = initCuid2({
  random: () => crypto.randomInt(281474976710655) / 281474976710655,
  length: 16,
  fingerprint: "mood-tracker",
});

export function moodInfo(pleasantness, energy, moods = DEFAULT_MOODS) {
  const moodRow =
    energy >= 0.67
      ? 0
      : energy >= 0.33
        ? 1
        : energy >= 0
          ? 2
          : energy >= -0.33
            ? 3
            : energy >= -0.67
              ? 4
              : 5;

  const moodColumn =
    pleasantness >= 0.67
      ? 0
      : pleasantness >= 0.33
        ? 1
        : pleasantness >= 0
          ? 2
          : pleasantness >= -0.33
            ? 3
            : pleasantness >= -0.67
              ? 4
              : 5;

  return moods[moodRow * 6 + moodColumn];
}

export function safeParseURL(url) {
  try {
    return new URL(url);
  } catch {}
}

export async function fetchMood(user) {
  const mood = await fetch$(
    "select * from mood where user_id=$1 order by id desc limit 1",
    [user.id],
  );

  return mood
    ? {
        status: moodInfo(
          mood.pleasantness,
          mood.energy,
          user.custom_labels?.length ? user.custom_labels : DEFAULT_MOODS,
        ),
        pleasantness: mood.pleasantness,
        energy: mood.energy,
        timestamp: mood.timestamp,
      }
    : {
        status: "-",
        pleasantness: 0,
        energy: 0,
        timestamp: null,
      };
}
