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

const PLATFORM_LOGOS = {
  amazon: "/images/amazon.jpg",
  flipkart: "/images/flipkart.jpg",
  myntra: "/images/myntra.webp",
};

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
  const [autoAlertCreated, setAutoAlertCreated] = useState(false);

  // Auto track product
  useEffect(() => {
    if (!productId) return;
    axios
      .post(
        "/api/tracked",
        { productId },
        { withCredentials: true }
      )
      .catch(() => {});
  }, [productId]);

  // PROCESS PLATFORM PRICES
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

  // ML Prediction
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

  // Auto Alert Create
  useEffect(() => {
    if (!bestDeal || !productId) return;
    const drop = parseFloat(bestDeal.dropPercent);
    if (drop < 20 || autoAlertCreated) return;

    let cancelled = false;

    const createAlert = async () => {
      try {
        await axios.post(
          "/api/alerts",
          {
            productId,
            targetPrice: bestDeal.latest,
          },
          { withCredentials: true }
        );
        if (!cancelled) setAutoAlertCreated(true);
      } catch {}
    };

    createAlert();
    return () => (cancelled = true);
  }, [bestDeal, productId, autoAlertCreated]);

  // LOADING / ERROR
  if (isLoading) return <Loader />;
  if (error)
    return (
      <Message variant="danger">
        {error?.data?.message || error.error}
      </Message>
    );
  if (!product) return <h3 className="text-center py-5">Product not found</h3>;

  // UI STARTS
  return (
    <Container className="py-4" style={{ maxWidth: "1100px" }}>
      <Row className="gy-4">
        {/* LEFT PANEL (sticky) */}
        <Col lg={4}>
          <div
            className="shadow-lg p-4 bg-white"
            style={{
              position: "sticky",
              top: "25px",
              borderRadius: "20px",
              border: "1px solid #ececec",
            }}
          >
            {/* IMAGE */}
            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                background: "#f5f5f5",
                padding: "10px",
              }}
            >
              <img
                src={product.image}
                alt={product.title}
                className="img-fluid"
                style={{ objectFit: "contain", width: "100%" }}
              />
            </div>

            {/* TITLE */}
            <h3
              className="fw-bold mt-3"
              style={{ lineHeight: "1.3", fontSize: "22px" }}
            >
              {product.title}
            </h3>

            {/* BEST PRICE */}
            {bestDeal && (
              <h2
                className="fw-bold mt-2"
                style={{ color: "#16a34a", fontSize: "32px" }}
              >
                {formatCurrency(bestDeal.latest)}
              </h2>
            )}

            {/* ML PREDICTION CARD */}
            {prediction && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  borderRadius: "16px",
                  background: "#0f172a",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 12px 25px rgba(0,0,0,0.35)",
                }}
              >
                <div className="d-flex justify-content-between mb-1">
                  <span style={{ opacity: 0.8, fontSize: "13px" }}>
                    🔮 Prediction Engine
                  </span>
                  <small style={{ opacity: 0.6 }}>v1.0 · Beta</small>
                </div>

                {/* PRICE ROW */}
                <div className="d-flex justify-content-between mt-2">
                  <div>
                    <div style={{ opacity: 0.7, fontSize: "12px" }}>
                      Current Best
                    </div>
                    <div
                      style={{ fontSize: "22px", fontWeight: 700 }}
                    >
                      ₹{prediction.currentMin.toFixed(0)}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ opacity: 0.7, fontSize: "12px" }}>
                      Predicted Next Min
                    </div>
                    <div
                      style={{ fontSize: "22px", fontWeight: 700 }}
                    >
                      ₹{prediction.predictedMin.toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* STATUS */}
                {prediction.willDrop ? (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background: "rgba(255, 88, 88, 0.2)",
                      border: "1px solid rgba(255, 88, 88, 0.35)",
                      fontSize: "12px",
                      display: "inline-block",
                    }}
                  >
                    ⚠️ Expected drop soon — Better wait
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "6px 12px",
                      borderRadius: "999px",
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      fontSize: "12px",
                      display: "inline-block",
                    }}
                  >
                    ✅ Stable price — Safe to buy now
                  </div>
                )}

                {autoAlertCreated && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: "11px",
                      color: "#a5b4fc",
                    }}
                  >
                    🔔 Auto alert saved — check Alerts tab.
                  </div>
                )}
              </div>
            )}

            {/* BUY BUTTON */}
            {bestDeal && (
              <Button
                variant="success"
                className="w-100 py-2 fw-semibold mt-4"
                onClick={() => window.open(bestDeal.url, "_blank")}
                style={{
                  fontSize: "18px",
                  borderRadius: "12px",
                  boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
                }}
              >
                🛒 Buy at Best Price
              </Button>
            )}
          </div>
        </Col>

        {/* RIGHT SIDE — PLATFORM CARDS */}
        <Col lg={8}>
          {platforms.map((p, idx) => (
            <div
              key={idx}
              className="shadow p-
4 mb-4"
              style={{
                borderRadius: "18px",
                background: "#ffffff",
                border: "1px solid #ececec",
              }}
            >
              {/* HEADER */}
              <div
                className="d-flex justify-content-between align-items-center mb-3"
              >
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={PLATFORM_LOGOS[p.name.toLowerCase()]}
                    alt={p.name}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                  <h5 className="fw-bold text-capitalize m-0">{p.name}</h5>
                </div>

                <Button
                  className="btn-sm"
                  variant="outline-primary"
                  style={{
                    padding: "6px 16px",
                    borderRadius: "10px",
                  }}
                  onClick={() => window.open(p.url, "_blank")}
                >
                  Buy →
                </Button>
              </div>

              {/* CHART */}
              <div style={{ height: "270px" }}>
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
