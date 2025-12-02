import { useState } from "react";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [noteActive, setNoteActive] = useState(false);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);

  function newNote() {
    const newNoteItem = {
      id: Date.now(),
      content: `Ak's Note ${notes.length + 1}`,
    };
    setNotes((prevNotes) => [...prevNotes, newNoteItem]);
  }

  function openNote(index) {
    setSelectedNoteIndex(index);
    setNoteActive(true);
  }

  function closeNote() {
    setNoteActive(false);
    setSelectedNoteIndex(null);
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
          </div>

          {/* Display notes list */}
          <div className="notes-list">
            {notes.map((note, index) => (
              <div
                key={note.id}
                className="note-item"
                onClick={() => openNote(index)}
              >
                <div className="nw-nt-div">
                  <p>{note.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal overlay for viewing/editing a single note */}
      {noteActive && selectedNoteIndex !== null && (
        <>
          <div className="backdrop" onClick={closeNote}></div>
          <div className="notes-modal">
            <div className="cls-btn-div">
              <button className="cls-nt-btn" onClick={closeNote}>
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="note-content">
                {notes[selectedNoteIndex].content}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Notes;
