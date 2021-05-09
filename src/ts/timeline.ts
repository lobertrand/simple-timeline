import { createDiv } from "./shared/utils";
import { TimelineEvent, TimelineInputEvent } from "./timeline_event";
import { Color } from "./shared/colors";

export type TimelineOptions<T = any> = {
  events?: TimelineInputEvent<T>[];
  container?: HTMLElement;
  formatter?: (event: TimelineEvent<T>) => string;
  alternate?: boolean;
  mouseEvents?: TimelineMouseEvents<T>;
};

type TimelineElements = {
  timeline?: HTMLDivElement;
  line?: HTMLDivElement;
  lineTrack?: HTMLDivElement;
};

type TimelineMouseEventHandler<T = any> = (
  event: TimelineEvent<T>,
  mouseEvent: MouseEvent
) => void;

type TimelineMouseEvents<T = any> = {
  click?: TimelineMouseEventHandler<T>;
  mouseover?: TimelineMouseEventHandler<T>;
};

type TimelineProperties = {
  minTime?: number;
  maxTime?: number;
  leftBound?: number;
  rightBound?: number;
  lineHeight?: number;
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
    const inputEvents = Array.from(options.events) ?? [];
    this.formatter = options.formatter ?? defaultFormatter;
    this.alternate = options.alternate ?? true;
    this.container = options.container ?? defaultContainer();
    const mouseEvents = options.mouseEvents ?? {};

    const { min, max } = minMaxTimes(inputEvents);

    this.properties = {
      lineHeight: 50,
      leftBound: 15,
      rightBound: 85,
      minTime: min,
      maxTime: max,
    };

    // Building elements
    this.container.innerHTML = /*html*/ `
      <div class="st" style="width: 100%; height: 400px; position: relative;">
        <div class="st-line" style="top: ${this.properties.lineHeight}%;"></div>
        <div class="st-line-track" style="
          top: ${this.properties.lineHeight}%; 
          left: ${this.properties.leftBound}%; 
          right: ${100 - this.properties.rightBound}%;
        "></div>
      </div>
    `;
    this.elements.timeline = this.container.querySelector(".st");
    this.elements.line = this.container.querySelector(".st-line");
    this.elements.lineTrack = this.container.querySelector(".st-line-track");

    // Building events
    sortEvents(inputEvents);
    this.events = inputEvents.map((inputEvent, index) => {
      return new TimelineEvent<T>({
        ...inputEvent,
        timeline: this,
        index,
      });
    });

    this.repositionEvents();

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
    this.repositionEvents();
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

  repositionEvents() {
    this.recomputeMinMax();
    sortEvents(this.events);
    this.events.forEach((event, i) => {
      event.index = i;
      event.placeOnAxis();
      event.refreshPlacement();
    });
  }

  private recomputeMinMax() {
    const { min, max } = minMaxTimes(this.events);
    this.properties.minTime = min;
    this.properties.maxTime = max;
  }
}

const minMaxTimes = <T>(events: TimelineInputEvent<T>[]) => {
  let min = Infinity;
  let max = 0;
  for (const event of events) {
    const time = event.date.getTime();
    min = Math.min(time, min);
    max = Math.max(time, max);
  }
  return { min, max };
};

const sortEvents = <T>(events: TimelineInputEvent<T>[]) => {
  events.sort((a, b) => (a.date.getTime() > b.date.getTime() ? 1 : -1));
};

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
  const container = createDiv("st-container");
  document.body.appendChild(container);
  return container;
};

const attachMouseEvent = <T>(
  timeline: Timeline<T>,
  handler: TimelineMouseEventHandler<T>
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
