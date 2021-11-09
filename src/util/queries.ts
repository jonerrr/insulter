import { presence } from "./model";
import { Presence } from "./types";
import config from "../../config.json";

export const createPresence = async (status: string) => {
  try {
    if (config.mode === "dev") console.log(`Adding presence ${status}`);

    const p: Presence = await presence.findOne({ status });
    if (!p) await new presence({ status, memes: [] }).save();
  } catch (e) {
    console.log(e);
  }
};

export const createMeme = async (
  status: string,
  url: string,
  submittedBy: string
): Promise<string> => {
    const check = await presence.findOne({ status });
    if(!check) return "Status not detected, please check `/info` for more information"
  for (const m of check.memes)
    if (m.url === url) return "Meme already submitted.";


};
