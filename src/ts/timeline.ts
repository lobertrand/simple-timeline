import { createDiv, debounce, deepMerge } from "./shared/utils";
import {
  updateEventPlacement,
  TimelineEvent,
  TimelineInputEvent,
} from "./timeline_event";
import { computeTimelineProperties } from "./positionning";

export type TimelineOptions<T = any> = {
  events?: TimelineInputEvent<T>[];
  container?: HTMLElement;
  config?: Partial<TimelineConfig<T>>;
};

type TimelineConfig<T = any> = {
  events: {
    formatter?: (event: TimelineEvent<T>) => string;
    // gap?: {
    //   vertical?: number;
    //   horizontal?: number;
    // };
    // minLineHeight?: number;
    // keepInside?: boolean;
    placement?: "alternate" | "up" | "down";
    mouseEvents?: TimelineMouseEvents<T>;
  };
  // timeline: {
  //   orientation?: "vertical" | "horizontal";
  //   reversed?: boolean;
  //   height?: number | "auto";
  //   padding?: {
  //     top?: number;
  //     right?: number;
  //     bottom?: number;
  //     left?: number;
  //   };
  // };
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

export class Timeline<T = any> {
  // TimelineOptions properties
  events: TimelineEvent<T>[];
  container: Element;
  config: TimelineConfig;

  // Other properties
  elements: TimelineElements = {};

  constructor(options: TimelineOptions<T>) {
    // Options validation
    this.container = options.container ?? defaultContainer();
    const inputEvents = Array.from(options.events ?? []);

    // Further configuration
    const defaultConfig: TimelineConfig = {
      events: {
        formatter: defaultFormatter,
        // gap: {
        //   vertical: 8,
        //   horizontal: 0,
        // },
        // keepInside: true,
        // minLineHeight: 30,
        placement: "alternate",
        mouseEvents: {},
      },
      // timeline: {
      //   orientation: "horizontal",
      //   reversed: false,
      //   height: "auto",
      //   padding: {
      //     top: 20,
      //     right: 20,
      //     bottom: 20,
      //     left: 20,
      //   },
      // },
    };
    this.config = deepMerge(defaultConfig, options.config);

    // Building elements
    this.container.innerHTML = /*html*/ `
      <div class="tc-timeline">
        <div class="tc-timeline-line"></div>
        <div class="tc-timeline-track"></div>
      </div>
    `;
    this.elements.timeline = this.container.querySelector(".tc-timeline");
    this.elements.line = this.container.querySelector(".tc-timeline-line");
    this.elements.track = this.container.querySelector(".tc-timeline-track");

    // Building events
    this.events = inputEvents.map(
      (inputEvent) =>
        new TimelineEvent<T>({
          ...inputEvent,
          timeline: this,
        })
    );
    repositionEverything(this);

    new ResizeObserver(
      debounce(50, () => {
        repositionEverything(this);
      })
    ).observe(this.elements.timeline);

    // Mouse events
    const { mouseEvents } = this.config.events;
    if (mouseEvents.click) {
      attachMouseEvent(this, mouseEvents.click);
    }
    if (mouseEvents.mouseover) {
      attachMouseEvent(this, mouseEvents.mouseover);
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
    repositionEverything(this);
  }

  setEvents(newEventOptions: TimelineInputEvent<T>[]) {
    // Delete existing events (without recomputing positions at each removal)
    this.events.forEach((event) => {
      // Remove from UI
      event._elements.label.remove();
      event._elements.line.remove();
      event._elements.point.remove();
    });
    this.events = [];
    // Add new events and recompute all positions once
    this.addEvents(newEventOptions);
  }
}

// Private API

/**
 * Computes and applies positionning to every HTML element of the timeline.
 * This function requires the timeline events to be already sorted by date.
 */
export const repositionEverything = (timeline: Timeline) => {
  sortEvents(timeline.events);

  timeline.events.forEach((event, i) => {
    event._index = i;
    updateEventPlacement(event);
  });

  const { eventProperties, height, startPoint, endPoint } =
    computeTimelineProperties(timeline);

  eventProperties.forEach(({ event, line, label, point }) => {
    event._elements.label.style.left = label.left + "px";
    event._elements.label.style.top = label.top + "px";
    event._elements.line.style.left = point.x + "px";
    event._elements.line.style.height = line.height + "px";
    event._elements.line.style.top = line.top + "px";
    event._elements.point.style.left = point.x + "px";
    event._elements.point.style.top = point.y + "px";
  });

  // Placing line and track
  timeline.elements.line.style.top = startPoint.y + "px";
  timeline.elements.track.style.left = startPoint.x + "px";
  timeline.elements.track.style.top = startPoint.y + "px";
  timeline.elements.track.style.width = endPoint.x - startPoint.x + "px";
  timeline.elements.timeline.style.height = height + "px";
};

// Helper functions

const sortEvents = (events: TimelineInputEvent[]) => {
  events.sort((a, b) => a.date.getTime() - b.date.getTime());
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
      const event = timeline.events.find((e) => e._ref === ref);
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
      <strong style="color: #263238;">${date}</strong>
    </div>
    <div style="color: #546E7A;">${event.description}</div>
  `;
};

const defaultContainer = () => {
  const container = createDiv("st-default-container");
  document.body.appendChild(container);
  return container;
};
