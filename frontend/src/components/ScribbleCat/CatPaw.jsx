function CatPaw() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      {/* Main paw pad */}
      <ellipse cx="20" cy="25" rx="12" ry="10" fill="#FFB347"/>
      
      {/* Toe beans */}
      <ellipse cx="12" cy="12" rx="5" ry="6" fill="#FFD700"/>
      <ellipse cx="20" cy="10" rx="5" ry="6" fill="#FFD700"/>
      <ellipse cx="28" cy="12" rx="5" ry="6" fill="#FFD700"/>
      
      {/* Bottom bean */}
      <ellipse cx="20" cy="20" rx="4" ry="5" fill="#FFD700"/>
    </svg>
  );
}

export default CatPaw;