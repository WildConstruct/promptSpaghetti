// NodeTetris - Tetris game using React Flow nodes
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';

// Tetris piece shapes using different node types
const TETRIS_PIECES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    nodeType: 'textBlock',
    color: '#00FFFF',
    name: 'I-Piece'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    nodeType: 'weightedChoice',
    color: '#FFFF00',
    name: 'O-Piece'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    nodeType: 'concat',
    color: '#800080',
    name: 'T-Piece'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    nodeType: 'setVariable',
    color: '#00FF00',
    name: 'S-Piece'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    nodeType: 'getVariable',
    color: '#FF0000',
    name: 'Z-Piece'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    nodeType: 'output',
    color: '#0000FF',
    name: 'J-Piece'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    nodeType: 'postItNote',
    color: '#FFA500',
    name: 'L-Piece'
  }
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const DROP_TIME = 1000; // milliseconds

interface TetrisPiece {
  shape: number[][];
  nodeType: string;
  color: string;
  name: string;
  position: { x: number; y: number };
  rotation: number;
}

interface NodeTetrisProps {
  onExit: () => void;
  onScoreUpdate?: (score: number) => void;
}

export const NodeTetris: React.FC<NodeTetrisProps> = ({ onExit, onScoreUpdate }) => {
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrisPiece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const dropTimeRef = useRef(DROP_TIME);

  // Generate random piece
  const generatePiece = useCallback((pieceName?: keyof typeof TETRIS_PIECES): TetrisPiece => {
    const names = pieceName ? [pieceName] : Object.keys(TETRIS_PIECES);
    const randomName = names[Math.floor(Math.random() * names.length)] as keyof typeof TETRIS_PIECES;
    const piece = TETRIS_PIECES[randomName];

    return {
      ...piece,
      position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2), y: 0 },
      rotation: 0
    };
  }, []);

  // Rotate piece
  const rotatePiece = useCallback((piece: TetrisPiece): TetrisPiece => {
    const newShape = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );

    return {
      ...piece,
      shape: newShape,
      rotation: (piece.rotation + 90) % 360
    };
  }, []);

  // Check collision
  const checkCollision = useCallback((piece: TetrisPiece, board: (string | null)[][], offsetX = 0, offsetY = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.position.x + x + offsetX;
          const newY = piece.position.y + y + offsetY;

          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Place piece on board
  const placePiece = useCallback((piece: TetrisPiece, board: (string | null)[][]): (string | null)[][] => {
    const newBoard = board.map(row => [...row]);

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = piece.position.x + x;
          const boardY = piece.position.y + y;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.nodeType;
          }
        }
      }
    }

    return newBoard;
  }, []);

  // Clear completed lines
  const clearLines = useCallback((board: (string | null)[][]): { newBoard: (string | null)[][], linesCleared: number } => {
    const newBoard = board.filter(row => row.some(cell => cell === null));
    const linesCleared = BOARD_HEIGHT - newBoard.length;

    // Add empty rows at the top
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    return { newBoard, linesCleared };
  }, []);

  // Initialize game
  useEffect(() => {
    setCurrentPiece(generatePiece());
    setNextPiece(generatePiece());
  }, [generatePiece]);

  // Game loop
  useEffect(() => {
    if (!currentPiece || gameOver || paused) return;

    gameLoopRef.current = setInterval(() => {
      setCurrentPiece(prevPiece => {
        if (!prevPiece) return null;

        const newPiece = { ...prevPiece, position: { ...prevPiece.position, y: prevPiece.position.y + 1 } };

        if (checkCollision(newPiece, board)) {
          // Piece has landed
          const newBoard = placePiece(prevPiece, board);
          const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

          setBoard(clearedBoard);
          setLines(prev => prev + linesCleared);
          setScore(prev => prev + linesCleared * 100 * level);

          // Check for level up
          if (lines % 10 === 0 && lines > 0) {
            setLevel(prev => prev + 1);
            dropTimeRef.current = Math.max(100, DROP_TIME - (level - 1) * 50);
          }

          // Generate next piece
          const next = nextPiece;
          setNextPiece(generatePiece());

          if (next && checkCollision(next, clearedBoard)) {
            setGameOver(true);
            return null;
          }

          return next;
        }

        return newPiece;
      });
    }, dropTimeRef.current);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [currentPiece, board, nextPiece, gameOver, paused, level, lines, checkCollision, placePiece, clearLines, generatePiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameOver || paused) return;

      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault();
          setCurrentPiece(prev => prev && !checkCollision(prev, board, -1, 0)
            ? { ...prev, position: { ...prev.position, x: prev.position.x - 1 } }
            : prev);
          break;
        case 'ArrowRight':
          event.preventDefault();
          setCurrentPiece(prev => prev && !checkCollision(prev, board, 1, 0)
            ? { ...prev, position: { ...prev.position, x: prev.position.x + 1 } }
            : prev);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setCurrentPiece(prev => {
            if (!prev) return null;
            const newPiece = { ...prev, position: { ...prev.position, y: prev.position.y + 1 } };
            return checkCollision(newPiece, board) ? prev : newPiece;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setCurrentPiece(prev => prev ? rotatePiece(prev) : null);
          break;
        case 'Space':
          event.preventDefault();
          // Hard drop
          setCurrentPiece(prev => {
            if (!prev) return null;
            let newPiece = { ...prev };
            while (!checkCollision({ ...newPiece, position: { ...newPiece.position, y: newPiece.position.y + 1 } }, board)) {
              newPiece.position.y += 1;
            }
            return newPiece;
          });
          break;
        case 'KeyP':
          event.preventDefault();
          setPaused(prev => !prev);
          break;
        case 'Escape':
          event.preventDefault();
          onExit();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [board, checkCollision, rotatePiece, gameOver, paused, onExit]);

  // Update score
  useEffect(() => {
    onScoreUpdate?.(score);
  }, [score, onScoreUpdate]);

  // Render board
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);

    // Add current piece to display
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardX = currentPiece.position.x + x;
            const boardY = currentPiece.position.y + y;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.nodeType;
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="tetris-row">
        {row.map((cell, x) => (
          <div
            key={x}
            className={`tetris-cell ${cell ? 'filled' : 'empty'}`}
            data-node-type={cell}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="node-tetris-overlay">
      <div className="tetris-header">
        <h2>🎮 Node Tetris! 🎮</h2>
        <div className="tetris-controls">
          <button onClick={onExit} className="tetris-exit-btn">Exit Game</button>
          <button onClick={() => setPaused(!paused)} className="tetris-pause-btn">
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      <div className="tetris-game">
        <div className="tetris-board">
          {renderBoard()}
        </div>

        <div className="tetris-sidebar">
          <div className="tetris-stats">
            <div className="stat">Score: {score}</div>
            <div className="stat">Level: {level}</div>
            <div className="stat">Lines: {lines}</div>
          </div>

          <div className="tetris-next">
            <h3>Next Piece:</h3>
            {nextPiece && (
              <div className="next-piece-preview">
                {nextPiece.shape.map((row, y) => (
                  <div key={y} className="preview-row">
                    {row.map((cell, x) => (
                      <div
                        key={x}
                        className={`preview-cell ${cell ? 'filled' : 'empty'}`}
                        data-node-type={cell ? nextPiece.nodeType : null}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tetris-controls-info">
            <h3>Controls:</h3>
            <div className="control-item">← → Move</div>
            <div className="control-item">↓ Soft Drop</div>
            <div className="control-item">↑ Rotate</div>
            <div className="control-item">Space Hard Drop</div>
            <div className="control-item">P Pause</div>
            <div className="control-item">Esc Exit</div>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="tetris-game-over">
          <div className="game-over-content">
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <div className="game-over-buttons">
              <button onClick={() => window.location.reload()} className="restart-btn">
                Play Again
              </button>
              <button onClick={onExit} className="exit-btn">
                Back to Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {paused && !gameOver && (
        <div className="tetris-paused">
          <div className="paused-content">
            <h2>Paused</h2>
            <p>Press P to resume</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .node-tetris-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: monospace;
        }

        .tetris-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 800px;
          margin-bottom: 20px;
          color: white;
        }

        .tetris-controls {
          display: flex;
          gap: 10px;
        }

        .tetris-exit-btn, .tetris-pause-btn {
          padding: 8px 16px;
          background: #333;
          border: 1px solid #555;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .tetris-exit-btn:hover, .tetris-pause-btn:hover {
          background: #555;
        }

        .tetris-game {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .tetris-board {
          background: #000;
          border: 2px solid #333;
          padding: 10px;
        }

        .tetris-row {
          display: flex;
        }

        .tetris-cell {
          width: 30px;
          height: 30px;
          border: 1px solid #333;
          box-sizing: border-box;
        }

        .tetris-cell.empty {
          background: #111;
        }

        .tetris-cell.filled[data-node-type="textBlock"] {
          background: #00FFFF;
        }

        .tetris-cell.filled[data-node-type="weightedChoice"] {
          background: #FFFF00;
        }

        .tetris-cell.filled[data-node-type="concat"] {
          background: #800080;
        }

        .tetris-cell.filled[data-node-type="setVariable"] {
          background: #00FF00;
        }

        .tetris-cell.filled[data-node-type="getVariable"] {
          background: #FF0000;
        }

        .tetris-cell.filled[data-node-type="output"] {
          background: #0000FF;
        }

        .tetris-cell.filled[data-node-type="postItNote"] {
          background: #FFA500;
        }

        .tetris-sidebar {
          color: white;
          min-width: 200px;
        }

        .tetris-stats {
          margin-bottom: 20px;
        }

        .stat {
          margin: 5px 0;
          font-size: 18px;
          font-weight: bold;
        }

        .tetris-next {
          margin-bottom: 20px;
        }

        .next-piece-preview {
          background: #111;
          border: 1px solid #333;
          padding: 10px;
          display: inline-block;
        }

        .preview-row {
          display: flex;
        }

        .preview-cell {
          width: 20px;
          height: 20px;
          border: 1px solid #333;
          box-sizing: border-box;
        }

        .preview-cell.filled {
          background: #00FFFF;
        }

        .tetris-controls-info {
          font-size: 14px;
        }

        .control-item {
          margin: 3px 0;
        }

        .tetris-game-over, .tetris-paused {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .game-over-content, .paused-content {
          background: #222;
          padding: 40px;
          border-radius: 8px;
          text-align: center;
          border: 2px solid #555;
        }

        .game-over-content h2, .paused-content h2 {
          color: #ff6b6b;
          margin: 0 0 20px 0;
        }

        .game-over-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 20px;
        }

        .restart-btn, .exit-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
        }

        .restart-btn {
          background: #4CAF50;
          color: white;
        }

        .restart-btn:hover {
          background: #45a049;
        }

        .exit-btn {
          background: #f44336;
          color: white;
        }

        .exit-btn:hover {
          background: #da190b;
        }
      `}</style>
    </div>
  );
};
