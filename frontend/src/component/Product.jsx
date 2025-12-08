import { Link } from "react-router-dom";
import PriceChart from "./PriceChart";

const PLATFORM_LOGOS = {
  amazon: "/images/amazon.jpg",
  flipkart: "/images/flipkart.jpg",
  myntra: "/images/myntra.jpg",
};

const Product = ({ product }) => {
  const platforms = product?.platforms || [];
  if (platforms.length === 0) return <p>No platform data</p>;

  // ✅ Sort by price ALWAYS first
  const sorted = [...platforms].sort(
    (a, b) => a.currentPrice - b.currentPrice
  );



const bestPlatform = sorted[0];

// ALWAYS use history of the cheapest platform
const history = bestPlatform.history && bestPlatform.history.length > 0
  ? bestPlatform.history
  : [{ price: bestPlatform.currentPrice, date: new Date() }];

const latest = bestPlatform.currentPrice;


  // Stats
  const prices = history.map((h) => h.price);
  const highest = Math.max(...prices, latest);
  const lowest = Math.min(...prices, latest);

  const dropPercent =
    highest > 0 ? (((highest - latest) / highest) * 100).toFixed(1) : 0;

  const recommendation = latest <= lowest * 1.05 ? "Buy Now" : "Hold / Watch";

  const logo = PLATFORM_LOGOS[bestPlatform.name.toLowerCase()];


  return (
    <Link
      to={`/product/${product._id}`}
      className="text-decoration-none text-dark"
      style={{ width: "100%" }}
    >
      <div
        style={{
          display: "flex",
          gap: "18px",
          background: "white",
          borderRadius: "14px",
          padding: "18px",
          border: "1px solid #e7e7e7",
          boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
        }}
      >
        {/* LEFT SIDE */}
        <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              width: "100%",
              height: "160px",
              background: "#f8f8f8",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <img
              src={product.image}
              alt={product.title}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          <h5 style={{ fontWeight: 600, minHeight: "42px" }}>{product.title}</h5>

          <h4 style={{ color: "#16a34a", fontWeight: "bold", margin: 0 }}>
            ₹{latest.toLocaleString()}
          </h4>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
  src={logo}
  alt={bestPlatform.name}
  style={{
    width: "26px",
    height: "26px",
    objectFit: "contain",
    background: "#fff",
    padding: "3px",
    borderRadius: "50%",
    border: "1px solid #eee",
  }}
/>

            <span style={{ fontSize: "14px", color: "gray" }}>
              Best Price from <b>{bestPlatform.name}</b>
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {dropPercent > 0 && (
              <span
                style={{
                  padding: "4px 8px",
                  fontSize: "12px",
                  background: "rgba(255,0,0,0.1)",
                  color: "red",
                  borderRadius: "6px",
                }}
              >
                🔻 {dropPercent}% Drop
              </span>
            )}

            <span
              style={{
                padding: "4px 8px",
                fontSize: "12px",
                background:
                  recommendation === "Buy Now"
                    ? "rgba(0,200,0,0.1)"
                    : "rgba(0,0,0,0.08)",
                color: recommendation === "Buy Now" ? "green" : "gray",
                borderRadius: "6px",
              }}
            >
              ⭐ {recommendation}
            </span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={{ width: "60%", height: "180px" }}>
          {history.length > 0 ? (
            <>
              <PriceChart data={history} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "10px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <strong>Lowest:</strong>{" "}
                  <span style={{ color: "green" }}>
                    ₹{lowest.toLocaleString()}
                  </span>
                </div>
                <div>
                  <strong>Highest:</strong>{" "}
                  <span style={{ color: "red" }}>
                    ₹{highest.toLocaleString()}
                  </span>
                </div>
                <div>
                  <strong>Avg:</strong>{" "}
                  {(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(0)}
                </div>
              </div>
            </>
          ) : (
            <p style={{ fontSize: "12px", color: "gray" }}>
              No price history available
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Product;
