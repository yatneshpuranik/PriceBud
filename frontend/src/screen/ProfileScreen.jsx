import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileScreen = () => {
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
        setName(data.name);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
        setLoading(false);

        if (err.response?.status === 401) navigate("/login");
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
        { name, password: password || undefined },
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
    <Container className="my-5" style={{ maxWidth: "900px" }}>
      <Row className="g-4 justify-content-center">
        
        {/* USER OVERVIEW */}
        <Col md={6}>
          <Card
            className="shadow-lg"
            style={{
              borderRadius: "18px",
              border: "1px solid #ececec",
              overflow: "hidden",
            }}
          >
            <Card.Header
              className="text-light"
              style={{
                background: "#1e293b",
                padding: "18px",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              User Overview
            </Card.Header>

            <Card.Body style={{ padding: "20px" }}>
              <div className="mb-3">
                <strong>Name:</strong>
                <div style={{ color: "#374151" }}>{user.name}</div>
              </div>

              <div className="mb-3">
                <strong>Email:</strong>
                <div style={{ color: "#374151" }}>{user.email}</div>
              </div>

              <div className="mb-3">
                <strong>Admin:</strong>
                <div style={{ color: "#374151" }}>{user.isAdmin ? "Yes" : "No"}</div>
              </div>

              <div className="mb-3">
                <strong>Tracked Items:</strong>
                <div style={{ color: "#374151" }}>
                  {user.trackedItems?.length ?? 0}
                </div>
              </div>

              <div>
                <strong>Alerts:</strong>
                <div style={{ color: "#374151" }}>
                  {user.alerts?.length ?? 0}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* EDIT PROFILE — SAME STYLE AS OVERVIEW */}
        <Col md={6}>
          <Card
            className="shadow-lg"
            style={{
              borderRadius: "18px",
              border: "1px solid #ececec",
              overflow: "hidden",
            }}
          >
            <Card.Header
              className="text-light"
              style={{
                background: "#1e293b",  // SAME DARK HEADER
                padding: "18px",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              Edit Profile
            </Card.Header>

            <Card.Body style={{ padding: "22px" }}>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 500 }}>Change Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter new name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 500 }}>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                    }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: 500 }}>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                    }}
                  />
                </Form.Group>

                <Button
                  type="submit"
                  disabled={updating}
                  className="w-100"
                  style={{
                    padding: "12px 0",
                    fontSize: "16px",
                    fontWeight: 600,
                    borderRadius: "12px",
                    background: "#1e293b",
                    border: "none",
                  }}
                >
                  {updating ? "Saving…" : "Update Profile"}
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
