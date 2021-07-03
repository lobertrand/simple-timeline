import { Line, Rect } from "./shapes";
import { partition } from "./shared/utils";
import { Timeline } from "./timeline";
import { TimelineEvent, TimelineEventPlacement } from "./timeline_event";

type TimelineProperties = {
  timeline: Timeline;
  eventProperties: TimelineEventProperties[];
  height: number;
};

type TimelineEventProperties = {
  event: TimelineEvent;
  line: Line;
  label: Rect;
};

export const computePositions = function (
  timeline: Timeline
): TimelineEventProperties[] {
  const events = timeline.events;
  // For the moment we don't consider "left" and "right" placements
  const [topPlaced, bottomPlaced] = partition(
    events,
    (e) => e.placement === "top",
    (e) => e.placement === "bottom"
  );
  const topPositions = computePositionsForPlacement(topPlaced, "top");
  const bottomPositions = computePositionsForPlacement(bottomPlaced, "bottom");
  return topPositions.concat(bottomPositions);
};

const computePositionsForPlacement = function (
  events: TimelineEvent[],
  placement: TimelineEventPlacement
): TimelineEventProperties[] {
  const placedEvents: TimelineEventProperties[] = [];
  const vGap = 8; // px
  const hGap = 0; // px

  for (const event of events) {
    const { pointPosition } = event._properties;
    const { offsetWidth, offsetHeight } = event._elements.label;

    // Starting position
    const lineHeight = 30; // px
    const current: TimelineEventProperties = {
      event,
      label: new Rect({
        x: pointPosition.x - offsetWidth / 2,
        y:
          placement === "top"
            ? pointPosition.y - lineHeight - offsetHeight
            : pointPosition.y + lineHeight,
        width: offsetWidth,
        height: offsetHeight,
      }),
      line: new Line({
        top:
          placement === "top" ? pointPosition.y - lineHeight : pointPosition.y,
        height: lineHeight,
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
          current.label.translateY(diff);
          current.line.top += diff;
        } else {
          const newLabelTop = overlap.label.bottom + vGap;
          const diff = newLabelTop - current.label.top;

          // Update current vertical position
          current.label.translateY(diff);
          current.line.bottom += diff;
        }
      }
    }

    placedEvents.push(current);
  }

  return placedEvents;
};
