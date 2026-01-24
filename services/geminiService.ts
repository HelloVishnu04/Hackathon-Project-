import { GoogleGenAI, Type } from "@google/genai";
import { BuildingParams, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBuildingStructure = async (params: BuildingParams): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing, returning mock data");
    return getMockAnalysis(params);
  }

  try {
    const prompt = `
      Act as a Senior Structural Engineer. Analyze the following building for structural integrity and seismic retrofit needs:
      - Construction Year: ${params.year}
      - Material: ${params.material}
      - Floors: ${params.floors}
      - Seismic Zone: ${params.seismicZone}
      - Occupancy: ${params.occupancy}
      
      Detailed Material Properties:
      - Concrete Strength: ${params.concreteStrength ? params.concreteStrength + ' psi' : 'N/A'}
      - Steel Grade: ${params.steelGrade ? params.steelGrade + ' ksi' : 'N/A'}
      - Elasticity Modulus: ${params.elasticityModulus ? params.elasticityModulus + ' GPa' : 'N/A'}

      Provide a JSON response with:
      1. vulnerabilityScore (0-100, where 100 is extremely vulnerable).
      2. summary (A concise technical summary of potential failure modes like soft story, shear failure, etc.).
      3. criticalZones (Array of strings identifying likely weak points, e.g., "Ground Floor Columns", "Corner Connections").
      4. recommendations (Array of retrofit options). Each option must have:
         - id (unique string)
         - name (Short technical name, e.g., "Viscous Dampers")
         - description (1 sentence explanation)
         - costEstimate (String range, e.g., "$50k - $75k")
         - roi (Number 1-10, 10 being highest return on investment)
         - riskReduction (Number 0-100 estimated safety improvement)
         - type (One of: 'bracing', 'isolation', 'jacketing', 'damping')
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vulnerabilityScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            criticalZones: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  costEstimate: { type: Type.STRING },
                  roi: { type: Type.NUMBER },
                  riskReduction: { type: Type.NUMBER },
                  type: { type: Type.STRING } // Simplified enum handling for JSON schema
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Parse and cast to ensure type safety matching our internal enum
    const data = JSON.parse(text) as AnalysisResult;
    
    // Sanitize data to prevent "Cannot read properties of undefined (reading 'map')"
    if (!Array.isArray(data.recommendations)) data.recommendations = [];
    if (!Array.isArray(data.criticalZones)) data.criticalZones = [];
    if (typeof data.vulnerabilityScore !== 'number') data.vulnerabilityScore = 50;
    if (!data.summary) data.summary = "Analysis completed. Review structural details below.";

    return data;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return getMockAnalysis(params);
  }
};

// Fallback for demo stability if API key fails or network issues
const getMockAnalysis = (params: BuildingParams): AnalysisResult => {
  return {
    vulnerabilityScore: params.year < 1990 ? 75 : 30,
    summary: "Simulated analysis: Older concrete structures in this zone are prone to non-ductile column shear failure.",
    criticalZones: ["Ground Floor Soft Story", "Beam-Column Joints"],
    recommendations: [
      {
        id: "r1",
        name: "Steel Cross Bracing",
        description: "External steel X-bracing to increase lateral stiffness.",
        costEstimate: "$120k - $150k",
        roi: 8.5,
        riskReduction: 40,
        type: "bracing"
      },
      {
        id: "r2",
        name: "Base Isolation",
        description: "Decoupling the superstructure from the foundation.",
        costEstimate: "$400k - $600k",
        roi: 6.0,
        riskReduction: 90,
        type: "isolation"
      },
      {
        id: "r3",
        name: "Carbon Fiber Jacketing",
        description: "Wrapping columns with FRP to enhance confinement.",
        costEstimate: "$80k - $110k",
        roi: 9.0,
        riskReduction: 25,
        type: "jacketing"
      }
    ]
  };
};