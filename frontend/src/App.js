// App.js
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";

import Header from "./component/Header";
import Footer from "./component/Footer";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <Header />

      <main className="py-3">
        <Container>
          <Outlet />
        </Container>
      </main>

      <Footer />
      <ToastContainer />
    </>
  );
}

export default App;
