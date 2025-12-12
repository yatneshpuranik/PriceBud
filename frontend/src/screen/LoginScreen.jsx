import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Row, Button, Col, Card } from "react-bootstrap";
import Loader from "../component/Loader";
import { useLoginMutation } from "../slices/userApiSlice";
import { setCredentials } from "../slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/profile";

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, redirect, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <Card
        className="shadow-lg"
        style={{
          borderRadius: "18px",
          border: "1px solid #e5e7eb",
          padding: "26px",
          boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          className="text-center mb-4"
          style={{ fontWeight: 700, letterSpacing: "-0.5px" }}
        >
          Sign In
        </h2>

        <Form onSubmit={submitHandler}>
          <Form.Group controlId="email" className="mb-3">
            <Form.Label style={{ fontWeight: 500 }}>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
              }}
            />
          </Form.Group>

          <Form.Group controlId="password" className="mb-3">
            <Form.Label style={{ fontWeight: 500 }}>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
              }}
            />
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100 mt-3"
            style={{
              padding: "10px 0",
              fontSize: "16px",
              fontWeight: 600,
              borderRadius: "12px",
              boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
            }}
          >
            Login
          </Button>

          {isLoading && <div className="mt-3 text-center"><Loader /></div>}
        </Form>

        <Row className="py-3 text-center">
          <Col>
            New User?{" "}
            <Link
              to={redirect ? `/register?redirect=${redirect}` : "/register"}
              style={{ fontWeight: 600 }}
            >
              Register Here
            </Link>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default LoginScreen;
