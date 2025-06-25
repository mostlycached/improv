import { ads, type Ad, type InsertAd } from "@shared/schema";

export interface IStorage {
  getAd(id: number): Promise<Ad | undefined>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: number, ad: Partial<InsertAd>): Promise<Ad | undefined>;
}

export class MemStorage implements IStorage {
  private ads: Map<number, Ad>;
  currentId: number;

  constructor() {
    this.ads = new Map();
    this.currentId = 1;
  }

  async getAd(id: number): Promise<Ad | undefined> {
    return this.ads.get(id);
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const id = this.currentId++;
    const ad: Ad = { 
      ...insertAd, 
      id,
      primaryColor: insertAd.primaryColor || "#4285F4",
      accentColor: insertAd.accentColor || "#EA4335",
      layout: insertAd.layout || "bottom-overlay",
    };
    this.ads.set(id, ad);
    return ad;
  }

  async updateAd(id: number, updateData: Partial<InsertAd>): Promise<Ad | undefined> {
    const existingAd = this.ads.get(id);
    if (!existingAd) return undefined;

    const updatedAd: Ad = { ...existingAd, ...updateData };
    this.ads.set(id, updatedAd);
    return updatedAd;
  }
}

export const storage = new MemStorage();
