import { useState, useEffect } from "react";
import { segment } from "./circle-segment-generator";
import "./styles.css";

interface Data {
  location: number;
  color: Color;
}

type Color = "blue" | "red" | "yellow";

export function RotationLock() {
  return (
    <div className="container">
      <DegreeGuides />
      <LockLayer
        keyMin={4}
        keyMax={7}
        circleMin={9}
        circleMax={11}
        trackSize={100}
      />

      <LockLayer
        keyMin={4}
        keyMax={7}
        circleMin={9}
        circleMax={11}
        trackSize={200}
      />
    </div>
  );
}

interface LockLayerProps {
  keyMin: number;
  keyMax: number;
  circleMin: number;
  circleMax: number;
  trackSize: number;
}
function LockLayer(props: LockLayerProps) {
  const [rotation, setRotation] = useState(0);
  const [circleData, setCircleData] = useState<Data[]>([]);
  const [keyData, setKeyData] = useState<Data[]>([]);

  useEffect(() => {
    // TODO: # of keys and circles should be random

    // generate random key data
    const occupiedLocations = new Set();

    const keyCount =
      Math.floor(Math.random() * (props.keyMax - props.keyMin + 1)) +
      props.keyMin;
    console.log(keyCount);
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setRotation((prevRotation) => prevRotation - 30);
      } else if (event.key === "ArrowRight") {
        setRotation((prevRotation) => prevRotation + 30);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [props.circleMax, props.keyMax, props.keyMin]);

  return (
    <div
      className="lock-layer"
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
