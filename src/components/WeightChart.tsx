import type { WeightEntry, WeightUnit } from "../types/weight";
import { parseDate } from "../utils/dateRanges";
import {
  convertEntryWeight,
  getMovingAverageSeries,
} from "../utils/weightStats";

interface WeightChartProps {
  entries: WeightEntry[];
  preferredUnit: WeightUnit;
  goalWeight?: number;
}

interface ChartPoint {
  x: number;
  y: number;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 200;
const Y_LABEL_X = 28;
const PADDING_LEFT = 34;
const PADDING_RIGHT = 10;
const PADDING_TOP = 28;
const PADDING_BOTTOM = 32;
const Y_TICK_COUNT = 5;

function formatChartDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatTickWeight(weight: number): string {
  return Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
}

function getAxisRange(min: number, max: number): { axisMin: number; axisMax: number } {
  const range = max - min || 1;
  const padding = range * 0.1;

  return {
    axisMin: min - padding,
    axisMax: max + padding,
  };
}

function getYAxisTicks(axisMin: number, axisMax: number): number[] {
  const range = axisMax - axisMin;
  const ticks: number[] = [];

  for (let index = 0; index < Y_TICK_COUNT; index += 1) {
    const value = axisMin + (range * index) / (Y_TICK_COUNT - 1);
    ticks.push(Math.round(value * 10) / 10);
  }

  return ticks;
}

export function WeightChart({
  entries,
  preferredUnit,
  goalWeight,
}: WeightChartProps): React.ReactElement {
  if (entries.length === 0) {
    return (
      <div className="weight-chart weight-chart--empty">
        <p>No entries in this range</p>
        <p className="weight-chart__hint">Add weight entries to see your chart</p>
      </div>
    );
  }

  if (entries.length === 1) {
    return (
      <div className="weight-chart weight-chart--empty">
        <p>You have 1 entry in this range</p>
        <p className="weight-chart__hint">Add one more entry to see a trend line</p>
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sortedEntries.map((entry) =>
    convertEntryWeight(entry, preferredUnit),
  );
  const movingAverageSeries = getMovingAverageSeries(
    sortedEntries,
    preferredUnit,
  );
  const allValues = [...weights, ...movingAverageSeries.map((point) => point.value)];

  if (goalWeight !== undefined) {
    allValues.push(goalWeight);
  }

  const { axisMin, axisMax } = getAxisRange(
    Math.min(...allValues),
    Math.max(...allValues),
  );
  const axisRange = axisMax - axisMin || 1;
  const plotWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const yAxisTicks = getYAxisTicks(axisMin, axisMax);

  const weightToY = (weight: number): number =>
    PADDING_TOP +
    plotHeight -
    ((weight - axisMin) / axisRange) * plotHeight;

  const toPoint = (index: number, weight: number): ChartPoint => {
    const x =
      PADDING_LEFT +
      (index / (sortedEntries.length - 1)) * plotWidth;
    return { x, y: weightToY(weight) };
  };

  const weightPoints = sortedEntries.map((entry, index) =>
    toPoint(index, convertEntryWeight(entry, preferredUnit)),
  );
  const averagePoints = movingAverageSeries.map((point, index) =>
    toPoint(index, point.value),
  );

  const weightLine = weightPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const averageLine = averagePoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const goalY = goalWeight !== undefined ? weightToY(goalWeight) : null;

  const firstDate = sortedEntries[0].date;
  const lastDate = sortedEntries[sortedEntries.length - 1].date;
  const midDate = sortedEntries[Math.floor(sortedEntries.length / 2)].date;

  return (
    <div className="weight-chart">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="weight-chart__svg"
        role="img"
        aria-label={`Weight over time in ${preferredUnit} with seven day moving average`}
      >
        {yAxisTicks.map((tick) => (
          <line
            key={`grid-${tick}`}
            x1={PADDING_LEFT}
            y1={weightToY(tick)}
            x2={CHART_WIDTH - PADDING_RIGHT}
            y2={weightToY(tick)}
            className="weight-chart__grid-line"
          />
        ))}

        <line
          x1={PADDING_LEFT}
          y1={PADDING_TOP}
          x2={PADDING_LEFT}
          y2={CHART_HEIGHT - PADDING_BOTTOM}
          className="weight-chart__axis"
        />
        <line
          x1={PADDING_LEFT}
          y1={CHART_HEIGHT - PADDING_BOTTOM}
          x2={CHART_WIDTH - PADDING_RIGHT}
          y2={CHART_HEIGHT - PADDING_BOTTOM}
          className="weight-chart__axis"
        />

        <text
          x={Y_LABEL_X}
          y={10}
          textAnchor="end"
          dominantBaseline="hanging"
          className="weight-chart__axis-unit"
        >
          {preferredUnit}
        </text>

        {yAxisTicks.map((tick) => (
          <text
            key={`tick-${tick}`}
            x={Y_LABEL_X}
            y={weightToY(tick) + 3}
            textAnchor="end"
            className="weight-chart__weight-label"
          >
            {formatTickWeight(tick)}
          </text>
        ))}

        {goalY !== null ? (
          <>
            <line
              x1={PADDING_LEFT}
              y1={goalY}
              x2={CHART_WIDTH - PADDING_RIGHT}
              y2={goalY}
              className="weight-chart__goal-line"
            />
            <text
              x={CHART_WIDTH - PADDING_RIGHT}
              y={goalY - 4}
              textAnchor="end"
              className="weight-chart__goal-label"
            >
              Goal
            </text>
          </>
        ) : null}

        <polyline
          points={averageLine}
          className="weight-chart__average-line"
          fill="none"
        />
        <polyline
          points={weightLine}
          className="weight-chart__line"
          fill="none"
        />
        {weightPoints.map((point, index) => (
          <circle
            key={sortedEntries[index].id}
            cx={point.x}
            cy={point.y}
            r={3.5}
            className="weight-chart__point"
          />
        ))}

        <text
          x={PADDING_LEFT}
          y={CHART_HEIGHT - 10}
          className="weight-chart__date-label"
        >
          {formatChartDate(firstDate)}
        </text>
        <text
          x={CHART_WIDTH / 2}
          y={CHART_HEIGHT - 10}
          textAnchor="middle"
          className="weight-chart__date-label"
        >
          {formatChartDate(midDate)}
        </text>
        <text
          x={CHART_WIDTH - PADDING_RIGHT}
          y={CHART_HEIGHT - 10}
          textAnchor="end"
          className="weight-chart__date-label"
        >
          {formatChartDate(lastDate)}
        </text>
      </svg>

      <div className="weight-chart__legend-row">
        <span className="weight-chart__legend-item">
          <span className="weight-chart__legend-swatch weight-chart__legend-swatch--weight" />
          Weight
        </span>
        <span className="weight-chart__legend-item">
          <span className="weight-chart__legend-swatch weight-chart__legend-swatch--average" />
          7-day avg
        </span>
      </div>
    </div>
  );
}
