import { Timeline } from "./timeline";

type MyEvent = {
  id: number;
  date: string;
  description: string;
  color: string;
};

const myEvents: MyEvent[] = [
  {
    id: 1,
    date: "2021-03-12",
    description: "First event is simple",
    color: "#FF9800",
  },
  {
    id: 2,
    date: "2021-03-14",
    description: "Second event has a lot of text",
    color: "#2196F3",
  },
  {
    id: 3,
    date: "2021-03-20",
    description: "Third event has even more text then the previous one",
    color: "#4CAF50",
  },
  {
    id: 4,
    date: "2021-03-26",
    description: "Fourth",
    color: "#673AB7",
  },
];

const events = myEvents.map((event) => ({
  date: new Date(event.date),
  description: event.description,
  color: event.color,
  custom: event,
}));

new Timeline({
  container: document.querySelector("#timeline-container"),
  events: events,
  // formatter: (event) => {
  //   const date = event.date.toLocaleDateString();
  //   return `
  //     <div style="color: ${event.color};">
  //       <strong>${event.custom.id})</strong> ${date}
  //     </div>
  //     <div style="color: #888;">${event.description}</div>
  //   `;
  // },
});
