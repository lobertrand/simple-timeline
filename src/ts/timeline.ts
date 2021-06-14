import { createDiv, debounce, stableSort } from "./shared/utils";
import {
  updateEventPosition,
  updateEventPlacement,
  TimelineEvent,
  TimelineInputEvent,
  updateEventProperties,
} from "./timeline_event";
import { Color } from "./shared/colors";
import { Point } from "./point";
import { computeAllEventLineHeights } from "./measurements";

export type TimelineOptions<T = any> = {
  events?: TimelineInputEvent<T>[];
  container?: HTMLElement;
  formatter?: (event: TimelineEvent<T>) => string;
  alternate?: boolean;
  mouseEvents?: TimelineMouseEvents<T>;
  /**
   * Width of the timeline element (not the container) as a string
   * (default: `"100%"`)
   */
  width?: string;
  /**
   * Height of the timeline element (not the container) as a string
   * (default: `"100%"`)
   */
  height?: string;
};

type TimelineElements = {
  timeline?: HTMLDivElement;
  line?: HTMLDivElement;
  track?: HTMLDivElement;
};

type TimelineMouseEventHandler<T = any> = (
  event: TimelineEvent<T>,
  mouseEvent: MouseEvent
) => void;

type TimelineMouseEvents<T = any> = {
  click?: TimelineMouseEventHandler<T>;
  mouseover?: TimelineMouseEventHandler<T>;
};

export type TimelineProperties = {
  minTime?: number;
  maxTime?: number;
  leftBound?: number; // 0..1
  rightBound?: number; // 0..1
  lineHeight?: number; // px
  width?: number; // px
  height?: number; // px
  startPoint?: Point;
  endPoint?: Point;
};

export class Timeline<T = any> {
  // TimelineOptions properties
  events: TimelineEvent<T>[];
  container: Element;
  formatter: (event: TimelineEvent<T>) => string;
  alternate: boolean;

  // Other properties
  elements: TimelineElements = {};
  properties: TimelineProperties = {};

  constructor(options: TimelineOptions<T>) {
    // Options validation
    this.formatter = options.formatter ?? defaultFormatter;
    this.alternate = options.alternate ?? true;
    this.container = options.container ?? defaultContainer();
    const inputEvents = Array.from(options.events) ?? [];
    const mouseEvents = options.mouseEvents ?? {};
    const width = options.width ?? "100%";
    const height = options.height ?? "100%";
    // const lineHeight = options.lineHeight ?? 50;

    // Building elements
    this.container.innerHTML = /*html*/ `
      <div class="st" style="width: ${width}; height: ${height}; position: relative;">
        <div class="st-line"></div>
        <div class="st-track"></div>
      </div>
    `;
    this.elements.timeline = this.container.querySelector(".st");
    this.elements.line = this.container.querySelector(".st-line");
    this.elements.track = this.container.querySelector(".st-track");

    // Computing timeline dimensions updating positions
    updateTimelineProperties(this);
    updateTimelinePositions(this);

    // Building events
    sortEvents(inputEvents);
    this.events = inputEvents.map((inputEvent, index) => {
      return new TimelineEvent<T>({
        ...inputEvent,
        timeline: this,
        index,
      });
    });

    updateAllEvents(this);

    const resizeObserver = new ResizeObserver(
      debounce(200, () => onTimelineResize(this))
    );
    resizeObserver.observe(this.elements.timeline);

    // Mouse events
    if (mouseEvents.click) {
      attachMouseEvent(this, options.mouseEvents.click);
    }
    if (mouseEvents.mouseover) {
      attachMouseEvent(this, options.mouseEvents.mouseover);
    }
  }

  addEvents(newEventOptions: TimelineInputEvent<T>[]) {
    // Add new events (without recomputing positions at each addition)
    newEventOptions.forEach((inputEvent) => {
      this.events.push(
        new TimelineEvent<T>({
          ...inputEvent,
          timeline: this,
        })
      );
    });
    // Recompute all positions once
    updateAllEvents(this);
  }

  setEvents(newEventOptions: TimelineInputEvent<T>[]) {
    // Delete existing events (without recomputing positions at each removal)
    this.events.forEach((event) => {
      // Remove from UI
      event.elements.event.remove();
      event.elements.point.remove();
    });
    this.events = [];
    // Add new events and ecompute all positions once
    this.addEvents(newEventOptions);
  }
}

// Private API

export const updateAllEvents = (timeline: Timeline) => {
  recomputeMinMax(timeline);
  sortEvents(timeline.events);
  timeline.events.forEach((event, i) => {
    event.index = i;
    updateEventProperties(event);
    updateEventPosition(event);
    updateEventPlacement(event);
  });

  const lineHeights = computeAllEventLineHeights(timeline.events);
  lineHeights.forEach(({ event, lineHeight }) => {
    event.elements.line.style.height = lineHeight + "px";
  });
};

// Helper functions

const onTimelineResize = (timeline: Timeline) => {
  updateTimelineProperties(timeline);
  updateTimelinePositions(timeline);
  updateAllEvents(timeline);
};

const updateTimelineProperties = (timeline: Timeline) => {
  timeline.properties.width = timeline.elements.timeline.offsetWidth;
  timeline.properties.height = timeline.elements.timeline.offsetHeight;

  timeline.properties.lineHeight = timeline.properties.height * 0.5;
  timeline.properties.leftBound = 0.15;
  timeline.properties.rightBound = 0.85;

  timeline.properties.startPoint = new Point(
    timeline.properties.width * timeline.properties.leftBound,
    timeline.properties.lineHeight
  );
  timeline.properties.endPoint = new Point(
    timeline.properties.width * timeline.properties.rightBound,
    timeline.properties.lineHeight
  );
};

const updateTimelinePositions = (timeline: Timeline) => {
  const { startPoint, endPoint } = timeline.properties;

  // Placing line and track
  timeline.elements.line.style.top = startPoint.y + "px";
  timeline.elements.track.style.top = startPoint.y + "px";
  timeline.elements.track.style.left = startPoint.x + "px";
  timeline.elements.track.style.right =
    timeline.properties.width - endPoint.x + "px";
};

const recomputeMinMax = (timeline: Timeline) => {
  const { min, max } = minMaxTimes(timeline.events);
  timeline.properties.minTime = min;
  timeline.properties.maxTime = max;
};

const minMaxTimes = (events: TimelineInputEvent[]) => {
  let min = Infinity;
  let max = 0;
  for (const event of events) {
    const time = event.date.getTime();
    min = Math.min(time, min);
    max = Math.max(time, max);
  }
  return { min, max };
};

const sortEvents = (events: TimelineInputEvent[]) => {
  stableSort(events, (a, b) => a.date.getTime() - b.date.getTime());
};

const attachMouseEvent = (
  timeline: Timeline,
  handler: TimelineMouseEventHandler
) => {
  timeline.elements.timeline[`on${handler.name}`] = (
    mouseEvent: MouseEvent
  ) => {
    const target = mouseEvent.target as Element;
    const element = target.closest("[data-st-event-ref]");
    if (element instanceof HTMLElement) {
      const ref = element.dataset.stEventRef;
      const event = timeline.events.find((e) => e.ref === ref);
      handler(event, mouseEvent);
    }
  };
};

// Computed default values

const defaultFormatter = (event: TimelineEvent) => {
  const date = event.date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
  return /*html*/ `
    <div style="white-space: nowrap;">
      <span style="color: ${event.color};">● </span>
      <strong style="color: ${Color.BLUE_GREY_900};">${date}</strong>
    </div>
    <div style="color: ${Color.BLUE_GREY_600};">${event.description}</div>
  `;
};

const defaultContainer = () => {
  const container = createDiv("st-default-container");
  document.body.appendChild(container);
  return container;
};
