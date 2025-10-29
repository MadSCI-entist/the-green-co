// From javascript_log_in_with_replit blueprint with custom routes
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  emissionInputSchema, 
  insertCompanyProfileSchema, 
  EMISSION_FACTORS,
  type EmissionInput,
} from "@shared/schema";

// Emission calculation logic
function calculateEmissions(input: EmissionInput) {
  // Baseline calculations (kg CO2)
  const baselineCarsKg = input.carKm * EMISSION_FACTORS.CARS;
  const baselineTrucksKg = input.truckKm * EMISSION_FACTORS.TRUCKS;
  const baselinePlanesKg = input.planeHours * EMISSION_FACTORS.PLANES;
  const baselineForkliftKg = input.forkliftHours * EMISSION_FACTORS.FORKLIFTS;
  const baselineHeatingKg = input.heatingKwh * EMISSION_FACTORS.HEATING;
  const baselineLightingKg = input.lightingCoolingItKwh * EMISSION_FACTORS.LIGHTING_COOLING_IT;
  const baselineSubcontractorsKg = input.subcontractorsTons * 1000; // already in tons, convert to kg

  // Optimized calculations
  // Cars: Distance × (1−KM_reduction) × [(1−EV_share)×0.18 + EV_share×0.18×0.3]
  const evShareDecimal = input.evShare / 100;
  const kmReductionDecimal = input.kmReduction / 100;
  const loadFactorDecimal = input.planeLoadFactor / 100;

  const optimizedCarsKg = input.carKm * (1 - kmReductionDecimal) * 
    ((1 - evShareDecimal) * EMISSION_FACTORS.CARS + evShareDecimal * EMISSION_FACTORS.CARS * EMISSION_FACTORS.EV_FACTOR);
  
  const optimizedTrucksKg = input.truckKm * (1 - kmReductionDecimal) * EMISSION_FACTORS.TRUCKS;
  
  // Planes: Hours × 9000 × (LoadFactor/100)
  const optimizedPlanesKg = input.planeHours * EMISSION_FACTORS.PLANES * loadFactorDecimal;
  
  const optimizedForkliftKg = input.forkliftHours * EMISSION_FACTORS.FORKLIFTS;
  const optimizedHeatingKg = input.heatingKwh * EMISSION_FACTORS.HEATING;
  const optimizedLightingKg = input.lightingCoolingItKwh * EMISSION_FACTORS.LIGHTING_COOLING_IT;
  const optimizedSubcontractorsKg = input.subcontractorsTons * 1000;

  // Convert to tons
  return {
    baselineCars: baselineCarsKg / 1000,
    baselineTrucks: baselineTrucksKg / 1000,
    baselinePlanes: baselinePlanesKg / 1000,
    baselineForklifts: baselineForkliftKg / 1000,
    baselineHeating: baselineHeatingKg / 1000,
    baselineLightingCoolingIt: baselineLightingKg / 1000,
    baselineSubcontractors: baselineSubcontractorsKg / 1000,
    baselineTotal: (baselineCarsKg + baselineTrucksKg + baselinePlanesKg + baselineForkliftKg + 
      baselineHeatingKg + baselineLightingKg + baselineSubcontractorsKg) / 1000,
    
    optimizedCars: optimizedCarsKg / 1000,
    optimizedTrucks: optimizedTrucksKg / 1000,
    optimizedPlanes: optimizedPlanesKg / 1000,
    optimizedForklifts: optimizedForkliftKg / 1000,
    optimizedHeating: optimizedHeatingKg / 1000,
    optimizedLightingCoolingIt: optimizedLightingKg / 1000,
    optimizedSubcontractors: optimizedSubcontractorsKg / 1000,
    optimizedTotal: (optimizedCarsKg + optimizedTrucksKg + optimizedPlanesKg + optimizedForkliftKg + 
      optimizedHeatingKg + optimizedLightingKg + optimizedSubcontractorsKg) / 1000,
  };
}

// Green Score calculation
// Green Score = Load Efficiency × (1+R) / (CO₂ emissions (tons) / Total Distance (km))
function calculateGreenScore(
  co2Emissions: number,
  totalDistance: number,
  loadEfficiency: number,
  renewableShare: number
): number {
  if (totalDistance === 0 || co2Emissions === 0) return 0;
  const emissionsPerKm = co2Emissions / totalDistance;
  return (loadEfficiency * (1 + renewableShare)) / emissionsPerKm;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Calculator endpoint
  app.post("/api/calculator/calculate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate input
      const inputData = emissionInputSchema.parse(req.body);
      
      // Calculate emissions
      const emissions = calculateEmissions(inputData);
      
      // Create emission record
      const record = await storage.createEmissionRecord({
        userId,
        ...inputData,
        ...emissions,
      });
      
      res.json(record);
    } catch (error: any) {
      console.error("Calculation error:", error);
      res.status(400).json({ message: error.message || "Calculation failed" });
    }
  });

  // Profile endpoints
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getCompanyProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Security: Always use authenticated userId, never trust client input
      const { userId: _, ...clientData } = req.body;
      
      // Validate input with server-side userId
      const profileData = insertCompanyProfileSchema.parse({
        ...clientData,
        userId, // Use authenticated userId only
      });
      
      const profile = await storage.upsertCompanyProfile(profileData);
      res.json(profile);
    } catch (error: any) {
      console.error("Profile save error:", error);
      res.status(400).json({ message: error.message || "Failed to save profile" });
    }
  });

  // Dashboard endpoint
  app.get("/api/dashboard/latest", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const latestRecord = await storage.getLatestEmissionRecord(userId);
      
      if (!latestRecord) {
        return res.status(404).json({ message: "No emission records found" });
      }
      
      res.json(latestRecord);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Leaderboard endpoint
  app.get("/api/leaderboard", isAuthenticated, async (req: any, res) => {
    try {
      // Get all company profiles
      const profiles = await storage.getAllCompanyProfiles();
      
      // Get latest emission record for each company
      const leaderboardEntries = await Promise.all(
        profiles.map(async (profile) => {
          const latestRecord = await storage.getLatestEmissionRecord(profile.userId);
          
          if (!latestRecord) return null;
          
          const greenScore = calculateGreenScore(
            latestRecord.optimizedTotal,
            profile.totalDistance,
            profile.loadEfficiency,
            profile.renewableShare
          );
          
          return {
            userId: profile.userId,
            companyName: profile.companyName,
            sector: profile.sector,
            greenScore,
            co2Emissions: latestRecord.optimizedTotal,
            totalDistance: profile.totalDistance,
            loadEfficiency: profile.loadEfficiency,
            renewableShare: profile.renewableShare,
          };
        })
      );
      
      // Filter out null entries and sort by green score (descending)
      const sortedLeaderboard = leaderboardEntries
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
        .sort((a, b) => b.greenScore - a.greenScore)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));
      
      res.json(sortedLeaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
