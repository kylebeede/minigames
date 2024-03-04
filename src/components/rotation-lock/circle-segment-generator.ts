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

export const segment = (n: number, size: number) => {
  const center = size / 2;
  const radius = size / 2;
  const degrees = 360 / SEGMENTS;
  const start = degrees * n;
  const end = degrees * (n + 1 - MARGIN) + (MARGIN == 0 ? 1 : 0);
  const offsetDegrees = (end - start) * OFFSET;
  const path = segmentPath(
    center,
    center,
    radius,
    radius - WIDTH,
    start + offsetDegrees,
    end + offsetDegrees
  );
  return path;
};

// const SVG_SIZE = 150;
const SEGMENTS = 12;
const MARGIN = 0;
// const RADIUS = 75;
const WIDTH = 4;
const OFFSET = -0.5;
