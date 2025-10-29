// Dramatic lighting for depth and contrast
function Lighting() {
  return (
    <>
      {/* Low ambient for contrast */}
      <ambientLight
        intensity={0.15}
        color="#0a0a0f"
      />
      
      {/* Back/side key light for rim and depth */}
      <directionalLight
        position={[-3, 2, -4]}
        intensity={0.6}
        color="#ffffff"
      />
      
      {/* Soft fill from camera side */}
      <directionalLight
        position={[2, 1, 3]}
        intensity={0.15}
        color="#8888aa"
      />
    </>
  );
}

export default Lighting;
