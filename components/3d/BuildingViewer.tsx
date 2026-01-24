import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, Environment, Html, Center, Cylinder, Float } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingParams } from '../../types';
import { 
  AlertTriangle, 
  Layers, 
  Activity, 
  Wifi, 
  Wind, 
  LogOut 
} from 'lucide-react';

type VisualizationMode = 'standard' | 'heatmap' | 'sensors' | 'seismic' | 'emergency';

interface BuildingViewerProps {
  params: BuildingParams;
  activeRetrofits: string[];
  emergencyMode: boolean;
  vulnerabilityScore: number;
  visualizationMode?: 'standard' | 'heatmap';
  onRegisterSnapshot?: (fn: () => string) => void;
}

// --- Effects ---
const CameraShaker: React.FC<{ active: boolean }> = ({ active }) => {
  const { camera } = useThree();
  const initialPos = useRef(camera.position.clone());
  
  useFrame((state) => {
    if (active) {
      const shakeIntensity = 0.2;
      const time = state.clock.getElapsedTime();
      camera.position.x += Math.sin(time * 20) * 0.05 * shakeIntensity;
      camera.position.y += Math.cos(time * 15) * 0.05 * shakeIntensity;
      camera.position.z += Math.sin(time * 10) * 0.05 * shakeIntensity;
    } 
  });

  return null;
};


// --- Advanced Materials System ---

const GlassMaterial: React.FC = () => (
  <meshPhysicalMaterial
    transmission={0.9}
    thickness={0.5}
    roughness={0.05}
    metalness={0.1}
    color="#e0f2fe"
    transparent
    opacity={0.3}
  />
);

interface SmartMaterialProps {
  type: 'concrete' | 'steel' | 'brick' | 'mud' | 'stone';
  year: number;
  mode: VisualizationMode;
  riskScore: number;
  baseColor?: string;
}

const SmartMaterial: React.FC<SmartMaterialProps> = ({ type, year, mode, riskScore, baseColor }) => {
  const age = new Date().getFullYear() - year;
  
  // 1. Determine Base Properties (Standard Mode)
  let pbrProps: any = {};
  let defaultColor = "#cccccc";

  switch(type) {
      case 'concrete':
          const weatheredConc = age > 15;
          pbrProps = { roughness: weatheredConc ? 0.9 : 0.6, metalness: 0.1 };
          defaultColor = weatheredConc ? "#a8a29e" : "#cbd5e1"; 
          break;
      case 'steel':
          const rusted = age > 20;
          pbrProps = { roughness: rusted ? 0.9 : 0.4, metalness: rusted ? 0.2 : 0.8 };
          defaultColor = rusted ? "#92400e" : "#475569";
          break;
      case 'brick':
          pbrProps = { roughness: 0.9, metalness: 0 };
          defaultColor = "#b91c1c";
          break;
      case 'mud':
          pbrProps = { roughness: 1.0, metalness: 0 };
          defaultColor = "#8d6e63";
          break;
      case 'stone':
          const ancient = age > 50;
           pbrProps = { roughness: 0.9, metalness: 0.1 };
           defaultColor = ancient ? "#57534e" : "#78716c";
           break;
  }

  // 2. Determine Final Color & Mode
  let finalColor = baseColor || defaultColor;
  let emissive = "#000000";
  let emissiveIntensity = 0;
  let transparent = false;
  let opacity = 1;

  if (mode === 'heatmap') {
      if (riskScore > 70) finalColor = '#ef4444';
      else if (riskScore > 40) finalColor = '#f97316';
      else finalColor = '#22c55e';
      
      if (riskScore > 60) {
          emissive = '#7f1d1d';
          emissiveIntensity = 0.5;
      }
      pbrProps = { roughness: 0.9, metalness: 0 }; 
  } else if (mode === 'sensors') {
      // Ghost mode for sensor visualization
      transparent = true;
      opacity = 0.15;
      finalColor = '#1e293b'; // Dark silhouette
      pbrProps = { roughness: 0.1, metalness: 0.8 };
  } else if (mode === 'emergency') {
      // Darker environment to highlight safe paths
       defaultColor = "#334155";
  }

  return (
      <meshStandardMaterial 
          color={finalColor} 
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          transparent={transparent}
          opacity={opacity}
          {...pbrProps}
      />
  );
};

// --- Visualization Helpers ---

const SensorPoint: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} toneMapped={false} />
            </mesh>
            <mesh scale={1.5}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial color="#22c55e" transparent opacity={0.3} />
            </mesh>
            <Html distanceFactor={10}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            </Html>
        </group>
    );
};

const SensorNetwork: React.FC<{ width: number; depth: number; floors: number; floorHeight: number }> = ({ width, depth, floors, floorHeight }) => {
    const sensors = [];
    for (let i = 0; i < floors; i++) {
        const y = i * floorHeight + floorHeight / 2;
        sensors.push(<SensorPoint key={`s1-${i}`} position={[width/2 - 0.5, y, depth/2 - 0.5]} />);
        sensors.push(<SensorPoint key={`s2-${i}`} position={[-width/2 + 0.5, y, depth/2 - 0.5]} />);
        sensors.push(<SensorPoint key={`s3-${i}`} position={[width/2 - 0.5, y, -depth/2 + 0.5]} />);
        sensors.push(<SensorPoint key={`s4-${i}`} position={[-width/2 + 0.5, y, -depth/2 + 0.5]} />);
    }
    return <group>{sensors}</group>;
};

const SeismicVectors: React.FC<{ width: number; height: number }> = ({ width, height }) => {
    return (
        <group position={[-width - 2, height/2, 0]}>
            <Float speed={2} rotationIntensity={0} floatIntensity={1}>
                <group rotation={[0, 0, -Math.PI / 2]}>
                    <mesh position={[0, 2, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 4]} />
                        <meshStandardMaterial color="#f59e0b" />
                    </mesh>
                    <mesh position={[0, 5, 0]}>
                        <coneGeometry args={[1, 2, 16]} />
                        <meshStandardMaterial color="#f59e0b" />
                    </mesh>
                </group>
                <Html position={[2, 1, 0]} center>
                    <div className="bg-amber-500/90 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Lateral Load (0.15g)</div>
                </Html>
            </Float>
        </group>
    );
};

const EvacuationPath: React.FC = () => {
    return (
        <group position={[0, 0.1, 5]}>
            {[0, 2, 4, 6].map((z) => (
                <group key={z} position={[0, 0, z]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                         <planeGeometry args={[1, 1]} />
                         <meshBasicMaterial color="#22c55e" transparent opacity={0.6} alphaMap={null} />
                    </mesh>
                    <Html center>
                        <div className="text-green-500 animate-bounce font-bold text-xl">↓</div>
                    </Html>
                </group>
            ))}
             <Html position={[0, 0, 8]} center>
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse whitespace-nowrap">
                    SAFE ASSEMBLY POINT
                </div>
            </Html>
        </group>
    );
};


// --- Sub-Components for Building ---

const Column: React.FC<{ 
  height: number; 
  position: [number, number, number]; 
  type: SmartMaterialProps['type'];
  year: number;
  mode: VisualizationMode; 
  risk: number 
}> = ({ height, position, type, year, mode, risk }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={[0.5, height, 0.5]} />
    <SmartMaterial type={type} year={year} mode={mode} riskScore={risk} />
  </mesh>
);

const Slab: React.FC<{ 
  width: number; 
  depth: number; 
  position: [number, number, number]; 
  type: SmartMaterialProps['type'];
  year: number;
  mode: VisualizationMode; 
  risk: number 
}> = ({ width, depth, position, type, year, mode, risk }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={[width, 0.2, depth]} />
    <SmartMaterial type={type} year={year} mode={mode} riskScore={risk} />
  </mesh>
);

// --- Typology 1: Stilt Apartment (Typical Indian G+4/5) ---
const StiltApartmentModel: React.FC<BuildingViewerProps & { viewMode: VisualizationMode }> = ({ params, viewMode, vulnerabilityScore }) => {
  const floorHeight = 3.5;
  const width = 12;
  const depth = 10;
  const getFloorRisk = (i: number) => (i === 0 ? Math.min(vulnerabilityScore + 20, 100) : Math.max(vulnerabilityScore - (i * 5), 20));
  const floors = Array.from({ length: params.floors });

  return (
    <group>
      {viewMode === 'sensors' && <SensorNetwork width={width} depth={depth} floors={params.floors} floorHeight={floorHeight} />}
      {viewMode === 'seismic' && <SeismicVectors width={width} height={params.floors * floorHeight} />}
      {viewMode === 'emergency' && <EvacuationPath />}

      {floors.map((_, i) => (
        <group key={i} position={[0, i * floorHeight, 0]}>
          <Slab width={width} depth={depth} position={[0, -0.1, 0]} type="concrete" year={params.year} mode={viewMode} risk={getFloorRisk(i)} />
          <Column height={floorHeight} position={[width/2-0.5, floorHeight/2, depth/2-0.5]} type="concrete" year={params.year} mode={viewMode} risk={getFloorRisk(i)} />
          <Column height={floorHeight} position={[-width/2+0.5, floorHeight/2, depth/2-0.5]} type="concrete" year={params.year} mode={viewMode} risk={getFloorRisk(i)} />
          <Column height={floorHeight} position={[width/2-0.5, floorHeight/2, -depth/2+0.5]} type="concrete" year={params.year} mode={viewMode} risk={getFloorRisk(i)} />
          <Column height={floorHeight} position={[-width/2+0.5, floorHeight/2, -depth/2+0.5]} type="concrete" year={params.year} mode={viewMode} risk={getFloorRisk(i)} />
          {i === 0 ? (
             viewMode === 'standard' && (
              <group>
                 <mesh position={[2, 0.5, 0]} castShadow>
                    <boxGeometry args={[1.5, 1, 3]} />
                    <meshStandardMaterial color="#ef4444" />
                 </mesh>
                  <mesh position={[-2, 0.5, 2]} castShadow rotation={[0, 0.5, 0]}>
                    <boxGeometry args={[1.5, 1, 3]} />
                    <meshStandardMaterial color="#3b82f6" />
                 </mesh>
                 <Html position={[0, 2, 4]} center>
                    <div className="bg-red-600/90 text-white px-2 py-0.5 text-[10px] rounded font-bold shadow">SOFT STOREY</div>
                 </Html>
              </group>
            )
          ) : (
             viewMode === 'standard' && (
              <group>
                <mesh position={[0, floorHeight/2, 0]}>
                   <boxGeometry args={[width-1, floorHeight, depth-1]} />
                   <meshStandardMaterial color="#f1f5f9" />
                </mesh>
                <mesh position={[0, floorHeight/2, depth/2]}>
                   <boxGeometry args={[width-2, floorHeight-1, 0.1]} />
                   <GlassMaterial />
                </mesh>
              </group>
            )
          )}
        </group>
      ))}
      {viewMode === 'standard' && (
          <mesh position={[0, params.floors * floorHeight + 0.5, 0]}>
            <boxGeometry args={[width-2, 1, depth-2]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
      )}
    </group>
  );
};

// --- Typology 2: Industrial Shed ---
const IndustrialShedModel: React.FC<BuildingViewerProps & { viewMode: VisualizationMode }> = ({ params, viewMode, vulnerabilityScore }) => {
  const width = 15;
  const depth = 25;
  const height = 8;
  const trussHeight = 3;

  return (
    <group position={[0, height/2, 0]}>
      {viewMode === 'sensors' && <SensorNetwork width={width} depth={depth} floors={1} floorHeight={height} />}
      {viewMode === 'seismic' && <SeismicVectors width={width} height={height} />}
      
      {[0, 1, 2, 3, 4].map((i) => {
         const z = -depth/2 + i * (depth/4);
         return (
           <group key={i}>
              <Column height={height} position={[width/2, 0, z]} type="steel" year={params.year} mode={viewMode} risk={vulnerabilityScore} />
              <Column height={height} position={[-width/2, 0, z]} type="steel" year={params.year} mode={viewMode} risk={vulnerabilityScore} />
              <mesh position={[0, height/2, z]}>
                 <boxGeometry args={[width, 0.3, 0.3]} />
                 <SmartMaterial type="steel" year={params.year} mode={viewMode} riskScore={vulnerabilityScore} />
              </mesh>
              {viewMode === 'standard' && (
                  <group position={[0, height/2 + trussHeight/2, z]}>
                      <mesh rotation={[0, 0, Math.PI/4]} position={[-width/4, 0, 0]}>
                          <boxGeometry args={[width/1.8, 0.2, 0.2]} />
                          <SmartMaterial type="steel" year={params.year} mode={viewMode} riskScore={vulnerabilityScore} />
                      </mesh>
                       <mesh rotation={[0, 0, -Math.PI/4]} position={[width/4, 0, 0]}>
                          <boxGeometry args={[width/1.8, 0.2, 0.2]} />
                          <SmartMaterial type="steel" year={params.year} mode={viewMode} riskScore={vulnerabilityScore} />
                      </mesh>
                  </group>
              )}
           </group>
         );
      })}
      {viewMode === 'standard' && (
        <group position={[0, height/2 + trussHeight/2 + 0.2, 0]}>
            <mesh rotation={[0, 0, Math.PI/12]} position={[width/4, 0, 0]}>
                <boxGeometry args={[width/1.8, 0.1, depth+2]} />
                <meshStandardMaterial color="#0ea5e9" metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI/12]} position={[-width/4, 0, 0]}>
                <boxGeometry args={[width/1.8, 0.1, depth+2]} />
                <meshStandardMaterial color="#0ea5e9" metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
            </mesh>
        </group>
      )}
    </group>
  );
};

// --- Typology 3: Indian Apartment ---
const IndianApartmentModel: React.FC<BuildingViewerProps & { viewMode: VisualizationMode }> = ({ params, viewMode, vulnerabilityScore }) => {
    const floorHeight = 3.2;
    const width = 14;
    const depth = 12;
    const floors = Array.from({ length: params.floors });

    return (
        <group>
            {viewMode === 'sensors' && <SensorNetwork width={width} depth={depth} floors={params.floors} floorHeight={floorHeight} />}
            {viewMode === 'seismic' && <SeismicVectors width={width} height={params.floors * floorHeight} />}
            {viewMode === 'emergency' && <EvacuationPath />}

            {floors.map((_, i) => (
                <group key={i} position={[0, i * floorHeight, 0]}>
                   <Slab width={width} depth={depth} position={[0, -0.1, 0]} type="concrete" year={params.year} mode={viewMode} risk={vulnerabilityScore} />
                   
                   {viewMode === 'standard' ? (
                       <group>
                           <mesh position={[0, floorHeight/2, 0]}>
                               <boxGeometry args={[width-1, floorHeight, depth-1]} />
                               <meshStandardMaterial color="#f8fafc" />
                           </mesh>
                           <group position={[0, floorHeight/2 - 0.5, depth/2 + 0.5]}>
                               <mesh position={[2, 0, 0]}>
                                   <boxGeometry args={[3, 1, 1]} />
                                   <SmartMaterial type="concrete" year={params.year} mode={viewMode} riskScore={vulnerabilityScore} baseColor="#64748b" />
                               </mesh>
                               <mesh position={[-2, 0, 0]}>
                                   <boxGeometry args={[3, 1, 1]} />
                                   <SmartMaterial type="concrete" year={params.year} mode={viewMode} riskScore={vulnerabilityScore} baseColor="#64748b" />
                               </mesh>
                           </group>
                       </group>
                   ) : (
                       <group>
                           <Column height={floorHeight} position={[width/2-0.5, floorHeight/2, depth/2-0.5]} type="concrete" year={params.year} mode={viewMode} risk={vulnerabilityScore} />
                           <Column height={floorHeight} position={[-width/2+0.5, floorHeight/2, depth/2-0.5]} type="concrete" year={params.year} mode={viewMode} risk={vulnerabilityScore} />
                           <Column height={floorHeight} position={[width/2-0.5, floorHeight/2, -depth/2+0.5]} type="concrete" year={params.year} mode={viewMode} risk={vulnerabilityScore} />
                           <Column height={floorHeight} position={[-width/2+0.5, floorHeight/2, -depth/2+0.5]} type="concrete" year={params.year} mode={viewMode} risk={vulnerabilityScore} />
                       </group>
                   )}
                </group>
            ))}
        </group>
    );
};

// --- Typology 4: Kutcha House ---
const KutchaHouseModel: React.FC<BuildingViewerProps & { viewMode: VisualizationMode }> = ({ params, viewMode, vulnerabilityScore }) => {
    const floorHeight = 2.8;
    const width = 6;
    const depth = 8;

    return (
        <group>
             <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[width+1, 0.4, depth+1]} />
                <SmartMaterial type="mud" year={params.year} mode={viewMode} riskScore={vulnerabilityScore} />
             </mesh>
             <mesh position={[0, floorHeight/2 + 0.4, 0]}>
                <boxGeometry args={[width, floorHeight, depth]} />
                <SmartMaterial type="mud" year={params.year} mode={viewMode} riskScore={vulnerabilityScore} />
             </mesh>
             {viewMode === 'standard' && (
                 <group position={[0, floorHeight + 1, 0]}>
                     <mesh rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[0, 5.5, 3, 4]} />
                        <meshStandardMaterial color="#a1887f" roughness={1} />
                     </mesh>
                 </group>
             )}
        </group>
    );
};

// --- Typology 5: Temple ---
const TempleModel: React.FC<BuildingViewerProps & { viewMode: VisualizationMode }> = ({ params, viewMode, vulnerabilityScore }) => {
    return (
        <group>
             <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[12, 1, 16]} />
                <SmartMaterial type="stone" year={params.year} mode={viewMode} riskScore={vulnerabilityScore} />
             </mesh>
             <group position={[0, 1 + 2, 4]}>
                <mesh>
                    <boxGeometry args={[8, 4, 6]} />
                    <SmartMaterial type="stone" year={params.year} mode={viewMode} riskScore={vulnerabilityScore} />
                </mesh>
             </group>
             <group position={[0, 0, -4]}>
                <mesh position={[0, 3, 0]}>
                    <boxGeometry args={[6, 4, 6]} />
                    <SmartMaterial type="stone" year={params.year} mode={viewMode} riskScore={vulnerabilityScore} />
                </mesh>
                <mesh position={[0, 5 + 1.5, 0]}>
                     <cylinderGeometry args={[2, 4, 4, 4]} />
                     <SmartMaterial type="stone" year={params.year} mode={viewMode} riskScore={vulnerabilityScore} />
                </mesh>
                {viewMode === 'standard' && (
                     <mesh position={[0, 13.5, 0]}>
                         <coneGeometry args={[0.2, 1.5, 8]} />
                         <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
                    </mesh>
                )}
             </group>
        </group>
    );
};

// --- Typology 6: Modern High Rise ---
const ModernHighRiseModel: React.FC<BuildingViewerProps & { viewMode: VisualizationMode }> = ({ params, viewMode, vulnerabilityScore }) => {
    const floorHeight = 3.5;
    const width = 14;
    const depth = 14;
    const floors = Array.from({ length: params.floors });
    
    return (
        <group>
             {viewMode === 'sensors' && <SensorNetwork width={width} depth={depth} floors={params.floors} floorHeight={floorHeight} />}
             {viewMode === 'seismic' && <SeismicVectors width={width} height={params.floors * floorHeight} />}
             {viewMode === 'emergency' && <EvacuationPath />}

             {floors.map((_, i) => (
                 <group key={i} position={[0, i * floorHeight, 0]}>
                      <Slab width={width} depth={depth} position={[0, -0.1, 0]} type="concrete" year={params.year} mode={viewMode} risk={vulnerabilityScore} />
                      <Column height={floorHeight} position={[width/2-0.5, floorHeight/2, depth/2-0.5]} type="concrete" year={params.year} mode={viewMode} risk={vulnerabilityScore} />
                      <Column height={floorHeight} position={[-width/2+0.5, floorHeight/2, depth/2-0.5]} type="concrete" year={params.year} mode={viewMode} risk={vulnerabilityScore} />
                      <Column height={floorHeight} position={[width/2-0.5, floorHeight/2, -depth/2+0.5]} type="concrete" year={params.year} mode={viewMode} risk={vulnerabilityScore} />
                      <Column height={floorHeight} position={[-width/2+0.5, floorHeight/2, -depth/2+0.5]} type="concrete" year={params.year} mode={viewMode} risk={vulnerabilityScore} />
                      
                      <mesh position={[0, floorHeight/2, 0]}>
                          <boxGeometry args={[4, floorHeight, 4]} />
                          <SmartMaterial type="concrete" year={params.year} mode={viewMode} riskScore={vulnerabilityScore} />
                      </mesh>

                      {viewMode === 'standard' && (
                          <group>
                              <mesh position={[0, floorHeight/2, depth/2]}>
                                  <boxGeometry args={[width-1, floorHeight-0.2, 0.1]} />
                                  <GlassMaterial />
                              </mesh>
                               <mesh position={[0, floorHeight/2, -depth/2]}>
                                  <boxGeometry args={[width-1, floorHeight-0.2, 0.1]} />
                                  <GlassMaterial />
                              </mesh>
                          </group>
                      )}
                 </group>
             ))}
        </group>
    );
};


// --- Main Viewer Component ---
const BuildingViewer: React.FC<BuildingViewerProps> = (props) => {
  const [viewMode, setViewMode] = useState<VisualizationMode>('standard');
  const { typology } = props.params;

  // Sync with parent props
  useEffect(() => {
      if (props.visualizationMode) setViewMode(props.visualizationMode as VisualizationMode);
  }, [props.visualizationMode]);

  // Handle emergency overrides
  useEffect(() => {
     if (props.emergencyMode) setViewMode('emergency');
     else if (viewMode === 'emergency') setViewMode('standard');
  }, [props.emergencyMode]);

  const renderModel = () => {
      const commonProps = { ...props, viewMode };
      switch (typology) {
          case 'StiltApartment': return <StiltApartmentModel {...commonProps} />;
          case 'IndianApartment': return <IndianApartmentModel {...commonProps} />;
          case 'IndustrialShed': return <IndustrialShedModel {...commonProps} />;
          case 'KutchaHouse': return <KutchaHouseModel {...commonProps} />;
          case 'Temple': return <TempleModel {...commonProps} />;
          case 'ModernHighRise': return <ModernHighRiseModel {...commonProps} />;
          case 'IndependentHouse': return <IndianApartmentModel {...commonProps} params={{...props.params, floors: 2}} />;
          default: return <ModernHighRiseModel {...commonProps} />;
      }
  };

  return (
    <div className={`w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 relative rounded-xl overflow-hidden shadow-2xl border transition-all duration-500 ${props.emergencyMode ? 'border-red-500 animate-pulse' : 'border-slate-700'}`}>
      <Canvas 
        shadows 
        camera={{ position: [40, 30, 40], fov: 35 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <CameraShaker active={props.emergencyMode} />
        <OrbitControls 
          makeDefault 
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={10}
          maxDistance={150}
        />
        
        <Center>
          {renderModel()}
        </Center>

        {/* Environment & Lighting */}
        {viewMode === 'standard' ? (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <Environment preset="city" background={false} />
          </>
        ) : (
          <group>
             <ambientLight intensity={0.2} />
             <directionalLight position={[5, 10, 5]} intensity={0.5} />
          </group>
        )}

        <Grid 
          renderOrder={-1} 
          position={[0, -5, 0]} 
          infiniteGrid 
          cellSize={1} 
          sectionSize={4} 
          fadeDistance={60} 
          sectionColor="#334155" 
          cellColor="#1e293b" 
        />
      </Canvas>
      
      {/* 3D Overlay Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded-lg pointer-events-auto shadow-xl">
          <p className="text-slate-400 text-[10px] font-mono font-bold tracking-wider mb-2 px-1">VISUALIZATION MODE</p>
          <div className="flex flex-col gap-1">
             <button 
               onClick={() => setViewMode('standard')}
               className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${viewMode === 'standard' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
             >
               <Layers className="w-3 h-3" /> Architectural
             </button>
             <button 
               onClick={() => setViewMode('heatmap')}
               className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${viewMode === 'heatmap' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
             >
               <Activity className="w-3 h-3" /> Stress Heatmap
             </button>
             <button 
               onClick={() => setViewMode('sensors')}
               className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${viewMode === 'sensors' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
             >
               <Wifi className="w-3 h-3" /> Active Sensors
             </button>
             <button 
               onClick={() => setViewMode('seismic')}
               className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${viewMode === 'seismic' ? 'bg-yellow-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
             >
               <Wind className="w-3 h-3" /> Seismic Load
             </button>
             <button 
               onClick={() => setViewMode('emergency')}
               className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${viewMode === 'emergency' ? 'bg-red-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
             >
               <LogOut className="w-3 h-3" /> Emergency Plan
             </button>
          </div>
        </div>
      </div>

      {/* Typology Badge */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded-lg text-xs font-mono text-cyan-400 pointer-events-none shadow-xl">
          {typology ? typology.replace(/([A-Z])/g, ' $1').trim() : 'High Rise'}
      </div>

      {/* Interactive Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs pointer-events-none">
         <div className="flex flex-col gap-1">
            {viewMode === 'standard' && (
                <>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                        <span className="text-slate-300">Glass / Facade</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span className="text-slate-300">Concrete / Structure</span>
                    </div>
                </>
            )}
            {viewMode === 'heatmap' && (
                 <>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-slate-300">High Stress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-slate-300">Safe Capacity</span>
                    </div>
                </>
            )}
            {viewMode === 'sensors' && (
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-green-300">IoT Active</span>
                </div>
            )}
            {props.emergencyMode && (
               <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-600 animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span className="text-red-400 font-bold">SEISMIC EVENT</span>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default BuildingViewer;