import { iterateInterlaced, partition, stableSort } from "./shared/utils";
import { TimelineEvent, TimelineEventPlacement } from "./timeline_event";

type TimelineEventProperties = {
  event: TimelineEvent;
  labelLeft: number;
  labelRight: number;
  labelTop: number;
  labelBottom: number;
  lineHeight: number;
  lineTop: number;
};

export const computeEventPositions = function (
  events: TimelineEvent[]
): TimelineEventProperties[] {
  // For the moment we don't consider "left" and "right" placements
  const [topPlaced, bottomPlaced] = partition(
    events,
    (e) => e.placement === "top",
    (e) => e.placement === "bottom"
  );
  const topPositions = eventPositionsByPlacement(topPlaced, "top");
  const bottomPositions = eventPositionsByPlacement(bottomPlaced, "bottom");
  return topPositions.concat(bottomPositions);
};

const eventPositionsByPlacement = function (
  events: TimelineEvent[],
  placement: TimelineEventPlacement
): TimelineEventProperties[] {
  const placedEvents: TimelineEventProperties[] = [];
  const vGap = 8; // px
  const hGap = 0; // px

  for (const event of iterateInterlaced(events)) {
    const { pointPosition } = event.properties;
    const { offsetWidth, offsetHeight } = event.elements.label;

    // Starting position
    const lineHeight = 30; // px
    const current: TimelineEventProperties = {
      event,
      labelLeft: pointPosition.x - offsetWidth / 2,
      labelRight: pointPosition.x + offsetWidth / 2,
      labelTop:
        placement === "top"
          ? pointPosition.y - lineHeight - offsetHeight
          : pointPosition.y + lineHeight,
      labelBottom:
        placement === "top"
          ? pointPosition.y - lineHeight
          : pointPosition.y + lineHeight + offsetHeight,
      lineHeight,
      lineTop:
        placement === "top" ? pointPosition.y - lineHeight : pointPosition.y,
    };

    // Select already placed events which are overlapping
    // HORIZONTALLY with this event
    const horizontalOverlaps = placedEvents.filter(
      (other) =>
        current.labelLeft - hGap < other.labelRight &&
        current.labelRight + hGap > other.labelLeft
    );

    if (horizontalOverlaps.length > 0) {
      if (placement === "top") {
        stableSort(horizontalOverlaps, (a, b) => b.labelTop - a.labelTop);
      } else {
        stableSort(horizontalOverlaps, (a, b) => a.labelBottom - b.labelBottom);
      }

      for (const overlap of horizontalOverlaps) {
        const strictOverlaps = horizontalOverlaps.filter(
          (overlap) =>
            current.labelLeft - hGap < overlap.labelRight &&
            current.labelRight + hGap > overlap.labelLeft &&
            current.labelTop - vGap < overlap.labelBottom &&
            current.labelBottom + vGap > overlap.labelTop
        );
        if (strictOverlaps.length === 0) {
          break;
        }

        if (placement == "top") {
          const newLabelBottom = overlap.labelTop - vGap;
          const diff = newLabelBottom - current.labelBottom;

          // Update current vertical position
          current.labelTop += diff;
          current.labelBottom += diff;
          current.lineTop += diff;
          current.lineHeight = pointPosition.y - current.labelBottom;
        } else {
          const newLabelTop = overlap.labelBottom + vGap;
          const diff = newLabelTop - current.labelTop;

          // Update current vertical position
          current.labelTop += diff;
          current.labelBottom += diff;
          current.lineHeight = current.labelTop - pointPosition.y;
        }
      }
    }

    placedEvents.push(current);
  }

  return placedEvents;
};
