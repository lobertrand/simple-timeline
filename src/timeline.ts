import { createDiv, mapValue, minMax } from "./utils";
import { Color } from "./colors";

export type TimelineInputEvent<T = any> = {
  date: Date;
  description?: string;
  color?: string;
  custom?: T;
};

export type TimelineOptions<T = any> = {
  events: TimelineInputEvent<T>[];
  container?: HTMLElement;
  formatter?: (event: TimelineInputEvent<T>) => string;
};
type TimelineEvent<T = any> = TimelineInputEvent<T> & {
  elements: {
    wrapper: HTMLDivElement;
    content: HTMLDivElement;
    point: HTMLDivElement;
    line: HTMLDivElement;
  };
};

export class Timeline<T = any> {
  private _options: TimelineOptions;

  constructor(options: TimelineOptions<T>) {
    const defaultOptions: Partial<TimelineOptions<T>> = {
      events: [],
      container: document.body,
      formatter: (event) => `
        <div style="white-space: nowrap;">
          <span style="color: ${event.color};">● </span>
          <strong style="color: ${
            Color.BlueGrey[900]
          };">${event.date.toLocaleDateString()}</strong>
        </div>
        <div style="color: ${Color.BlueGrey[600]};">${event.description}</div>
      `,
    };
    this._options = Object.assign(defaultOptions, options);

    const timelineElt = createDiv("st");
    timelineElt.style.width = "100%";
    timelineElt.style.height = "400px";
    timelineElt.style.position = "relative";

    this._options.container.appendChild(timelineElt);

    const times = this._options.events.map((event) => event.date.getTime());
    const { min: minTime, max: maxTime } = minMax(times);

    const LINE_HEIGHT_PERCENT = 50;
    const START_PERCENT = 15;
    const END_PERCENT = 85;

    const lineElt = createDiv("st-line");
    lineElt.style.top = LINE_HEIGHT_PERCENT + "%";
    timelineElt.appendChild(lineElt);

    const lineTrackElt = createDiv("st-line-track");
    lineTrackElt.style.top = LINE_HEIGHT_PERCENT + "%";
    lineTrackElt.style.left = START_PERCENT + "%";
    lineTrackElt.style.right = 100 - END_PERCENT + "%";

    timelineElt.appendChild(lineTrackElt);

    const eventElts: TimelineEvent<T>[] = [];

    this._options.events.forEach((event, i) => {
      const defaultEventOptions: Partial<TimelineInputEvent<T>> = {
        color: Color.BlueGrey[500],
        description: "Event",
      };
      event = Object.assign(defaultEventOptions, event);

      // Creating elements
      const position = i % 2 == 0 ? "st-top" : "st-bottom";
      const eventElt = createDiv(`st-event ${position}`);

      const eventLabelElt = createDiv("st-event-label");
      eventLabelElt.innerHTML = this._options.formatter(event);
      eventElt.appendChild(eventLabelElt);

      const eventLineElt = createDiv("st-event-line");
      eventLineElt.style.backgroundColor = event.color;
      eventElt.appendChild(eventLineElt);

      timelineElt.appendChild(eventElt);

      // Point is outside eventElt
      const eventPointElt = createDiv("st-event-point");
      eventPointElt.style.backgroundColor = event.color;
      timelineElt.appendChild(eventPointElt);

      // Positioning elements
      const xPos = mapValue(
        event.date.getTime(),
        minTime,
        maxTime,
        START_PERCENT,
        END_PERCENT
      );

      eventElt.style.left = xPos + "%";
      eventElt.style.top = LINE_HEIGHT_PERCENT + "%";

      eventPointElt.style.left = xPos + "%";
      eventPointElt.style.top = LINE_HEIGHT_PERCENT + "%";

      eventElts.push({
        date: event.date,
        color: event.color,
        description: event.description,
        custom: event.custom,
        elements: {
          wrapper: eventElt,
          content: eventLabelElt,
          point: eventPointElt,
          line: eventLineElt,
        },
      });
    });

    // for (const eventElt of eventElts) {
    //   console.log(getComputedStyle(eventElt.wrapper).height);
    // }
  }
}
