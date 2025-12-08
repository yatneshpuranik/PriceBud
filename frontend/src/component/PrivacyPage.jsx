import React from "react";

const PrivacyPage = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2 className="mb-3">Privacy Policy</h2>
      <p>
        At <strong>PriceBuddy</strong>, your privacy is extremely important to us.
        We are committed to safeguarding your data and ensuring transparency
        about how your information is collected, used, and protected.
      </p>

      <h4 className="mt-4">1. Information We Collect</h4>
      <p>
        - Basic usage data (pages visited, clicks, etc.) <br />
        - Product URLs or details you submit for tracking <br />
        - No sensitive or financial information is collected
      </p>

      <h4 className="mt-4">2. How We Use Your Information</h4>
      <p>
        - To track product price history <br />
        - To show comparison data <br />
        - To generate AI-based price predictions <br />
        - To improve platform performance and user experience
      </p>

      <h4 className="mt-4">3. Data Protection</h4>
      <p>
        - All user data is securely stored <br />
        - We never sell or share data with third parties <br />
        - Only anonymized data is used for analytics
      </p>

      <h4 className="mt-4">4. Contact Us</h4>
      <p>
        If you have questions about our privacy policy, reach out at: <br />
        <strong>support@pricebuddy.com</strong>
      </p>

      <p className="mt-3">
        Last Updated: <strong>{new Date().toDateString()}</strong>
      </p>
    </div>
  );
};

export default PrivacyPage;
