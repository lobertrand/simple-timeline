import { Color } from "./shared/colors";
import { Timeline } from "./timeline";
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

export type TimelineEventElements = {
  event?: HTMLDivElement;
  label?: HTMLDivElement;
  wrapper?: HTMLDivElement;
  content?: HTMLDivElement;
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
  private timeline: Timeline<T>;
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
        <div class="st-event-line" style="background-color: ${this.color};"
             data-st-event-ref="${this.ref}">
        </div>
      </div>
    `);
    this.elements.label = this.elements.event.querySelector(".st-event-label");
    this.elements.line = this.elements.event.querySelector(".st-event-line");

    this.elements.point = parseDiv(/*html*/ `
      <div class="st-event-point" style="background-color: ${this.color};"
           data-st-event-ref="${this.ref}">
      </div>
    `);

    this.timeline.elements.timeline.append(
      this.elements.event,
      this.elements.point
    );
  }

  // Rendre cette fonction inacessible par les utilisateurs
  placeOnAxis(/* Pass props as arguments instead */) {
    const props = this.timeline.properties;

    const x =
      this.timeline.events.length == 1
        ? "50%"
        : mapValue(
            this.date.getTime(),
            props.minTime,
            props.maxTime,
            props.leftBound,
            props.rightBound
          ) + "%";

    const y = props.lineHeight + "%";

    this.elements.event.style.left = x;
    this.elements.event.style.top = y;

    this.elements.point.style.left = x;
    this.elements.point.style.top = y;
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
      this.elements.point.style.backgroundColor = this.color;
      this.elements.line.style.backgroundColor = this.color;
    }
    if (updatePosition) {
      this.timeline.repositionEvents();
    }
    if (updatePlacement && !updatePosition) {
      this.refreshPlacement();
    }
  }

  delete() {
    const index = this.timeline.events.indexOf(this);
    this.timeline.events.splice(index, 1);
    this.elements.event.remove();
    this.elements.point.remove();
    this.timeline.repositionEvents();
  }

  // Rendre cette fonction inacessible par les utilisateurs
  refreshPlacement() {
    if (this.timeline.alternate) {
      this.placement = this.index % 2 == 0 ? "top" : "bottom";
    }
    this.elements.event.classList.remove(
      "st-top",
      "st-right",
      "st-bottom",
      "st-left"
    );
    this.elements.event.classList.add(`st-${this.placement}`);
  }
}

const defaultDescription = "Event";
const defaultColor = Color.BLUE_GREY_500;
