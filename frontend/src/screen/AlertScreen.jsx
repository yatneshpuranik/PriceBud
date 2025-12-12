import { useEffect, useState } from "react";
import axios from "axios";

const AlertScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/alerts", {
        withCredentials: true,
      });
      setAlerts(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load alerts");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "24px",
      }}
    >
      {/* Heading */}
      <h1
        style={{
          fontSize: 30,
          fontWeight: 700,
          marginBottom: 8,
          color: "#111827",
          letterSpacing: "-0.5px",
        }}
      >
        Price Drop Alerts
      </h1>

      <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 24 }}>
        Alerts generate automatically when a product drops more than{" "}
        <b>20%</b> from its recent high.
      </p>

      {/* Error Notice */}
      {error && (
        <div
          style={{
            color: "#b91c1c",
            background: "#fee2e2",
            padding: "10px 14px",
            borderRadius: 10,
            marginBottom: 16,
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <p style={{ opacity: 0.6 }}>Loading alerts…</p>
      ) : alerts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            borderRadius: 14,
            padding: "50px 0",
            background: "#fafafa",
            border: "1px dashed #d1d5db",
            color: "#6b7280",
          }}
        >
          <p style={{ fontSize: 16, margin: 0 }}>
            No alerts yet — track products to receive notifications.
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {alerts.map((alert) => (
            <li
              key={alert._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                background: "#ffffff",
                padding: "18px 20px",
                marginBottom: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "0.25s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0,0,0,0.04)";
              }}
            >
              {/* LEFT CONTENT */}
              <div style={{ width: "75%" }}>
                <p
                  style={{
                    fontWeight: 600,
                    margin: 0,
                    fontSize: 16,
                    color: "#1f2937",
                    marginBottom: 4,
                  }}
                >
                  {alert.product?.title || alert.product?.name || "Product"}
                </p>

                <p style={{ margin: 0, fontSize: 14, color: "#374151" }}>
                  <b>Drop:</b> {alert.dropPercent.toFixed(1)}% &nbsp; | &nbsp;
                  <b>From:</b> {alert.previousHigh.toFixed(0)} →{" "}
                  <b>Now:</b> {alert.currentPrice.toFixed(0)}
                </p>

                {alert.createdAt && (
                  <p
                    style={{
                      margin: 0,
                      marginTop: 6,
                      fontSize: 12,
                      color: "#6b7280",
                    }}
                  >
                    Detected: {new Date(alert.createdAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* BADGE */}
              <span
                style={{
                  background: "#ffe4e6",
                  color: "#be123c",
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  border: "1px solid #fecdd3",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                🔻 Big Drop
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertScreen;
