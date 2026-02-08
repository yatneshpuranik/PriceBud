// src/screen/ProductScreen.jsx
import { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import * as tf from "@tensorflow/tfjs"; // ⭐ FRONTEND TFJS

import PriceChartLarge from "../component/PriceChartLarge";
import { useGetProductDetailsQuery } from "../slices/productsApiSlice";
import Loader from "../component/Loader";
import Message from "../component/Message";

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

// ---------------- ML HELPERS (frontend) ----------------
const WINDOW = 14; // last 14 days ka window (30 bhi rakh sakte ho)

// platforms: [{ name, currentPrice, history:[{date,price}, ...] }, ...]
function alignPlatformHistory(platforms) {
  if (!platforms || platforms.length === 0) return [];

  // Assume sab platforms ke history length ~ same hai (jaise seed me)
  const sortedHistories = {};
  platforms.forEach((p) => {
    const hist = (p.history || []).slice().sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    sortedHistories[p.name] = hist;
  });

  // length = min length across platforms (safety)
  const lengths = Object.values(sortedHistories).map((h) => h.length);
  const length = Math.min(...lengths);

  const merged = [];

  for (let i = 0; i < length; i++) {
    const date = sortedHistories[platforms[0].name][i].date;
    const prices = platforms.map((p) => sortedHistories[p.name][i].price);
    merged.push({ date, prices }); // e.g. [amazonPrice, flipkartPrice, myntraPrice]
  }

  return merged;
}

function buildXY(series) {
  const X = [];
  const y = [];

  for (let i = 0; i + WINDOW < series.length; i++) {
    const windowSlice = series.slice(i, i + WINDOW);
    const nextDay = series[i + WINDOW];

    const featureVec = windowSlice.map((d) => d.prices).flat(); // length = WINDOW * 3
    const nextMinPrice = Math.min(...nextDay.prices);

    X.push(featureVec);
    y.push(nextMinPrice);
  }

  return { X, y };
}

// -------------------------------------------------

const ProductScreen = () => {
  const { id: productId } = useParams();
  const { data: product, isLoading, error } =
    useGetProductDetailsQuery(productId);

  const [platforms, setPlatforms] = useState([]);
  const [bestDeal, setBestDeal] = useState(null);

  // ML prediction state
  const [prediction, setPrediction] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  // ------------------------------------------------------------------
  // 🟩 AUTO-TRACK PRODUCT WHEN USER OPENS THE SCREEN
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!productId) return;

    let ignore = false;

    const autoTrack = async () => {
      if (ignore) return;
      try {
        await axios.post(
          "/api/tracked",
          { productId },
          { withCredentials: true }
        );
      } catch (err) {
        console.log("Auto-track error:", err);
      }
    };

    autoTrack();

    return () => {
      ignore = true;
    };
  }, [productId]);

  // ------------------------------------------------------------------
  // PROCESS PLATFORM DATA (for charts + best deal)
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
        recommendation:
          latest <= lowest * 1.05 || latest <= avg * 0.95
            ? "Buy Now"
            : "Hold / Watch",
      };
    });

    setPlatforms(processed);

    if (processed.length)
      setBestDeal(
        processed.reduce((a, b) => (a.latest < b.latest ? a : b))
      );
  }, [product]);

  // ------------------------------------------------------------------
  // 🧠 ML: Train small model on client & predict next min price
  // ------------------------------------------------------------------
  useEffect(() => {
    const runMl = async () => {
      if (!product || !product.platforms || product.platforms.length < 1) {
        setPrediction(null);
        return;
      }

      const series = alignPlatformHistory(product.platforms);
      if (series.length <= WINDOW) {
        setPrediction({
          notEnough: true,
          message: "Not enough price history for prediction.",
        });
        return;
      }

      const { X, y } = buildXY(series);
      if (X.length === 0) {
        setPrediction({
          notEnough: true,
          message: "Not enough windows for training.",
        });
        return;
      }

      setMlLoading(true);

      try {
        const xs = tf.tensor2d(X); // [N, WINDOW*3]
        const ys = tf.tensor2d(y, [y.length, 1]); // [N,1]

        const model = tf.sequential();
        model.add(
          tf.layers.dense({
            inputShape: [WINDOW * 3],
            units: 32,
            activation: "relu",
          })
        );
        model.add(tf.layers.dense({ units: 16, activation: "relu" }));
        model.add(tf.layers.dense({ units: 1 })); // next min price

        model.compile({
          optimizer: tf.train.adam(0.01),
          loss: "meanSquaredError",
        });

        await model.fit(xs, ys, {
          epochs: 40,
          batchSize: 16,
          verbose: 0,
        });

        xs.dispose();
        ys.dispose();

        // Last window -> prediction
        const lastWindow = series.slice(-WINDOW);
        const featureVec = lastWindow.map((d) => d.prices).flat();
        const input = tf.tensor2d([featureVec]); // [1, WINDOW*3]
        const predTensor = model.predict(input);
        const nextMinPrice = (await predTensor.data())[0];

        predTensor.dispose();
        input.dispose();

        const lastDay = series[series.length - 1];
        const currentMin = Math.min(...lastDay.prices);

        const dropThreshold = 0.98; // 2% se jyada gir gaya to drop
        const willDrop = nextMinPrice <= currentMin * dropThreshold;

        const nextDate = new Date(lastDay.date);
        nextDate.setDate(nextDate.getDate() + 1);

        setPrediction({
          currentMinPrice: currentMin,
          predictedNextMinPrice: nextMinPrice,
          predictedDate: nextDate.toISOString(),
          willDrop,
          message: willDrop
            ? "Model expects a price drop tomorrow (or very soon)."
            : "No strong drop signal for tomorrow.",
        });
      } catch (err) {
        console.log("ML error:", err);
        setPrediction({
          error: true,
          message: "Prediction failed in browser.",
        });
      } finally {
        setMlLoading(false);
      }
    };

    runMl();
  }, [product]);

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

  if (!product) return <h3 className="text-center py-5">Product not found</h3>;

  // ------------------------------------------------------------------
  // UI STARTS HERE
  // ------------------------------------------------------------------
  return (
    <Container className="py-4">
      <Row className="gy-4">
        {/* LEFT — PRODUCT SUMMARY */}
        <Col lg={4}>
          <div
            className="shadow-lg rounded-4 p-4 bg-white"
            style={{ position: "sticky", top: "20px", border: "1px solid #f0f0f0" }}
          >
            <div
              style={{
                borderRadius: "14px",
                overflow: "hidden",
                background: "#fafafa",
              }}
            >
              <img
                src={product.image}
                alt={product.title}
                className="img-fluid"
              />
            </div>

            <h3 className="fw-bold mt-3">{product.title}</h3>

            {bestDeal && (
              <>
                <h2 className="text-success fw-bold mt-2">
                  {formatCurrency(bestDeal.latest)}
                </h2>

                <div className="d-flex align-items-center gap-2 mt-2">
                  {bestDeal.dropPercent > 0 && (
                    <span
                      className="badge text-danger"
                      style={{
                        background: "rgba(255,0,0,0.09)",
                        padding: "5px 10px",
                      }}
                    >
                      🔻 {bestDeal.dropPercent}% drop
                    </span>
                  )}

                  {bestDeal.recommendation === "Buy Now" && (
                    <span
                      className="badge text-success"
                      style={{
                        background: "rgba(0,150,0,0.1)",
                        padding: "5px 10px",
                      }}
                    >
                      ⭐ Best Deal
                    </span>
                  )}
                </div>

                {/* Best Platform Logo */}
                <div className="mt-3 d-flex align-items-center gap-2">
                  <img
                    src={PLATFORM_LOGOS[bestDeal.name.toLowerCase()]}
                    alt={bestDeal.name}
                    style={{ width: "28px", height: "28px" }}
                  />
                  <span style={{ fontSize: "15px" }}>
                    Best Price from <b>{bestDeal.name}</b>
                  </span>
                </div>
              </>
            )}

            <Button
              variant="success"
              className="w-100 py-2 fw-semibold mt-4"
              onClick={() => window.open(bestDeal?.url, "_blank")}
              style={{ borderRadius: "10px", fontSize: "17px" }}
            >
              🛒 Buy at Best Price
            </Button>

            {/* ⭐ ML SUGGESTION BOX */}
            <div className="mt-4 p-3 rounded-3" style={{ background: "#eef9ff" }}>
              <strong>ML Suggestion</strong>
              {mlLoading && <div className="text-muted">Training model...</div>}

              {!mlLoading && prediction?.error && (
                <div className="text-danger small">{prediction.message}</div>
              )}

              {!mlLoading && prediction?.notEnough && (
                <div className="text-muted small">{prediction.message}</div>
              )}

              {!mlLoading &&
                prediction &&
                !prediction.error &&
                !prediction.notEnough && (
                  <>
                    <div className="mt-1">
                      Current best price:{" "}
                      <b>₹{prediction.currentMinPrice.toFixed(2)}</b>
                    </div>
                    <div>
                      Predicted next min price (tomorrow):{" "}
                      <b>₹{prediction.predictedNextMinPrice.toFixed(2)}</b>
                    </div>
                    <div className="mt-1">
                      {prediction.willDrop ? (
                        <span className="text-warning">
                          💡 Wait: model expects a drop soon.
                        </span>
                      ) : (
                        <span className="text-success">
                          ✅ No big drop expected tomorrow.
                        </span>
                      )}
                    </div>
                  </>
                )}
            </div>
          </div>
        </Col>

        {/* RIGHT — PLATFORM ANALYSIS */}
        <Col lg={8}>
          {platforms.map((p, idx) => (
            <div
              key={idx}
              className="shadow rounded-4 p-4 mb-4 bg-white"
              style={{ border: "1px solid #efefef" }}
            >
              {/* HEADER */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={PLATFORM_LOGOS[p.name.toLowerCase()]}
                    alt={p.name}
                    style={{ width: "30px", height: "30px", borderRadius: "6px" }}
                  />
                  <h5 className="fw-bold text-capitalize m-0">{p.name}</h5>
                </div>

                <Button
                  className="btn-sm"
                  variant="outline-success"
                  style={{ borderRadius: "8px" }}
                  onClick={() => window.open(p.url, "_blank")}
                >
                  Buy Now →
                </Button>
              </div>

              {/* CHART */}
              <div style={{ height: "260px" }}>
                <PriceChartLarge data={p.chartData} />
              </div>

              {/* STATS */}
              <Row className="mt-3 g-3 text-center">
                <Col xs={6} md={3}>
                  <div className="p-2 bg-light rounded-3">
                    <small className="text-muted">Current</small>
                    <div className="fw-bold">{formatCurrency(p.latest)}</div>
                  </div>
                </Col>

                <Col xs={6} md={3}>
                  <div className="p-2 bg-light rounded-3">
                    <small className="text-muted">Lowest</small>
                    <div className="fw-bold text-success">
                      {formatCurrency(p.lowest)}
                    </div>
                  </div>
                </Col>

                <Col xs={6} md={3}>
                  <div className="p-2 bg-light rounded-3">
                    <small className="text-muted">Highest</small>
                    <div className="fw-bold text-danger">
                      {formatCurrency(p.highest)}
                    </div>
                  </div>
                </Col>

                <Col xs={6} md={3}>
                  <div className="p-2 bg-light rounded-3">
                    <small className="text-muted">Avg</small>
                    <div className="fw-bold">{p.avg}</div>
                  </div>
                </Col>
              </Row>

              {/* Recommendation */}
              <div className="mt-3 p-3 rounded-3" style={{ background: "#fafafa" }}>
                <strong>Recommendation:</strong>{" "}
                <span
                  className={
                    p.recommendation === "Buy Now"
                      ? "text-success fw-bold"
                      : "text-secondary fw-semibold"
                  }
                >
                  {p.recommendation}
                </span>
              </div>
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductScreen;
