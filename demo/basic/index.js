define(["require", "exports", "../../dist/simple-timeline-1.0.0"], function (require, exports, simple_timeline_1_0_0_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var myEvents = [
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
    var events = myEvents.map(function (event, i) { return ({
        date: new Date(event.date),
        description: event.description,
        color: event.color,
        custom: event,
        // placement: "bottom",
        // placement: i % 2 == 1 ? "top" : "bottom",
        mouseEvents: {
            click: function (event) {
                var e = random(myEvents);
                event.update({
                    color: e.color,
                    description: e.description,
                    date: new Date(e.date),
                    custom: e,
                });
            },
        },
    }); });
    new simple_timeline_1_0_0_1.Timeline({
        container: document.querySelector("#timeline-container"),
        events: events,
        // alternate: true,
        formatter: function (event) {
            var date = event.date.toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
            });
            return /*html*/ "\n      <div style=\"font-weight: bold; color: #777;\">\n        <span style=\"color: " + event.color + ";\">" + event.custom.id + " \u00B7 </span>" + date + "\n      </div>\n      <div style=\"color: #777;\">" + event.description + "</div>\n    ";
        },
    });
    function random(array) {
        var index = Math.floor(Math.random() * array.length);
        return array[index];
    }
    function reverse(str) {
        return str.split("").reverse().join("");
    }
    function addDays(date, n) {
        var newDate = new Date(date);
        newDate.setDate(newDate.getDate() + n);
        return newDate;
    }
});
