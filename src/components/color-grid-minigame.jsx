import React, { useEffect, useCallback, useState } from "react";
import { App, Button, Typography } from "antd";
const { Title } = Typography;

const HEIGHT = 8;
const WIDTH = 11;

function ColorGridMinigame() {
  const [grid, setGrid] = useState(calculateGrid());
  const [selectedGridColor, setSelectedGridColor] = useState(null);
  const [gridHistory, setGridHistory] = useState([]);

  const { message } = App.useApp();

  const handleCellClick = useCallback(
    (i, j) => {
      let historyGrid = grid.map((arr) => arr.slice());
      let newGrid = grid.map((arr) => arr.slice());
      if (selectedGridColor) {
        newGrid[i][j] = selectedGridColor;
      } else {
        const changed = recalculateGrid(newGrid, j, i, newGrid[i][j], true);
        if (changed) reflowGrid(newGrid);
      }
      setGrid(newGrid);
      setGridHistory([...gridHistory, historyGrid]);
    },
    [grid, selectedGridColor, gridHistory]
  );

  const handleGridReset = useCallback(() => {
    setGridHistory([]);
    setGrid(calculateGrid());
  }, []);

  useEffect(() => {
    let hasElementsLeft = false;
    for (let i = 0; i < HEIGHT; i++) {
      for (let j = 0; j < WIDTH; j++) {
        if (grid[i][j] !== "transparent") {
          hasElementsLeft = true;
        }
      }
    }
    if (!hasElementsLeft) message.success("You win!");
  }, [grid, message]);

  const gridComponents = [];
  if (grid.length) {
    for (let i = 0; i < HEIGHT; i++) {
      for (let j = 0; j < WIDTH; j++) {
        gridComponents.push(
          <GridCell
            key={`${i}-${j}`}
            color={grid[i][j]}
            j={j}
            i={i}
            onClick={handleCellClick}
          />
        );
      }
    }
  }

  const handleGridColorControlClick = useCallback(
    (color) => {
      if (selectedGridColor === color) setSelectedGridColor(null);
      else setSelectedGridColor(color);
    },
    [selectedGridColor]
  );

  const handleGridUndo = useCallback(() => {
    const prevGrid = gridHistory[gridHistory.length - 1];
    const newGridHistory = gridHistory.slice(0, -1);
    setGridHistory(newGridHistory);
    setGrid(prevGrid);
  }, [setGrid, gridHistory, setGridHistory]);

  return (
    <div
      className="colorGrid"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        className="grid-container"
        style={{
          width: `calc((50px * ${WIDTH}) + ${WIDTH - 1}px)`,
          height: `calc(50px * ${HEIGHT})`,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))",
          gridGap: "1px",
        }}
      >
        {gridComponents}
      </div>
      <div style={{ display: "flex", marginTop: "16px" }}>
        <Button
          type="primary"
          onClick={handleGridUndo}
          style={{ display: "flex" }}
          disabled={gridHistory.length === 0}
        >
          Undo
        </Button>

        <Button
          type="primary"
          onClick={handleGridReset}
          style={{ display: "flex", marginLeft: "8px" }}
        >
          Reload grid
        </Button>
      </div>
      <div
        className="grid-controls"
        style={{ display: "flex", alignItems: "center", marginTop: "16px" }}
      >
        <Title level={5} style={{ textAlign: "left", margin: "0" }}>
          {"Modify grid: "}
        </Title>
        <div style={{ display: "flex" }}>
          <GridColorControl
            color="green"
            selected={selectedGridColor === "green"}
            onClick={handleGridColorControlClick}
          />
          <GridColorControl
            color="blue"
            selected={selectedGridColor === "blue"}
            onClick={handleGridColorControlClick}
          />
          <GridColorControl
            color="red"
            selected={selectedGridColor === "red"}
            onClick={handleGridColorControlClick}
          />
        </div>
      </div>
    </div>
  );
}

function GridCell(props) {
  return (
    <div
      style={{ backgroundColor: props.color, width: "50px", height: "50px" }}
      onClick={() => props.onClick(props.i, props.j)}
    />
  );
}

function GridColorControl(props) {
  return (
    <div
      style={{
        backgroundColor: props.color,
        margin: "4px",
        width: "35px",
        height: "35px",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: props.selected ? "black" : "transparent",
        borderRadius: "6px",
      }}
      onClick={() => props.onClick(props.color)}
    />
  );
}

function calculateGrid() {
  const grid = [];
  for (let i = 0; i < HEIGHT; i++) {
    grid[i] = [];
    for (let j = 0; j < WIDTH; j++) {
      grid[i][j] = getRandomColor();
    }
  }
  return grid;
}

function recalculateGrid(grid, j, i, color, first) {
  let hasMatchingTop = i !== 0 && grid[i - 1][j] === color;
  let hasMatchingBottom = i !== HEIGHT - 1 && grid[i + 1][j] === color;
  let hasMatchingLeft = j !== 0 && grid[i][j - 1] === color;
  let hasMatchingRight = j !== WIDTH - 1 && grid[i][j + 1] === color;

  if (color === "transparent") return false;
  if (
    first &&
    !hasMatchingTop &&
    !hasMatchingBottom &&
    !hasMatchingLeft &&
    !hasMatchingRight
  )
    return false;

  // Update clicked cell color
  if (grid[i][j] === color) grid[i][j] = "transparent";

  if (hasMatchingTop) recalculateGrid(grid, j, i - 1, color, false);

  if (hasMatchingBottom) recalculateGrid(grid, j, i + 1, color, false);

  if (hasMatchingLeft) recalculateGrid(grid, j - 1, i, color, false);

  if (hasMatchingRight) recalculateGrid(grid, j + 1, i, color, false);

  return true;
}

function reflowGrid(grid) {
  for (let j = 0; j < WIDTH; j++) {
    let bottommostAvailable = null;
    for (let i = HEIGHT - 1; i >= 0; i--) {
      if (!bottommostAvailable && grid[i][j] === "transparent")
        bottommostAvailable = i;
      else if (bottommostAvailable !== null) {
        if (grid[i][j] !== "transparent") {
          grid[bottommostAvailable--][j] = grid[i][j];
        }
        grid[i][j] = "transparent";
      }
    }
  }

  const emptyCols = new Array(WIDTH).fill(false);
  for (let j = 0; j < WIDTH; j++) {
    let colHasElements = false;
    for (let i = HEIGHT - 1; i >= 0; i--) {
      if (grid[i][j] !== "transparent") {
        colHasElements = true;
      }
    }

    if (!colHasElements) emptyCols[j] = true;
  }

  let spliceCount = 0;
  for (let x = 0; x < WIDTH; x++) {
    const colIsEmpty = emptyCols[x];
    if (colIsEmpty) {
      for (let i = 0; i < HEIGHT; i++) {
        const spliced = grid[i].splice(x - spliceCount, 1);
        grid[i][WIDTH - 1] = spliced[0];
      }
      spliceCount++;
    }
  }
}

function getRandomColor() {
  const rand = Math.random();
  if (rand <= 0.33) return "red";
  if (rand <= 0.66) return "green";
  return "blue";
}

export default ColorGridMinigame;
