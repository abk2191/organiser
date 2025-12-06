import { useState, useEffect } from "react";

function Calendar() {
  // Load events from localStorage on initial render
  const [event, setEvent] = useState(() => {
    const savedEvents = localStorage.getItem("calendarEvents");
    return savedEvents ? JSON.parse(savedEvents) : [];
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [eventViewerActive, setEventViewerActive] = useState(false);

  // Save events to localStorage whenever event state changes
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(event));
  }, [event]);

  function getMonthDatesByWeekday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed (0 = January)

    // Get first and last day of month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Initialize result object with arrays for each day
    const result = {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };

    // Generate all dates in the month
    const currentDate = new Date(firstDayOfMonth);

    while (currentDate <= lastDayOfMonth) {
      const dayOfMonth = currentDate.getDate();
      const dayOfWeek = currentDate.getDay(); // 0=Sunday, 1=Monday, etc.

      // Map day number to day name
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = dayNames[dayOfWeek];

      // Add the date to the corresponding day array
      result[dayName].push(dayOfMonth);

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  function getWeeks() {
    const monthDates = getMonthDatesByWeekday();

    // Find which weekday has the 1st day of the month
    let firstDayIndex = -1;
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (let i = 0; i < dayNames.length; i++) {
      if (monthDates[dayNames[i]].includes(1)) {
        firstDayIndex = i;
        break;
      }
    }

    // If 1st day not found (shouldn't happen), return empty array
    if (firstDayIndex === -1) {
      return [];
    }

    // Create all dates array for the month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1); // Set to 1st of current month
    const year = firstDayOfMonth.getFullYear();
    const month = firstDayOfMonth.getMonth();

    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    const allDates = [];
    for (let i = 1; i <= totalDays; i++) {
      allDates.push(i);
    }

    // Create weeks array
    const weeks = [];

    // First week
    const week1 = Array(7).fill(" ");

    // Fill first week starting from the correct weekday
    for (
      let i = firstDayIndex, dayIndex = 0;
      i < 7 && dayIndex < allDates.length;
      i++, dayIndex++
    ) {
      week1[i] = allDates[dayIndex];
    }
    weeks.push(week1);

    // Fill remaining weeks
    let dayIndex = 7 - firstDayIndex; // Start index for week 2

    while (dayIndex < allDates.length) {
      const week = [];

      for (let i = 0; i < 7 && dayIndex < allDates.length; i++, dayIndex++) {
        week.push(allDates[dayIndex]);
      }

      // If week is not full (last week), fill with spaces
      while (week.length < 7) {
        week.push(" ");
      }

      weeks.push(week);
    }

    return weeks;
  }

  function updateEventViewer(date) {
    setSelectedDate(date); // Track which date was clicked
    setEventViewerActive(true);
  }

  function addEventForSelectedDate() {
    const eventName = window.prompt(
      "Enter event name:",
      `Event for ${selectedDate}`
    );

    if (eventName === null) {
      return; // User cancelled
    }

    if (!selectedDate) {
      alert("Please select a date first");
      return;
    }

    const eventDetails = {
      id: Date.now(),
      date: selectedDate,
      name: eventName || `Event for ${selectedDate}`, // Handle empty names
      backgroundColor: "#32327a", // Make sure this is included
    };

    console.log(
      "Adding event with background color:",
      eventDetails.backgroundColor
    );

    setEvent((prev) => [...prev, eventDetails]);
  }
  function EventViewer({ event, selectedDate, onAddEvent }) {
    // Filter events for the selected date
    const eventsForSelectedDate = event.filter(
      (item) => item.date === selectedDate
    );

    if (!selectedDate) {
      return (
        <p style={{ color: "white", marginTop: "40px" }}>
          Click a date to see events
        </p>
      );
    }

    const day = getDayForDate(selectedDate);
    // Get background color from the first event if it exists
    const backgroundColor =
      eventsForSelectedDate.length > 0
        ? eventsForSelectedDate[0].backgroundColor || "#32327a"
        : "#32327a";

    // DEBUG: Log what's happening
    console.log("Events for date:", eventsForSelectedDate);
    console.log("Background color to use:", backgroundColor);
    console.log("Selected date:", selectedDate);

    return (
      <>
        {eventViewerActive && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              background: backgroundColor,
            }}
            className="event-viewer"
          >
            <div className="event-header">
              <h3 style={{ color: "white", fontSize: "40px" }}>
                {day}, {selectedDate}
              </h3>
              <button className="cls-nt-btn" onClick={closeEventViewer}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="add-evnt-btn">
              <button className="evnt-btn" onClick={onAddEvent}>
                Add an event
              </button>
              <div className="event-colors">
                <div
                  className="color-one"
                  onClick={() => updateEventViewerBackgroundColor("red")}
                ></div>

                <div
                  className="color-four"
                  onClick={() => updateEventViewerBackgroundColor("#510751")}
                ></div>
                <div
                  className="color-five"
                  onClick={() => updateEventViewerBackgroundColor("blue")}
                ></div>
              </div>
            </div>
            {eventsForSelectedDate.length === 0 ? (
              <p style={{ color: "white", marginTop: "30px" }}>
                No events for this date yet
              </p>
            ) : (
              eventsForSelectedDate.map((item) => (
                <div
                  style={{
                    color: "white",
                    marginTop: "30px",
                  }}
                  className="event-name-text"
                  key={item.id}
                >
                  {item.name}
                </div>
              ))
            )}
          </div>
        )}
      </>
    );
  }

  function getDayForDate(targetDate) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const dateObj = new Date(year, month, targetDate);
    const dayOfWeek = dateObj.getDay();

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return dayNames[dayOfWeek];
  }

  function hasEventsForDate(date) {
    return event.some((item) => item.date === date);
  }

  function closeEventViewer() {
    setEventViewerActive(false);
    setSelectedDate(false);
  }

  function updateEventViewerBackgroundColor(color) {
    if (!selectedDate) return;

    setEvent((prevEvents) =>
      prevEvents.map((ev) =>
        ev.date === selectedDate ? { ...ev, backgroundColor: color } : ev
      )
    );
  }

  function getEventColorForDate(date) {
    const eventForDate = event.find((item) => item.date === date);

    return eventForDate?.backgroundColor || "transparent";
  }

  // Usage
  const monthDates = getMonthDatesByWeekday();
  const wks = getWeeks();

  const date = new Date();
  const formatted = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const today = new Date();
  const todayDate = today.getDate();

  return (
    <>
      <div
        className="calendar-div-main-main"
        style={{ overflow: "hidden", height: "100vh" }}
      >
        <div className="calendar-div-main">
          <div className="wrapper">
            <div className="page-text">
              <h1>CALENDAR</h1>
            </div>
          </div>
          <div className="clndr-wrpr">
            <div className="month-name">
              <h1
                style={{
                  color: "white",
                }}
              >
                {formatted}
              </h1>
            </div>
            <div className="day-names-div">
              <p>SU</p>
              <p>MO</p>
              <p>TU</p>
              <p>WE</p>
              <p>TH</p>
              <p>FR</p>
              <p>SA</p>
            </div>
            {wks.map((week, weekIndex) => (
              <div key={weekIndex} className="week-container">
                <div className="week-dates">
                  {week.map((date, dateIndex) => (
                    <span
                      key={dateIndex}
                      className="date-item"
                      style={{
                        color: date === todayDate ? "greenyellow" : "inherit",
                        fontWeight: "bold",
                        fontSize: "20px",
                        border: date === todayDate ? "2px solid white" : "none",
                        backgroundColor: getEventColorForDate(date),
                        cursor: "pointer",
                      }}
                      onClick={() => updateEventViewer(date)}
                    >
                      {date === " " ? (
                        <span className="empty-space">
                          &nbsp;&nbsp;&nbsp;&nbsp;
                        </span>
                      ) : (
                        date
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <EventViewer
            event={event}
            selectedDate={selectedDate}
            onAddEvent={addEventForSelectedDate}
          />
        </div>
      </div>
    </>
  );
}

export default Calendar;
