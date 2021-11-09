import { createPresence } from "./../util/queries";
import { Activity, Presence } from "discord.js";
import _ from "lodash";

/**
 * Add user's presence to database if it has not been added.
 * @param Presence Old presence of the user.
 * @param Presence New presence of the user.
 */
export const addPresence = (oldP: Presence, newP: Presence) => {
  console.log(oldP);
  const parsed = parseActivity(
    oldP.activities ? oldP.activities : [],
    newP.activities
  );
  parsed.forEach((p) => createPresence(p));
};

/**
 * Check if the user's presence has changed.
 * @param Activity[] Array of the old activities.
 * @param Activity[] Array of the new activities.
 * @returns Returns an array of activities that have changed.
 */
const parseActivity = (
  oldActivities: Activity[],
  newActivities: Activity[]
): string[] => {
  const parsedOld: string[] = [];
  for (const a of oldActivities)
    if (a.name.toLowerCase() !== "custom status")
      parsedOld.push(a.name.toLowerCase());

  const parsedNew: string[] = [];
  for (const a of newActivities)
    if (a.name.toLowerCase() !== "custom status")
      parsedNew.push(a.name.toLowerCase());

  if (_.isEqual(parsedOld, parsedNew)) return [];

  return parsedNew;
};
