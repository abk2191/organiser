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

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [shouldRenderSidebar, setShouldRenderSidebar] = useState(false);
  const sidebarRef = useRef(null);

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

  return (
    <Router basename="/organiser">
      <div>
        {/* Navbar and Sidebar Logic Starts */}
        <div className="navbar">
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
                <h2>NOTES</h2>
              </div>
              <div
                className="sliding-div-two div-style"
                onClick={() => {
                  window.location.href = "/organiser/todo";
                  closeSidebar();
                }}
              >
                <h2>TODOS</h2>
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
