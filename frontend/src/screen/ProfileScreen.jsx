import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, ListGroup, Spinner, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileScreen = () => {
  const [user, setUser] = useState(null);

  // Editable fields
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get("/api/users/profile", {
          withCredentials: true,
        });

        setUser(data);
        setName(data.name); // load current name in input
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch user profile");
        setLoading(false);

        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setUpdating(true);

      const { data } = await axios.put(
        "/api/users/profile",
        {
          name,
          password: password || undefined, // send only if not empty
        },
        { withCredentials: true }
      );

      setSuccess("Profile updated successfully!");
      setUser(data);
      setUpdating(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-dark text-light">
              <h4>User Profile</h4>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Name:</strong> {user.name}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Email:</strong> {user.email}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Admin:</strong> {user.isAdmin ? "Yes" : "No"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Tracked Items:</strong> {user.trackedItems?.length || 0}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Alerts:</strong> {user.alerts?.length || 0}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-light">
              <h5>Edit Profile</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label>Change Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter new name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Group>

                <Button type="submit" className="w-100" disabled={updating}>
                  {updating ? "Saving..." : "Update Profile"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileScreen;
