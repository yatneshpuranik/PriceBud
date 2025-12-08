import { Container, Row, Col } from "react-bootstrap";
import { FaGithub, FaEnvelope, FaChartLine } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: "#111", color: "#ccc", marginTop: "40px" }}>
      <Container>
        <Row className="py-4">
          <Col md={4} className="text-center text-md-start mb-3">
            <h5 style={{ color: "#fff" }}>PriceBuddy</h5>
            <p style={{ fontSize: "0.9rem" }}>
              Smart price-tracking, comparison & AI-powered predictions. Helping
              you buy at the right time.
            </p>
          </Col>

          <Col md={4} className="text-center mb-3">
            <h6 style={{ color: "#fff" }}>Quick Links</h6>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li>
                <Link to="/info#about" style={{ color: "#ccc" }}>
                  About
                </Link>
              </li>
              <li>
                <Link to="/info#features" style={{ color: "#ccc" }}>
                  Features
                </Link>
              </li>
              <li>
                <Link to="/info#contact" style={{ color: "#ccc" }}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/info#privacy" style={{ color: "#ccc" }}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </Col>

          <Col md={4} className="text-center text-md-end mb-3">
            <h6 style={{ color: "#fff" }}>Connect</h6>
            <div style={{ fontSize: "1.4rem" }}>
              <a href="mailto:support@pricebuddy.com" style={{ color: "#ccc" }}>
                <FaEnvelope />
              </a>
              <a
                href="https://github.com/your-repo"
                style={{ color: "#ccc", marginLeft: "15px" }}
              >
                <FaGithub />
              </a>
              <FaChartLine style={{ color: "#48b1ff", marginLeft: "15px" }} />
            </div>
          </Col>
        </Row>

        <Row>
          <Col className="text-center py-2">
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#777" }}>
              © {currentYear} PriceBuddy — All Rights Reserved
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
