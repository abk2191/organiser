import { useState, useEffect, useRef } from "react";
import EventEditor from "./EventEditor";
import LiveClock from "./LiveClock";

function Calendar() {
  const reminderTimeoutsRef = useRef({});
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
  const [viewerBg, setViewerBg] = useState("#000033");

  // Add state for current month and year
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem("calendarReminders");
    return saved ? JSON.parse(saved) : [];
  });

  const [showEventEditor, setShowEventEditor] = useState(false);
  const [deleteWarningActive, setDeleteWarningActive] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // Add this function to handle saving events from EventEditor
  const handleSaveEvent = (eventData) => {
    if (!selectedDate) return;

    // Create a unique date key
    const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDate}`;

    if (editingEvent) {
      // Update existing event
      setEvent((prev) =>
        prev.map((ev) =>
          ev.id === editingEvent.id
            ? {
                ...ev,
                name: eventData.name,
                description: eventData.description,
                time: eventData.time,
                location: eventData.location,
                backgroundColor: ev.backgroundColor, // Keep existing background color
              }
            : ev
        )
      );
      setEditingEvent(null); // Clear editing state
    } else {
      // Create new event
      const newEvent = {
        id: Date.now(),
        date: selectedDate,
        dateKey: dateKey,
        month: currentMonth,
        year: currentYear,
        name: eventData.name,
        description: eventData.description,
        time: eventData.time,
        location: eventData.location,
        backgroundColor: "#000033", // Default background color
      };

      console.log("Adding event with full details:", newEvent);
      setEvent((prev) => [...prev, newEvent]);
    }
  };

  useEffect(() => {
    console.log("⏳ Scheduling reminders:", reminders);

    Object.values(reminderTimeoutsRef.current).forEach(clearTimeout);
    reminderTimeoutsRef.current = {};

    const now = Date.now();

    reminders.forEach((reminder) => {
      if (reminder.fired) return;

      const delay = reminder.fireAt - now;
      console.log("⏱ Reminder delay(ms):", delay, reminder);

      if (delay <= 0) return;

      const timeoutId = setTimeout(async () => {
        try {
          const reg = window.__SW_REG || (await navigator.serviceWorker.ready);

          await reg.showNotification("⏰ Reminder", {
            body: reminder.message,
            vibrate: [200, 100, 200],
          });

          setReminders((prev) =>
            prev.map((r) => (r.id === reminder.id ? { ...r, fired: true } : r))
          );
        } catch (err) {
          console.error("Reminder error:", err);
        }
      }, delay);

      reminderTimeoutsRef.current[reminder.id] = timeoutId;
    });
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem("calendarReminders", JSON.stringify(reminders));
  }, [reminders]);

  // Add useEffect to save moods
  useEffect(() => {
    localStorage.setItem("calendarMoods", JSON.stringify(moods));
  }, [moods]);

  // Save events to localStorage whenever event state changes
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(event));
  }, [event]);

  async function addReminderForSelectedDate() {
    if (!selectedDate) {
      alert("Select a date first");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Notification permission required");
      return;
    }

    const timeInput = prompt("Enter reminder time (HH:MM, 24h)", "09:00");
    if (!timeInput) return;

    const [hh, mm] = timeInput.split(":").map(Number);
    if (isNaN(hh) || isNaN(mm)) {
      alert("Invalid time format");
      return;
    }

    const message = prompt("Reminder message:");
    if (!message) return;

    const fireDate = new Date(
      currentYear,
      currentMonth,
      selectedDate,
      hh,
      mm,
      0,
      0
    );

    const fireAt = fireDate.getTime();

    if (fireAt <= Date.now()) {
      alert("Time must be in the future");
      return;
    }

    const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDate}`;

    const newReminder = {
      id: Date.now(),
      dateKey,
      fireAt,
      message,
      fired: false,
    };

    setReminders((prev) => [...prev, newReminder]);
    alert("✅ Reminder saved");
  }

  function ensureNotificationPermission() {
    if (!("Notification" in window)) {
      alert("Notifications are not supported in this browser.");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      alert(
        "You have blocked notifications for this site in browser settings."
      );
      return false;
    }

    // permission === "default"
    return Notification.requestPermission().then((result) => {
      if (result === "granted") {
        return true;
      } else {
        alert("Notification permission was not granted.");
        return false;
      }
    });
  }

  ensureNotificationPermission();

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
    setShowEventEditor(true);
  }

  function handleEditEvent(eventId) {
    const eventToEdit = event.find((e) => e.id === eventId);
    if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setShowEventEditor(true);
    }
  }

  function getOrdinalSuffix(date) {
    if (!date) return "";

    const lastDigit = date % 10;
    const lastTwoDigits = date % 100;

    // Special cases for 11th, 12th, 13th
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `${date}th`;
    }

    switch (lastDigit) {
      case 1:
        return `${date}st`;
      case 2:
        return `${date}nd`;
      case 3:
        return `${date}rd`;
      default:
        return `${date}th`;
    }
  }

  function EventViewer({
    event,
    selectedDate,
    onAddEvent,
    onAddReminder,
    onEventDelete,
    onEventEdit,
    reminders,
  }) {
    // Filter events for the selected date - now using dateKey
    const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDate}`;
    const eventsForSelectedDate = event.filter(
      (item) => item.dateKey === dateKey
    );

    // ADD THIS LINE: Get mood for selected date
    const moodForSelectedDate = moods.find((item) => item.dateKey === dateKey);

    const day = getDayForDate(selectedDate);
    // Get background color from the first event if it exists
    const backgroundColor =
      eventsForSelectedDate.length > 0
        ? eventsForSelectedDate[0].backgroundColor || viewerBg
        : viewerBg;

    // DEBUG: Log what's happening
    console.log("Events for date:", eventsForSelectedDate);
    console.log("Background color to use:", backgroundColor);
    console.log("Selected date:", selectedDate);
    console.log("Date key:", dateKey);

    const remindersForDate = reminders.filter(
      (r) => r.dateKey === dateKey && !r.fired
    );

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
                {day}, {getOrdinalSuffix(selectedDate)}.
              </h3>
              <button className="cls-nt-btn" onClick={closeEventViewer}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="add-evnt-btn">
              <button className="evnt-reminder" onClick={onAddEvent}>
                <i class="fa-solid fa-square-plus"></i>
              </button>
              <button className="evnt-reminder" onClick={onAddReminder}>
                <i class="fa-solid fa-bell"></i>
              </button>
              <div className="event-colors">
                <div
                  className="color-one"
                  onClick={() => updateEventViewerBackgroundColor("#3949ab")}
                ></div>

                <div
                  className="color-four"
                  onClick={() => updateEventViewerBackgroundColor("#191970 ")}
                ></div>
                <div
                  className="color-five"
                  onClick={() => updateEventViewerBackgroundColor("#36013F")}
                ></div>
              </div>
            </div>

            {moodForSelectedDate && (
              <div
                className="mood-display"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "15px",
                  marginBottom: "10px",
                  fontSize: "25px",
                  color: "white",
                }}
              >
                {moodForSelectedDate.mood}
              </div>
            )}
            {eventsForSelectedDate.length === 0 ? (
              <div className="warn">
                <p style={{ color: "white", marginTop: "30px" }}>No Events.</p>
              </div>
            ) : (
              eventsForSelectedDate.map((item, index) => (
                <div
                  key={item.id}
                  className="event-name-text"
                  style={{
                    color: "white",
                    marginTop: "20px",
                    gap: "10px",
                    padding: "15px",

                    borderRadius: "8px",
                  }}
                >
                  {/* Event Name */}
                  <div
                    className="event-name"
                    style={{
                      lineHeight: "1.6",
                      fontWeight: "bold",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "30px",
                    }}
                  >
                    {index + 1}.{" "}
                    <span style={{ color: "gold" }}>
                      <i class="fa-solid fa-tag"></i>
                    </span>{" "}
                    {item.name}
                  </div>

                  <hr
                    style={{
                      borderColor: "white",
                      margin: "10px 0",
                    }}
                  />

                  {/* Event Description */}
                  {item.description && (
                    <div
                      className="event-desc"
                      style={{
                        lineHeight: "1.6",
                        fontWeight: "bold",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "25px",
                      }}
                    >
                      <span style={{ color: "orange" }}>
                        <i class="fa-solid fa-circle-info"></i>
                      </span>{" "}
                      Description: {item.description}
                    </div>
                  )}

                  {/* Event Time */}
                  {item.time && (
                    <div
                      className="event-time"
                      style={{
                        lineHeight: "1.6",
                        fontWeight: "bold",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "25px",
                      }}
                    >
                      <span style={{ color: "yellow" }}>
                        <i class="fa-solid fa-clock"></i>
                      </span>{" "}
                      Time: {item.time}
                    </div>
                  )}

                  {/* Event Location */}
                  {item.location && (
                    <div
                      className="event-loc"
                      style={{
                        lineHeight: "1.6",
                        fontWeight: "bold",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "25px",
                      }}
                    >
                      <span style={{ color: "green" }}>
                        <i class="fa-solid fa-location-dot"></i>
                      </span>{" "}
                      Location: {item.location}
                    </div>
                  )}

                  <hr
                    style={{
                      borderColor: "white",
                      margin: "10px 0",
                    }}
                  />
                  <div className="event-dlt-btn">
                    {/* EDIT BUTTON */}
                    <button
                      className="dlt-evnt-btn"
                      onClick={() => onEventEdit(item.id)}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <i class="fa-solid fa-pen"></i>
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      className="dlt-evnt-btn"
                      onClick={() => onEventDelete(item.id)}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
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

    // ✅ Instantly update UI
    setViewerBg(color);

    // ✅ If event exists, update it
    setEvent((prevEvents) => {
      const exists = prevEvents.some((ev) => ev.dateKey === dateKey);

      if (!exists) return prevEvents;

      return prevEvents.map((ev) =>
        ev.dateKey === dateKey ? { ...ev, backgroundColor: color } : ev
      );
    });
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

  function onEventDelete(eventId) {
    setEventToDelete(eventId); // Store the ID of the event to delete
    setDeleteWarningActive(true);
  }

  function cancelDelete() {
    setDeleteWarningActive(false);
    setEventToDelete(null); // Clear the event ID
  }

  function confirmDelete() {
    if (!eventToDelete) {
      setDeleteWarningActive(false);
      return;
    }

    // Find the event to get its date for cleanup (optional)
    const eventToRemove = event.find((e) => e.id === eventToDelete);

    // Filter out only the specific event by ID
    setEvent((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventToDelete)
    );

    // Note: We're NOT deleting moods or reminders here since those are date-specific
    // and you might want to keep them for other events on the same date

    // Close the warning modal and clear the event ID
    setDeleteWarningActive(false);
    setEventToDelete(null);

    // Check if there are still events for this date
    if (eventToRemove) {
      const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDate}`;
      const remainingEvents = event.filter(
        (e) => e.id !== eventToDelete && e.dateKey === dateKey
      );

      // If no events remain for this date, close the event viewer
      if (remainingEvents.length === 0) {
        setEventViewerActive(false);
      }
    }

    alert("Event deleted successfully!");
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
          {/* <div style={{ marginTop: "10px" }}>
            <button
              onClick={async () => {
                try {
                  const permission = await Notification.requestPermission();

                  if (permission !== "granted") {
                    alert("Permission still not granted");
                    return;
                  }

                  if (!window.__SW_REG) {
                    alert(
                      "Service Worker not ready yet. Reload and try again."
                    );
                    return;
                  }

                  await window.__SW_REG.showNotification("✅ Test Successful", {
                    body: "Android tray notifications are now working!",
                    vibrate: [100, 50, 100],
                  });

                  console.log("✅ Notification fired via Service Worker");
                } catch (err) {
                  console.error("❌ Notification error:", err);
                  alert(err.message);
                }
              }}
            >
              Test Notification
            </button>
          </div> */}
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
            <div
              className="mood-select"
              onClick={handleMood}
              style={{ fontSize: "20px", color: "white", marginBottom: "12px" }}
            >
              {(() => {
                const today = new Date();
                const todayDate = today.getDate();
                const todayMonth = today.getMonth();
                const todayYear = today.getFullYear();

                const isTodayInCurrentMonth =
                  todayMonth === currentMonth && todayYear === currentYear;

                if (!isTodayInCurrentMonth) {
                  return (
                    <span style={{ fontSize: "12px" }}>
                      Navigate to current month to add mood
                    </span>
                  );
                }

                // Get mood from separate moods array
                const dateKey = `${todayYear}-${todayMonth + 1}-${todayDate}`;
                const todayMood = moods.find((m) => m.dateKey === dateKey);

                return (
                  todayMood?.mood || (
                    <span style={{ fontSize: "14px" }}>
                      Click to add thought of the day
                    </span>
                  )
                );
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
            onAddReminder={addReminderForSelectedDate}
            onEventDelete={onEventDelete}
            onEventEdit={handleEditEvent}
            reminders={reminders}
          />
          {/* Pass handleSaveEvent to EventEditor */}
          {showEventEditor && (
            <EventEditor
              onClose={() => {
                setShowEventEditor(false);
                setEditingEvent(null);
              }}
              onSaveEvent={handleSaveEvent}
              editingEvent={editingEvent}
            />
          )}

          {/* Delete Confirmation Warning Modal */}
          {deleteWarningActive && (
            <>
              <div className="backdrop" onClick={cancelDelete}></div>
              <div className="dlt-wrn">
                <div className="wrng">
                  <p>Are you sure ?</p>
                </div>
                <div className="yes-no-btn-div">
                  <button className="btn-y" onClick={confirmDelete}>
                    Yes
                  </button>
                  <button className="btn-x" onClick={cancelDelete}>
                    No
                  </button>
                </div>
              </div>
            </>
          )}

          <div
            className="calendar-warning"
            style={{ marginTop: "35px", color: "#000033" }}
          >
            <p>Click on dates to see or add events.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Calendar;
