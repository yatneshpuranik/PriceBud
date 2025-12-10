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
      console.error(err);
      setError("Failed to load alerts");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        Price Drop Alerts
      </h1>

      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
        These alerts are automatically created when a tracked product drops
        more than <b>20%</b> from its recent high.
      </p>

      {error && (
        <div style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</div>
      )}

      {loading ? (
        <p>Loading alerts…</p>
      ) : alerts.length === 0 ? (
        <p style={{ color: "#6b7280" }}>
          No alerts yet. Track some products and check back when prices drop.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {alerts.map((alert) => (
            <li
              key={alert._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              <div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>
                  {alert.product?.title || alert.product?.name || "Product"}
                </p>
                <p style={{ margin: 0, fontSize: 14 }}>
                  <b>Drop:</b> {alert.dropPercent.toFixed(1)}% &nbsp; | &nbsp;
                  <b>From:</b> {alert.previousHigh.toFixed(0)} &nbsp;→&nbsp;
                  <b>Now:</b> {alert.currentPrice.toFixed(0)}
                </p>
                {alert.createdAt && (
                  <p
                    style={{
                      margin: 0,
                      marginTop: 4,
                      fontSize: 12,
                      color: "#6b7280",
                    }}
                  >
                    Detected at:{" "}
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                )}
              </div>

              <span
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#fee2e2",
                  color: "#b91c1c",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
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
