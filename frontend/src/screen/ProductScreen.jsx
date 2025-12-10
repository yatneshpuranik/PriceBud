import { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";

import PriceChartLarge from "../component/PriceChartLarge";
import { useGetProductDetailsQuery } from "../slices/productsApiSlice";
import Loader from "../component/Loader";
import Message from "../component/Message";

import {
  alignPlatformHistory,
  trainPriceModel,
  predictNextDrop,
} from "../utils/ml";

// Platform Logos
const PLATFORM_LOGOS = {
  amazon: "/images/amazon.jpg",
  flipkart: "/images/flipkart.jpg",
  myntra: "/images/myntra.webp",
};

// Currency formatter
const formatCurrency = (v) =>
  v == null
    ? "-"
    : `₹${Number(v).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}`;

const ProductScreen = () => {
  const { id: productId } = useParams();
  const { data: product, isLoading, error } =
    useGetProductDetailsQuery(productId);

  const [platforms, setPlatforms] = useState([]);
  const [bestDeal, setBestDeal] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [autoAlertCreated, setAutoAlertCreated] = useState(false); // 🔔 auto-alert status

  // ------------------------------------------------------------------
  // 🟩 AUTO-TRACK PRODUCT WHEN USER OPENS THE SCREEN
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!productId) return;
    axios
      .post(
        "/api/tracked",
        { productId },
        { withCredentials: true }
      )
      .catch(() => {
        // ignore if user not logged in
      });
  }, [productId]);

  // ------------------------------------------------------------------
  // PROCESS PLATFORM DATA (stats + best deal)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!product || !product.platforms) return;

    const processed = product.platforms.map((p) => {
      const history = p.history || [];
      const prices = history.map((h) => h.price);

      const latest = p.currentPrice;
      const highest = prices.length ? Math.max(...prices) : latest;
      const lowest = prices.length ? Math.min(...prices) : latest;

      const avg =
        prices.length > 0
          ? prices.reduce((a, b) => a + b, 0) / prices.length
          : latest;

      const dropPercent =
        highest > 0 ? (((highest - latest) / highest) * 100).toFixed(1) : 0;

      return {
        ...p,
        latest,
        highest,
        lowest,
        avg: avg.toFixed(0),
        dropPercent,
        chartData: history.length
          ? history
          : [{ price: latest, date: new Date() }],
      };
    });

    setPlatforms(processed);

    if (processed.length) {
      const best = processed.reduce((a, b) =>
        a.latest < b.latest ? a : b
      );
      setBestDeal(best);
    }
  }, [product]);

  // ------------------------------------------------------------------
  // ML (browser) – TensorFlow.js CDN based prediction
  // ------------------------------------------------------------------
  useEffect(() => {
    async function runML() {
      if (!product || !product.platforms) return;

      const series = alignPlatformHistory(product.platforms);
      if (series.length < 35) return;

      const currentBest = Math.min(
        ...product.platforms.map((p) => p.currentPrice)
      );

      const model = await trainPriceModel(series);
      if (!model) return;

      const pred = await predictNextDrop(model, series, currentBest);
      setPrediction(pred);
    }

    runML();
  }, [product]);

  // ------------------------------------------------------------------
  // 🔔 AUTO-CREATE ALERT WHEN DROP >= 20%
  //
  // Logic:
  //  - Use current best platform dropPercent (historic)
  //  - If dropPercent >= 20, automatically POST /api/alerts
  //  - So Alerts screen shows it as a notification-style row
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!bestDeal || !productId) return;

    const drop = parseFloat(bestDeal.dropPercent);
    if (isNaN(drop) || drop < 20) return; // only for 20%+ drops

    if (autoAlertCreated) return; // already created for this view

    let cancelled = false;

    const createAutoAlert = async () => {
      try {
        await axios.post(
          "/api/alerts",
          {
            productId,
            // Alert price = current best deal price
            targetPrice: bestDeal.latest,
          },
          { withCredentials: true }
        );
        if (!cancelled) {
          setAutoAlertCreated(true);
        }
      } catch (err) {
        // silently ignore if not logged in or API error
        console.log("Auto alert create error:", err?.response?.data || err);
      }
    };

    createAutoAlert();

    return () => {
      cancelled = true;
    };
  }, [bestDeal, productId, autoAlertCreated]);

  // ------------------------------------------------------------------
  // LOADING + ERROR
  // ------------------------------------------------------------------
  if (isLoading) return <Loader />;
  if (error)
    return (
      <Message variant="danger">
        {error?.data?.message || error.error}
      </Message>
    );
  if (!product)
    return <h3 className="text-center py-5">Product not found</h3>;

  // ------------------------------------------------------------------
  // UI STARTS HERE
  // ------------------------------------------------------------------
  return (
    <Container className="py-4">
      <Row className="gy-4">
        {/* LEFT CARD */}
        <Col lg={4}>
          <div
            className="shadow-lg rounded-4 p-4 bg-white"
            style={{
              position: "sticky",
              top: "25px",
              border: "1px solid #ececec",
              borderRadius: "20px",
            }}
          >
            {/* Product Image */}
            <div
              style={{
                borderRadius: "14px",
                overflow: "hidden",
                background: "#f7f7f7",
              }}
            >
              <img
                src={product.image}
                alt={product.title}
                className="img-fluid"
              />
            </div>

            <h3 className="fw-bold mt-3">{product.title}</h3>

            {/* BEST PRICE */}
            {bestDeal && (
              <h2
                className="fw-bold mt-2"
                style={{ color: "#3ABF4A", fontSize: "32px" }}
              >
                {formatCurrency(bestDeal.latest)}
              </h2>
            )}

            {/* ML PREDICTION CARD — premium style */}
            {prediction && (
              <div
                className="ml-widget mt-3"
                style={{
                  borderRadius: "16px",
                  padding: "14px 16px",
                  background: "#0f172a",
                  color: "white",
                  border: "1px solid rgba(148,163,184,0.4)",
                  boxShadow: "0 10px 25px rgba(15,23,42,0.55)",
                }}
              >
                {/* ML HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span
                    style={{
                      fontSize: "13px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#e2e8f0",
                    }}
                  >
                    🔮 Price Prediction Engine
                  </span>
                  <small style={{ opacity: 0.7, fontSize: "11px" }}>
                    v1.0 · Beta
                  </small>
                </div>

                {/* PRICE ROW */}
                <div className="d-flex justify-content-between mt-2">
                  <div>
                    <div
                      style={{
                        opacity: 0.75,
                        fontSize: "12px",
                        color: "#cbd5f5",
                      }}
                    >
                      Current Best
                    </div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      ₹{prediction.currentMin.toFixed(0)}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        opacity: 0.75,
                        fontSize: "12px",
                        color: "#cbd5f5",
                      }}
                    >
                      Predicted Next Min
                    </div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      ₹{prediction.predictedMin.toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* STATUS TAG */}
                {prediction.willDrop ? (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 500,
                      background: "rgba(248, 113, 113, 0.12)",
                      color: "#fecaca",
                      border: "1px solid rgba(248,113,113,0.35)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>⚠️ Expected Drop Soon</span>
                    <span
                      style={{
                        height: 4,
                        width: 4,
                        borderRadius: "999px",
                        background: "#fecaca",
                      }}
                    />
                    <span>Better wait</span>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 500,
                      background: "rgba(52,211,153,0.12)",
                      color: "#bbf7d0",
                      border: "1px solid rgba(52,211,153,0.35)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>✅ Stable Price</span>
                    <span
                      style={{
                        height: 4,
                        width: 4,
                        borderRadius: "999px",
                        background: "#bbf7d0",
                      }}
                    />
                    <span>Safe to buy now</span>
                  </div>
                )}

                {/* AUTO ALERT INFO */}
                {autoAlertCreated && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: "#a5b4fc",
                    }}
                  >
                    🔔 Price drop alert saved — check your Alerts tab.
                  </div>
                )}

                {/* FOOTER TEXT */}
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    opacity: 0.7,
                    color: "#e5e7eb",
                  }}
                >
                  Powered by <b>TensorFlow.js</b> · learns from your live price
                  history.
                </div>
              </div>
            )}

            {/* BUY BUTTON */}
            {bestDeal && (
              <Button
                variant="success"
                className="w-100 py-2 fw-semibold mt-4"
                onClick={() => window.open(bestDeal.url, "_blank")}
                style={{
                  borderRadius: "12px",
                  fontSize: "17px",
                  boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
                }}
              >
                🛒 Buy at Best Price
              </Button>
            )}
          </div>
        </Col>

        {/* RIGHT SIDE — PLATFORM ANALYSIS */}
        <Col lg={8}>
          {platforms.map((p, idx) => (
            <div
              key={idx}
              className="shadow rounded-4 p-4 mb-4 bg-white"
              style={{
                border: "1px solid #ececec",
                borderRadius: "18px",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                {/* Logo + Name */}
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={PLATFORM_LOGOS[p.name.toLowerCase()]}
                    alt={p.name}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                    }}
                  />
                  <h5 className="fw-bold text-capitalize m-0">{p.name}</h5>
                </div>

                <Button
                  className="btn-sm"
                  variant="outline-primary"
                  style={{
                    borderRadius: "10px",
                    padding: "6px 14px",
                  }}
                  onClick={() => window.open(p.url, "_blank")}
                >
                  Buy →
                </Button>
              </div>

              {/* Chart */}
              <div style={{ height: "260px" }}>
                <PriceChartLarge data={p.chartData} />
              </div>
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductScreen;
