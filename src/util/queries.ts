import { presence } from "./model";
import { Presence } from "./types";
import config from "../../config.json";

/**
 * Add a presence to the database.
 * @param string The status to add.
 */
export const createPresence = async (status: string) => {
  try {
    if (config.mode === "dev") console.log(`Adding presence ${status}`);

    const p: Presence = await presence.findOne({ status });
    if (!p) await new presence({ status, memes: [] }).save();
  } catch (e) {
    console.log(e);
  }
};

/**
 * Add a meme to the database.
 * @param string The status that the meme relates to (e.g. "minecraft").
 * @param string The meme URL.
 * @param string The person who submitted the meme.
 * @return ObjectID of the meme.
 */
export const createMeme = async (
  status: string,
  url: string,
  submittedBy: string
): Promise<string> => {
  const check = await presence.findOne({ status });
  if (!check)
    throw new Error(
      "Status not found in databases, please run `/info` for more information."
    );

  for (const m of check.memes)
    if (m.url === url) throw new Error("Meme already submitted.");

  const data = await presence.updateOne(
    { status },
    { $push: { memes: { url, submittedBy } } }
  );

  console.log(data);

  return "";
};
