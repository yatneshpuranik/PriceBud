import axios from "axios";
import { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import Product from "../component/Product";

const TrackedScreen = () => {
  const [items, setItems] = useState([]);

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
    await axios.delete(`/api/tracked/${trackId}`, {
      withCredentials: true,
    });
    loadTracked();
  };

  // CLEAR ALL
  const clearAll = async () => {
    await axios.delete("/api/tracked", { withCredentials: true });
    setItems([]);
  };

  return (
    <Container className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Recently Viewed</h2>
        {items.length > 0 && (
          <Button variant="outline-danger" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-muted">Nothing viewed yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          {items.map((p) => (
            <div key={p.trackId} style={{ position: "relative" }}>
              {/* REMOVE BUTTON */}
              <Button
                variant="outline-danger"
                size="sm"
                style={{ position: "absolute", top: 5, right: 5 }}
                onClick={() => removeItem(p.trackId)}
              >
                ✕
              </Button>

              <Product product={p} />

              <small className="text-muted">
                Viewed: {new Date(p.viewedAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default TrackedScreen;
