import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import Product from "../component/Product";

const TrackedScreen = () => {
  const [items, setItems] = useState([]);
  const [deletedItem, setDeletedItem] = useState(null);
  const [showUndo, setShowUndo] = useState(false);

  const loadTracked = async () => {
    try {
      const { data } = await axios.get("/api/tracked", {
        withCredentials: true,
      });
      setItems(data);
    } catch (e) {
      console.log("Error loading tracked items:", e);
    }
  };

  useEffect(() => {
    loadTracked();
  }, []);

  // DELETE ONE ITEM
  const removeItem = async (trackId) => {
    const item = items.find((i) => i.trackId === trackId);

    setDeletedItem(item);
    setShowUndo(true);

    // Remove in UI (smooth animation)
    setItems((prev) =>
      prev.filter((i) => i.trackId !== trackId).map((i) => ({
        ...i,
        _deleted: i.trackId === trackId,
      }))
    );

    // Wait before backend delete (allow undo)
    setTimeout(async () => {
      if (showUndo) return;
      await axios.delete(`/api/tracked/${trackId}`, {
        withCredentials: true,
      });
    }, 1200);
  };

  // UNDO
  const undoDelete = () => {
    if (!deletedItem) return;
    setItems((prev) => [deletedItem, ...prev]);
    setDeletedItem(null);
    setShowUndo(false);
  };

  // CLEAR ALL
  const clearAll = async () => {
    await axios.delete("/api/tracked", { withCredentials: true });
    setItems([]);
  };

  return (
    <Container className="py-4" style={{ maxWidth: "900px" }}>
      
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            fontSize: "28px",
            letterSpacing: "-0.5px",
          }}
        >
          Recently Viewed
        </h2>

        {items.length > 0 && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={clearAll}
            style={{
              borderRadius: "8px",
              padding: "6px 14px",
              fontWeight: 600,
            }}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* EMPTY STATE */}
      {items.length === 0 ? (
        <div
          style={{
            padding: "40px",
            borderRadius: "14px",
            border: "1px dashed #d1d5db",
            background: "#fafafa",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "16px",
          }}
        >
          No recently viewed products.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          {items.map((p) => (
            <div
              key={p.trackId}
              style={{
                position: "relative",
                transition: "transform 0.3s ease, opacity 0.3s ease",
                transform: p._deleted ? "translateX(-80px)" : "translateY(0)",
                opacity: p._deleted ? 0 : 1,
              }}
            >
              {/* DELETE BUTTON */}
              <Button
                onClick={() => removeItem(p.trackId)}
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-10px",
                  zIndex: 20,
                  background: "#ffffff",
                  color: "#dc2626",
                  border: "1px solid #e5e7eb",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                }}
              >
                ×
              </Button>

              {/* SWIPE REMOVE (MOBILE) */}
              <div
                draggable
                onDragEnd={(e) => {
                  if (e.clientX < 150) removeItem(p.trackId);
                }}
                style={{ touchAction: "pan-x" }}
              >
                <div
                  style={{
                    transition: "0.25s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-3px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <Product product={p} />
                </div>
              </div>

              {/* Viewed Timestamp */}
              <small
                style={{
                  color: "#6b7280",
                  marginTop: "6px",
                  display: "block",
                  fontSize: "13px",
                }}
              >
                Viewed: {new Date(p.viewedAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}

      {/* UNDO SNACKBAR */}
      {showUndo && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1f2937",
            color: "white",
            padding: "12px 22px",
            borderRadius: "10px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
            zIndex: 5000,
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: "14px",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <span>Item removed</span>
          <button
            onClick={undoDelete}
            style={{
              background: "transparent",
              border: "none",
              color: "#60a5fa",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            UNDO
          </button>
        </div>
      )}
    </Container>
  );
};

export default TrackedScreen;
