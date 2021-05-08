import { createDiv, minMax } from "./shared/utils";
import { TimelineEvent, TimelineInputEvent } from "./timeline_event";
import { Color } from "./shared/colors";

export type TimelineOptions<T = any> = {
  events?: TimelineInputEvent<T>[];
  container?: HTMLElement;
  formatter?: (event: TimelineEvent<T>) => string;
  alternate?: boolean;
};

type TimelineElements = {
  timeline?: HTMLDivElement;
  line?: HTMLDivElement;
  lineTrack?: HTMLDivElement;
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
    const inputEvents = options.events ?? [];
    this.formatter = options.formatter ?? defaultFormatter;
    this.alternate = options.alternate ?? true;
    this.container = options.container ?? defaultContainer();

    const times = inputEvents.map((event) => event.date.getTime());
    const { min, max } = minMax(times);

    this.properties = {
      lineHeight: 50,
      leftBound: 15,
      rightBound: 85,
      minTime: min,
      maxTime: max,
    };

    // Building elements
    this.container.innerHTML = /*html*/ `
      <div class="st" style="width: 100%; height: 100vh; position: relative;">
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
    this.events = [];

    inputEvents.forEach((inputEvent, index) => {
      const event = new TimelineEvent<T>({
        ...inputEvent,
        timeline: this,
        index,
      });
      this.events.push(event);
    });
  }
}

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
