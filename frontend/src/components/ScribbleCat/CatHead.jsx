function CatHead() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
      {/* Cat head - half visible */}
      <ellipse cx="60" cy="70" rx="50" ry="60" fill="#FFB347"/>
      
      {/* Inner ears */}
      <path d="M 20 50 L 10 20 L 35 45 Z" fill="#FFD700"/>
      <path d="M 100 50 L 110 20 L 85 45 Z" fill="#FFD700"/>
      
      {/* Outer ears */}
      <path d="M 15 55 L 5 15 L 40 50 Z" fill="#FFB347"/>
      <path d="M 105 55 L 115 15 L 80 50 Z" fill="#FFB347"/>
      
      {/* Eyes */}
      <ellipse cx="45" cy="55" rx="8" ry="12" fill="#2C3E50"/>
      <ellipse cx="75" cy="55" rx="8" ry="12" fill="#2C3E50"/>
      
      {/* Eye highlights */}
      <ellipse cx="47" cy="52" rx="3" ry="4" fill="white"/>
      <ellipse cx="77" cy="52" rx="3" ry="4" fill="white"/>
      
      {/* Nose */}
      <path d="M 60 65 L 55 70 L 65 70 Z" fill="#FF6B9D"/>
      
      {/* Mouth */}
      <path d="M 60 70 Q 50 75 45 73" stroke="#2C3E50" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M 60 70 Q 70 75 75 73" stroke="#2C3E50" strokeWidth="2" fill="none" strokeLinecap="round"/>
      
      {/* Whiskers */}
      <line x1="10" y1="60" x2="35" y2="58" stroke="#2C3E50" strokeWidth="1.5"/>
      <line x1="10" y1="65" x2="35" y2="65" stroke="#2C3E50" strokeWidth="1.5"/>
      <line x1="110" y1="60" x2="85" y2="58" stroke="#2C3E50" strokeWidth="1.5"/>
      <line x1="110" y1="65" x2="85" y2="65" stroke="#2C3E50" strokeWidth="1.5"/>
    </svg>
  );
}

export default CatHead;