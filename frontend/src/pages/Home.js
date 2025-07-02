import React from "react";

export default function Home() {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <button
        onClick={handleGoogleLogin}
        style={{
          padding: "10px 20px",
          background: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px"
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
