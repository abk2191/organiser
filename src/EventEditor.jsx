import { useState } from "react";

function EventEditor({ onClose, onSaveEvent }) {
  // Add onSaveEvent prop
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    time: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    // Call onSaveEvent with the form data
    if (onSaveEvent) {
      onSaveEvent(formData);
    }

    if (onClose) onClose(); // Close after submit
  };

  return (
    <div className="event-editor-container">
      <div className="event-editor">
        <div className="event-viewer-name">
          <h3 style={{ color: "white" }}>EVENT EDITOR</h3>
        </div>
        {/* Add close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>

        <form onSubmit={handleSubmit} style={{ color: "white", width: "100%" }}>
          <div>
            <label htmlFor="name">Event Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="description">Event Description:</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="time">Time:</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
}

export default EventEditor;
