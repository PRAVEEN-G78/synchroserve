import React, { useState } from "react";
import "./LeaveRequestForm.css";

export default function LeaveRequestForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    leaveType: "Sick Leave",
    startDate: "",
    endDate: "",
    reason: "",
    messageToManager: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResultMessage("");
    try {
      const response = await fetch("/api/send-manager-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setResultMessage("Your leave request and message have been sent to the center manager.");
        setFormData({
          name: "",
          employeeId: "",
          leaveType: "Sick Leave",
          startDate: "",
          endDate: "",
          reason: "",
          messageToManager: "",
        });
      } else {
        setResultMessage("Failed to send message to manager. Please try again later.");
      }
    } catch (error) {
      setResultMessage("An error occurred. Please try again later.");
    }
    setSubmitting(false);
  };

  return (
    <div className="leave-form-container">
      <button className="form-close-btn" onClick={onClose} aria-label="Close">&times;</button>
      <h2 className="leave-form-title">Leave Request Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Employee Name</label>
          <input
            type="text"
            className="form-input"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Employee ID</label>
          <input
            type="text"
            className="form-input"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Leave Type</label>
          <select
            className="form-select"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
          >
            <option value="Sick Leave">Sick Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Earned Leave">Earned Leave</option>
            <option value="Maternity Leave">Maternity Leave</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-input"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-input"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Reason for Leave</label>
          <textarea
            className="form-textarea"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Message to Center Manager (optional)</label>
          <textarea
            className="form-textarea"
            name="messageToManager"
            value={formData.messageToManager}
            onChange={handleChange}
            placeholder="Type your message here..."
          />
        </div>

        <button type="submit" className="submit-button" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Leave Request"}
        </button>
        {resultMessage && (
          <div className="result-message">{resultMessage}</div>
        )}
      </form>
    </div>
  );
} 