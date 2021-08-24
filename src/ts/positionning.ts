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

type BaseProperties = Readonly<{
  width: number;
  minTime: number;
  maxTime: number;
  startPoint: Point;
  endPoint: Point;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  eventGap: {
    vertical: number;
    horizontal: number;
  };
  autoResizeTimeline: boolean;
  keepEventsInside: boolean;
  minEventLineLength: number;
}>;

export const computeTimelineProperties = (
  timeline: Timeline
): TimelineProperties => {
  const events = timeline.events;

  const width = timeline.elements.timeline.offsetWidth;
  let height = 500;
  let lineHeight = height / 2;

  const baseProps: BaseProperties = {
    width: width,
    minTime: events[0]?._date.getTime() ?? 0,
    maxTime: events[events.length - 1]?._date.getTime() ?? 0,
    startPoint: new Point(width * 0.15, lineHeight),
    endPoint: new Point(width * 0.85, lineHeight),
    padding: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
    eventGap: {
      vertical: 8,
      horizontal: 0,
    },
    autoResizeTimeline: true,
    keepEventsInside: true,
    minEventLineLength: 20,
  };
  const startPoint = baseProps.startPoint.copy();
  const endPoint = baseProps.endPoint.copy();
  const eventProperties = computeAllEventProperties(events, baseProps);

  // Auto resize timeline element and shift positions accordingly
  if (baseProps.autoResizeTimeline) {
    let minY = lineHeight;
    let maxY = lineHeight;
    for (const position of eventProperties) {
      minY = Math.min(minY, position.label.top);
      maxY = Math.max(maxY, position.label.bottom);
    }
    const diff = baseProps.padding.top - minY;
    for (const position of eventProperties) {
      position.label.y += diff;
      position.line.top += diff;
      position.line.bottom += diff;
      position.point.y += diff;
    }
    startPoint.y += diff;
    endPoint.y += diff;
    lineHeight += diff;
    height = maxY - minY + baseProps.padding.top + baseProps.padding.bottom;
  }

  return {
    timeline,
    eventProperties,
    lineHeight,
    height,
    startPoint,
    endPoint,
  };
};

const computeAllEventProperties = (
  events: TimelineEvent[],
  baseProperties: BaseProperties
) => {
  // For the moment we don't consider "left" and "right" placements
  const [topPlaced, bottomPlaced] = partition(
    events,
    (e) => e.placement === "up",
    (e) => e.placement === "down"
  );
  const topPositions = computeEventPropertiesByPlacement(
    topPlaced,
    "up",
    baseProperties
  );
  const bottomPositions = computeEventPropertiesByPlacement(
    bottomPlaced,
    "down",
    baseProperties
  );
  return topPositions.concat(bottomPositions);
};

const computeEventPropertiesByPlacement = (
  events: TimelineEvent[],
  placement: TimelineEventPlacement,
  baseProps: BaseProperties
): TimelineEventProperties[] => {
  const {
    eventGap: { vertical: vGap, horizontal: hGap },
  } = baseProps;

  const placedEvents: TimelineEventProperties[] = [];

  for (const event of events) {
    const current = initialEventPosition(event, baseProps);

    // Select already placed events which could potentially overlap with
    // this event if we were to change the current event's vertical position
    const verticalOverlaps = placedEvents.filter(
      (other) =>
        current.label.left - hGap < other.label.right &&
        current.label.right + hGap > other.label.left
    );

    if (verticalOverlaps.length > 0) {
      verticalOverlaps.sort(
        placement === "up"
          ? (a, b) => b.label.top - a.label.top
          : (a, b) => a.label.bottom - b.label.bottom
      );
      for (const overlap of verticalOverlaps) {
        const strictOverlaps = verticalOverlaps.filter(
          (other) =>
            current.label.top - vGap < other.label.bottom &&
            current.label.bottom + vGap > other.label.top
        );
        if (strictOverlaps.length === 0) {
          break;
        }

        if (placement == "up") {
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

const initialEventPosition = (
  event: TimelineEvent,
  baseProps: BaseProperties
): TimelineEventProperties => {
  const placement = event._placement;
  const { width, padding, minEventLineLength, keepEventsInside } = baseProps;
  const point = computeEventPoint(event, baseProps);
  const { offsetWidth, offsetHeight } = event._elements.label;

  let x = point.x - offsetWidth / 2;
  if (keepEventsInside) {
    const leftBound = padding.left;
    const rightBound = width - offsetWidth - padding.right;
    x = Math.max(leftBound, Math.min(x, rightBound));
  }

  return {
    event,
    point,
    label: new Rect({
      x,
      y:
        placement === "up"
          ? point.y - minEventLineLength - offsetHeight
          : point.y + minEventLineLength,
      width: offsetWidth,
      height: offsetHeight,
    }),
    line: new Line({
      top: placement === "up" ? point.y - minEventLineLength : point.y,
      height: minEventLineLength,
    }),
  };
};

const computeEventPoint = (
  event: TimelineEvent,
  baseProperties: BaseProperties
) => {
  const { minTime, maxTime, startPoint, endPoint } = baseProperties;
  const time = event._date.getTime();
  const onlyOne = event._timeline.events.length == 1;
  const lerpAmount = onlyOne ? 0.5 : (time - minTime) / (maxTime - minTime);
  return Point.lerp(startPoint, endPoint, lerpAmount);
};
