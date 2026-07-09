const JEWELS = [
  [200, 130], [270, 165], [285, 235], [230, 285],
  [160, 280], [110, 220], [125, 150], [200, 200],
];

export default function MovementFace() {
  return (
    <svg
      className="watch-svg movement-svg"
      viewBox="0 0 400 400"
      role="img"
      aria-label="Aurel automatic movement, caseback view"
    >
      <defs>
        <radialGradient id="caseGradBack" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f1dfa8" />
          <stop offset="45%" stopColor="#b6913f" />
          <stop offset="100%" stopColor="#4a3a1e" />
        </radialGradient>
        <radialGradient id="plateGrad" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#3a2a20" />
          <stop offset="55%" stopColor="#1a1310" />
          <stop offset="100%" stopColor="#080505" />
        </radialGradient>
        <linearGradient id="rotorGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--gold-bright)" />
          <stop offset="100%" stopColor="var(--gold)" />
        </linearGradient>
      </defs>

      <circle cx="200" cy="200" r="190" fill="url(#caseGradBack)" />
      <circle cx="200" cy="200" r="176" fill="var(--bg)" />
      <circle cx="200" cy="200" r="168" fill="url(#plateGrad)" />

      <circle cx="200" cy="200" r="150" fill="none" stroke="var(--ink-faint)" strokeWidth="0.75" />
      <circle cx="200" cy="200" r="118" fill="none" stroke="var(--ink-faint)" strokeWidth="0.75" />

      {JEWELS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6" fill="none" stroke="var(--gold-bright)" strokeWidth="2.5" />
      ))}
      {JEWELS.map(([x, y], i) => (
        <circle key={`c${i}`} cx={x} cy={y} r="2.5" fill="var(--oxblood-bright)" opacity="0.85" />
      ))}

      <g className="movement-rotor" style={{ transformOrigin: "200px 200px" }}>
        <path
          d="M200,200 L200,90 A110,110 0 0 1 295,255 Z"
          fill="url(#rotorGrad)"
          opacity="0.9"
        />
        <circle cx="200" cy="200" r="14" fill="var(--bg)" stroke="var(--gold-bright)" strokeWidth="1.5" />
      </g>

      <text
        x="200"
        y="345"
        textAnchor="middle"
        fill="var(--ink-faint)"
        fontFamily="var(--mono)"
        fontSize="8.5"
        letterSpacing="2"
      >
        18K ROSE GOLD · SWISS MADE
      </text>
    </svg>
  );
}
