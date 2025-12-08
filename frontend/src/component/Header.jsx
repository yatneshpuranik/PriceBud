import { Navbar, Nav, NavDropdown, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaStar,
  FaBell,
  FaInfoCircle,
  FaUserCircle,
  FaSearch,
} from "react-icons/fa";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../slices/userApiSlice";
import { logout } from "../slices/authSlice";

const Header = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

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

          {/* ⭐ BRAND LOGO – Minimal + Micro Animation */}
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

              {[
                { to: "/", icon: <FaHome />, label: "Home" },
                { to: "/tracked", icon: <FaStar />, label: "Tracked" },
                { to: "/alerts", icon: <FaBell />, label: "Alerts" },
                { to: "/info#about", icon: <FaInfoCircle />, label: "About" },
              ].map((item, index) => (
                <Nav.Link
                  key={index}
                  as={Link}
                  to={item.to}
                  className="text-dark px-3"
                  style={{
                    fontWeight: 500,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {item.icon} {item.label}
                  </span>

                  {/* Underline Animation */}
                  <span
                    className="nav-underline"
                    style={{
                      content: "",
                      position: "absolute",
                      bottom: -2,
                      left: 15,
                      width: 0,
                      height: "2px",
                      background: "#0070f3",
                      transition: "0.3s ease",
                    }}
                  ></span>
                </Nav.Link>
              ))}
            </Nav>

            {/* SEARCH BAR */}
            <Form onSubmit={handleSearch} className="d-flex ms-md-3 my-2 my-md-0">
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

            {/* PROFILE DROPDOWN */}
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
                <Nav.Link as={Link} to="/login" className="text-dark fw-semibold">
                  <FaUserCircle className="me-1" /> Login
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* MICRO ANIMATION KEYFRAME */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.25); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
          }

          .nav-link:hover .nav-underline {
            width: 45%;
          }
        `}
      </style>

    </header>
  );
};

export default Header;
