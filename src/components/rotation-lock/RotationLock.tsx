import { useCallback, useState, useEffect } from "react";
import { App } from "antd";
import { segment } from "./circle-segment-generator";
import "./styles.css";

interface Data {
  location: number;
  color: Color;
}

type Color = "blue" | "red" | "yellow";
type LayerStatus = "active" | "inactive" | "failed" | "passed";

const LAYER_COUNT = 4;

export function RotationLock() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [failed, setFailed] = useState(false);
  const [layerStatuses, setLayerStatuses] = useState<LayerStatus[]>([
    "active",
    ...new Array(LAYER_COUNT - 1).fill("inactive"),
  ]);

  const { message } = App.useApp();

  const handleResult = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        message.success("Correct!");
        if (activeLayer === LAYER_COUNT - 1) {
          message.success("You've unlocked the lock!");
        }

        const updatedLayerStatuses = [...layerStatuses];
        updatedLayerStatuses[activeLayer] = "passed";

        if (activeLayer < LAYER_COUNT - 1) {
          updatedLayerStatuses[activeLayer + 1] = "active";
        }
        setLayerStatuses(updatedLayerStatuses);
        setActiveLayer(Math.min(activeLayer + 1, LAYER_COUNT - 1));
      } else {
        message.error("Failed");
        setFailed(true);
        setActiveLayer(0);
      }
    },
    [activeLayer, layerStatuses, message]
  );

  return (
    <div className="container">
      <DegreeGuides />
      <LockLayer
        status={layerStatuses[0]}
        keyMin={4}
        keyMax={7}
        circleMin={9}
        circleMax={11}
        trackSize={100}
        handleResult={handleResult}
      />

      <LockLayer
        status={layerStatuses[1]}
        keyMin={4}
        keyMax={7}
        circleMin={9}
        circleMax={11}
        trackSize={200}
        handleResult={handleResult}
      />

      <LockLayer
        status={layerStatuses[2]}
        keyMin={4}
        keyMax={7}
        circleMin={9}
        circleMax={11}
        trackSize={300}
        handleResult={handleResult}
      />

      <LockLayer
        status={layerStatuses[3]}
        keyMin={4}
        keyMax={7}
        circleMin={9}
        circleMax={11}
        trackSize={400}
        handleResult={handleResult}
      />
    </div>
  );
}

interface LockLayerProps {
  status: LayerStatus;
  keyMin: number;
  keyMax: number;
  circleMin: number;
  circleMax: number;
  trackSize: number;
  handleResult: (isCorrect: boolean) => void;
}
function LockLayer(props: LockLayerProps) {
  const [rotation, setRotation] = useState(0);
  const [circleData, setCircleData] = useState<Data[]>([]);
  const [keyData, setKeyData] = useState<Data[]>([]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (props.status !== "active") return;

      if (e.key === "ArrowLeft") {
        setRotation((prevRotation) => prevRotation - 30);
      } else if (e.key === "ArrowRight") {
        setRotation((prevRotation) => prevRotation + 30);
      } else if (e.key === "Enter") {
        let isCorrect = true;
        // check if circles are aligned with keys
        const circleMap = new Map<number, Color>();
        circleData.forEach((circle) => {
          let adjustedLocation = circle.location + rotation;
          while (adjustedLocation < 0) adjustedLocation += 360;
          circleMap.set(adjustedLocation % 360, circle.color);
        });

        keyData.forEach((key) => {
          const keyLocation = key.location;
          const circleColor = circleMap.get(keyLocation);
          if (!circleColor || circleColor !== key.color) {
            isCorrect = false;
          }
        });

        props.handleResult(isCorrect);
      }
    },
    [circleData, keyData, props, rotation]
  );

  // Generate key and circle data
  useEffect(() => {
    const occupiedLocations = new Set();
    const keyCount =
      Math.floor(Math.random() * (props.keyMax - props.keyMin + 1)) +
      props.keyMin;
    const generatedKeyData = Array.from({ length: keyCount }, () => {
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
    const minCircleCount = Math.max(keyCount, props.keyMin);
    const totalCircleCount =
      Math.floor(Math.random() * (props.circleMax - minCircleCount + 1)) +
      minCircleCount;
    for (let i = 0; i < totalCircleCount - 7; i++) {
      let location = Math.floor(Math.random() * 12) * 30;
      while (occupiedLocations.has(location)) {
        location = Math.floor(Math.random() * 12) * 30;
      }

      occupiedLocations.add(location);
      generatedCircleData.push({
        location: location + randomRotation,
        color: getRandomColor(),
      });
    }

    setKeyData(generatedKeyData);
    setCircleData(generatedCircleData);
  }, [props.circleMax, props.keyMax, props.keyMin]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, props.circleMax, props.keyMax, props.keyMin]);

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
        {keyData.map((keyData, index) => {
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
          transform: `rotate(${rotation}deg)`,
          width: `${props.trackSize}px`,
          height: `${props.trackSize}px`,
        }}
      >
        {circleData.map((circleData, index) => (
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

function DegreeGuides() {
  return (
    <>
      <div className="guide" />
      <div className="guide" />
      <div className="guide" />
      <div className="guide" />
      <div className="guide" />
      <div className="guide" />
    </>
  );
}

function getRandomColor(): Color {
  const colors = ["blue", "red", "yellow"];
  return colors[Math.floor(Math.random() * colors.length)] as Color;
}
