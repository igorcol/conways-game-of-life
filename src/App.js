import React, { useState, useRef, useCallback } from 'react'
import produce from 'immer'

import './App.css';

const numRows = 70;
const numCols = 70;
const activeNodeColor = "black"
const delay = 100

// Node neighbors index
const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0]
]

function generateEmptyGrid() {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0))
  }
  return rows
}

function App() {
  const [running, setRunning] = useState(false)

  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid()
  })

  const runningRef = useRef(running)
  runningRef.current = running

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }
      /*
        1. Any live cell with fewer than two or more than three live neighbors dies 
        2. Any live cell with two or three live neighbors lives  
        3. Any dead cell with exactly three live neighbors become a live cell
      */
      setGrid(g => {
        return produce(g, gridCopy => {
          for (let i = 0; i < numRows; i++) {
            for (let k = 0; k < numCols; k++) {
              // For each cell 
              let neighbors = 0;
              // Get neighbors
              operations.forEach(([x, y]) => {
                const newI = i + x
                const newK = k + y
                // Check neighbors boundaries
                if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
                  neighbors += g[newI][newK]
                }
              })

              // *1 
              if (neighbors < 2 || neighbors > 3) {
                gridCopy[i][k] = 0;
              }
              // *3
              else if (g[i][k] === 0 && neighbors === 3) {
                gridCopy[i][k] = 1;
              }

            }
          }
        })
      }) 
    setTimeout(runSimulation, delay)
  }, [])


  return (
    <div className="page">

      <div className="title">
        <h1>Conway's Game Of Life</h1>
      </div>

      <div className="btns">
        <a  className="startBtn" 
        style={{
          backgroundColor: running ? "#EE3633" : "#1860B6"
        }} 
        onClick={() => {
          setRunning(!running);
          if(!running) {
            runningRef.current = true
            runSimulation()
          }
        }}> {running ? "STOP" : "START"} </a>

        <a  className="clearBtn" onClick={() => {
          setGrid(generateEmptyGrid())
          setRunning(false);
          if(running) {
            runningRef.current = false
          }
        }}>CLEAR</a>

        <a  className="randomizeBtn" onClick={() => {
          const rows = [];
          for (let i = 0; i < numRows; i++) {
            rows.push(Array.from(Array(numCols), () => Math.random() > 0.6 ? 1 : 0))
          }
          setGrid(rows)
        }}>RANDOMIZE</a>

        
      </div>

      <div className="grid" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${numCols}, 20px)`
        }}>
        {grid.map((rows, i) => 
          rows.map((col, k) => 
            <div className="node"
            key={`${i}-${k}`}
            onClick={() => {
              const newGrid = produce(grid, gridCopy => {
                gridCopy[i][k] = !grid[i][k]
              })
              setGrid(newGrid)
            }}
            style={{
              width: 20,
              height: 20,
              border: 'solid 1px grey',
              backgroundColor: grid[i][k] ? activeNodeColor : undefined
            }} 
            />
          ))}
      </div>

    </div>
  );
}

export default App;
