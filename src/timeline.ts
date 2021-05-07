import { mapValue, minMax } from "./utils";
import { TimelineEvent, TimelineInputEvent } from "./timeline_event";
import { Color } from "./colors";

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

export class Timeline<T = any> implements TimelineOptions<T> {
  // Options
  elements: TimelineElements = {};
  container: HTMLDivElement;
  alternate: boolean;
  formatter: (event: TimelineEvent<T>) => string;

  constructor(options: TimelineOptions<T>) {
    const defaultOptions: TimelineOptions<T> = {
      events: [],
      container: document.body,
      formatter: (event) => `
        <div style="white-space: nowrap;">
          <span style="color: ${event.color};">● </span>
          <strong style="color: ${
            Color.BLUE_GREY_900
          };">${event.date.toLocaleDateString()}</strong>
        </div>
        <div style="color: ${Color.BLUE_GREY_600};">${event.description}</div>
      `,
      alternate: true,
    };
    Object.assign(this, Object.assign(defaultOptions, options));

    const LINE_HEIGHT_PERCENT = 50;
    const START_PERCENT = 15;
    const END_PERCENT = 85;

    this.container.innerHTML = /*html*/ `
      <div class="st" style="width: 100%; height: 400px; position: relative;">
        <div class="st-line" style="top: ${LINE_HEIGHT_PERCENT}%;"></div>
        <div class="st-line-track" style="top: ${LINE_HEIGHT_PERCENT}%; 
            left: ${START_PERCENT}%; right: ${100 - END_PERCENT}%;"></div>
      </div>
    `;
    this.elements.timeline = this.container.querySelector(".st");
    this.elements.line = this.container.querySelector(".st-line");
    this.elements.lineTrack = this.container.querySelector(".st-line-track");

    const times = options.events.map((event) => event.date.getTime());
    const { min: minTime, max: maxTime } = minMax(times);

    const events: TimelineEvent<T>[] = [];

    options.events.forEach((inputEvent, i) => {
      const event = new TimelineEvent<T>({
        ...inputEvent,
        timeline: this,
        index: i,
      });

      // Positioning elements
      const xPos = mapValue(
        inputEvent.date.getTime(),
        minTime,
        maxTime,
        START_PERCENT,
        END_PERCENT
      );

      event.elements.event.style.left = xPos + "%";
      event.elements.event.style.top = LINE_HEIGHT_PERCENT + "%";

      event.elements.point.style.left = xPos + "%";
      event.elements.point.style.top = LINE_HEIGHT_PERCENT + "%";

      events.push(event);
    });
  }
}
