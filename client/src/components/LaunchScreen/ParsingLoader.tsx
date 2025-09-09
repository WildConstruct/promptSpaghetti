import React from 'react';
import { motion } from 'framer-motion';

interface ParsingLoaderProps {
  prompt?: string;
  message?: string;
}

export default function ParsingLoader({
  prompt = '',
  message = 'Parsing your prompt...'
}: ParsingLoaderProps) {
  // Use the actual prompt text or fall back to the message
  const text = prompt.trim() || message;

  // Split into words, limiting to avoid overflow
  const words = text
    .split(/\s+/)
    .filter(w => w.length > 0)
    .slice(0, 8); // Limit to 8 words for display
  const nodes = words.length > 0 ? words : message.split(' ');

  const nodeRadius = 23;
  const nodeSpacing = 74;
  const width = Math.min(nodeSpacing * nodes.length, 800); // Cap width
  const height = 120;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '30px',
        padding: '60px 20px',
        background: 'transparent',
        minHeight: '300px',
        width: '100%'
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ display: 'block', margin: 'auto' }}
      >
        {nodes.map((word, i) => (
          <React.Fragment key={i}>
            {/* Node with word pop-in */}
            <motion.g
              animate={{ scale: [1, 1.16, 1], opacity: [0.7, 1, 0.7] }}
              transition={{
                repeat: Infinity,
                duration: 1.2 + i * 0.12,
                delay: i * 0.16,
                repeatType: 'loop'
              }}
            >
              <circle
                cx={nodeSpacing / 2 + i * nodeSpacing}
                cy={height / 2}
                r={nodeRadius}
                fill="#667eea"
                opacity={0.9}
                filter="url(#shadow)"
              />
              <motion.text
                x={nodeSpacing / 2 + i * nodeSpacing}
                y={height / 2 + 6}
                textAnchor="middle"
                fontSize="12"
                fill="#fff"
                style={{ fontWeight: 600 }}
                animate={{ opacity: [0.25, 1, 0.25], scale: [0.92, 1.1, 0.92] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: i * 0.13,
                  repeatType: 'loop'
                }}
              >
                {word.length > 8 ? word.slice(0, 7) + '…' : word}
              </motion.text>
            </motion.g>
            {/* Connecting lines */}
            {i > 0 && (
              <motion.line
                x1={nodeSpacing / 2 + (i - 1) * nodeSpacing + nodeRadius}
                y1={height / 2}
                x2={nodeSpacing / 2 + i * nodeSpacing - nodeRadius}
                y2={height / 2}
                stroke="#8969e7"
                strokeWidth={3}
                animate={{
                  strokeDashoffset: [8, 0, 8],
                  strokeDasharray: '8 8'
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.7,
                  delay: i * 0.09
                }}
              />
            )}
          </React.Fragment>
        ))}
        {/* Shadow filter */}
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              floodColor="#988af9"
              floodOpacity="0.61"
            />
          </filter>
        </defs>
      </svg>

      {/* Loading message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          color: '#e1e1e1',
          fontSize: '16px',
          textAlign: 'center',
          fontWeight: 500
        }}
      >
        <motion.span
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'easeInOut'
          }}
        >
          AI-Enhanced parsing in progress
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'easeInOut',
            delay: 0.5
          }}
          style={{ marginLeft: '2px' }}
        >
          ...
        </motion.span>
      </motion.div>
    </div>
  );
}
