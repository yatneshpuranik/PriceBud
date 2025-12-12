import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { FaEnvelope, FaGithub } from "react-icons/fa";
import { useState } from "react";
import axios from "axios";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const res = await axios.post("/api/contact", {
        name,
        email,
        message,
      });

      if (res.data.success) {
        setSuccess("Your message has been sent successfully!");
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (err) {
      setError("Message could not be sent. Please try again.");
    }
  };

  return (
    <Container className="py-5">
      <Row className="text-center mb-4">
        <h2 className="fw-bold">Contact Us</h2>
        <p className="text-muted">We’d love to hear from you.</p>
      </Row>

      <Row className="justify-content-center">
        <Col md={6}>
          <Form className="shadow p-4 rounded" onSubmit={handleSubmit}>

            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Your Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Send Message
            </Button>
          </Form>

          <div className="text-center mt-3">
            {/* Email icon goes directly to your email */}
            <a href="mailto:yatneshpuranik@gmail.com" className="me-3 text-dark">
              <FaEnvelope size={22} />
            </a>

            {/* GitHub stays same */}
            <a href="https://github.com/yatneshpuranik/PriceBud.git" className="text-dark">
              <FaGithub size={22} />
            </a>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactPage;
