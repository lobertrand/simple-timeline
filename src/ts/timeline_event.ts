import { Color } from "./shared/colors";
import { updateAllEventPositions, Timeline } from "./timeline";
import { parseDiv, mapValue, randomString } from "./shared/utils";

export type TimelineEventPlacement = "top" | "right" | "bottom" | "left";

export type TimelineInputEvent<T = any> = {
  date: Date;
  description?: string;
  color?: string;
  custom?: T;
  placement?: TimelineEventPlacement;
};

export type TimelineEventOptions<T = any> = TimelineInputEvent<T> & {
  timeline: Timeline<T>;
  index?: number;
};

type TimelineEventElements = {
  event?: HTMLDivElement;
  label?: HTMLDivElement;
  wrapper?: HTMLDivElement;
  point?: HTMLDivElement;
  line?: HTMLDivElement;
};

export class TimelineEvent<T = any> {
  // TimelineInputEvent properties
  date: Date;
  description: string;
  color: string;
  custom: T;
  placement: TimelineEventPlacement;

  // TimelineEventOptions properties
  timeline: Timeline<T>;
  index: number;

  // Other properties
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
    this.custom = options.custom;
    this.index = options.index ?? -1;

    if (this.timeline.alternate) {
      this.placement = this.index % 2 == 0 ? "top" : "bottom";
    } else {
      this.placement = options.placement ?? "top";
    }

    // Building elements
    this.elements.event = parseDiv(/*html*/ `
      <div class="st-event st-${this.placement}">
        <div class="st-event-label" data-st-event-ref="${this.ref}">
          ${this.timeline.formatter(this)}
        </div>
        <div class="st-event-line" style="color: ${this.color};"
             data-st-event-ref="${this.ref}">
        </div>
      </div>
    `);
    this.elements.label = this.elements.event.querySelector(".st-event-label");
    this.elements.line = this.elements.event.querySelector(".st-event-line");

    this.elements.point = parseDiv(/*html*/ `
      <div class="st-event-point" style="color: ${this.color};"
           data-st-event-ref="${this.ref}">
      </div>
    `);

    this.timeline.elements.timeline.append(
      this.elements.event,
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
    }
    if ("color" in newValues) {
      this.color = newValues.color ?? defaultColor;
      updateColor = true;
      reformat = true;
    }
    if ("custom" in newValues) {
      this.custom = newValues.custom;
      reformat = true;
      updateColor = true;
      updatePosition = true;
    }
    if ("placement" in newValues) {
      this.placement = newValues.placement;
      updatePlacement = true;
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
      updateAllEventPositions(this.timeline);
    }
    if (updatePlacement && !updatePosition) {
      updateEventPlacement(this);
    }
  }

  delete() {
    const index = this.timeline.events.indexOf(this);
    this.timeline.events.splice(index, 1);
    this.elements.event.remove();
    this.elements.point.remove();
    updateAllEventPositions(this.timeline);
  }
}

// Private API

export const updateEventPlacement = (event: TimelineEvent) => {
  if (event.timeline.alternate) {
    event.placement = event.index % 2 == 0 ? "top" : "bottom";
  }
  event.elements.event.classList.remove(
    "st-top",
    "st-right",
    "st-bottom",
    "st-left"
  );
  event.elements.event.classList.add(`st-${event.placement}`);
};

export const updateEventPosition = (event: TimelineEvent) => {
  const props = event.timeline.properties;

  const x =
    event.timeline.events.length == 1
      ? "50%"
      : mapValue(
          event.date.getTime(),
          props.minTime,
          props.maxTime,
          props.leftBound,
          props.rightBound
        ) + "%";

  const y = props.lineHeight + "%";

  event.elements.event.style.left = x;
  event.elements.event.style.top = y;

  event.elements.point.style.left = x;
  event.elements.point.style.top = y;
};

// Default options

const defaultDescription = "Event";
const defaultColor = Color.BLUE_GREY_500;
