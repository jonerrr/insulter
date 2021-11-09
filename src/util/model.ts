import { Schema, model } from "mongoose";
import { Presence } from "../util/types";

const schema = new Schema<Presence>({
  status: { type: String, required: true },
  memes: [
    {
      added: { type: Date, default: Date.now, required: true },
      url: { type: String, required: true },
      approved: { type: Boolean, default: false, required: true },
      approvedBy: { type: String, required: false },
      submittedBy: { type: String, required: true },
    },
  ],
});

export const presence = model<Presence>("statuses", schema);
