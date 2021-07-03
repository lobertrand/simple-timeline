import { Line, Point, Rect } from "./shapes";
import { partition } from "./shared/utils";
import { Timeline } from "./timeline";
import { TimelineEvent, TimelineEventPlacement } from "./timeline_event";

type TimelineProperties = {
  timeline: Timeline;
  eventProperties: TimelineEventProperties[];
  lineHeight: number;
  height: number;
  startPoint: Point;
  endPoint: Point;
};

type TimelineEventProperties = {
  event: TimelineEvent;
  line: Line;
  label: Rect;
  point: Point;
};

export const computePositions = function (
  timeline: Timeline
): TimelineProperties {
  const events = timeline.events;

  let height = timeline.elements.timeline.offsetHeight;
  let lineHeight = height / 2;

  const minTime = events[0]?._date.getTime() ?? 0;
  const maxTime = events[events.length - 1]?._date.getTime() ?? 0;
  const width = timeline.elements.timeline.offsetWidth;
  const startPoint = new Point(width * 0.15, lineHeight);
  const endPoint = new Point(width * 0.85, lineHeight);

  const eventProperties = computeAllEventPositions(
    events,
    minTime,
    maxTime,
    startPoint,
    endPoint
  );

  // Auto resize timeline element and adjust positions accordingly
  let minY = lineHeight;
  let maxY = lineHeight;
  for (const position of eventProperties) {
    minY = Math.min(minY, position.label.top);
    maxY = Math.max(maxY, position.label.bottom);
  }
  const yMargin = 20;
  const diff = yMargin - minY;
  for (const position of eventProperties) {
    position.label.y += diff;
    position.line.top += diff;
    position.line.bottom += diff;
    position.point.y += diff;
  }
  startPoint.y += diff;
  endPoint.y += diff;
  lineHeight += diff;
  height = maxY - minY + yMargin * 2;

  return {
    timeline,
    eventProperties,
    lineHeight,
    height,
    startPoint,
    endPoint,
  };
};

const computeAllEventPositions = function (
  events: TimelineEvent[],
  minTime: number,
  maxTime: number,
  startPoint: Point,
  endPoint: Point
) {
  // For the moment we don't consider "left" and "right" placements
  const [topPlaced, bottomPlaced] = partition(
    events,
    (e) => e.placement === "top",
    (e) => e.placement === "bottom"
  );
  const topPositions = computePositionsForPlacement(
    topPlaced,
    "top",
    startPoint,
    endPoint,
    minTime,
    maxTime
  );
  const bottomPositions = computePositionsForPlacement(
    bottomPlaced,
    "bottom",
    startPoint,
    endPoint,
    minTime,
    maxTime
  );
  return topPositions.concat(bottomPositions);
};

const computePositionsForPlacement = function (
  events: TimelineEvent[],
  placement: TimelineEventPlacement,
  startPoint: Point,
  endPoint: Point,
  minTime: number,
  maxTime: number
): TimelineEventProperties[] {
  const placedEvents: TimelineEventProperties[] = [];
  const vGap = 8; // px
  const hGap = 0; // px

  for (const event of events) {
    const pointPosition = computeEventPoint(
      event,
      startPoint,
      endPoint,
      minTime,
      maxTime
    );

    const { offsetWidth, offsetHeight } = event._elements.label;

    // Starting position
    const eventLineHeight = 30; // px
    const current: TimelineEventProperties = {
      event,
      point: pointPosition,
      label: new Rect({
        x: pointPosition.x - offsetWidth / 2,
        y:
          placement === "top"
            ? pointPosition.y - eventLineHeight - offsetHeight
            : pointPosition.y + eventLineHeight,
        width: offsetWidth,
        height: offsetHeight,
      }),
      line: new Line({
        top:
          placement === "top"
            ? pointPosition.y - eventLineHeight
            : pointPosition.y,
        height: eventLineHeight,
      }),
    };

    // Select already placed events which could potentially overlap with
    // this event if we were to change the current event's vertical position
    const verticalOverlaps = placedEvents.filter(
      (other) =>
        current.label.left - hGap < other.label.right &&
        current.label.right + hGap > other.label.left
    );

    if (verticalOverlaps.length > 0) {
      if (placement === "top") {
        verticalOverlaps.sort((a, b) => b.label.top - a.label.top);
      } else {
        verticalOverlaps.sort((a, b) => a.label.bottom - b.label.bottom);
      }

      for (const overlap of verticalOverlaps) {
        const strictOverlaps = verticalOverlaps.filter(
          (other) =>
            current.label.top - vGap < other.label.bottom &&
            current.label.bottom + vGap > other.label.top
        );
        if (strictOverlaps.length === 0) {
          break;
        }

        if (placement == "top") {
          const newLabelBottom = overlap.label.top - vGap;
          const diff = newLabelBottom - current.label.bottom;

          // Update current vertical position
          current.label.y += diff;
          current.line.top += diff;
          current.point.y = current.line.bottom;
        } else {
          const newLabelTop = overlap.label.bottom + vGap;
          const diff = newLabelTop - current.label.top;

          // Update current vertical position
          current.label.y += diff;
          current.line.bottom += diff;
          current.point.y = current.line.top;
        }
      }
    }

    placedEvents.push(current);
  }

  return placedEvents;
};

const computeEventPoint = (
  event: TimelineEvent,
  startPoint: Point,
  endPoint: Point,
  minTime: number,
  maxTime: number
) => {
  const time = event._date.getTime();
  const onlyOne = event._timeline.events.length == 1;
  const lerpAmount = onlyOne ? 0.5 : (time - minTime) / (maxTime - minTime);
  return Point.lerp(startPoint, endPoint, lerpAmount);
};
