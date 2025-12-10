/* global tf */
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PriceChart from "./PriceChart";
import { quickAlign, quickTrain, quickPredict } from "../utils/mlMini";

const PLATFORM_LOGOS = {
  amazon: "/images/amazon.jpg",
  flipkart: "/images/flipkart.jpg",
  myntra: "/images/myntra.jpg",
};

const Product = ({ product }) => {
  // -----------------------
  // ALWAYS RUN HOOKS FIRST
  // -----------------------
  const [mlResult, setMlResult] = useState(null);

  const platforms = product?.platforms || [];

  // -----------------------
  // SAFETY RETURN NO EXIT BEFORE HOOKS
  // -----------------------
  const isEmpty = platforms.length === 0;

  // -----------------------
  // ML MINI ENGINE
  // -----------------------
  useEffect(() => {
    if (isEmpty) return;

    async function runMiniML() {
      try {
        // ALIGN DATA
        const series = quickAlign(platforms);
        if (series.length < 35) return; // not enough data

        // CURRENT BEST PRICE
        const currentBest = Math.min(...platforms.map((p) => p.currentPrice));

        // TRAIN
        const model = await quickTrain(series);
        if (!model) return;

        // PREDICT
        const result = await quickPredict(model, series, currentBest);

        // Compute ML DROP %
        const mlDropPercent =
          ((currentBest - result.predictedMin) / currentBest) * 100;

        setMlResult({
          ...result,
          currentBest,
          mlDropPercent: mlDropPercent.toFixed(1),
        });
      } catch (err) {
        console.log("ML Mini Error:", err);
      }
    }

    runMiniML();
  }, [product] );

  // -----------------------
  // BASED ON CHEAPEST PLATFORM
  // -----------------------
  const sorted = [...platforms].sort(
    (a, b) => a.currentPrice - b.currentPrice
  );

  const bestPlatform = sorted[0] || {};
  const history =
    bestPlatform.history?.length > 0
      ? bestPlatform.history
      : [{ price: bestPlatform.currentPrice, date: new Date() }];

  const latest = bestPlatform.currentPrice;
  const prices = history.map((h) => h.price);

  const highest = Math.max(...prices, latest);
  const lowest = Math.min(...prices, latest);

  const logo = PLATFORM_LOGOS[bestPlatform.name?.toLowerCase()] ?? "";

  return (
    <Link
      to={`/product/${product._id}`}
      className="text-decoration-none text-dark"
      style={{ width: "100%" }}
    >
      <div
        style={{
          display: "flex",
          gap: "22px",
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          border: "1px solid #e5e5e5",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          transition: "0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
        }}
      >
        {/* LEFT SECTION */}
        <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              width: "100%",
              height: "160px",
              background: "#f5f5f5",
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
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          <h5 style={{ fontWeight: 600, lineHeight: "1.3", minHeight: "45px" }}>
            {product.title}
          </h5>

          <h3 style={{ color: "#15803d", fontWeight: 700, margin: 0 }}>
            ${latest?.toLocaleString()}
          </h3>

          {/* BEST PLATFORM BADGE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "#fafafa",
              padding: "6px 10px",
              borderRadius: "10px",
              border: "1px solid #e5e5e5",
            }}
          >
            <img
              src={logo}
              alt={bestPlatform.name}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                objectFit: "contain",
                background: "#fff",
                border: "1px solid #ddd",
                padding: "3px",
              }}
            />
            <span style={{ fontSize: "14px", color: "#444" }}>
              Best from <b>{bestPlatform.name}</b>
            </span>
          </div>

          {/* ML TAGS (REAL ML) */}
          {mlResult && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>

              {/* ML % Drop */}
              {mlResult.mlDropPercent > 0 && (
                <span
                  style={{
                    padding: "4px 10px",
                    fontSize: "12px",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    borderRadius: "6px",
                    fontWeight: 500,
                  }}
                >
                  🔻 {mlResult.mlDropPercent}% Drop Expected
                </span>
              )}

              {/* ML Recommendation */}
              <span
                style={{
                  padding: "4px 10px",
                  fontSize: "12px",
                  background: mlResult.willDrop ? "#fee2e2" : "#dcfce7",
                  color: mlResult.willDrop ? "#b91c1c" : "#166534",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
              >
                {mlResult.willDrop ? "⏳ Hold / Watch" : "✅ Buy Now"}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT SECTION (CHART) */}
        <div
          style={{
            width: "60%",
            height: "180px",
            background: "#fafafa",
            borderRadius: "12px",
            border: "1px solid #e5e5e5",
            padding: "10px",
          }}
        >
          {history.length ? (
            <>
              <PriceChart data={history} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "10px",
                  fontSize: "13px",
                  color: "#444",
                }}
              >
                <div>
                  <strong>Lowest:</strong>{" "}
                  <span style={{ color: "green" }}>
                    ${lowest.toLocaleString()}
                  </span>
                </div>
                <div>
                  <strong>Highest:</strong>{" "}
                  <span style={{ color: "#b91c1c" }}>
                    ${highest.toLocaleString()}
                  </span>
                </div>
                <div>
                  <strong>Avg:</strong>{" "}
                  {(
                    prices.reduce((a, b) => a + b, 0) / prices.length
                  ).toFixed(0)}
                </div>
              </div>
            </>
          ) : (
            <p style={{ fontSize: "12px", color: "gray" }}>No price history available</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Product;
