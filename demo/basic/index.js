
// type MyEvent = {
//   id: number;
//   date: string;
//   description: string;
//   color: string;
// };

const myEvents/*: MyEvent[]*/ = [
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

const events/*: TimelineInputEvent<MyEvent>[]*/ = myEvents.map((event, i) => ({
  date: new Date(event.date),
  description: event.description,
  color: event.color,
  custom: event,
  // placement: "bottom",
  // placement: i % 2 == 1 ? "top" : "bottom",
  mouseEvents: {
    click(event) {
      console.log(event.description);
        
      event.set("color", "red");
      event.set("description", event.description.split("").reverse().join(""));
      const newDate = new Date(event.date);
      newDate.setDate(newDate.getDate() - 5)
      event.set("date", newDate);
    },
  },
}));

new SimpleTimeline.Timeline({
  container: document.querySelector("#timeline-container"),
  events: events,
  // alternate: true,
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
