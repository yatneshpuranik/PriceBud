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

  // DELETE ONE
  const removeItem = async (trackId) => {
    const item = items.find((i) => i.trackId === trackId);

    setDeletedItem(item);
    setShowUndo(true);

    // UI Remove Animation
    setItems((prev) =>
      prev.filter((i) => i.trackId !== trackId).map((i) => ({
        ...i,
        _deleted: i.trackId === trackId,
      }))
    );

    // Send delete to backend after short delay
    setTimeout(async () => {
      if (showUndo) return; // user clicked Undo
      await axios.delete(`/api/tracked/${trackId}`, {
        withCredentials: true,
      });
    }, 1200);
  };

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
    <Container className="py-3">
      {/* HEADER ROW */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontWeight: 700 }}>Recently Viewed</h2>

        {items.length > 0 && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={clearAll}
            style={{ borderRadius: "6px" }}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* EMPTY STATE */}
      {items.length === 0 ? (
        <p className="text-muted">Nothing viewed yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          {items.map((p) => (
            <div
              key={p.trackId}
              style={{
                position: "relative",
                transition: "transform 0.3s ease, opacity 0.3s ease",
                transform: p._deleted ? "translateX(-80px)" : "translateX(0)",
                opacity: p._deleted ? 0 : 1,
              }}
            >
              {/* DELETE BUTTON FOR DESKTOP */}
              <Button
                onClick={() => removeItem(p.trackId)}
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-10px",
                  zIndex: 20,
                  background: "white",
                  color: "red",
                  border: "1px solid #ccc",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                ×
              </Button>

              {/* SWIPE TO REMOVE (MOBILE) */}
              <div
                draggable
                onDragEnd={(e) => {
                  if (e.clientX < 150) removeItem(p.trackId);
                }}
                style={{ touchAction: "pan-x" }}
              >
                <Product product={p} />
              </div>

              {/* VIEWED TIME */}
              <small style={{ color: "gray", marginTop: "6px", display: "block" }}>
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
            background: "#333",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            zIndex: 5000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span>Item removed</span>
          <button
            onClick={undoDelete}
            style={{
              background: "transparent",
              border: "none",
              color: "#4FC3F7",
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
