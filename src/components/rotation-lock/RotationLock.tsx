import { useCallback, useMemo, useState, useEffect } from "react";
import {
  App,
  Button,
  Checkbox,
  FloatButton,
  InputNumber,
  Typography,
} from "antd";
import { SettingOutlined, UndoOutlined } from "@ant-design/icons";
import type { CheckboxProps } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { segment } from "./circle-segment-generator";
import { Timer } from "../shared";
const { Title, Text } = Typography;
import "./styles.css";

interface Data {
  location: number;
  color: Color;
}

type Color = "blue" | "red" | "yellow";
type LayerStatus = "active" | "inactive" | "failed" | "passed";

const DEFAULT_LAYER_COUNT = 4;

export function RotationLock() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [layerStatuses, setLayerStatuses] = useState<LayerStatus[]>([
    "active",
    ...new Array(DEFAULT_LAYER_COUNT - 1).fill("inactive"),
  ]);

  const [timerKey, setTimerKey] = useState(crypto.randomUUID());
  const [timerDuration, setTimerDuration] = useState(20);
  const [timerEnabled, setTimerEnabled] = useState(true);

  const [gameKey, setGameKey] = useState(crypto.randomUUID());

  const [showControlPanel, setShowControlPanel] = useState(false);
  const [layerCount, setLayerCount] = useState(DEFAULT_LAYER_COUNT);
  const [allowFailures, setAllowFailures] = useState(false);

  const [lockData, setLockData] = useState(
    generateLockData(
      Array.from({ length: DEFAULT_LAYER_COUNT }, () => ({
        keyMin: 4,
        keyMax: 7,
        circleMin: 9,
        circleMax: 11,
      })),
    ),
  );
  const { keyData, circleData } = lockData;

  const [layerRotations, setLayerRotations] = useState<number[]>(
    new Array(DEFAULT_LAYER_COUNT).fill(0),
  );

  const { message } = App.useApp();

  const handleResult = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        if (activeLayer === layerCount - 1) {
          message.success("You've unlocked the lock!");
        } else {
          message.success("Correct!");
        }

        const updatedLayerStatuses = [...layerStatuses];
        updatedLayerStatuses[activeLayer] = "passed";

        if (activeLayer < layerCount - 1) {
          updatedLayerStatuses[activeLayer + 1] = "active";
        }
        setLayerStatuses(updatedLayerStatuses);
        setActiveLayer(Math.min(activeLayer + 1, layerCount - 1));
      } else {
        message.error("Failed");
        if (!allowFailures) {
          const updatedLayerStatuses = [...layerStatuses];
          updatedLayerStatuses[activeLayer] = "failed";
          setLayerStatuses(updatedLayerStatuses);
        }
      }
    },
    [activeLayer, allowFailures, layerCount, layerStatuses, message],
  );

  const handleRotation = useCallback(
    (rotation: number) => {
      if (layerStatuses[activeLayer] !== "active") return;
      const updatedLayerRotations = [...layerRotations];
      updatedLayerRotations[activeLayer] += rotation;
      setLayerRotations(updatedLayerRotations);
    },
    [activeLayer, layerRotations, layerStatuses],
  );

  const handleUnlock = useCallback(() => {
    const layerKeyData = keyData[activeLayer];
    const layerCircleData = circleData[activeLayer];
    const layerRotation = layerRotations[activeLayer];
    let isCorrect = true;

    // check if circles are aligned with keys
    const circleMap = new Map<number, Color>();
    layerCircleData.forEach((circle) => {
      let adjustedLocation = circle.location + layerRotation;
      while (adjustedLocation < 0) adjustedLocation += 360;
      circleMap.set(adjustedLocation % 360, circle.color);
    });

    layerKeyData.forEach((key) => {
      const keyLocation = key.location;
      const circleColor = circleMap.get(keyLocation);
      if (!circleColor || circleColor !== key.color) {
        isCorrect = false;
      }
    });

    handleResult(isCorrect);
  }, [activeLayer, circleData, handleResult, keyData, layerRotations]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (layerStatuses[activeLayer] !== "active") return;

      if (e.key === "ArrowLeft") {
        handleRotation(-30);
      } else if (e.key === "ArrowRight") {
        handleRotation(30);
      } else if (e.key === "Enter" || e.key === " ") {
        handleUnlock();
      }
    },
    [activeLayer, handleRotation, handleUnlock, layerStatuses],
  );

  const handleTimerEnd = useCallback(() => {
    setLayerStatuses((prevLayerStatuses) => {
      const newLayerStatuses = prevLayerStatuses.map((status) =>
        status === "passed" ? "passed" : "failed",
      );

      return newLayerStatuses;
    });
    message.error("You lose");
  }, [message]);

  const toggleControlPanel = useCallback(() => {
    setShowControlPanel((prev) => !prev);
  }, []);

  const handleSetTimerDuration = useCallback((duration: number | null) => {
    if (duration === null) return;
    setTimerDuration(duration);
    setTimerKey(crypto.randomUUID());
  }, []);

  const handleTimerToggle: CheckboxProps["onChange"] = useCallback(
    (e: CheckboxChangeEvent) => {
      setTimerEnabled(e.target.checked);
    },
    [],
  );

  const handleReset = useCallback(() => {
    setGameKey(crypto.randomUUID());
    setTimerKey(crypto.randomUUID());
    setActiveLayer(0);
    setLayerStatuses(["active", ...new Array(layerCount).fill("inactive")]);
    setLayerRotations(new Array(layerCount).fill(0));
    setLockData(
      generateLockData(
        Array.from({ length: layerCount }, () => ({
          keyMin: 4,
          keyMax: 7,
          circleMin: 9,
          circleMax: 11,
        })),
      ),
    );
  }, [layerCount]);

  const handleLayerCountChange = useCallback((newLayerCount: number | null) => {
    if (newLayerCount === null) return;
    setLayerCount(newLayerCount);
    setGameKey(crypto.randomUUID());
    setTimerKey(crypto.randomUUID());
    setActiveLayer(0);
    setLayerStatuses(["active", ...new Array(newLayerCount).fill("inactive")]);
    setLayerRotations(new Array(newLayerCount).fill(0));
    setLockData(
      generateLockData(
        Array.from({ length: newLayerCount }, () => ({
          keyMin: 4,
          keyMax: 7,
          circleMin: 9,
          circleMax: 11,
        })),
      ),
    );
  }, []);

  const handleAllowFailuresToggle = useCallback(() => {
    setAllowFailures((prev) => !prev);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const isGameOver = useMemo(
    () =>
      layerStatuses.some((status) => status === "failed") ||
      layerStatuses.every((status) => status === "passed"),
    [layerStatuses],
  );

  const lockLayerComponents = Array.from({ length: layerCount }, (_, i) => (
    <LockLayer
      key={`${gameKey}-${i}`}
      status={layerStatuses[i]}
      rotation={layerRotations[i]}
      keyData={keyData[i]}
      circleData={circleData[i]}
      trackSize={(i + 1) * 100}
    />
  ));

  return (
    <>
      <div
        className="container"
        style={{
          width: `${layerCount * 100 + 50}px`,
          height: `${layerCount * 100 + 50}px`,
        }}
      >
        <DegreeGuides layerCount={layerCount} />
        <div
          className={`lock-container ${isGameOver ? "game-over" : ""}`}
          style={{
            width: `${layerCount * 100 + 50}px`,
            height: `${layerCount * 100 + 50}px`,
          }}
        >
          {lockLayerComponents}
        </div>

        <div className="rotate-button-container">
          <Button
            type="primary"
            onClick={() => handleRotation(-30)}
            style={{ marginRight: "8px" }}
            block
            disabled={isGameOver}
          >
            Rotate left
          </Button>

          <Button
            type="primary"
            onClick={() => handleRotation(30)}
            block
            disabled={isGameOver}
          >
            Rotate right
          </Button>
        </div>
        <div>
          <Button
            type="primary"
            onClick={handleUnlock}
            block
            disabled={isGameOver}
          >
            Unlock
          </Button>
        </div>

        {!timerEnabled ? null : (
          <Timer
            key={timerKey}
            duration={timerDuration}
            onTimerEnd={handleTimerEnd}
            isCompleted={isGameOver}
          />
        )}
      </div>
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
          <div>
            <Title
              level={5}
              style={{
                margin: "0",
                color: "#FFF",
                display: "block",
              }}
            >
              {"Layers"}
            </Title>
            <InputNumber
              min={2}
              max={8}
              defaultValue={4}
              onChange={handleLayerCountChange}
              value={layerCount}
            />
          </div>
          <div style={{ marginTop: "8px" }}>
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
            <div>
              <Checkbox checked={timerEnabled} onChange={handleTimerToggle} />
              <InputNumber
                min={10}
                max={1000}
                defaultValue={20}
                onChange={handleSetTimerDuration}
                value={timerDuration}
                disabled={!timerEnabled}
                style={{
                  width: "65px",
                  marginLeft: "8px",
                }}
              />
            </div>
          </div>
          <Checkbox
            checked={allowFailures}
            onChange={handleAllowFailuresToggle}
            style={{ marginTop: "8px" }}
          >
            <Title level={5} style={{ color: "white", margin: "0" }}>
              {"Allow failures"}
            </Title>
          </Checkbox>
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
        tooltip={<div>Reset</div>}
        onClick={handleReset}
        style={{ right: 80 }}
      />
    </>
  );
}

interface LockLayerProps {
  status: LayerStatus;
  rotation: number;
  keyData: Data[];
  circleData: Data[];
  trackSize: number;
}
function LockLayer(props: LockLayerProps) {
  return (
    <div
      className={`lock-layer ${props.status}`}
      style={{
        width: `${props.trackSize + 50}px`,
        height: `${props.trackSize + 50}px`,
      }}
    >
      <svg
        className="svg-key"
        style={{
          width: `${props.trackSize + 50}px`,
          height: `${props.trackSize + 50}px`,
        }}
        viewBox={`0 0 ${props.trackSize + 50} ${props.trackSize + 50}`}
      >
        {props.keyData.map((keyData, index) => {
          return (
            <path
              className={`key ${keyData.color}`}
              key={index}
              d={segment(keyData.location / 30, props.trackSize + 50)}
            />
          );
        })}
      </svg>
      <div
        className="circle-track"
        style={{
          transform: `rotate(${props.rotation}deg)`,
          width: `${props.trackSize}px`,
          height: `${props.trackSize}px`,
        }}
      >
        {props.circleData.map((circleData, index) => (
          <div
            key={index}
            className={`circle ${circleData.color}`}
            style={{
              transform: `translate(-50%, -50%) rotate(${
                circleData.location
              }deg) translate(${props.trackSize / 2}px) rotate(-${
                circleData.location
              }deg)`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

interface DegreeGuidesProps {
  layerCount: number;
}
function DegreeGuides({ layerCount }: DegreeGuidesProps) {
  return (
    <>
      <div className="guide" style={{ height: `${layerCount * 100}px` }} />
      <div className="guide" style={{ height: `${layerCount * 100}px` }} />
      <div className="guide" style={{ height: `${layerCount * 100}px` }} />
      <div className="guide" style={{ height: `${layerCount * 100}px` }} />
      <div className="guide" style={{ height: `${layerCount * 100}px` }} />
      <div className="guide" style={{ height: `${layerCount * 100}px` }} />
    </>
  );
}

function getRandomColor(): Color {
  const colors = ["blue", "red", "yellow"];
  return colors[Math.floor(Math.random() * colors.length)] as Color;
}

interface LayerDetails {
  keyMin: number;
  keyMax: number;
  circleMin: number;
  circleMax: number;
}

function generateLockData(layerDetails: LayerDetails[]) {
  const keyData: Data[][] = [];
  const circleData: Data[][] = [];

  for (let i = 0; i < layerDetails.length; i++) {
    const occupiedLocations = new Set();
    const keyCount =
      Math.floor(
        Math.random() * (layerDetails[i].keyMax - layerDetails[i].keyMin + 1),
      ) + layerDetails[i].keyMin;
    const generatedKeyData: Data[] = Array.from({ length: keyCount }, () => {
      let location = Math.floor(Math.random() * 12) * 30;
      while (occupiedLocations.has(location)) {
        location = Math.floor(Math.random() * 12) * 30;
      }

      occupiedLocations.add(location);
      return {
        location: location,
        color: getRandomColor(),
      };
    });

    // circle data should match key data with additional data
    // 1. match the color and location of the key data & rotate
    const randomRotation = Math.floor(Math.random() * 12) * 30;
    const generatedCircleData = generatedKeyData.map((keyData) => ({
      location: (keyData.location + randomRotation) % 360,
      color: keyData.color,
    }));
    // 2. add additional circle data
    const minCircleCount = Math.max(keyCount, layerDetails[i].keyMin);
    const totalCircleCount =
      Math.floor(
        Math.random() * (layerDetails[i].circleMax - minCircleCount + 1),
      ) + minCircleCount;
    for (let i = 0; i < totalCircleCount - 7; i++) {
      let location = Math.floor(Math.random() * 12) * 30;
      while (occupiedLocations.has(location)) {
        location = Math.floor(Math.random() * 12) * 30;
      }

      occupiedLocations.add(location);
      generatedCircleData.push({
        location: location + randomRotation,
        color: getRandomColor(),
      } as Data);
    }

    keyData.push(generatedKeyData);
    circleData.push(generatedCircleData);
  }

  return { keyData, circleData };
}
