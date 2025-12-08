import { Container, Row, Col, Card } from "react-bootstrap";
import { FaBell, FaChartLine, FaExchangeAlt, FaRobot } from "react-icons/fa";

const FeaturesPage = () => {
  return (
    <Container className="py-5">
      <Row className="text-center mb-4">
        <h2 className="fw-bold">Features</h2>
        <p className="text-muted">Everything you need to make smarter buying decisions.</p>
      </Row>

      <Row>
        <Col md={6} lg={4} className="mb-4">
          <Card className="p-4 shadow-sm h-100">
            <FaChartLine size={45} className="text-primary mb-3" />
            <h5>Price History</h5>
            <p className="text-muted">Detailed charts showing price trends over time.</p>
          </Card>
        </Col>

        <Col md={6} lg={4} className="mb-4">
          <Card className="p-4 shadow-sm h-100">
            <FaExchangeAlt size={45} className="text-success mb-3" />
            <h5>Compare Prices</h5>
            <p className="text-muted">Check prices across multiple stores instantly.</p>
          </Card>
        </Col>

        <Col md={6} lg={4} className="mb-4">
          <Card className="p-4 shadow-sm h-100">
            <FaBell size={45} className="text-warning mb-3" />
            <h5>Price Alerts</h5>
            <p className="text-muted">
              Get notified when the price drops or hits your target range.
            </p>
          </Card>
        </Col>

        <Col md={6} lg={4} className="mb-4">
          <Card className="p-4 shadow-sm h-100">
            <FaRobot size={45} className="text-danger mb-3" />
            <h5>AI Predictions</h5>
            <p className="text-muted">
              TensorFlow.js-powered future price predictions (coming soon).
            </p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FeaturesPage;
