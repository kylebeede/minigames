import { useState, useEffect } from "react";
import "./styles.css";

interface Data {
  location: number;
  color: Color;
}

type Color = "blue" | "red" | "yellow";

export function RotationLock() {
  const [rotation, setRotation] = useState(0);
  const [circleData, setCircleData] = useState<Data[]>([]);
  const [keyData, setKeyData] = useState<Data[]>([]);

  useEffect(() => {
    // generate random circle data
    const generatedCircleData = Array.from({ length: 7 }, () => ({
      location: Math.floor(Math.random() * 12) * 30,
      color: getRandomColor(),
    }));

    // key data should be a subset of circle data with offset

    setCircleData(generatedCircleData);
    setKeyData(generatedCircleData);

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
  }, []);

  return (
    <div className="container">
      <div className="guide" />
      <div className="guide" />
      <div className="guide" />
      <div className="guide" />
      <div className="guide" />
      <div className="guide" />

      <svg className="svg-key" viewBox="0 0 150 150">
        {keyData.map((keyData, index) => {
          return (
            <path
              className={`key ${keyData.color}`}
              key={index}
              d={segment(keyData.location / 30)}
            />
          );
        })}
      </svg>
      <div
        className="circle-track"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {circleData.map((circleData, index) => (
          <div
            key={index}
            className={`circle ${circleData.color}`}
            style={{
              transform: `translate(-50%, -50%) rotate(${circleData.location}deg) translate(50px) rotate(-${circleData.location}deg)`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

function getRandomColor(): Color {
  const colors = ["blue", "red", "yellow"];
  return colors[Math.floor(Math.random() * colors.length)] as Color;
}

const polarToCartesian = (x: number, y: number, r: number, degrees: number) => {
  const radians = (degrees * Math.PI) / 180.0;
  return [x + r * Math.cos(radians), y + r * Math.sin(radians)];
};

const segmentPath = (
  x: number,
  y: number,
  r0: number,
  r1: number,
  d0: number,
  d1: number
) => {
  // https://svgwg.org/specs/paths/#PathDataEllipticalArcCommands
  const arc = Math.abs(d0 - d1) > 180 ? 1 : 0;
  const point = (radius: number, degree: number) =>
    polarToCartesian(x, y, radius, degree)
      .map((n) => n.toPrecision(5))
      .join(",");
  return [
    `M${point(r0, d0)}`,
    `A${r0},${r0},0,${arc},1,${point(r0, d1)}`,
    `L${point(r1, d1)}`,
    `A${r1},${r1},0,${arc},0,${point(r1, d0)}`,
    "Z",
  ].join("");
};

const segment = (n: number) => {
  const center = SVG_SIZE / 2;
  const degrees = 360 / SEGMENTS;
  const start = degrees * n;
  const end = degrees * (n + 1 - MARGIN) + (MARGIN == 0 ? 1 : 0);
  const offsetDegrees = (end - start) * OFFSET;
  const path = segmentPath(
    center,
    center,
    RADIUS,
    RADIUS - WIDTH,
    start + offsetDegrees,
    end + offsetDegrees
  );
  return path;
};

const SVG_SIZE = 150;
const SEGMENTS = 12;
const MARGIN = 0;
const RADIUS = 75;
const WIDTH = 4;
const OFFSET = -0.5;
