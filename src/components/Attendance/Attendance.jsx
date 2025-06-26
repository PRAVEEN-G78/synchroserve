import React, { useState, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import Webcam from 'react-webcam';
import './Attendance.css';

function Attendance() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCalendar, setShowCalendar] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    checkIn: '',
    checkOut: '',
    checkInDate: '',
    checkOutDate: ''
  });
  const [attendanceRecords] = useState([
    {
      id: 1,
      date: '2024-03-20',
      checkIn: '09:00',
      checkOut: '18:00',
      status: 'Present',
      workingHours: 9,
      overtime: 0,
    },
    {
      id: 2,
      date: '2024-03-19',
      checkIn: '09:15',
      checkOut: '18:00',
      status: 'Late',
      workingHours: 8.75,
      overtime: 0,
    },
    {
      id: 3,
      date: '2024-03-18',
      checkIn: '09:00',
      checkOut: '17:00',
      status: 'Present',
      workingHours: 8,
      overtime: 0,
    },
  ]);

  const [leaveBalance] = useState([
    {
      type: 'Annual Leave',
      total: 20,
      used: 5,
      remaining: 15,
    },
    {
      type: 'Sick Leave',
      total: 10,
      used: 2,
      remaining: 8,
    },
  ]);

  const [message, setMessage] = useState('');

  // Face Auth & GPS state
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState('');
  const [faceAuthMessage, setFaceAuthMessage] = useState('');
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [faceModalType, setFaceModalType] = useState(null); // 'checkin' or 'checkout'

  const handleCheckIn = () => {
    setFaceModalType('checkin');
    setFaceModalOpen(true);
  };

  const handleCheckOut = () => {
    setFaceModalType('checkout');
    setFaceModalOpen(true);
  };

  const handleFaceCapture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setFaceModalOpen(false);
      setTimeout(() => setCapturedImage(null), 1000); // Clear image after modal closes
      if (!location.lat || !location.lng) {
        setFaceAuthMessage('Location not available. Please allow location access.');
        setTimeout(() => setFaceAuthMessage(''), 3000);
        return;
      }
      // Convert base64 image to Blob
      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();
      formData.append('file', blob, 'face.jpg');
      formData.append('latitude', location.lat);
      formData.append('longitude', location.lng);
      try {
        const res = await fetch('http://localhost:8000/validate/', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.face_matched && data.location_ok) {
          const now = new Date();
          if (faceModalType === 'checkin') {
            setAttendanceData(prev => ({
              ...prev,
              checkIn: now.toLocaleTimeString(),
              checkInDate: now.toLocaleDateString()
            }));
            setMessage('Checked in successfully!');
          } else if (faceModalType === 'checkout') {
            setAttendanceData(prev => ({
              ...prev,
              checkOut: now.toLocaleTimeString(),
              checkOutDate: now.toLocaleDateString()
            }));
            setMessage('Checked out successfully!');
          }
        } else {
          setFaceAuthMessage(data.status || 'Face or location validation failed.');
        }
      } catch (err) {
        setFaceAuthMessage('Face authentication server error.');
      }
      setTimeout(() => {
        setMessage('');
        setFaceAuthMessage('');
      }, 3000);
    }
  };

  const handleExport = () => {
    // Export functionality would go here
    setMessage('Exporting attendance report...');
    setTimeout(() => setMessage(''), 3000);
  };

  const calculateMonthlyStats = () => {
    const present = attendanceRecords.filter(r => r.status === 'Present').length;
    const late = attendanceRecords.filter(r => r.status === 'Late').length;
    const absent = attendanceRecords.filter(r => r.status === 'Absent').length;
    const totalWorkingHours = attendanceRecords.reduce((sum, r) => sum + r.workingHours, 0);
    const totalOvertime = attendanceRecords.reduce((sum, r) => sum + r.overtime, 0);

    return { present, late, absent, totalWorkingHours, totalOvertime };
  };

  const stats = calculateMonthlyStats();

  // Get GPS location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationError('');
        },
        (err) => {
          setLocationError('Location access denied or unavailable.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  // Capture image from webcam
  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      // Placeholder: Here you would send imageSrc to a backend or face recognition API
      setFaceAuthMessage('Face captured! (Authentication placeholder)');
      setTimeout(() => setFaceAuthMessage(''), 3000);
    }
  };

  // Helper to get all days in the selected month
  const getMonthDays = (month) => {
    const start = startOfMonth(new Date(month + '-01'));
    const end = endOfMonth(start);
    return eachDayOfInterval({ start, end });
  };

  return (
    <div className="attendance-container">
      {/* Face Authentication Modal */}
      {faceModalOpen && (
        <div className="face-modal-overlay">
          <div className="face-modal-content">
            <h2 style={{marginBottom: '1rem'}}>
              {faceModalType === 'checkin' ? 'Check In' : 'Check Out'} - Face Authentication
            </h2>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={240}
              height={180}
              style={{borderRadius: 8, border: '1px solid #ddd'}}
            />
            <div style={{marginTop: 12, display: 'flex', gap: 8}}>
              <button className="button button-primary" onClick={handleFaceCapture}>
                <i className="icon">📸</i> Capture & Continue
              </button>
              <button className="button button-secondary" onClick={() => setFaceModalOpen(false)}>
                Cancel
              </button>
            </div>
            {faceAuthMessage && (
              <div style={{marginTop: 16, color: 'red', fontWeight: 500}}>{faceAuthMessage}</div>
            )}
          </div>
        </div>
      )}
      <div className="attendance-header">
        <h1 className="attendance-title">Attendance Management</h1>
        <div className="header-actions">
          <button
            className="button button-outlined"
            onClick={() => setShowCalendar(true)}
          >
            <i className="icon">📅</i>
            Calendar View
          </button>
          <button
            className="button button-outlined"
            onClick={handleExport}
          >
            <i className="icon">📥</i>
            Export Report
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="quick-actions-card">
          <div className="quick-actions-content">
            <div className="form-group">
              <label className="form-label">Today's Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <button
              className="button button-primary"
              onClick={handleCheckIn}
            >
              <i className="icon">⏰</i>
              Check In
            </button>
            <button
              className="button button-secondary"
              onClick={handleCheckOut}
            >
              <i className="icon">⏰</i>
              Check Out
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stats-grid">
          <div className="stat-card stat-inline">
            <div className="stat-label">Present Days</div>
            <div className="stat-value">{stats.present}</div>
          </div>
          <div className="stat-card stat-inline">
            <div className="stat-label">Late Days</div>
            <div className="stat-value">{stats.late}</div>
          </div>
          <div className="stat-card stat-inline">
            <div className="stat-label">Absent Days</div>
            <div className="stat-value">{stats.absent}</div>
          </div>
          <div className="stat-card stat-inline">
            <div className="stat-label">Working Hours</div>
            <div className="stat-value">{stats.totalWorkingHours}</div>
          </div>
          <div className="stat-card stat-inline">
            <div className="stat-label">Overtime Hours</div>
            <div className="stat-value">{stats.totalOvertime}</div>
          </div>
        </div>
      </div>

      {/* Leave Balance */}
      <div className="leave-balance">
        <h2 className="leave-balance-title">Leave Balance</h2>
        <div className="leave-balance-grid">
          {leaveBalance.map((leave) => (
            <div key={leave.type} className="leave-card">
              <h3 className="leave-type">{leave.type}</h3>
              <div className="leave-detail">
                <span className="leave-label">Total:</span>
                <span>{leave.total} days</span>
              </div>
              <div className="leave-detail">
                <span className="leave-label">Used:</span>
                <span>{leave.used} days</span>
              </div>
              <div className="leave-detail">
                <span className="leave-label">Remaining:</span>
                <span>{leave.remaining} days</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Records */}
      <div className="attendance-records">
        <div className="records-header">
          <h2 className="records-title">Attendance Records</h2>
          <div className="records-filters">
            <div className="form-group">
              <select
                className="form-input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Working Hours</th>
                <th>Overtime</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.checkIn}</td>
                  <td>{record.checkOut}</td>
                  <td>
                    <span className={`status-chip status-${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.workingHours}</td>
                  <td>{record.overtime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar Dialog */}
      {showCalendar && (
        <div className="calendar-dialog">
          <div className="calendar-content">
            <div className="calendar-header">
              <h2 className="calendar-title">Calendar View</h2>
              <button
                className="button button-secondary"
                onClick={() => setShowCalendar(false)}
              >
                Close
              </button>
            </div>
            {/* Month Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <button className="button button-secondary" onClick={() => setSelectedMonth(format(new Date(new Date(selectedMonth + '-01').setMonth(new Date(selectedMonth + '-01').getMonth() - 1)), 'yyyy-MM'))}>
                {'<'}
              </button>
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                style={{ fontSize: 16, padding: 4 }}
              />
              <button className="button button-secondary" onClick={() => setSelectedMonth(format(new Date(new Date(selectedMonth + '-01').setMonth(new Date(selectedMonth + '-01').getMonth() + 1)), 'yyyy-MM'))}>
                {'>'}
              </button>
            </div>
            {/* Calendar Grid */}
            <div className="calendar-grid">
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{ fontWeight: 600, textAlign: 'center' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
                </div>
              ))}
              {(() => {
                const days = getMonthDays(selectedMonth);
                const firstDay = days[0].getDay();
                const blanks = Array(firstDay).fill(null);
                const todayStr = format(new Date(), 'yyyy-MM-dd');
                return [
                  ...blanks.map((_, i) => <div key={'b'+i} className="calendar-day disabled"></div>),
                  ...days.map(day => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const isToday = dayStr === todayStr;
                    const isSelected = dayStr === date;
                    return (
                      <div
                        key={dayStr}
                        className={`calendar-day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
                        onClick={() => setDate(dayStr)}
                        style={{ cursor: 'pointer', fontWeight: isToday ? 600 : 400 }}
                      >
                        {day.getDate()}
                      </div>
                    );
                  })
                ];
              })()}
            </div>
            <div style={{marginTop: 16}}>
              <b>Selected Date:</b> {date}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Attendance; 