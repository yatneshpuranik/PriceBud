import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaEnvelope, FaGithub } from "react-icons/fa";

const ContactPage = () => {
  return (
    <Container className="py-5">
      <Row className="text-center mb-4">
        <h2 className="fw-bold">Contact Us</h2>
        <p className="text-muted">We’d love to hear from you.</p>
      </Row>

      <Row className="justify-content-center">
        <Col md={6}>
          <Form className="shadow p-4 rounded">
            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control type="text" placeholder="Enter your name" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" placeholder="Enter your email" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Your Message</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder="Type your message..." />
            </Form.Group>

            <Button variant="primary" className="w-100">
              Send Message
            </Button>
          </Form>

          <div className="text-center mt-3">
            <a href="mailto:support@pricebuddy.com" className="me-3 text-dark">
              <FaEnvelope size={22} />
            </a>
            <a href="https://github.com/your-repo" className="text-dark">
              <FaGithub size={22} />
            </a>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactPage;
