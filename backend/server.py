from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
from model import StructuralAnalyzer

app = FastAPI()

# Enable CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Analyzer Class
analyzer = StructuralAnalyzer()

# Define Request Schema
class BuildingParams(BaseModel):
    year: int
    typology: str  # Added Typology
    material: str
    floors: int
    seismicZone: str
    occupancy: str
    lastInspection: str
    concreteStrength: Optional[int] = None
    steelGrade: Optional[int] = None
    elasticityModulus: Optional[int] = None

@app.get("/")
def read_root():
    return {"status": "Structural AI Backend Online"}

@app.post("/analyze")
def analyze_structure(params: BuildingParams):
    """
    Endpoint receiving building data and returning ML predictions
    """
    # Convert Pydantic model to dict
    data = params.model_dump()
    
    # Run the DL Model
    result = analyzer.generate_analysis(data)
    
    return result

if __name__ == "__main__":
    print("Starting Structural AI Neural Backend...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
