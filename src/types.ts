export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type JsonObject = { [key: string]: Json | undefined };

export type JsonArray = Json[];

export enum MealPlanRegime {
  HD = 'HD', // Half Board (Breakfast & Dinner)
  MP = 'MP', // Modified Pension (Breakfast & Dinner, or as defined by hotel)
  TI = 'TI', // All Inclusive (Breakfast, Lunch, Dinner)
  BB = 'BB', // Bed & Breakfast
  RO = 'RO', // Room Only
}
