import { Navbar, Nav, NavDropdown, Container, Form } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaStar,
  FaBell,
  FaInfoCircle,
  FaUserCircle,
  FaSearch,
} from "react-icons/fa";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../slices/userApiSlice";
import { logout } from "../slices/authSlice";
import axios from "axios";

const Header = () => {
  const [search, setSearch] = useState("");
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [LogoutApiCall] = useLogoutMutation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim().length === 0) return;
    navigate(`/?search=${search}`);
  };

  const logoutHandler = async () => {
    try {
      await LogoutApiCall().unwrap();
      dispatch(logout());
      setUnreadAlerts(0);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  // 🔴 Fetch unread alert count on app load + when user changes
  useEffect(() => {
    const fetchUnread = async () => {
      if (!userInfo) {
        setUnreadAlerts(0);
        return;
      }
      try {
        const { data } = await axios.get("/api/alerts/unread-count", {
          withCredentials: true,
        });
        setUnreadAlerts(data.count || 0);
      } catch (err) {
        console.log("Alert count error:", err);
      }
    };

    fetchUnread();
  }, [userInfo]);

  // Agar user alerts page open kare → header me count reset kar de
  useEffect(() => {
    if (location.pathname === "/alerts") {
      setUnreadAlerts(0);
    }
  }, [location.pathname]);

  return (
    <header>
      <Navbar
        expand="md"
        className="py-3"
        style={{
          backdropFilter: "blur(12px)",
          background: "rgba(255,255,255,0.55)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Container>
          {/* BRAND */}
          <Navbar.Brand
            as={Link}
            to="/"
            className="fw-bold"
            style={{
              fontSize: "1.55rem",
              letterSpacing: "0.3px",
              color: "#1a1a1a",
            }}
          >
            PriceBuddy
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                background: "#0070f3",
                borderRadius: "50%",
                marginLeft: "2px",
                transformOrigin: "center",
                animation: "pulse 1.8s ease-in-out infinite",
              }}
            ></span>
          </Navbar.Brand>

          <Navbar.Toggle />

          <Navbar.Collapse>
            {/* LEFT NAV LINKS */}
            <Nav className="me-auto align-items-center">
              {/* Home */}
              <Nav.Link
                as={Link}
                to="/"
                className="text-dark px-3"
                style={{ fontWeight: 500 }}
              >
                <FaHome className="me-1" /> Home
              </Nav.Link>

              {/* Tracked */}
              <Nav.Link
                as={Link}
                to="/tracked"
                className="text-dark px-3"
                style={{ fontWeight: 500 }}
              >
                <FaStar className="me-1" /> Tracked
              </Nav.Link>

              {/* Alerts with dot */}
              <Nav.Link
                as={Link}
                to="/alerts"
                className="text-dark px-3"
                style={{ fontWeight: 500, position: "relative" }}
              >
                <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FaBell className="me-1" /> Alerts
                  {unreadAlerts > 0 && (
                    <span
                      style={{
                        minWidth: "18px",
                        height: "18px",
                        borderRadius: "999px",
                        background: "#ef4444",
                        color: "white",
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 5px",
                        marginLeft: "4px",
                      }}
                    >
                      {unreadAlerts > 9 ? "9+" : unreadAlerts}
                    </span>
                  )}
                </span>
              </Nav.Link>

              {/* About */}
              <Nav.Link
                as={Link}
                to="/info#about"
                className="text-dark px-3"
                style={{ fontWeight: 500 }}
              >
                <FaInfoCircle className="me-1" /> About
              </Nav.Link>
            </Nav>

            {/* SEARCH */}
            <Form
              onSubmit={handleSearch}
              className="d-flex ms-md-3 my-2 my-md-0"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#fff",
                  padding: "6px 12px",
                  borderRadius: "10px",
                  width: "220px",
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                <FaSearch className="text-muted me-2" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    width: "100%",
                    background: "transparent",
                  }}
                />
              </div>
            </Form>

            {/* PROFILE */}
            <Nav className="ms-3">
              {userInfo ? (
                <NavDropdown
                  title={
                    <span className="text-dark fw-semibold">
                      <FaUserCircle className="me-1" /> {userInfo.name}
                    </span>
                  }
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link
                  as={Link}
                  to="/login"
                  className="text-dark fw-semibold"
                >
                  <FaUserCircle className="me-1" /> Login
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.25); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
          }
        `}
      </style>
    </header>
  );
};

export default Header;
