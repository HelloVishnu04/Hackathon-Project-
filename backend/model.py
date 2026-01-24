import torch
import torch.nn as nn
import numpy as np

# Define the Deep Learning Model Architecture
class StructuralRiskNetwork(nn.Module):
    def __init__(self, input_size=10, hidden_size=24):
        # Increased input size to 10 to accommodate one-hot encoding of typologies
        super(StructuralRiskNetwork, self).__init__()
        # Input Layer -> Hidden Layer 1
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu1 = nn.ReLU()
        # Hidden Layer 1 -> Hidden Layer 2
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.relu2 = nn.ReLU()
        # Hidden Layer 2 -> Output (Risk Score 0-1)
        self.output = nn.Linear(hidden_size, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        out = self.fc1(x)
        out = self.relu1(out)
        out = self.fc2(out)
        out = self.relu2(out)
        out = self.output(out)
        out = self.sigmoid(out)
        return out

class StructuralAnalyzer:
    def __init__(self):
        self.model = StructuralRiskNetwork()
        self.model.eval()  # Set to evaluation mode

    def encode_input(self, params):
        """
        Preprocess input features into a tensor.
        Features: [NormYear, NormFloors, IsConcrete, IsSteel, SeismicIntensity, IsCommercial, 
                   IsStilt, IsHouse, IsHighRise, IsIndustrial]
        """
        # 1. Normalize Year (0 to 1 scaling based on 1950-2024)
        norm_year = (params['year'] - 1950) / (2024 - 1950)
        
        # 2. Normalize Floors (0 to 1 scaling based on 1-50 floors)
        norm_floors = params['floors'] / 50.0
        
        # 3. One-hot encoding for materials
        is_concrete = 1.0 if params['material'] in ['Concrete', 'Stone'] else 0.0
        is_steel = 1.0 if params['material'] == 'Steel' else 0.0
        
        # 4. Seismic Zone intensity (IS 1893:2016 Mapping)
        seismic_map = {'Zone II': 0.2, 'Zone III': 0.4, 'Zone IV': 0.7, 'Zone V': 1.0}
        seismic_val = seismic_map.get(params['seismicZone'], 0.4)
        
        # 5. Occupancy weight
        is_commercial = 1.0 if params['occupancy'] in ['Commercial', 'Industrial', 'Religious'] else 0.0

        # 6. Typology One-Hot Encoding (Simplified Mapping)
        t = params.get('typology', 'ModernHighRise')
        is_stilt = 1.0 if t == 'StiltApartment' else 0.0
        is_house = 1.0 if t in ['IndependentHouse', 'KutchaHouse', 'Temple'] else 0.0
        is_highrise = 1.0 if t in ['ModernHighRise', 'IndianApartment'] else 0.0
        is_industrial = 1.0 if t == 'IndustrialShed' else 0.0

        # Create input vector (Size 10)
        features = np.array([
            norm_year, norm_floors, is_concrete, is_steel, seismic_val, is_commercial,
            is_stilt, is_house, is_highrise, is_industrial
        ], dtype=np.float32)
        
        return torch.from_numpy(features)

    def predict(self, params):
        """Run the DL inference with Indian Context Logic"""
        input_tensor = self.encode_input(params)
        
        with torch.no_grad():
            # Run forward pass through the Neural Network
            # Multiplied by 100 for percentage
            risk_score = self.model(input_tensor).item() * 100
            
        # --- Indian Subcontinent Heuristics & Rules ---
        
        typology = params.get('typology')
        
        # 1. Stilt Parking (Open Ground Storey) Risk
        if typology == 'StiltApartment':
            risk_score += 25  # Significant penalty for OGS without stiffness
            if params['seismicZone'] in ['Zone IV', 'Zone V']:
                risk_score += 10 # Extremely dangerous in high seismic zones

        # 2. Industrial Sheds (Wind/Seismic)
        elif typology == 'IndustrialShed':
            if params['material'] == 'Steel':
                risk_score -= 10 # Steel sheds perform better structurally
            else:
                risk_score += 15 # Masonry sheds are risky
        
        # 3. Kutcha House (High Vulnerability)
        elif typology == 'KutchaHouse':
             risk_score += 40
             if params['material'] in ['MudMortar', 'Masonry']:
                 risk_score += 20
        
        # 4. Temple (Heavy Mass)
        elif typology == 'Temple':
            risk_score += 15
            if params['seismicZone'] in ['Zone IV', 'Zone V']:
                risk_score += 15 # Brittle failure of Shikara

        # 5. Age Factor (IS 1893 Revisions)
        if params['year'] < 2002:
            risk_score += 20
        elif params['year'] < 2016:
            risk_score += 5
            
        # 6. Zone Penalties
        if params['seismicZone'] == 'Zone V':
            risk_score += 20
        elif params['seismicZone'] == 'Zone IV':
            risk_score += 10
            
        # 7. Material Factor
        if params['material'] == 'Masonry' and params['floors'] > 3:
            risk_score += 35 # Unreinforced masonry extremely dangerous above 3 floors
            
        return min(max(risk_score, 10), 99) # Clamp

    def get_recommendations(self, score, material, zone, typology):
        """Recommendation Engine using Indian Retrofit Practices & INR Costs"""
        recs = []
        
        # Typology Specific Recommendations
        if typology == 'StiltApartment':
             recs.append({
                "id": "ogs_stiffness",
                "name": "Ground Floor Bracing",
                "description": "Adding shear walls or cross-bracing to the parking level to eliminate soft-storey mechanism.",
                "costEstimate": "₹15 Lakh - ₹25 Lakh",
                "roi": 9.5,
                "riskReduction": 60,
                "type": "bracing"
            })

        if typology == 'IndustrialShed':
             recs.append({
                "id": "truss_strength",
                "name": "Roof Truss Strengthening",
                "description": "Reinforcing connections and adding wind bracing to roof trusses.",
                "costEstimate": "₹5 Lakh - ₹10 Lakh",
                "roi": 8.0,
                "riskReduction": 30,
                "type": "bracing"
            })

        if typology == 'KutchaHouse':
             recs.append({
                "id": "mud_stabilization",
                "name": "Wall Stabilization & Bands",
                "description": "Adding horizontal seismic bands (plinth, lintel, roof) to prevent collapse.",
                "costEstimate": "₹2 Lakh - ₹4 Lakh",
                "roi": 9.0,
                "riskReduction": 70,
                "type": "jacketing"
            })

        if typology == 'Temple':
             recs.append({
                "id": "stone_pinning",
                "name": "Stone Pinning & Grouting",
                "description": "Vertical pinning of stone blocks and epoxy grouting for structural continuity.",
                "costEstimate": "₹20 Lakh - ₹50 Lakh",
                "roi": 7.5,
                "riskReduction": 45,
                "type": "jacketing"
            })

        # General Material Recommendations
        if score > 50:
            if material == 'Concrete':
                recs.append({
                    "id": "rc_jacket",
                    "name": "RC Jacketing",
                    "description": "Reinforced concrete jacketing of columns to improve ductility (IS 15988).",
                    "costEstimate": "₹8 Lakh - ₹15 Lakh",
                    "roi": 8.5,
                    "riskReduction": 40,
                    "type": "jacketing"
                })
            elif material in ['Masonry', 'MudMortar', 'Stone']:
                 recs.append({
                    "id": "ferro_cement",
                    "name": "Ferrocement Splint & Bandage",
                    "description": "Strengthening masonry walls with wire mesh and cement mortar.",
                    "costEstimate": "₹3 Lakh - ₹6 Lakh",
                    "roi": 9.0,
                    "riskReduction": 35,
                    "type": "jacketing"
                })

        if zone in ['Zone IV', 'Zone V'] and score > 70:
             recs.append({
                "id": "shear_wall",
                "name": "Shear Wall Addition",
                "description": "Adding RC shear walls to resist lateral seismic loads.",
                "costEstimate": "₹12 Lakh - ₹25 Lakh",
                "roi": 8.0,
                "riskReduction": 50,
                "type": "bracing"
            })
             
        if zone == 'Zone V' and score > 85 and typology == 'ModernHighRise':
             recs.append({
                "id": "dampers",
                "name": "Fluid Viscous Dampers",
                "description": "Energy dissipation devices for high-rise structures.",
                "costEstimate": "₹50 Lakh+",
                "roi": 6.5,
                "riskReduction": 85,
                "type": "damping"
            })

        return recs

    def generate_analysis(self, params):
        score = self.predict(params)
        recs = self.get_recommendations(score, params['material'], params['seismicZone'], params.get('typology'))
        
        # Determine Critical Zones based on Indian typologies
        zones = []
        if params.get('typology') == 'StiltApartment':
             zones.append("Open Ground Storey (Soft Storey)")
        if params['floors'] > 3 and params.get('typology') not in ['ModernHighRise', 'Temple']:
            zones.append("Column Shear Failure")
        if params['material'] == 'Concrete' and params['year'] < 2002:
            zones.append("Non-Ductile Beam-Column Joints")
        if params['material'] in ['Masonry', 'MudMortar', 'Stone']:
            zones.append("Corner & Gable Walls")
        if params.get('typology') == 'IndustrialShed':
            zones.append("Roof Truss Connections")
        if params.get('typology') == 'Temple':
            zones.append("Shikara (Tower) Toppling")
            
        summary = f"Analysis of {params.get('typology')} structure in {params['seismicZone']} indicates a risk score of {int(score)}/100. "
        if score > 60:
            summary += "Critical deficiencies detected. "
            if params.get('typology') == 'StiltApartment':
                summary += "The Open Ground Storey configuration presents a severe collapse risk."
            elif params.get('typology') == 'KutchaHouse':
                summary += "Unreinforced masonry/mud construction is highly vulnerable to total collapse."
        else:
            summary += "Structure performs within acceptable safety margins."

        return {
            "vulnerabilityScore": int(score),
            "summary": summary,
            "criticalZones": zones if zones else ["None Detected"],
            "recommendations": recs
        }