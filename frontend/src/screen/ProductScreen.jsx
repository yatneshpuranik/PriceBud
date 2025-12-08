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

  // AUTO-TRACK
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

  // PROCESS PLATFORM DATA
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

  // ML (browser)
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

  if (isLoading) return <Loader />;
  if (error)
    return (
      <Message variant="danger">
        {error?.data?.message || error.error}
      </Message>
    );
  if (!product)
    return <h3 className="text-center py-5">Product not found</h3>;

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
              <img src={product.image} alt={product.title} className="img-fluid" />
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

            {/* ML PREDICTION CARD — redesigned */}
           {prediction && (
  <div className="ml-widget mt-3">

    {/* ML HEADER */}
    <div className="d-flex justify-content-between align-items-center mb-2">
      <span className="ml-header">🔮 Price Prediction Engine</span>
      <small style={{ opacity: 0.7 }}>v1.0 • Beta</small>
    </div>

    {/* PRICE ROW */}
    <div className="d-flex justify-content-between mt-3">
      <div>
        <div style={{ opacity: 0.7 }}>Current Best</div>
        <div className="ml-value">₹{prediction.currentMin.toFixed(0)}</div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ opacity: 0.7 }}>Predicted Next Min</div>
        <div className="ml-value">₹{prediction.predictedMin.toFixed(0)}</div>
      </div>
    </div>

    {/* STATUS TAG */}
    {prediction.willDrop ? (
      <div className="ml-tag ml-tag-wait">
        ⚠️ Expected Drop Soon • Better Wait!
      </div>
    ) : (
      <div className="ml-tag ml-tag-buy">
        ✅ Stable Price • Safe to Buy Now
      </div>
    )}

    {/* FOOTER TEXT */}
    <div style={{ marginTop: 12, fontSize: 13, opacity: 0.65 , color: "black" }}>
      <b>Powered by TensorFlow.js ML — learns from real-time price history.</b>
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
                  boxShadow: "0 6px 14px rgba(0,0,0,0.1)",
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
