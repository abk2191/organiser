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
    const newNoteItem = {
      id: Date.now(),
      content: `Add text`,
    };
    setNotes((prevNotes) => [...prevNotes, newNoteItem]);
  }

  function openNote(index) {
    setSelectedNoteIndex(index);
    setNoteActive(true);
    // Set the text directly when opening
    setTimeout(() => {
      if (contentRef.current && notes[index]) {
        contentRef.current.innerText = notes[index].content;
      }
    }, 0);
  }

  function closeNote() {
    setNoteActive(false);
    setSelectedNoteIndex(null);
  }

  function deleteNote(index, e) {
    e.stopPropagation(); // CRITICAL: Prevent click from bubbling
    e.preventDefault(); // Extra safety

    setNotes((prevNotes) => {
      const newNotes = [...prevNotes];
      newNotes.splice(index, 1);
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
            {notes.length === 0 ? (
              <div style={{ textAlign: "center", justifyContent: "center" }}>
                <p className="warning">No notes yet. Create your first note!</p>
              </div>
            ) : (
              notes.map((note, index) => (
                <div
                  key={note.id}
                  className="note-item"
                  onClick={() => openNote(index)}
                >
                  <div className="nw-nt-div">
                    <div className="nt-cntnt-div">
                      <p>{note.content}</p>
                    </div>
                    <div className="dlt-nt-btn-div">
                      <button
                        className="dlt-btn"
                        onClick={(e) => deleteNote(index, e)}
                      >
                        <i class="fa-solid fa-trash-can"></i>
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
            <div className="cls-btn-div">
              <button className="cls-nt-btn" onClick={closeNote}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-content">
              <div
                className="note-content"
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) => {
                  const updatedText = e.target.innerText;
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
