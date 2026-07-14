// Logos.jsx — logos placeholder para ministerios, en la paleta de marca
// (el usuario reemplazará estos por sus logos definitivos más adelante)

export function LogoMIA({ className = '' }) {
  return (
    <svg viewBox="0 0 200 200" className={className}>
      <circle cx="100" cy="100" r="96" fill="#024293" />
      <circle cx="100" cy="100" r="96" fill="none" stroke="#FFCD02" strokeWidth="6" />
      {/* estrella sencilla — motivo infantil */}
      <path
        d="M100 48 L111 82 L147 82 L118 103 L129 137 L100 116 L71 137 L82 103 L53 82 L89 82 Z"
        fill="#FFCD02"
      />
      <text
        x="100"
        y="172"
        textAnchor="middle"
        fontFamily="'Work Sans', sans-serif"
        fontWeight="700"
        fontSize="26"
        fill="#FFFFFF"
        letterSpacing="2"
      >
        M.I.A
      </text>
    </svg>
  );
}

export function LogoMJP({ className = '' }) {
  return (
    <svg viewBox="0 0 200 200" className={className}>
      <circle cx="100" cy="100" r="96" fill="#FFCD02" />
      <circle cx="100" cy="100" r="96" fill="none" stroke="#024293" strokeWidth="6" />
      {/* llama — motivo juvenil */}
      <path
        d="M100 46 C118 70 128 88 122 108 C118 122 106 130 100 138 C94 130 82 122 78 108 C72 88 82 70 100 46 Z"
        fill="#E1011D"
      />
      <path
        d="M100 78 C108 92 112 102 108 114 C106 122 102 126 100 130 C98 126 94 122 92 114 C88 102 92 92 100 78 Z"
        fill="#024293"
      />
      <text
        x="100"
        y="172"
        textAnchor="middle"
        fontFamily="'Work Sans', sans-serif"
        fontWeight="700"
        fontSize="24"
        fill="#024293"
        letterSpacing="2"
      >
        M.J.P
      </text>
    </svg>
  );
}
