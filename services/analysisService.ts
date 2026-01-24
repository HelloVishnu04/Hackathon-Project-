import { BuildingParams, AnalysisResult } from "../types";

const API_URL = "http://localhost:8000/analyze";

export const analyzeBuildingStructure = async (params: BuildingParams): Promise<AnalysisResult> => {
  try {
    // Attempt to call the local Python Backend
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as AnalysisResult;

  } catch (error) {
    console.warn("Python Backend Unavailable. Falling back to client-side ML simulation (Indian Context).", error);
    // If Python server isn't running, run a local JS simulation so the app doesn't break
    return runLocalSimulation(params);
  }
};

// Client-side simulation to ensure UI works even without the Python server started
const runLocalSimulation = (params: BuildingParams): AnalysisResult => {
  // Logic mimicking the Python Neural Network (Indian Context)
  let baseScore = 30;

  // Typology Factors
  if (params.typology === 'StiltApartment') {
    baseScore += 30; // Soft Storey Risk
  }
  if (params.typology === 'IndustrialShed') {
    baseScore -= 5;
  }
  if (params.typology === 'KutchaHouse') {
    baseScore += 45; // Very high vulnerability
  }
  if (params.typology === 'Temple') {
    baseScore += 15;
  }

  // Material & Age factors (IS Code revisions: 1993, 2002, 2016)
  if (params.material === 'Concrete') {
    if (params.year < 1993) baseScore += 45;
    else if (params.year < 2002) baseScore += 25;
  } else if (params.material === 'Masonry' || params.material === 'Stone' || params.material === 'MudMortar') {
    baseScore += 55; // High risk for unreinforced masonry in India
  } else if (params.material === 'Steel') {
    baseScore -= 10;
  }

  // Zone factors
  if (params.seismicZone === 'Zone IV') baseScore += 15;
  if (params.seismicZone === 'Zone V') baseScore += 30;

  // Height factors (Soft Storey Risk)
  if (params.floors > 3) baseScore += 15;

  const finalScore = Math.min(Math.max(baseScore, 10), 98);

  const recommendations = [];

  if (params.typology === 'StiltApartment') {
    recommendations.push({
        id: "r_ogs",
        name: "Ground Floor Stiffness",
        description: "Adding shear walls or bracing to open parking level.",
        costEstimate: "₹15 Lakh - ₹20 Lakh",
        roi: 9.5,
        riskReduction: 60,
        type: "bracing" as const
    });
  }

  if (params.typology === 'KutchaHouse') {
      recommendations.push({
        id: "r_mud",
        name: "Seismic Bands",
        description: "Installing horizontal timber or RC bands at lintel and roof levels.",
        costEstimate: "₹3 Lakh",
        roi: 9.0,
        riskReduction: 75,
        type: "jacketing" as const
    });
  }

  if (finalScore > 50) {
    recommendations.push({
      id: "r1",
      name: "RC Jacketing",
      description: "Increasing column size with additional reinforcement (IS 15988).",
      costEstimate: "₹10 Lakh - ₹15 Lakh",
      roi: 8.5,
      riskReduction: 40,
      type: "jacketing" as const
    });
  }
  
  if (finalScore > 70 && params.typology !== 'KutchaHouse') {
      recommendations.push({
        id: "r2",
        name: "Shear Wall Addition",
        description: "New RC walls to resist lateral forces.",
        costEstimate: "₹20 Lakh - ₹35 Lakh",
        roi: 8.0,
        riskReduction: 60,
        type: "bracing" as const
      });
  }

  return {
    vulnerabilityScore: finalScore,
    summary: `(Local Simulation) Analysis based on IS 1893 estimates a vulnerability score of ${finalScore}/100. ${params.typology === 'StiltApartment' ? 'Open Ground Storey configuration detected as high risk.' : ''}`,
    criticalZones: params.typology === 'StiltApartment' ? ["Open Ground Storey (Parking)", "Beam-Column Joints"] : ["Masonry Infills", "Connections"],
    recommendations: recommendations
  };
};