import { useState, useEffect } from "react";
import LiveClock from "./LiveClock";

function Calendar() {
  // Load events from localStorage on initial render
  const [event, setEvent] = useState(() => {
    const savedEvents = localStorage.getItem("calendarEvents");
    return savedEvents ? JSON.parse(savedEvents) : [];
  });

  const [moods, setMoods] = useState(() => {
    const savedMoods = localStorage.getItem("calendarMoods");
    return savedMoods ? JSON.parse(savedMoods) : [];
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [eventViewerActive, setEventViewerActive] = useState(false);

  // Add state for current month and year
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Add useEffect to save moods
  useEffect(() => {
    localStorage.setItem("calendarMoods", JSON.stringify(moods));
  }, [moods]);

  // Save events to localStorage whenever event state changes
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(event));
  }, [event]);

  // Modified function to accept month and year parameters
  function getMonthDatesByWeekday(month, year) {
    // Handle month parameter - can be number (0-11) or month name
    let targetMonth;
    if (typeof month === "string") {
      // Convert month name to number (0-11)
      const monthNames = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];
      const monthLower = month.toLowerCase();
      targetMonth = monthNames.indexOf(monthLower);
      if (targetMonth === -1) {
        // Invalid month name, fall back to current month
        targetMonth = currentMonth;
      }
    } else if (typeof month === "number" && month >= 0 && month <= 11) {
      targetMonth = month;
    } else {
      // Invalid or undefined month, use current month
      targetMonth = currentMonth;
    }

    // Handle year parameter
    let targetYear;
    if (year !== undefined) {
      targetYear = Number(year);
      if (isNaN(targetYear)) {
        // Invalid year, fall back to current year
        targetYear = currentYear;
      }
    } else {
      // No year provided, use current year
      targetYear = currentYear;
    }

    // Get first and last day of month
    const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
    const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0);

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
    const monthDates = getMonthDatesByWeekday(currentMonth, currentYear);

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
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
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

  // Add navigation functions
  function goToNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  }

  function goToPrevMonth() {
    if (currentMonth === 0) {
      // If current month is January
      setCurrentMonth(11); // Go to December
      setCurrentYear((prev) => prev - 1); // Previous year
    } else {
      setCurrentMonth((prev) => prev - 1); // Just go to previous month
    }
  }

  function goToToday() {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
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

    // const mood = window.prompt("Mood event name:", `Mood for ${selectedDate}`);

    if (eventName === null) {
      return; // User cancelled
    }

    if (!selectedDate) {
      alert("Please select a date first");
      return;
    }

    // Create a unique date key that includes month and year
    const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDate}`;

    const eventDetails = {
      id: Date.now(),
      date: selectedDate, // Keep the simple date for display
      dateKey: dateKey, // Add a unique key with year-month-date
      month: currentMonth, // Store month
      year: currentYear, // Store year
      name: eventName || `Event for ${selectedDate}`, // Handle empty names
      backgroundColor: "#32327a", // Make sure this is included
      mood: "",
    };

    console.log(
      "Adding event with background color:",
      eventDetails.backgroundColor
    );

    setEvent((prev) => [...prev, eventDetails]);
  }

  function EventViewer({ event, selectedDate, onAddEvent }) {
    // Filter events for the selected date - now using dateKey
    const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDate}`;
    const eventsForSelectedDate = event.filter(
      (item) => item.dateKey === dateKey
    );

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
    console.log("Date key:", dateKey);

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
            <div className="event-viewer-name">
              <h3 style={{ color: "white" }}>EVENT VIEWER</h3>
            </div>
            <div className="event-header">
              <h3 style={{ color: "white", fontSize: "30px" }}>
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
                  onClick={() => updateEventViewerBackgroundColor("#0F4C3A")}
                ></div>

                <div
                  className="color-four"
                  onClick={() => updateEventViewerBackgroundColor("#15001F")}
                ></div>
                <div
                  className="color-five"
                  onClick={() => updateEventViewerBackgroundColor("#001427")}
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
    const dateObj = new Date(currentYear, currentMonth, targetDate);
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

  // Update hasEventsForDate to use dateKey
  function hasEventsForDate(date) {
    const dateKey = `${currentYear}-${currentMonth + 1}-${date}`;
    return event.some((item) => item.dateKey === dateKey);
  }

  function closeEventViewer() {
    setEventViewerActive(false);
    setSelectedDate(false);
  }

  // Update updateEventViewerBackgroundColor to use dateKey
  function updateEventViewerBackgroundColor(color) {
    if (!selectedDate) return;

    const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDate}`;

    setEvent((prevEvents) =>
      prevEvents.map((ev) =>
        ev.dateKey === dateKey ? { ...ev, backgroundColor: color } : ev
      )
    );
  }

  // Update getEventColorForDate to use dateKey
  function getEventColorForDate(date) {
    const dateKey = `${currentYear}-${currentMonth + 1}-${date}`;
    const eventForDate = event.find((item) => item.dateKey === dateKey);

    return eventForDate?.backgroundColor || "transparent";
  }

  function handleMood() {
    // Get today's date
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    // Create unique date key
    const dateKey = `${todayYear}-${todayMonth + 1}-${todayDate}`;

    // Get mood from user
    const mood = window.prompt("Enter mood (emoji):");

    if (mood === null || mood.trim() === "") {
      return; // User cancelled or entered empty
    }

    // Check if mood already exists for today
    const existingMoodIndex = moods.findIndex(
      (item) => item.dateKey === dateKey
    );

    if (existingMoodIndex !== -1) {
      // Update existing mood
      setMoods((prev) =>
        prev.map((m, index) =>
          index === existingMoodIndex ? { ...m, mood: mood } : m
        )
      );
      alert(`Mood updated for today!`);
    } else {
      // Create new mood entry
      const newMood = {
        id: Date.now(),
        dateKey: dateKey,
        date: todayDate,
        month: todayMonth,
        year: todayYear,
        mood: mood,
      };

      setMoods((prev) => [...prev, newMood]);
      alert(`Mood added for today!`);
    }
  }

  // Add function to get mood for a specific date
  function getMoodForDate(date) {
    const dateKey = `${currentYear}-${currentMonth + 1}-${date}`;
    const moodEntry = moods.find((item) => item.dateKey === dateKey);
    return moodEntry ? moodEntry.mood : null;
  }
  // Usage - using currentMonth and currentYear state
  const monthDates = getMonthDatesByWeekday(currentMonth, currentYear);
  const wks = getWeeks();

  const date = new Date(currentYear, currentMonth);
  const formatted = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  const todayDate = isCurrentMonth ? today.getDate() : null;

  return (
    <>
      <div
        className="calendar-div-main-main"
        style={{ overflow: "hidden", height: "100vh" }}
      >
        <div className="calendar-div-main">
          <div className="time" style={{ marginTop: "20px" }}>
            <LiveClock />
          </div>
          <div className="clndr-wrpr">
            <div className="month-name">
              <button onClick={goToPrevMonth} className="prev-mnth-btn">
                <i class="fa-solid fa-angles-left"></i>
              </button>
              <h1
                style={{
                  color: "white",
                  fontSize: "22px",
                }}
              >
                {formatted}
              </h1>

              <button onClick={goToNextMonth} className="nxt-mnth-btn">
                <i class="fa-solid fa-angles-right"></i>
              </button>
              {/* <button onClick={goToToday}>Today</button> */}
            </div>
            <div className="mood-select" onClick={handleMood}>
              {(() => {
                const today = new Date();
                const todayDate = today.getDate();
                const todayMonth = today.getMonth();
                const todayYear = today.getFullYear();

                const isTodayInCurrentMonth =
                  todayMonth === currentMonth && todayYear === currentYear;

                if (!isTodayInCurrentMonth) {
                  return "Navigate to current month to add mood";
                }

                // Get mood from separate moods array
                const dateKey = `${todayYear}-${todayMonth + 1}-${todayDate}`;
                const todayMood = moods.find((m) => m.dateKey === dateKey);

                return todayMood?.mood || "Click to add mood";
              })()}
            </div>
            {/* <div className="today">
              <button onClick={goToToday} className="nxt-mnth-btn">
                <i class="fa-solid fa-rotate"></i>
              </button>
            </div> */}
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
                        color: date === todayDate ? "red" : "inherit",
                        fontWeight: "bold",
                        fontSize: "20px",
                        border: hasEventsForDate(date)
                          ? "2px solid white"
                          : "none",
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
