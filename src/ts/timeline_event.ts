import { Color } from "./shared/colors";
import { updateAllEvents, Timeline } from "./timeline";
import { parseDiv, randomString } from "./shared/utils";
import { Point } from "./point";

export type TimelineEventPlacement = "top" | "bottom";

export type TimelineInputEvent<T = any> = {
  date: Date;
  description?: string;
  color?: string;
  data?: T;
  placement?: TimelineEventPlacement;
};

export type TimelineEventOptions<T = any> = TimelineInputEvent<T> & {
  timeline: Timeline<T>;
  index?: number;
};

type TimelineEventElements = {
  label?: HTMLDivElement;
  line?: HTMLDivElement;
  point?: HTMLDivElement;
};

export type TimelineEventProperties = {
  pointPosition?: Point;
};

export class TimelineEvent<T = any> {
  // TimelineInputEvent properties
  date: Date;
  description: string;
  color: string;
  data: T;
  placement: TimelineEventPlacement;

  // TimelineEventOptions properties
  timeline: Timeline<T>;
  index: number;

  // Other properties
  properties: TimelineEventProperties = {};
  readonly elements: TimelineEventElements = {};
  readonly ref = randomString(8); // Unique identifier for an event

  constructor(options: TimelineEventOptions<T>) {
    // Required options
    this.timeline = options.timeline;
    this.index = options.index;
    this.date = options.date;

    // Other options
    this.description = options.description ?? defaultDescription;
    this.color = options.color ?? defaultColor;
    this.data = options.data;
    this.index = options.index ?? -1;

    if (this.timeline.alternate) {
      this.placement = this.index % 2 == 0 ? "top" : "bottom";
    } else {
      this.placement = options.placement ?? "top";
    }

    // Building elements
    this.elements.label = parseDiv(/*html*/ `
      <div class="st-event-label" data-st-event-ref="${this.ref}">
        ${this.timeline.formatter(this)}
      </div>
    `);
    this.elements.line = parseDiv(/*html*/ `
      <div class="st-event-line" style="color: ${this.color};"
           data-st-event-ref="${this.ref}">
      </div>
    `);
    this.elements.point = parseDiv(/*html*/ `
      <div class="st-event-point" style="color: ${this.color};"
           data-st-event-ref="${this.ref}">
      </div>
    `);

    this.timeline.elements.timeline.append(
      this.elements.label,
      this.elements.line,
      this.elements.point
    );
  }

  /**
   * Update data of the event and refresh parts of the UI that need to change.
   */
  update(newValues: Partial<TimelineInputEvent<T>>) {
    let reformat = false;
    let updateColor = false;
    let updatePosition = false;
    let updatePlacement = false;

    // Réfléchir aux valeurs par défaut : doit-on factoriser le code
    // permettant de déterminer les valeurs par défaut ?

    // Update data
    if ("date" in newValues) {
      this.date = newValues.date;
      reformat = true;
      updatePosition = true;
    }
    if ("description" in newValues) {
      this.description = newValues.description ?? defaultDescription;
      reformat = true;
      updatePosition = true;
    }
    if ("color" in newValues) {
      this.color = newValues.color ?? defaultColor;
      updateColor = true;
      reformat = true;
    }
    if ("data" in newValues) {
      this.data = newValues.data;
      reformat = true;
      updateColor = true;
      updatePosition = true;
    }
    if ("placement" in newValues) {
      this.placement = newValues.placement;
      updatePlacement = true;
      updatePosition = true;
    }

    // Update UI
    if (reformat) {
      this.elements.label.innerHTML = this.timeline.formatter(this);
    }
    if (updateColor) {
      this.elements.point.style.color = this.color;
      this.elements.line.style.color = this.color;
    }
    if (updatePosition) {
      updateAllEvents(this.timeline);
    }
    if (updatePlacement && !updatePosition) {
      updateEventPlacement(this);
    }
  }

  delete() {
    const index = this.timeline.events.indexOf(this);
    this.timeline.events.splice(index, 1);
    // this.elements.event.remove();
    this.elements.label.remove();
    this.elements.line.remove();
    this.elements.point.remove();
    updateAllEvents(this.timeline);
  }
}

// Private API

export const updateEventProperties = (event: TimelineEvent) => {
  const { minTime, maxTime, startPoint, endPoint } = event.timeline.properties;

  const time = event.date.getTime();
  const oneEvent = event.timeline.events.length == 1;
  const lerpAmount = oneEvent ? 0.5 : (time - minTime) / (maxTime - minTime);

  event.properties.pointPosition = Point.lerp(startPoint, endPoint, lerpAmount);
};

export const updateEventPosition = (event: TimelineEvent) => {
  const { pointPosition } = event.properties;

  const left = pointPosition.x + "px";
  const top = pointPosition.y + "px";

  // event.elements.event.style.left = left;
  // event.elements.event.style.top = top;

  event.elements.label.style.left = left;
  event.elements.label.style.top = top;

  event.elements.line.style.left = left;
  event.elements.line.style.top = top;

  event.elements.point.style.left = left;
  event.elements.point.style.top = top;
};

export const updateEventPlacement = (event: TimelineEvent) => {
  if (event.timeline.alternate) {
    event.placement = event.index % 2 == 0 ? "top" : "bottom";
  }
  // event.elements.event.classList.remove(
  //   "st-top",
  //   "st-right",
  //   "st-bottom",
  //   "st-left"
  // );
  // event.elements.event.classList.add(`st-${event.placement}`);
};

// Default options

const defaultDescription = "Event";
const defaultColor = Color.BLUE_GREY_500;
