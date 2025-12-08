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

  const sectionStyle = {
    background: "#ffffff",
    padding: "35px 25px",
    borderRadius: "14px",
    marginBottom: "40px",
    border: "1px solid #e5e5e5",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  };



  return (
    <Container className="py-4" style={{ maxWidth: "900px" }}>
      
      {/* ABOUT */}
      <section id="about" style={sectionStyle}>
        {/* <h2 style={headingStyle}>About PriceBuddy</h2> */}
        <About />
      </section>

      {/* FEATURES */}
      <section id="features" style={sectionStyle}>
        {/* <h2 style={headingStyle}>Features</h2> */}
        <Features />
      </section>

      {/* CONTACT */}
      <section id="contact" style={sectionStyle}>
        {/* <h2 style={headingStyle}>Contact Us</h2> */}
        <Contact />
      </section>

      {/* PRIVACY */}
      <section id="privacy" style={sectionStyle}>
        {/* <h2 style={headingStyle}>Privacy Polic</h2> */}
        <Privacy />
      </section>

    </Container>
  );
};

export default InfoScreen;
