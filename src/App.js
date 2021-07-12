import React, { useState, useRef, useCallback } from 'react'
import produce from 'immer'
import { SliderPicker } from 'react-color';

import './App.css';

const numRows = 70;
const numCols = 70;
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
  const [color, setColor] = useState("#111")
  let [counter, setCounter] = useState(0)
  const [deathMode, setDeathMode] = useState(false)
  

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
          // For each cell 
          for (let i = 0; i < numRows; i++) {
            for (let k = 0; k < numCols; k++) {
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

  function handleStartSimulation() {
    setRunning(!running);
    if(!running) {
      runningRef.current = true
      runSimulation()
    }
  }
  
  // Generates new grid with new live cell
  function handleNodeClick(i,k) {
    const newGrid = produce(grid, gridCopy => {
    gridCopy[i][k] = !grid[i][k] })
    setGrid(newGrid) 
  }

  // Generates random live cell pattern
  function handleRandomizeGrid() {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(Array.from(Array(numCols), () => Math.random() > 0.6 ? 1 : 0))
    }
    setGrid(rows)
  }

  // Death Mode EasterEgg
  function handleDeathMode() {
      if (counter < 4) {
        setCounter(counter + 1) 
        setDeathMode(false)
      }
      else if (counter === 4){
        setDeathMode(true)
        handleRandomizeGrid()
        handleStartSimulation()
        setColor("#EE3633")
        setCounter(-1) 
      }
  }

  // RENDER
  return (
    <div className="page">
      <div className="title" 
        onClick={() => handleDeathMode()}
        style={{
          color: deathMode ? "#EE3633" : "#1860B6"
      }}>
        <h1>
          {deathMode ? `Conway's Game Of Death` : `Conway's Game Of Life`}
        </h1>
      </div>

      <div className="btns">
        <a  className="startBtn" 
          style={{
            backgroundColor: running ? "#EE3633" : "#1860B6",
            color: "#fff"
          }} 
          onClick={handleStartSimulation}> 
        {running ? "STOP" : "START"} 
        </a>

        <a  className="clearBtn" onClick={() => {
          setGrid(generateEmptyGrid())
          setRunning(false);
          if(running) {
            runningRef.current = false
          }
        }}> 
          CLEAR
        </a>

        <a  className="randomizeBtn" onClick={handleRandomizeGrid}>
          RANDOMIZE
        </a>

        <SliderPicker className="colorPicker"
          color={color}
          onChangeComplete={(color) => {
            setColor(color.hex)
          }}
        />

        
      </div>
    

      <div className="grid" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${numCols}, 20px)`
        }}>
        {grid.map((rows, i) => 
          rows.map((col, k) => 
            <div className="node"
            key={`${i}-${k}`}
            onClick={() => handleNodeClick(i,k)}
            style={{
              width: 20,
              height: 20,
              border: 'solid 1px grey',
              backgroundColor: grid[i][k] ? color : undefined
            }} 
            />
          ))}
      </div>

      <footer>  
          <a href="https://github.com/igorcol/conways-game-of-life">github.com/igorcol</a>
      </footer>

    </div>
  );
}

export default App;
