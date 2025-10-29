// Simple loading placeholder while 3D plant loads
function PlantPlaceholder() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      borderRadius: '1rem',
      fontSize: '4rem'
    }}>
      🌱
    </div>
  );
}

export default PlantPlaceholder;
