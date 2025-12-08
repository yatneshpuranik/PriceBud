import { Container, Row, Col } from "react-bootstrap";
import { FaChartLine, FaBell, FaSearchDollar, FaExclamationTriangle } from "react-icons/fa";

const AboutPage = () => {
  return (
    <Container className="py-5">

      {/* Heading */}
      <Row className="mb-5 text-center">
        <h2 className="fw-bold">About PriceBuddy</h2>
        <p className="text-muted">
          Your smart companion for tracking, comparing & predicting product prices.
        </p>
      </Row>

      {/* About Section */}
      <Row className="align-items-center">
        <Col md={6}>
          <h4 className="fw-bold mb-3">Why PriceBuddy?</h4>
          <p>
            E-commerce product prices change constantly — sometimes even multiple times a day.  
            PriceBuddy helps you stay ahead by letting you:
          </p>

          <ul>
            <li>📌 Track real-time price changes</li>
            <li>📌 Compare prices across platforms</li>
            <li>📌 View historical price trends</li>
            <li>📌 (Coming soon) Get AI-powered price predictions</li>
          </ul>

          <p className="mt-3">
            No assumptions. No extra spending.  
            <strong>Just smart, data-driven decisions.</strong>
          </p>
        </Col>

        <Col md={6} className="text-center">
          <img
            src="/images/image.png"
            className="img-fluid rounded shadow-sm"
            style={{ maxHeight: "320px", objectFit: "contain" }}
            alt="About"
          />
        </Col>
      </Row>

      {/* Disclaimer Box */}
      <Row className="mt-5">
        <Col md={12}>
          <div
            style={{
              background: "#f8f9fa",
              borderLeft: "4px solid #f0ad4e",
              padding: "18px 20px",
              borderRadius: "6px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <h6 className="fw-bold" style={{ display: "flex", alignItems: "center" }}>
              <FaExclamationTriangle className="text-warning me-2" />
              Disclaimer
            </h6>

            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              PriceBuddy uses automated price tracking and experimental prediction models.
              Prices may not always be 100% accurate or real-time as e-commerce prices change frequently.  
              This tool is still under development, so users should verify final prices on official websites.
            </p>
          </div>
        </Col>
      </Row>

      {/* Three Icons Section */}
      <Row className="text-center mt-5">
        <Col md={4}>
          <FaSearchDollar size={40} className="mb-3 text-primary" />
          <h5>Track Prices</h5>
          <p className="text-muted">Monitor price changes across stores easily.</p>
        </Col>

        <Col md={4}>
          <FaChartLine size={40} className="mb-3 text-success" />
          <h5>Smart Insights</h5>
          <p className="text-muted">See historical data & trends over time.</p>
        </Col>

        <Col md={4}>
          <FaBell size={40} className="mb-3 text-warning" />
          <h5>Price Alerts</h5>
          <p className="text-muted">Get notified instantly when prices fall.</p>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;
