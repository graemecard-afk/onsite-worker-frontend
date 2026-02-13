// src/pages/OnShiftPage.jsx
import React, { useEffect, useState } from "react";
import GpsBreadcrumbs from "../components/GpsBreadcrumbs.jsx";



export default function OnShiftPage({
  theme,
  siteName,
  userEmail,
  shiftStartTimeText,
  onSignOut,
onSupervisor,
  activeTask,
  setActiveTask,
  completedTasks,
  setCompletedTasks,
  breadcrumbs,
}) {

  const isDark = theme === "dark";
const [minutesOnSite, setMinutesOnSite] = useState(0);

// --- TASK STATE ---
const [selectedTask, setSelectedTask] = useState('');
const [otherTaskText, setOtherTaskText] = useState('');


const [activeTaskElapsed, setActiveTaskElapsed] = useState(0);

// --- ACTIVE TASK TIMER ---
useEffect(() => {
  if (!activeTask) return;

  const tick = () => {
    const diffMs = Date.now() - new Date(activeTask.startedAt).getTime();
    setActiveTaskElapsed(Math.floor(diffMs / 1000));
  };

  tick();
  const id = setInterval(tick, 1000);

  return () => clearInterval(id);
}, [activeTask]);



useEffect(() => {
  if (!shiftStartTimeText) return;

  const parseStart = () => {
    const [hour, minute] = shiftStartTimeText.split(":").map(Number);
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const update = () => {
    const start = parseStart();
    const now = new Date();
    const diffMs = now - start;
    const mins = Math.max(0, Math.floor(diffMs / 60000));
    setMinutesOnSite(mins);
  };

  update();

  const id = setInterval(update, 30000);
  return () => clearInterval(id);
}, [shiftStartTimeText]);



  const pageStyle = {
    minHeight: "100vh",
    background: isDark ? "#0b1220" : "#f6f7fb",
    color: isDark ? "#e7eaf0" : "#111827",
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: 520,
    background: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
    border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 20,
    boxShadow: isDark
      ? "0 10px 30px rgba(0,0,0,0.35)"
      : "0 10px 30px rgba(17,24,39,0.08)",
  };

  const labelStyle = {
    fontSize: 12,
    letterSpacing: 0.3,
    opacity: 0.75,
    marginBottom: 6,
  };

  const bigStyle = {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
  };

  const subStyle = {
    marginTop: 10,
    fontSize: 14,
    opacity: 0.85,
  };

  const boxStyle = {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    border: isDark ? "1px dashed rgba(255,255,255,0.25)" : "1px dashed #cbd5e1",
    background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    fontSize: 14,
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={labelStyle}>On site</div>
        <p style={bigStyle}>
          {siteName ? siteName : "Unknown site"}
        </p>
<div style={subStyle}>
  Logged in as: <strong>{userEmail || "—"}</strong>
</div>

                <div style={subStyle}>
          On site since{" "}
          <strong>{shiftStartTimeText ? shiftStartTimeText : "—"}</strong>
          <div style={{ marginTop: 6 }}>
            Minutes on site: <strong>{minutesOnSite}</strong>
          </div>
        </div>

        <GpsBreadcrumbs boxStyle={boxStyle} breadcrumbs={breadcrumbs} />

        {/* TASKS (scaffold - frontend only) */}
<div style={{ marginTop: 16, padding: 16, border: '1px solid rgba(0,0,0,0.15)', borderRadius: 12 }}>
  <div style={{ fontWeight: 700, marginBottom: 8 }}>Tasks</div>

  <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 12 }}>
    Select a common task (or Other) — wiring + timers coming next.
  </div>

  <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>
    Task
  </label>
  <select
  value={selectedTask}
  onChange={e => setSelectedTask(e.target.value)}
  style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid rgba(0,0,0,0.2)' }}
>
    <option value="">Select a task…</option>
    <option value="check_pumps">Check pumps</option>
    <option value="clear_debris_access_way">Clear debris from access way</option>
    <option value="flush_pod_lines_headworks">Flush pod lines and headworks</option>
    <option value="read_gauges">Read gauges</option>
    <option value="shift_pod_lines">Shift pod lines</option>
    <option value="unblock_sprinklers">Unblock sprinklers</option>
    <option value="weed_spray_around_pumps">Weed spray around pumps</option>
    <option value="other">Other (specify)</option>
  </select>

  <div style={{ marginTop: 10 }}>
    <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>
      If Other, describe
    </label>
    <input
  type="text"
  value={otherTaskText}
  onChange={e => setOtherTaskText(e.target.value)}
  disabled={selectedTask !== 'other'}
  placeholder="Type what you’re doing…"
  style={{ width: '100%', padding: 10, borderRadius: 10, borderRadius: 10, border: '1px solid rgba(0,0,0,0.2)' }}
/>

  </div>

  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
   <button
  type="button"
  disabled={!selectedTask || activeTask}
  style={{
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 600,
    cursor: "pointer",
    opacity: !selectedTask || activeTask ? 0.6 : 1,
  }}
  onClick={() => {

    let label = selectedTask;

    if (selectedTask === 'other') {
      if (!otherTaskText.trim()) return;
      label = otherTaskText.trim();
    } else {
      const map = {
        check_pumps: 'Check pumps',
        clear_debris_access_way: 'Clear debris from access way',
        flush_pod_lines_headworks: 'Flush pod lines and headworks',
        read_gauges: 'Read gauges',
        shift_pod_lines: 'Shift pod lines',
        unblock_sprinklers: 'Unblock sprinklers',
        weed_spray_around_pumps: 'Weed spray around pumps',
      };

      label = map[selectedTask];
    }

    setActiveTask({
      label,
      startedAt: new Date().toISOString(),
    });

    setSelectedTask('');
    setOtherTaskText('');
    setActiveTaskElapsed(0);
  }}
>
  Start task
</button>

    <button
  type="button"
  disabled={!activeTask}
  style={{
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 600,
    cursor: "pointer",
    opacity: !activeTask ? 0.6 : 1,
  }}
  onClick={() => {

    const endedAt = new Date().toISOString();

    const durationSeconds = Math.floor(
      (new Date(endedAt).getTime() -
        new Date(activeTask.startedAt).getTime()) /
        1000
    );

    setCompletedTasks(prev => [
      ...prev,
      {
        ...activeTask,
        endedAt,
        durationSeconds,
      },
    ]);

    setActiveTask(null);
    setActiveTaskElapsed(0);
  }}
>
  Stop task
</button>

  </div>

  {activeTask && (
  <div style={{ marginTop: 12, fontSize: 14 }}>
    <strong>Active task:</strong> {activeTask.label}
    <div>
      Running: {Math.floor(activeTaskElapsed / 60)}m {activeTaskElapsed % 60}s
    </div>
  </div>
)}

{!activeTask && completedTasks.length === 0 && (
  <div style={{ marginTop: 12, fontSize: 14, opacity: 0.8 }}>
    No tasks yet.
  </div>
)}

{completedTasks.length > 0 && (
  <div style={{ marginTop: 12 }}>
    <strong>Completed tasks</strong>
    <ul>
      {completedTasks.map((t, idx) => (
        <li key={idx}>
          {t.label} — {Math.floor(t.durationSeconds / 60)}m{' '}
          {t.durationSeconds % 60}s
        </li>
      ))}
    </ul>
  </div>
)}

</div>


                <button
          type="button"
          style={{
            marginTop: 20,
            width: "100%",
            padding: "14px 16px",
            borderRadius: 12,
            border: "none",
            background: "#dc2626",
            color: "white",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={() => onSignOut?.()}


        >
          Sign out
        </button>
{onSupervisor ? (
  <button
    type="button"
    style={{
      marginTop: 12,
      width: "100%",
      padding: "14px 16px",
      borderRadius: 12,
      border: "none",
      background: "#2563eb",
      color: "white",
      fontSize: 16,
      fontWeight: 600,
      cursor: "pointer",
    }}
    onClick={() => onSupervisor?.()}
  >
    Supervisor
  </button>
) : null}


      </div>
    </div>
  );
}
