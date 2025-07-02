import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  // ✅ Get user info
  useEffect(() => {
    axios
      .get("https://todo-backend-akshaya.onrender.com/auth/success", {
        withCredentials: true,
      })
      .then((res) => setUser(res.data.user))
      .catch(() => (window.location.href = "/"));
  }, []);

  // ✅ Get tasks
  useEffect(() => {
    axios
      .get("https://todo-backend-akshaya.onrender.com/api/tasks", {
        withCredentials: true,
      })
      .then((res) => setTasks(res.data));
  }, []);

  // ✅ Add task
  const handleAddTask = () => {
    if (!title) return;
    axios
      .post(
        "https://todo-backend-akshaya.onrender.com/api/tasks",
        { title },
        { withCredentials: true }
      )
      .then((res) => {
        setTasks([res.data.task, ...tasks]);
        setTitle("");
      });
  };

  // ✅ Delete task
  const handleDelete = (id) => {
    axios
      .delete(
        `https://todo-backend-akshaya.onrender.com/api/tasks/${id}`,
        { withCredentials: true }
      )
      .then(() => {
        setTasks(tasks.filter((task) => task._id !== id));
      });
  };

  // ✅ Share task
  const handleShare = (id) => {
    const email = prompt("Enter email to share this task with:");
    if (!email) return;
    axios
      .post(
        `https://todo-backend-akshaya.onrender.com/api/tasks/${id}/share`,
        { email },
        { withCredentials: true }
      )
      .then(() => alert(`✅ Shared with ${email}`))
      .catch(() => alert("❌ Sharing failed"));
  };

  if (!user) return <div style={{ padding: "2rem" }}>Loading...</div>;

  return (
    <div
      style={{
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "white",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img
            src={user.photo}
            alt="profile"
            style={{ width: "80px", borderRadius: "50%", marginBottom: "10px" }}
          />
          <h2 style={{ margin: "0" }}>Hello, {user.name} 👋</h2>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>{user.email}</p>
        </div>

        <div style={{ display: "flex", marginBottom: "1.5rem" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a task..."
            style={{
              flex: 1,
              padding: "10px 14px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              marginRight: "10px",
            }}
          />
          <button
            onClick={handleAddTask}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>

        {tasks.length === 0 && (
          <p style={{ textAlign: "center", color: "#888" }}>No tasks yet.</p>
        )}

        {tasks.map((task) => (
          <div
            key={task._id}
            style={{
              background: "#fafafa",
              border: "1px solid #ddd",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 500 }}>{task.title}</div>
              {task.owner !== user.email && (
                <span style={{ fontSize: "0.85rem", color: "#999" }}>
                  (Shared with you)
                </span>
              )}
            </div>
            {task.owner === user.email && (
              <div>
                <button
                  onClick={() => handleShare(task._id)}
                  style={{
                    marginRight: "8px",
                    padding: "6px 10px",
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Share
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
