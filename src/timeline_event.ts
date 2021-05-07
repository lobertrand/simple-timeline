import { Color } from "./colors";
import { Timeline, TimelineOptions } from "./timeline";
import { createDiv } from "./utils";

export type TimelineInputEvent<T = any> = {
  date: Date;
  description?: string;
  color?: string;
  custom?: T;
};

type TimelineEventOptions<T = any> = TimelineInputEvent<T> & {
  timeline: Timeline;
  index: number;
};

export type TimelineEventElements = {
  event?: HTMLDivElement;
  label?: HTMLDivElement;
  wrapper?: HTMLDivElement;
  content?: HTMLDivElement;
  point?: HTMLDivElement;
  line?: HTMLDivElement;
};

export class TimelineEvent<T = any> implements TimelineEventOptions<T> {
  // User options
  date: Date;
  description: string;
  color: string;
  custom: any;

  // Other options
  elements: TimelineEventElements = {};
  timeline: Timeline<T>;
  index: number;

  constructor(options: TimelineEventOptions<T>) {
    const defaultOptions: Partial<TimelineEventOptions<T>> = {
      description: "Event",
      color: Color.BLUE_GREY_500,
    }
    Object.assign(this, Object.assign(defaultOptions, options));

    // Creating elements
    this.elements.event = this.timeline.alternate
      ? createDiv(`st-event ${this.index % 2 == 1 ? "st-bottom" : ""}`)
      : createDiv("st-event");

    this.elements.label = createDiv("st-event-label");
    this.elements.label.innerHTML = this.timeline.formatter(this);
    this.elements.event.appendChild(this.elements.label);

    this.elements.line = createDiv("st-event-line");
    this.elements.line.style.backgroundColor = this.color;
    this.elements.event.appendChild(this.elements.line);

    this.timeline.elements.timeline.appendChild(this.elements.event);

    // Point is outside eventElt
    this.elements.point = createDiv("st-event-point");
    this.elements.point.style.backgroundColor = this.color;
    this.timeline.elements.timeline.appendChild(this.elements.point);
  }
}
