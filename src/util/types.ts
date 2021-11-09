export type Presence = {
  status: string;
  memes: Meme[];
};

export type Meme = {
  added: Date;
  url: string;
  approved: boolean;
  approvedBy: string;
  submittedBy: string;
};
