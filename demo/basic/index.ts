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
    description: "These are simple words",
    color: "#FF9800",
  },
  {
    id: 2,
    date: "2021-05-22",
    description: "Every moment is a fresh beginning",
    color: "#009688",
  },
  {
    id: 3,
    date: "2021-06-03",
    description: "Change the world by being yourself",
    color: "#2196F3",
  },
  {
    id: 4,
    date: "2021-06-10",
    description: "Hello world",
    color: "#FFC107",
  },
  {
    id: 5,
    date: "2021-07-02",
    description: `One day the people that don’t even believe in
                  you will tell everyone how they met you`,
    color: "#4CAF50",
  },
  {
    id: 6,
    date: "2021-07-02",
    description: "Goodbye",
    color: "#673AB7",
  },
  {
    id: 7,
    date: "2021-07-26",
    description: "And still, I rise",
    color: "#F44336",
  },
  {
    id: 8,
    date: "2021-08-10",
    description: "Be so good they can’t ignore you",
    color: "#3F51B5",
  },
  {
    id: 9,
    date: "2021-08-20",
    description: "Don't worry",
    color: "#795548",
  },
];

const events: TimelineInputEvent<MyEvent>[] = myEvents.map((myEvent, i) => ({
  date: new Date(myEvent.date),
  description: myEvent.description,
  color: myEvent.color,
  data: myEvent,
  // placement: "bottom",
}));

const timeline = new Timeline({
  container: document.querySelector("#timeline-container"),
  events,
  // alternate: false,
  // formatter: (event) => {
  //   const day = event.date.toLocaleDateString("fr-FR", { day: "numeric" });
  //   const month = event.date.toLocaleDateString("fr-FR", { month: "short" });
  //   return /*html*/ `
  //     <div style="display: flex; align-items: center; align-items: stretch;
  //       border: 1px solid ${event.color}; border-radius: 8px; overflow: hidden;">
  //       <div style="color: ${event.color}; text-align: center; padding: 8px 12px;
  //         background-color: ${event.color}0e">
  //         <div style="font-weight: 800; line-height: 1; font-size: 24px;">${day}</div>
  //         <div style="font-weight: 700; font-size: 12px;">${month}</div>
  //       </div>
  //       <div style="color: #555; padding: 8px 12px;">${event.description}</div>
  //     </div>
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
    //   console.log("mouseover", event.data.id);
    // }
  },
});
const desc = document.querySelector("#description") as HTMLParagraphElement;
const date = document.querySelector("#date") as HTMLHeadingElement;
const addEventBtn = document.querySelector(
  "#add-event-button"
) as HTMLButtonElement;
const randomizeBtn = document.querySelector(
  "#randomize-button"
) as HTMLButtonElement;

addEventBtn.onclick = () => {
  const randomTime = Date.now() + Math.floor(Math.random() * 1e10 - 1e10 / 2);
  const date = new Date(randomTime).toISOString().slice(0, 10);
  const event = {
    id: 5,
    date,
    description: "New Event",
    color: randomColor(),
  };
  timeline.addEvents([
    {
      date: new Date(event.date),
      description: event.description,
      color: event.color,
      data: event,
    },
  ]);
};

randomizeBtn.onclick = () => {
  const descriptions = timeline.events.map((e) => e.description);

  shuffle(descriptions);
  timeline.events.forEach((event, idx) => {
    event.update({ description: descriptions[idx] });
  });
};

console.log(timeline);

function randomColor(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function shuffle<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
