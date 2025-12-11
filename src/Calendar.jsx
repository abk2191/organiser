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

  useEffect(() => {
    // Calculate milliseconds until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    console.log(
      `Page will reload at midnight in ${timeUntilMidnight / 1000} seconds`
    );

    const timeoutId = setTimeout(() => {
      console.log("Midnight reached, reloading page...");
      window.location.reload();
    }, timeUntilMidnight);

    // Clean up timeout if component unmounts
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array means this runs once on mount

  // UPDATED: Proper handleSaveEvent with correct multi-month calculation
  const handleSaveEvent = (eventData) => {
    if (!selectedDate) return;

    // Parse start and end dates
    const startDate = parseInt(selectedDate);
    const endDate = eventData.endDate ? parseInt(eventData.endDate) : startDate;

    // Get the last day of the current month
    const lastDayOfCurrentMonth = new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();

    // Check if event spans across months
    // If endDate is less than startDate, it means next month
    const spansToNextMonth = endDate < startDate;

    if (spansToNextMonth) {
      // Event spans to next month
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

      // Generate dates for current month (from startDate to end of month)
      const currentMonthDates = [];
      const currentMonthKeys = [];
      for (let d = startDate; d <= lastDayOfCurrentMonth; d++) {
        currentMonthDates.push(d);
        currentMonthKeys.push(`${currentYear}-${currentMonth + 1}-${d}`);
      }

      // Generate dates for next month (from 1st to endDate)
      const nextMonthDates = [];
      const nextMonthKeys = [];
      for (let d = 1; d <= endDate; d++) {
        nextMonthDates.push(d);
        nextMonthKeys.push(`${nextYear}-${nextMonth + 1}-${d}`);
      }

      // Combine all dates and keys
      const eventDates = [...currentMonthDates, ...nextMonthDates];
      const dateKeys = [...currentMonthKeys, ...nextMonthKeys];

      // The actual end date is calculated differently
      const actualEndDate = endDate + lastDayOfCurrentMonth - startDate + 1;

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
                  startDate: startDate,
                  endDate: actualEndDate,
                  eventDates: eventDates,
                  dateKeys: dateKeys,
                  backgroundColor: ev.backgroundColor,
                  startMonth: currentMonth,
                  startYear: currentYear,
                  endMonth: nextMonth,
                  endYear: nextYear,
                  spansMonths: true,
                }
              : ev
          )
        );
        setEditingEvent(null);
      } else {
        // Create new event
        const newEvent = {
          id: Date.now(),
          startDate: startDate,
          endDate: actualEndDate,
          eventDates: eventDates,
          dateKeys: dateKeys,
          month: currentMonth,
          year: currentYear,
          startMonth: currentMonth,
          startYear: currentYear,
          endMonth: nextMonth,
          endYear: nextYear,
          name: eventData.name,
          description: eventData.description,
          time: eventData.time,
          location: eventData.location,
          backgroundColor: "#000033",
          spansMonths: true,
        };

        console.log("Adding multi-month event:", newEvent);
        setEvent((prev) => [...prev, newEvent]);
      }
    } else {
      // Event stays within current month
      const actualStartDate = Math.min(startDate, endDate);
      const actualEndDate = Math.max(startDate, endDate);

      const eventDates = [];
      for (let d = actualStartDate; d <= actualEndDate; d++) {
        eventDates.push(d);
      }

      const dateKeys = eventDates.map(
        (date) => `${currentYear}-${currentMonth + 1}-${date}`
      );

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
                  startDate: actualStartDate,
                  endDate: actualEndDate,
                  eventDates: eventDates,
                  dateKeys: dateKeys,
                  backgroundColor: ev.backgroundColor,
                  spansMonths: false,
                }
              : ev
          )
        );
        setEditingEvent(null);
      } else {
        // Create new event
        const newEvent = {
          id: Date.now(),
          startDate: actualStartDate,
          endDate: actualEndDate,
          eventDates: eventDates,
          dateKeys: dateKeys,
          month: currentMonth,
          year: currentYear,
          name: eventData.name,
          description: eventData.description,
          time: eventData.time,
          location: eventData.location,
          backgroundColor: "#000033",
          spansMonths: false,
        };

        console.log("Adding single-month event:", newEvent);
        setEvent((prev) => [...prev, newEvent]);
      }
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
    // Filter events for the selected date - check if date is in eventDates
    const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDate}`;
    const eventsForSelectedDate = event.filter(
      (item) => item.dateKeys && item.dateKeys.includes(dateKey)
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
                  fontSize: "15px",
                  color: "greenyellow",
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
                    {/* Show date range if multi-day event */}
                    {item.eventDates && item.eventDates.length > 1 && (
                      <span
                        style={{
                          fontSize: "18px",
                          color: "#ccc",
                          marginLeft: "10px",
                        }}
                      >
                        ({item.startDate} - {item.endDate})
                      </span>
                    )}
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

  // Update hasEventsForDate to check all events
  function hasEventsForDate(date) {
    const dateKey = `${currentYear}-${currentMonth + 1}-${date}`;

    // Check if any event includes this date in its dateKeys array
    return event.some(
      (item) => item.dateKeys && item.dateKeys.includes(dateKey)
    );
  }

  function closeEventViewer() {
    setEventViewerActive(false);
    setSelectedDate(false);
  }

  // Update updateEventViewerBackgroundColor to use dateKey array
  function updateEventViewerBackgroundColor(color) {
    if (!selectedDate) return;

    const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDate}`;

    // ✅ Instantly update UI
    setViewerBg(color);

    // ✅ Update all events that include this date
    setEvent((prevEvents) => {
      return prevEvents.map((ev) => {
        if (ev.dateKeys && ev.dateKeys.includes(dateKey)) {
          return { ...ev, backgroundColor: color };
        }
        return ev;
      });
    });
  }

  // Update getEventColorForDate to check dateKeys array
  function getEventColorForDate(date) {
    const dateKey = `${currentYear}-${currentMonth + 1}-${date}`;

    // Find the first event that includes this date
    const eventForDate = event.find(
      (item) => item.dateKeys && item.dateKeys.includes(dateKey)
    );

    return eventForDate?.backgroundColor || "transparent";
  }

  // UPDATED: Simple and reliable needsConnectionToRight function
  function needsConnectionToRight(date) {
    const dateKey = `${currentYear}-${currentMonth + 1}-${date}`;
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Don't show connection on the last day (it will have special styling)
    if (date === lastDayOfMonth) {
      return false;
    }

    // Check all events
    for (const ev of event) {
      if (ev.dateKeys && ev.dateKeys.includes(dateKey)) {
        // Check if there's a next date in the same month
        const nextDate = date + 1;
        const nextDateKey = `${currentYear}-${currentMonth + 1}-${nextDate}`;

        if (ev.dateKeys.includes(nextDateKey)) {
          return true;
        }
      }
    }
    return false;
  }

  // UPDATED: Check if event continues to next month
  function needsConnectionToNextMonth(date) {
    const dateKey = `${currentYear}-${currentMonth + 1}-${date}`;
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Only check on the last day of the month
    if (date !== lastDayOfMonth) {
      return false;
    }

    // Check all events
    for (const ev of event) {
      if (ev.dateKeys && ev.dateKeys.includes(dateKey)) {
        // If this is a multi-month event
        if (ev.spansMonths) {
          // Check if there's a date in the next month
          const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
          const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
          const nextMonthFirstDayKey = `${nextYear}-${nextMonth + 1}-1`;

          if (ev.dateKeys.includes(nextMonthFirstDayKey)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Get event connection info for proper styling
  function getEventConnectionInfo(date) {
    const dateKey = `${currentYear}-${currentMonth + 1}-${date}`;
    const eventsForDate = event.filter(
      (item) => item.dateKeys && item.dateKeys.includes(dateKey)
    );

    if (eventsForDate.length === 0) {
      return {
        hasEvent: false,
        connectionClass: "",
      };
    }

    // Determine connection classes
    const needsRightConnection = needsConnectionToRight(date);
    const needsNextMonthConnection = needsConnectionToNextMonth(date);
    let connectionClass = "";

    if (needsNextMonthConnection) {
      connectionClass = "last-day-connected";
    } else if (needsRightConnection) {
      connectionClass = "connected-right";
    }

    return {
      hasEvent: true,
      connectionClass,
    };
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

    // Find the event to get its date for cleanup
    const eventToRemove = event.find((e) => e.id === eventToDelete);

    // Filter out only the specific event by ID
    setEvent((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventToDelete)
    );

    // Close the warning modal and clear the event ID
    setDeleteWarningActive(false);
    setEventToDelete(null);

    // Check if there are still events for this selected date
    if (eventToRemove && selectedDate) {
      const dateKey = `${currentYear}-${currentMonth + 1}-${selectedDate}`;
      const remainingEvents = event.filter(
        (e) =>
          e.id !== eventToDelete && e.dateKeys && e.dateKeys.includes(dateKey)
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
            </div>
            <div
              className="mood-select"
              onClick={handleMood}
              style={{
                fontSize: "15px",
                color: "greenyellow",
                marginBottom: "12px",
              }}
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
                  {week.map((date, dateIndex) => {
                    if (date === " ") {
                      return (
                        <span
                          key={dateIndex}
                          className="date-item"
                          style={{
                            fontWeight: "bold",
                            fontSize: "20px",
                            visibility: "hidden",
                            pointerEvents: "none",
                            minWidth: "40px", // Match the width of actual dates
                            textAlign: "center",
                            display: "inline-block",
                          }}
                        >
                          <span className="empty-space">
                            &nbsp;&nbsp;&nbsp;&nbsp;
                          </span>
                        </span>
                      );
                    }

                    const connection = getEventConnectionInfo(date);
                    const hasEvent = connection.hasEvent;
                    const connectionClass = connection.connectionClass;

                    let borderStyle = {};
                    if (hasEvent) {
                      borderStyle = {
                        border: "2px solid white",
                        borderRadius: "8px",
                      };
                    }

                    return (
                      <span
                        key={dateIndex}
                        className={`date-item ${connectionClass} ${
                          hasEvent ? "has-event" : ""
                        }`}
                        style={{
                          color: date === todayDate ? "red" : "inherit",
                          fontWeight: "bold",
                          fontSize: "20px",
                          backgroundColor: getEventColorForDate(date),
                          cursor: "pointer",
                          ...borderStyle,
                          padding: "2px 8px",
                          display: "inline-block",
                          minWidth: "40px",
                          textAlign: "center",
                          position: "relative",
                        }}
                        onClick={() => date !== " " && updateEventViewer(date)}
                      >
                        {date}
                        {/* Add a visual indicator for events that span months */}
                        {connectionClass === "last-day-connected" && (
                          <span
                            style={{
                              position: "absolute",
                              right: "-5px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontSize: "12px",
                              color: "white",
                            }}
                          >
                            →
                          </span>
                        )}
                      </span>
                    );
                  })}
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
