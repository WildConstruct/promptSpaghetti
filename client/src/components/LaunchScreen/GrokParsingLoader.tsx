import React from 'react';
import { motion } from 'framer-motion';

interface GrokParsingLoaderProps {
  prompt?: string;
  message?: string;
}

export default function GrokParsingLoader({
  prompt = '',
  message = 'Parsing...'
}: GrokParsingLoaderProps) {
  // Extract first few words for node labels
  const words = prompt
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0)
    .slice(0, 5);

  // Node destinations for the flowing animation (scaled 1.5x)
  const nodeDestinations = [
    { x: 225, y: 150 },
    { x: 375, y: 150 },
    { x: 270, y: 300 },
    { x: 330, y: 300 },
    { x: 345, y: 180 }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px',
        padding: '40px 20px',
        minHeight: '400px',
        width: '100%'
      }}
    >
      <svg
        width="600"
        height="450"
        viewBox="0 0 600 450"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Central pulsing node */}
        <motion.circle
          cx="300"
          cy="225"
          fill="#B3E5FC"
          stroke="#81D4FA"
          strokeWidth="3"
          initial={{ r: 15 }}
          animate={{
            r: [15, 21, 15]
          }}
          transition={{
            r: {
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut'
            }
          }}
        />

        {/* Moving nodes that flow outward */}
        {nodeDestinations.slice(0, Math.max(1, words.length)).map((dest, i) => (
          <motion.g key={i}>
            {/* Connecting line - drawn by the moving circle */}
            <motion.line
              x1="300"
              y1="225"
              x2="300"
              y2="225"
              stroke="#81D4FA"
              strokeWidth="2"
              initial={{ opacity: 0 }}
              animate={{
                x2: [300, dest.x],
                y2: [225, dest.y],
                opacity: [0, 0.6, 0.6, 0]
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: 'easeOut'
              }}
            />

            {/* Node */}
            <motion.circle
              cx="300"
              cy="225"
              r="9"
              fill="#E0F7FA"
              stroke="#81D4FA"
              strokeWidth="3"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0.8],
                cx: [300, dest.x],
                cy: [225, dest.y]
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: 'easeOut'
              }}
            />

            {/* Label - moves with the circle */}
            <motion.text
              fontSize="16"
              fill="#B3E5FC"
              textAnchor="middle"
              initial={{ opacity: 0, x: 300, y: 225 }}
              animate={{
                opacity: [0, 0, 1, 1, 0],
                // Adjust x position - bottom text goes to outer side of circle
                x:
                  dest.y > 225
                    ? [
                        300 + (dest.x - 300) * 0.15,
                        dest.x < 300 ? dest.x - 15 : dest.x + 15
                      ] // Bottom: offset based on which side
                    : [300, dest.x], // Top/side nodes centered
                // Adjust y position - bottom text goes below circle
                y:
                  dest.y > 225
                    ? [250, dest.y + 25] // Bottom nodes: start lower, end below circle
                    : [225, dest.y - 20] // Top/side nodes above circle
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: 'easeOut'
              }}
            >
              {words[i] || `Node${i + 1}`}
            </motion.text>
          </motion.g>
        ))}

        {/* Glow effect for central node */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Animated glow ring */}
        <motion.circle
          cx="300"
          cy="225"
          r="30"
          fill="none"
          stroke="#81D4FA"
          strokeWidth="1.5"
          filter="url(#glow)"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
            r: [22, 37, 45]
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeOut'
          }}
        />
      </svg>
      <span
        style={{
          color: '#b3e5fc',
          fontSize: '1rem',
          letterSpacing: '0.03em'
        }}
      >
        {message}
      </span>
    </div>
  );
}
