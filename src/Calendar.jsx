function Calendar() {
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

  // Usage
  const monthDates = getMonthDatesByWeekday();
  console.log(monthDates);
  const wks = getWeeks();
  console.log("weeeeeeeeeeeeks:", wks);
  const date = new Date(2025, 11, 1); // December 1, 2025
  const formatted = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const today = new Date();
  const todayDate = today.getDate();

  return (
    <>
      <div className="calendar-div-main">
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
                    }}
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
      </div>
    </>
  );
}

export default Calendar;
