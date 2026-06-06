export const CLASS_LEVELS = [
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th Commerce",
  "12th Commerce",
] as const;

export type ClassLevel = (typeof CLASS_LEVELS)[number];
