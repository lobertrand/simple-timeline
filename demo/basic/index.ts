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
    date: "2021-06-03",
    description: "Second event has a lot of text",
    color: "#2196F3",
  },
  {
    id: 3,
    date: "2021-07-02",
    description: "Third event has even more text then the previous one",
    color: "#4CAF50",
  },
  {
    id: 4,
    date: "2021-07-20",
    description: "Fourth",
    color: "#673AB7",
  },
  {
    id: 5,
    date: "2021-07-26",
    description: "A fifth one here",
    color: "#F44336",
  },
  {
    id: 6,
    date: "2021-08-10",
    description: "And finally, a sixth one",
    color: "#3F51B5",
  },
];

const events: TimelineInputEvent<MyEvent>[] = myEvents.map((myEvent, i) => ({
  date: new Date(myEvent.date),
  description: myEvent.description,
  color: myEvent.color,
  custom: myEvent,
  // placement: "bottom",
  // placement: i % 2 == 1 ? "top" : "bottom",
  mouseEvents: {
    // Déplacer la mise en place du listener dans la timeline !!!
    // Sinon, les nouveaux événements ajoutés n'ont pas le listener
    // click(event) {
    //   // const e = random(myEvents);
    //   // event.update({
    //   //   // color: e.color,
    //   //   // description: e.description,
    //   //   date: addDays(event.date, 20),
    //   //   // custom: e,
    //   // });
    //   event.delete();
    // },
  },
}));

const timeline = new Timeline({
  container: document.querySelector("#timeline"),
  events: events,
  lineHeight: 50,
  height: "500px",
  // alternate: false,
  // formatter: (event) => {
  //   const date = event.date.toLocaleDateString(undefined, {
  //     day: "numeric",
  //     month: "long",
  //   });
  //   return /*html*/ `
  //     <div style="font-weight: bold; color: #777;">
  //       <span style="color: ${event.color};">${event.custom.id} · </span>${date}
  //     </div>
  //     <div style="color: #777;">${event.description}</div>
  //   `;
  // },
  mouseEvents: {
    click(event, mouseEvent) {
      if (mouseEvent.ctrlKey) {
        event.delete();
      } else {
        desc.innerText = event.description;
        date.innerHTML =
          `<span style="color: ${event.color}">● </span>` +
          event.date.toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
      }
    },
    // mouseover(event) {
    //   console.log("mouseover", event.custom.id);
    // }
  },
});
const desc = document.querySelector("#description") as HTMLParagraphElement;
const date = document.querySelector("#date") as HTMLHeadingElement;
const button = document.querySelector("#add-event-button") as HTMLButtonElement;
button.onclick = () => {
  const event = {
    id: 5,
    date: randomDateString("2020-01-01", "2023-01-01"),
    description: "New Event",
    color: randomColor(),
  };
  timeline.addEvents([
    {
      date: new Date(event.date),
      description: event.description,
      color: event.color,
      custom: event,
    },
  ]);
};

console.log(timeline);

function random<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function randomDateString(min: string, max: string): string {
  const d1 = new Date(min).getTime();
  const d2 = new Date(max).getTime();
  const d3 = Math.floor(Math.random() * (d2 - d1 + 1) + d1);
  return new Date(d3).toISOString().slice(0, 10);
}

function randomColor(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function reverse(str: string): string {
  return str.split("").reverse().join("");
}

function addDays(date: Date, n: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + n);
  return newDate;
}
