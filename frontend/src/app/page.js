"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/status`
);

        if (!response.ok) {
          throw new Error("Backend request failed");
        }

        const data = await response.json();

        setBackendStatus(data.message);
      } catch (error) {
        console.error(error);
        setBackendStatus("Backend connection failed");
        setError("Could not connect to Vaxcribe API.");
      }
    }

    checkBackend();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>
          Vaxcribe
        </h1>

        <p style={{ color: "#666", marginBottom: "30px" }}>
          Turn your videos into knowledge you can search, understand, and use.
        </p>

        <div
          style={{
            padding: "16px",
            borderRadius: "10px",
            background: "#f0fdf4",
            color: "#166534",
            fontWeight: "bold",
          }}
        >
          ✓ {backendStatus}
        </div>

        {error && (
          <p style={{ color: "#dc2626", marginTop: "15px" }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}