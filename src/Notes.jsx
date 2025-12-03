import { useState, useRef, useEffect } from "react";

function Notes() {
  // Load notes from localStorage on initial render
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("notes");
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [noteActive, setNoteActive] = useState(false);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
  const contentRef = useRef(null);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  function newNote() {
    //*********************************************/
    // Create a Date object (current time)
    const now = new Date();

    // Get date parts
    const month = now.getMonth() + 1; // Months are 0-indexed (0 = January)
    const day = now.getDate();
    const year = now.getFullYear();

    // Get time parts
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert 24-hour to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

    // Format time with leading zero
    const formattedHours = hours.toString().padStart(2, "0");

    // Create the formatted strings
    const dateString = `${month}/${day}/${year}`;
    const timeString = `${formattedHours}:${minutes} ${ampm}`;
    //********************************************************************/

    const newNoteItem = {
      id: Date.now(),
      content: `Add text`,
      date: dateString,
      time: timeString,
    };
    setNotes((prevNotes) => [...prevNotes, newNoteItem]);
  }

  function openNote(noteId) {
    const originalIndex = notes.findIndex((note) => note.id === noteId);
    setSelectedNoteIndex(originalIndex);
    setNoteActive(true);
    // Set the text directly when opening
    setTimeout(() => {
      if (contentRef.current && notes[originalIndex]) {
        contentRef.current.innerHTML = notes[originalIndex].content;
      }
    }, 0);
  }

  function closeNote() {
    setNoteActive(false);
    setSelectedNoteIndex(null);
  }

  function deleteNote(noteId, e) {
    e.stopPropagation(); // CRITICAL: Prevent click from bubbling
    e.preventDefault(); // Extra safety

    const originalIndex = notes.findIndex((note) => note.id === noteId);

    setNotes((prevNotes) => {
      const newNotes = [...prevNotes];
      newNotes.splice(originalIndex, 1);
      return newNotes;
    });

    closeNote();
  }

  // Function to clear all notes (optional - you can add a button for this)
  function clearAllNotes() {
    if (window.confirm("Are you sure you want to delete all notes?")) {
      setNotes([]);
      localStorage.removeItem("notes");
    }
  }

  // Sort notes by ID in descending order (newest first)
  const sortedNotes = [...notes].sort((a, b) => b.id - a.id);

  return (
    <>
      <div className="main-kontainer">
        <div className="wrapper">
          <div className="page-text">
            <h1>NOTES</h1>
          </div>
        </div>
        <div className="kontainer">
          <div className="crt-nt-btn-div">
            <button className="crt-nt-btn" onClick={newNote}>
              Create New Note
            </button>
            {/* Optional: Add clear all button */}
            {/* <button 
              className="crt-nt-btn" 
              onClick={clearAllNotes}
              style={{ marginLeft: "10px", backgroundColor: "#ff6b6b" }}
            >
              Clear All
            </button> */}
          </div>

          {/* Display notes list */}
          <div className="notes-list">
            {sortedNotes.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                <p className="warning"></p>
              </div>
            ) : (
              sortedNotes.map((note) => (
                <div
                  key={note.id}
                  className="note-item"
                  onClick={() => openNote(note.id)}
                >
                  <div className="nw-nt-div">
                    <div className="nt-cntnt-div">
                      <p dangerouslySetInnerHTML={{ __html: note.content }}></p>
                    </div>
                    <div className="dlt-nt-btn-div">
                      <button
                        className="dlt-btn"
                        onClick={(e) => deleteNote(note.id, e)}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal overlay for viewing/editing a single note */}
      {noteActive && selectedNoteIndex !== null && notes[selectedNoteIndex] && (
        <>
          <div className="backdrop" onClick={closeNote}></div>
          <div className="notes-modal">
            <div className="mdl-hdr">
              <div className="nt-dt-tm">
                <p style={{ fontWeight: "bold" }}>
                  {notes[selectedNoteIndex].date || "No date"}
                </p>
                <p>{notes[selectedNoteIndex].time || "No time"}</p>
              </div>
              <div className="cls-btn-div">
                <button className="cls-nt-btn" onClick={closeNote}>
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
            <div className="modal-content">
              <div
                className="note-content"
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) => {
                  const updatedText = e.target.innerHTML;
                  setNotes((prev) =>
                    prev.map((n, i) =>
                      i === selectedNoteIndex
                        ? { ...n, content: updatedText }
                        : n
                    )
                  );
                }}
              ></div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Notes;
