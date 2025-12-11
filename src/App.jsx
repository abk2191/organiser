import { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import Notes from "./Notes";
import Todo from "./Todo";
import Calendar from "./Calendar";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shouldRenderSidebar, setShouldRenderSidebar] = useState(false);
  const sidebarRef = useRef(null);

  // Load theme from localStorage on initial render
  const [lightTheme, setLightTheme] = useState(() => {
    const savedTheme = localStorage.getItem("lightTheme");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("lightTheme", JSON.stringify(lightTheme));
  }, [lightTheme]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    if (!isSidebarOpen) {
      // Opening: render sidebar first
      setShouldRenderSidebar(true);
    } else {
      // Closing: trigger close animation
      if (sidebarRef.current) {
        sidebarRef.current.classList.remove("sidebar-open");
        sidebarRef.current.classList.add("sidebar-close");
      }
      // Unmount after animation
      setTimeout(() => {
        setShouldRenderSidebar(false);
      }, 300); // Must match CSS animation duration
    }
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Add open class after sidebar mounts
  useEffect(() => {
    if (shouldRenderSidebar && isSidebarOpen && sidebarRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (sidebarRef.current) {
          sidebarRef.current.classList.add("sidebar-open");
          sidebarRef.current.classList.remove("sidebar-close");
        }
      }, 10);
    }
  }, [shouldRenderSidebar, isSidebarOpen]);

  // Function to close sidebar when a link is clicked (for mobile)
  const closeSidebar = () => {
    if (isSidebarOpen) {
      toggleSidebar();
    }
  };

  function handleThemeSwitch() {
    setLightTheme((prev) => !prev);
  }

  return (
    <Router basename="/organiser">
      <div>
        {/* Navbar and Sidebar Logic Starts */}
        <div className="navbar">
          <div className="logo">
            <h3 style={{ color: "white" }}>Andromeda.</h3>
          </div>

          <button
            className={`hamburger ${isSidebarOpen ? "open" : ""}`}
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Conditionally render sidebar */}
        {shouldRenderSidebar && (
          <div ref={sidebarRef} className="sidebar">
            <div className="sliding-div-container item-style">
              <div
                className="sliding-div div-style"
                onClick={() => {
                  window.location.href = "/organiser/notes";
                  closeSidebar();
                }}
              >
                <div className="sidebar-menu-items">
                  <i className="fa-solid fa-lightbulb"></i>
                  <h2 style={{ fontSize: "25px" }}>NOTES</h2>
                </div>
              </div>
              <div
                className="sliding-div-two div-style"
                onClick={() => {
                  window.location.href = "/organiser/todo";
                  closeSidebar();
                }}
              >
                <div className="sidebar-menu-items">
                  <i className="fa-solid fa-list-check"></i>
                  <h2 style={{ fontSize: "25px" }}>TODOS</h2>
                </div>
              </div>
              <div
                className="sliding-div-two div-style"
                onClick={() => {
                  window.location.href = "/organiser/calendar";
                  closeSidebar();
                }}
              >
                <div className="sidebar-menu-items">
                  <i className="fa-solid fa-calendar-days"></i>
                  <h2 style={{ fontSize: "25px" }}>CALENDAR</h2>
                </div>
              </div>
            </div>

            <div className="theme-holder">
              <h2 className="theme-text">
                {lightTheme ? (
                  <>
                    <i class="fa-solid fa-cloud-moon"></i> Dark
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-sun"></i> Light
                  </>
                )}
              </h2>
              <div className="toggle-border">
                <input
                  id="one"
                  type="checkbox"
                  checked={lightTheme}
                  onChange={handleThemeSwitch}
                />
                <label htmlFor="one">
                  <div className="handle"></div>
                </label>
              </div>
            </div>
          </div>
        )}
        {/* Navbar and Sidebar Logic Ends */}

        {/* Routes Configuration */}
        <Routes>
          <Route path="/" element={<Navigate to="/notes" />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
