import React, { useCallback, useState, useMemo } from "react";
import { App, Typography, InputNumber, FloatButton } from "antd";
import {
  SettingOutlined,
  StepBackwardOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Timer } from "../shared";
const { Title } = Typography;

type Color = "green" | "blue" | "red" | "transparent";
type GameStatus = "active" | "ended";
const DEFAULT_HEIGHT = 8;
const DEFAULT_WIDTH = 11;

function ColorGridMinigame() {
  const [gameStatus, setGameStatus] = useState<GameStatus>("active");
  const [gridHistory, setGridHistory] = useState<Color[][][]>([
    calculateGrid(DEFAULT_HEIGHT, DEFAULT_WIDTH),
  ]);

  const [showControlPanel, setShowControlPanel] = useState(false);
  const [height, setHeight] = useState(8);
  const [width, setWidth] = useState(11);
  const [selectedGridColor, setSelectedGridColor] = useState<Color | null>(
    null
  );

  const [timerKey, setTimerKey] = useState(crypto.randomUUID());
  const [timerDuration, setTimerDuration] = useState(30);

  const { message } = App.useApp();

  const handleCellClick = useCallback(
    (colIndex: number, rowIndex: number) => {
      if (gameStatus === "ended") return;
      const latestGrid = gridHistory[gridHistory.length - 1];
      const newGrid = latestGrid.map((arr) => arr.slice());
      if (selectedGridColor) {
        newGrid[rowIndex][colIndex] = selectedGridColor;
      } else {
        const changed = recalculateGrid(
          newGrid,
          colIndex,
          rowIndex,
          newGrid[rowIndex][colIndex],
          true,
          height,
          width
        );
        if (changed) reflowGrid(newGrid);

        let hasElementsLeft = false;
        for (let i = 0; i < height; i++) {
          for (let j = 0; j < width; j++) {
            if (newGrid[i][j] !== "transparent") {
              hasElementsLeft = true;
            }
          }
        }
        if (!hasElementsLeft) {
          message.success("You win!");
          setGameStatus("ended");
        }
      }
      setGridHistory([...gridHistory, newGrid]);
    },
    [gameStatus, gridHistory, selectedGridColor, height, width, message]
  );

  const handleGridReset = useCallback(() => {
    setGridHistory([calculateGrid(height, width)]);
    setGameStatus("active");
    setTimerKey(crypto.randomUUID());
  }, [height, width]);

  const gridComponents: React.ReactNode[] = useMemo(() => {
    const grid = gridHistory[gridHistory.length - 1];
    const components: React.ReactNode[] = [];
    if (grid.length && grid[0].length) {
      for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
          components.push(
            <GridCell
              key={`${i}-${j}`}
              color={grid[i][j]}
              rowIndex={i}
              colIndex={j}
              onClick={handleCellClick}
            />
          );
        }
      }
    }
    return components;
  }, [gridHistory, handleCellClick]);

  const handleGridColorControlClick = useCallback(
    (color: Color) => {
      if (selectedGridColor === color) setSelectedGridColor(null);
      else setSelectedGridColor(color);
    },
    [selectedGridColor]
  );

  const handleGridUndo = useCallback(() => {
    if (gridHistory.length === 1 || gameStatus === "ended") return;
    const newGridHistory = gridHistory.slice(0, -1);
    setGridHistory(newGridHistory);
  }, [gameStatus, gridHistory]);

  const handleGridHeightChange = useCallback(
    (height: number | null) => {
      if (height === null) return;
      setHeight(height);
      setGridHistory([calculateGrid(height, width)]);
      setGameStatus("active");
      setTimerKey(crypto.randomUUID());
    },
    [width]
  );

  const handleGridWidthChange = useCallback(
    (width: number | null) => {
      if (width === null) return;
      setWidth(width);
      setGridHistory([calculateGrid(height, width)]);
      setGameStatus("active");
    },
    [height]
  );

  const toggleControlPanel = useCallback(() => {
    setShowControlPanel((prev) => !prev);
  }, []);

  const handleSetTimerDuration = useCallback((duration: number | null) => {
    if (duration === null) return;
    setTimerDuration(duration);
    setTimerKey(crypto.randomUUID());
  }, []);

  const handleTimerEnd = useCallback(() => {
    message.error("You lose.");
    setGameStatus("ended");
  }, [message]);

  return (
    <div
      className="colorGrid"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowX: "auto",
        overflowY: "auto",
        maxWidth: "100%",
        maxHeight: "100%",
      }}
    >
      <div
        className="grid-container"
        style={{
          width: `calc((50px * ${width}) + ${width - 1}px)`,
          height: `calc(51px * ${height})`,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))",
          gridGap: "1px",
        }}
      >
        {gridComponents}
      </div>
      <Timer
        key={timerKey}
        duration={timerDuration}
        onTimerEnd={handleTimerEnd}
        isCompleted={gameStatus === "ended"}
      />
      {!showControlPanel ? null : (
        <div
          className="control-panel"
          style={{
            position: "absolute",
            right: "16px",
            border: "1px solid white",
            padding: "12px",
            bottom: "110px",
            backgroundColor: "rgb(6, 18, 33)",
          }}
        >
          <div
            className="grid-controls"
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Title
              level={5}
              style={{
                margin: "0",
                color: "#FFF",
                display: "block",
              }}
            >
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              marginTop: "16px",
            }}
          >
            <div>
              <Title
                level={5}
                style={{
                  margin: "0",
                  color: "#FFF",
                  display: "block",
                }}
              >
                {"Height"}
              </Title>
              <InputNumber
                min={1}
                max={50}
                defaultValue={DEFAULT_HEIGHT}
                onChange={handleGridHeightChange}
                value={height}
              />
            </div>

            <div style={{ marginLeft: "8px" }}>
              <Title
                level={5}
                style={{
                  margin: "0",
                  color: "#FFF",
                  display: "block",
                }}
              >
                {"Width"}
              </Title>
              <InputNumber
                min={1}
                max={50}
                defaultValue={DEFAULT_WIDTH}
                onChange={handleGridWidthChange}
                value={width}
              />
            </div>
          </div>

          <div>
            <Title
              level={5}
              style={{
                margin: "0",
                color: "#FFF",
                display: "block",
              }}
            >
              {"Timer"}
            </Title>
            <InputNumber
              min={10}
              max={1000}
              defaultValue={30}
              onChange={handleSetTimerDuration}
              value={timerDuration}
            />
          </div>
        </div>
      )}
      <FloatButton
        icon={<SettingOutlined />}
        type="primary"
        tooltip={<div>Settings</div>}
        onClick={toggleControlPanel}
        style={{ right: 24 }}
      />
      <FloatButton
        icon={<UndoOutlined />}
        type="primary"
        tooltip={<div>Reset grid</div>}
        onClick={handleGridReset}
        style={{ right: 80 }}
      />
      <FloatButton
        icon={<StepBackwardOutlined />}
        type="primary"
        tooltip={<div>Undo</div>}
        onClick={handleGridUndo}
        style={{ right: 136 }}
      />
    </div>
  );
}

interface GridCellProps {
  color: Color;
  rowIndex: number;
  colIndex: number;
  onClick: (colIndex: number, rowIndex: number) => void;
}
function GridCell({ color, rowIndex, colIndex, onClick }: GridCellProps) {
  return (
    <div
      style={{
        backgroundColor: getHexColor(color),
        width: "50px",
        height: "50px",
      }}
      onClick={() => onClick(colIndex, rowIndex)}
    />
  );
}

interface GridColorControlProps {
  color: Color;
  selected: boolean;
  onClick: (color: Color) => void;
}
function GridColorControl({ color, selected, onClick }: GridColorControlProps) {
  return (
    <div
      style={{
        backgroundColor: getHexColor(color),
        margin: "4px",
        width: "35px",
        height: "35px",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: selected ? "black" : "transparent",
        borderRadius: "6px",
      }}
      onClick={() => onClick(color)}
    />
  );
}

function calculateGrid(height: number, width: number) {
  const grid: Color[][] = [];
  for (let i = 0; i < height; i++) {
    grid[i] = [];
    for (let j = 0; j < width; j++) {
      grid[i][j] = getRandomColor();
    }
  }
  return grid;
}

function recalculateGrid(
  grid: Color[][],
  colIndex: number,
  rowIndex: number,
  color: Color,
  first: boolean,
  height: number,
  width: number
) {
  const hasMatchingTop =
    rowIndex !== 0 && grid[rowIndex - 1][colIndex] === color;
  const hasMatchingBottom =
    rowIndex !== height - 1 && grid[rowIndex + 1][colIndex] === color;
  const hasMatchingLeft =
    colIndex !== 0 && grid[rowIndex][colIndex - 1] === color;
  const hasMatchingRight =
    colIndex !== width - 1 && grid[rowIndex][colIndex + 1] === color;

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
  if (grid[rowIndex][colIndex] === color)
    grid[rowIndex][colIndex] = "transparent";

  if (hasMatchingTop)
    recalculateGrid(grid, colIndex, rowIndex - 1, color, false, height, width);

  if (hasMatchingBottom)
    recalculateGrid(grid, colIndex, rowIndex + 1, color, false, height, width);

  if (hasMatchingLeft)
    recalculateGrid(grid, colIndex - 1, rowIndex, color, false, height, width);

  if (hasMatchingRight)
    recalculateGrid(grid, colIndex + 1, rowIndex, color, false, height, width);

  return true;
}

function reflowGrid(grid: Color[][]) {
  const height = grid.length;
  const width = grid[0].length;
  for (let j = 0; j < width; j++) {
    let bottommostAvailable: number | null = null;
    for (let i = height - 1; i >= 0; i--) {
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

  const emptyCols = new Array(width).fill(false);
  for (let j = 0; j < width; j++) {
    let colHasElements = false;
    for (let i = height - 1; i >= 0; i--) {
      if (grid[i][j] !== "transparent") {
        colHasElements = true;
      }
    }

    if (!colHasElements) emptyCols[j] = true;
  }

  let spliceCount = 0;
  for (let x = 0; x < width; x++) {
    const colIsEmpty = emptyCols[x];
    if (colIsEmpty) {
      for (let i = 0; i < height; i++) {
        const spliced = grid[i].splice(x - spliceCount, 1);
        grid[i][width - 1] = spliced[0];
      }
      spliceCount++;
    }
  }
}

function getRandomColor(): Color {
  const rand = Math.random();
  if (rand <= 0.33) return "red";
  if (rand <= 0.66) return "green";
  return "blue";
}

function getHexColor(colorString: Color) {
  if (colorString === "red") return "#BD2322";
  if (colorString === "green") return "#789E48";
  if (colorString === "blue") return "#4A83A5";
  return "transparent";
}

export default ColorGridMinigame;
