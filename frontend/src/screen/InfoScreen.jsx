import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";

import About from "../component/AboutPage";
import Features from "../component/FeaturesPage";
import Contact from "../component/ContactPage";
import Privacy from "../component/PrivacyPage";

const InfoScreen = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const section = document.getElementById(id);

      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, [hash]);

  // Clean modern card UI
  const sectionStyle = {
    background: "#ffffff",
    padding: "32px 26px",
    borderRadius: "18px",
    marginBottom: "40px",
    border: "1px solid #ececec",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    transition: "0.25s ease",
  };

  return (
    <Container className="py-4" style={{ maxWidth: "900px" }}>
      
      {/* ABOUT SECTION */}
      <section
        id="about"
        style={sectionStyle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "translateY(-3px)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "translateY(0px)")
        }
      >
        <About />
      </section>

      {/* FEATURES */}
      <section
        id="features"
        style={sectionStyle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "translateY(-3px)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "translateY(0px)")
        }
      >
        <Features />
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        style={sectionStyle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "translateY(-3px)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "translateY(0px)")
        }
      >
        <Contact />
      </section>

      {/* PRIVACY */}
      <section
        id="privacy"
        style={sectionStyle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "translateY(-3px)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "translateY(0px)")
        }
      >
        <Privacy />
      </section>

    </Container>
  );
};

export default InfoScreen;
