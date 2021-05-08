import { Color } from "./shared/colors";
import { Timeline } from "./timeline";
import { parseDiv, mapValue } from "./shared/utils";

export type TimelineEventPlacement = "top" | "right" | "bottom" | "left";

export type TimelineInputEvent<T = any> = {
  date: Date;
  description?: string;
  color?: string;
  custom?: T;
  placement?: TimelineEventPlacement;
  mouseEvents?: TimelineEventMouseEvents<T>;
};

export type TimelineEventOptions<T = any> = TimelineInputEvent<T> & {
  timeline: Timeline<T>;
  index: number;
};

export type TimelineEventMouseEvents<T = any> = {
  click?: (event: TimelineEvent<T>, mouseEvent: MouseEvent) => void;
  mouseover?: (event: TimelineEvent<T>, mouseEvent: MouseEvent) => void;
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
  mouseEvents: TimelineEventMouseEvents<T>;

  // TimelineEventOptions properties
  timeline: Timeline<T>;
  index: number;

  // Other properties
  elements: TimelineEventElements = {};

  constructor(options: TimelineEventOptions<T>) {
    // Required options
    this.timeline = options.timeline;
    this.index = options.index;
    this.date = options.date;

    // Other options
    this.description = options.description ?? "Event";
    this.color = options.color ?? Color.BLUE_GREY_500;
    this.mouseEvents = options.mouseEvents ?? {};
    this.custom = options.custom;

    if (options.placement) {
      this.placement = options.placement;
    } else if (this.timeline.alternate) {
      this.placement = this.index % 2 == 0 ? "top" : "bottom";
    } else {
      this.placement = "top";
    }

    // Building elements
    this.elements.event = parseDiv(/*html*/ `
      <div class="st-event st-${this.placement}">
        <div class="st-event-label">
          ${this.timeline.formatter(this)}
        </div>
        <div class="st-event-line" style="background-color: ${this.color};">
        </div>
      </div>
    `);
    this.elements.label = this.elements.event.querySelector(".st-event-label");
    this.elements.line = this.elements.event.querySelector(".st-event-line");

    this.elements.point = parseDiv(/*html*/ `
      <div class="st-event-point" style="background-color: ${this.color};">
      </div>
    `);

    this.timeline.elements.timeline.append(
      this.elements.event,
      this.elements.point
    );

    // Mouse events
    if (this.mouseEvents.click) {
      this.elements.label.onclick = (clickEvent) => {
        this.mouseEvents.click(this, clickEvent);
      };
    }
    if (this.mouseEvents.mouseover) {
      this.elements.label.onmouseover = (overEvent) => {
        this.mouseEvents.mouseover(this, overEvent);
      };
    }

    // Placement
    this.placeOnAxis();
  }

  private placeOnAxis() {
    const props = this.timeline.properties;

    const x = mapValue(
      this.date.getTime(),
      props.minTime,
      props.maxTime,
      props.leftBound,
      props.rightBound
    );
    const y = props.lineHeight;

    this.elements.event.style.left = x + "%";
    this.elements.event.style.top = y + "%";

    this.elements.point.style.left = x + "%";
    this.elements.point.style.top = y + "%";
  }

  // Experiment
  set(property: "description" | "color" | "date", value: any) {
    if (property === "description") {
      this.description = value;
      this.elements.label.innerHTML = this.timeline.formatter(this);
    } else if (property === "color") {
      this.color = value;
      this.elements.label.innerHTML = this.timeline.formatter(this);
      this.elements.point.style.backgroundColor = value;
      this.elements.line.style.backgroundColor = value;
    } else if (property === "date") {
      this.date = value;
      this.elements.label.innerHTML = this.timeline.formatter(this);
      this.placeOnAxis(); // + recalculer les min/max et repositionner tous les événements si la nouvelle date est en dehors du min et du max courant
    }
  }
}
