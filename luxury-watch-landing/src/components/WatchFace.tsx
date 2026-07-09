const TICKS = Array.from({ length: 60 }, (_, i) => i);

export default function WatchFace() {
  return (
    <svg
      className="watch-svg"
      viewBox="0 0 400 400"
      role="img"
      aria-label="Aurel Sovereign automatic wristwatch"
    >
      <defs>
        <radialGradient id="caseGrad" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f1dfa8" />
          <stop offset="45%" stopColor="#b6913f" />
          <stop offset="100%" stopColor="#4a3a1e" />
        </radialGradient>
        <radialGradient id="dialGrad" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#241512" />
          <stop offset="100%" stopColor="#080504" />
        </radialGradient>
        <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7a1f22" />
          <stop offset="100%" stopColor="#3d1012" />
        </linearGradient>
      </defs>

      <circle className="watch-case" cx="200" cy="200" r="192" fill="url(#caseGrad)" />
      <circle cx="200" cy="200" r="182" fill="url(#bezelGrad)" />
      <circle cx="200" cy="200" r="174" fill="var(--bg)" />
      <circle className="watch-dial" cx="200" cy="200" r="166" fill="url(#dialGrad)" />

      <g className="watch-ticks">
        {TICKS.map((i) => {
          const angle = (i / 60) * 360;
          const major = i % 5 === 0;
          const r1 = major ? 138 : 150;
          const r2 = 160;
          return (
            <line
              key={i}
              x1={200 + r1 * Math.sin((angle * Math.PI) / 180)}
              y1={200 - r1 * Math.cos((angle * Math.PI) / 180)}
              x2={200 + r2 * Math.sin((angle * Math.PI) / 180)}
              y2={200 - r2 * Math.cos((angle * Math.PI) / 180)}
              stroke={major ? "var(--gold-bright)" : "var(--ink-faint)"}
              strokeWidth={major ? 2.5 : 1}
            />
          );
        })}
      </g>

      <circle
        className="watch-accent-ring"
        cx="200"
        cy="200"
        r="122"
        fill="none"
        stroke="var(--oxblood-bright)"
        strokeWidth="0.75"
        strokeDasharray="1 5"
        opacity="0.6"
      />

      <text
        x="200"
        y="118"
        textAnchor="middle"
        fill="var(--ink-dim)"
        fontFamily="var(--display)"
        fontSize="15"
        letterSpacing="5"
      >
        AUREL
      </text>
      <text
        x="200"
        y="288"
        textAnchor="middle"
        fill="var(--ink-faint)"
        fontFamily="var(--mono)"
        fontSize="8.5"
        letterSpacing="2"
      >
        CHRONOMETER · 100M
      </text>

      <circle
        className="watch-subdial"
        cx="200"
        cy="246"
        r="32"
        fill="none"
        stroke="var(--oxblood-bright)"
        strokeWidth="1"
        opacity="0.7"
      />
      <line
        className="watch-second-hand"
        x1="200"
        y1="246"
        x2="200"
        y2="220"
        stroke="var(--oxblood-bright)"
        strokeWidth="1.5"
      />

      <line
        className="watch-hour-hand"
        x1="200"
        y1="200"
        x2="200"
        y2="120"
        stroke="var(--ink)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        className="watch-minute-hand"
        x1="200"
        y1="200"
        x2="200"
        y2="82"
        stroke="var(--ink)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      <circle cx="200" cy="200" r="7" fill="var(--gold-bright)" />
      <circle cx="200" cy="200" r="3" fill="var(--oxblood-bright)" />

      <rect className="watch-crown" x="388" y="188" width="18" height="24" rx="3" fill="url(#caseGrad)" />
    </svg>
  );
}
