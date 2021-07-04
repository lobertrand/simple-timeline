import { repositionEverything, Timeline } from "./timeline";
import { parseDiv, randomString } from "./shared/utils";

export type TimelineEventPlacement = "top" | "bottom";

export type TimelineInputEvent<T = any> = {
  date: Date;
  description?: string;
  color?: string;
  data?: T;
  placement?: TimelineEventPlacement;
};

export type TimelineEventUpdateOptions<T = any> = Partial<
  TimelineInputEvent<T>
>;

export type TimelineEventOptions<T = any> = TimelineInputEvent<T> & {
  timeline: Timeline<T>;
  index?: number;
};

type TimelineEventElements = {
  label?: HTMLDivElement;
  line?: HTMLDivElement;
  point?: HTMLDivElement;
};

export class TimelineEvent<T = any> {
  // TimelineInputEvent properties
  _date: Date;
  _description: string;
  _color: string;
  _data: T;
  _placement: TimelineEventPlacement;

  // TimelineEventOptions properties
  _timeline: Timeline<T>;
  _index: number;

  // Other properties
  readonly _elements: TimelineEventElements = {};
  readonly _ref = randomString(8); // Unique identifier for an event

  constructor(options: TimelineEventOptions<T>) {
    // Required options
    this._timeline = options.timeline;
    this._date = options.date;

    // Other options
    this._description = options.description ?? defaultDescription;
    this._color = options.color ?? defaultColor;
    this._data = options.data;
    this._index = options.index ?? -1;

    if (this._timeline.alternate) {
      this._placement = this._index % 2 == 0 ? "top" : "bottom";
    } else {
      this._placement = options.placement ?? "top";
    }

    // Building elements
    this._elements.label = parseDiv(/*html*/ `
      <div class="st-event-label" data-st-event-ref="${this._ref}">
        ${this._timeline.formatter(this)}
      </div>
    `);
    this._elements.line = parseDiv(/*html*/ `
      <div class="st-event-line" style="color: ${this.color};"
           data-st-event-ref="${this._ref}">
      </div>
    `);
    this._elements.point = parseDiv(/*html*/ `
      <div class="st-event-point" style="color: ${this.color};"
           data-st-event-ref="${this._ref}">
      </div>
    `);

    this._timeline.elements.timeline.append(
      this._elements.label,
      this._elements.line,
      this._elements.point
    );
  }

  /**
   * Update data of the event and refresh parts of the UI that need to change.
   */
  update(options: TimelineEventUpdateOptions<T>) {
    let updateColor = false;
    let updatePosition = false;

    // Update data
    if ("date" in options) {
      this._date = options.date;
      updatePosition = true;
    }
    if ("description" in options) {
      this._description = options.description ?? defaultDescription;
      updatePosition = true;
    }
    if ("color" in options) {
      this._color = options.color ?? defaultColor;
      updateColor = true;
    }
    if ("data" in options) {
      this._data = options.data;
      updateColor = true;
      updatePosition = true;
    }
    if ("placement" in options) {
      this._placement = options.placement ?? "top";
      updatePosition = true;
    }

    // Update UI
    this._elements.label.innerHTML = this._timeline.formatter(this);
    if (updateColor) {
      this._elements.point.style.color = this._color;
      this._elements.line.style.color = this._color;
    }
    if (updatePosition) {
      repositionEverything(this.timeline);
    }
  }

  delete() {
    const index = this._timeline.events.indexOf(this);
    this._timeline.events.splice(index, 1);
    this._elements.label.remove();
    this._elements.line.remove();
    this._elements.point.remove();
    repositionEverything(this.timeline);
  }

  get date() {
    return this._date;
  }

  get description() {
    return this._description;
  }

  get color() {
    return this._color;
  }

  get data() {
    return this._data;
  }

  get placement() {
    return this._placement;
  }

  get timeline() {
    return this._timeline;
  }
}

// Private API

export const updateEventPlacement = (event: TimelineEvent) => {
  if (event._timeline.alternate) {
    event._placement = event._index % 2 == 0 ? "top" : "bottom";
  }
};

// Default options

const defaultDescription = "Event";
const defaultColor = "#607D8B";
