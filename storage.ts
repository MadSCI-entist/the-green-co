// Combining javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  companyProfiles,
  emissionRecords,
  type User,
  type UpsertUser,
  type CompanyProfile,
  type InsertCompanyProfile,
  type EmissionRecord,
  type InsertEmissionRecord,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Company profile operations
  getCompanyProfile(userId: string): Promise<CompanyProfile | undefined>;
  upsertCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile>;
  getAllCompanyProfiles(): Promise<CompanyProfile[]>;
  
  // Emission record operations
  createEmissionRecord(record: InsertEmissionRecord): Promise<EmissionRecord>;
  getLatestEmissionRecord(userId: string): Promise<EmissionRecord | undefined>;
  getEmissionRecords(userId: string, limit?: number): Promise<EmissionRecord[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company profile operations
  async getCompanyProfile(userId: string): Promise<CompanyProfile | undefined> {
    const [profile] = await db
      .select()
      .from(companyProfiles)
      .where(eq(companyProfiles.userId, userId));
    return profile;
  }

  async upsertCompanyProfile(profileData: InsertCompanyProfile): Promise<CompanyProfile> {
    const existing = await this.getCompanyProfile(profileData.userId);
    
    if (existing) {
      const [profile] = await db
        .update(companyProfiles)
        .set({
          ...profileData,
          updatedAt: new Date(),
        })
        .where(eq(companyProfiles.userId, profileData.userId))
        .returning();
      return profile;
    } else {
      const [profile] = await db
        .insert(companyProfiles)
        .values(profileData)
        .returning();
      return profile;
    }
  }

  async getAllCompanyProfiles(): Promise<CompanyProfile[]> {
    return await db.select().from(companyProfiles);
  }

  // Emission record operations
  async createEmissionRecord(recordData: InsertEmissionRecord): Promise<EmissionRecord> {
    const [record] = await db
      .insert(emissionRecords)
      .values(recordData)
      .returning();
    return record;
  }

  async getLatestEmissionRecord(userId: string): Promise<EmissionRecord | undefined> {
    const [record] = await db
      .select()
      .from(emissionRecords)
      .where(eq(emissionRecords.userId, userId))
      .orderBy(desc(emissionRecords.createdAt))
      .limit(1);
    return record;
  }

  async getEmissionRecords(userId: string, limit: number = 10): Promise<EmissionRecord[]> {
    return await db
      .select()
      .from(emissionRecords)
      .where(eq(emissionRecords.userId, userId))
      .orderBy(desc(emissionRecords.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
