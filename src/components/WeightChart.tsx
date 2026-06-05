import type { WeightEntry, WeightUnit } from "../types/weight";
import { convertEntryWeight } from "../utils/weightStats";

interface WeightChartProps {
  entries: WeightEntry[];
  preferredUnit: WeightUnit;
}

interface ChartPoint {
  x: number;
  y: number;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 180;
const PADDING = 24;

export function WeightChart({
  entries,
  preferredUnit,
}: WeightChartProps): React.ReactElement {
  if (entries.length < 2) {
    return (
      <div className="weight-chart weight-chart--empty">
        <p>Not enough data for this range</p>
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sortedEntries.map((entry) =>
    convertEntryWeight(entry, preferredUnit),
  );
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight || 1;

  const points: ChartPoint[] = sortedEntries.map((entry, index) => {
    const weight = convertEntryWeight(entry, preferredUnit);
    const x =
      PADDING +
      (index / (sortedEntries.length - 1)) * (CHART_WIDTH - PADDING * 2);
    const y =
      CHART_HEIGHT -
      PADDING -
      ((weight - minWeight) / weightRange) * (CHART_HEIGHT - PADDING * 2);
    return { x, y };
  });

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="weight-chart">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="weight-chart__svg"
        role="img"
        aria-label="Weight over time line chart"
      >
        <line
          x1={PADDING}
          y1={CHART_HEIGHT - PADDING}
          x2={CHART_WIDTH - PADDING}
          y2={CHART_HEIGHT - PADDING}
          className="weight-chart__axis"
        />
        <polyline
          points={polylinePoints}
          className="weight-chart__line"
          fill="none"
        />
        {points.map((point, index) => (
          <circle
            key={sortedEntries[index].id}
            cx={point.x}
            cy={point.y}
            r={4}
            className="weight-chart__point"
          />
        ))}
      </svg>
      <div className="weight-chart__labels">
        <span>
          {minWeight} {preferredUnit}
        </span>
        <span>
          {maxWeight} {preferredUnit}
        </span>
      </div>
    </div>
  );
}
