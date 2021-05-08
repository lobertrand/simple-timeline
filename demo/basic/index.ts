import { Timeline, TimelineInputEvent } from "../../dist/simple-timeline-1.0.0";

type MyEvent = {
  id: number;
  date: string;
  description: string;
  color: string;
};

const myEvents: MyEvent[] = [
  {
    id: 1,
    date: "2021-05-05",
    description: "First event is simple",
    color: "#FF9800",
  },
  {
    id: 2,
    date: "2021-06-15",
    description: "Second event has a lot of text",
    color: "#2196F3",
  },
  {
    id: 3,
    date: "2021-06-27",
    description: "Third event has even more text then the previous one",
    color: "#4CAF50",
  },
  {
    id: 4,
    date: "2021-07-18",
    description: "Fourth",
    color: "#673AB7",
  },
];

const events: TimelineInputEvent<MyEvent>[] = myEvents.map((event, i) => ({
  date: new Date(event.date),
  description: event.description,
  color: event.color,
  custom: event,
  // placement: "bottom",
  // placement: i % 2 == 1 ? "top" : "bottom",
  mouseEvents: {
    click(event) {
      const e = random(myEvents);

      event.update({
        color: e.color,
        description: e.description,
        date: new Date(e.date),
        custom: e,
      });
    },
  },
}));

new Timeline({
  container: document.querySelector("#timeline-container"),
  events: events,
  // alternate: true,
  formatter: (event) => {
    const date = event.date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
    return /*html*/ `
      <div style="font-weight: bold; color: #777;">
        <span style="color: ${event.color};">${event.custom.id} · </span>${date}
      </div>
      <div style="color: #777;">${event.description}</div>
    `;
  },
});

function random<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function reverse(str: string): string {
  return str.split("").reverse().join("");
}

function addDays(date: Date, n: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + n);
  return newDate;
}
