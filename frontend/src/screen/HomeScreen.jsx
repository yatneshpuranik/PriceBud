import { Container } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import Product from "../component/Product";
import { useGetProductsQuery } from "../slices/productsApiSlice";

const HomeScreen = () => {
  const { search } = useLocation();
  const keyword = new URLSearchParams(search).get("search") || "";

  const { data: products, isLoading, error } = useGetProductsQuery(keyword);

  return (
    <>
      {isLoading ? (
        <Container className="py-5 text-center">
          <h4 style={{ opacity: 0.6 }}>Loading products…</h4>
        </Container>
      ) : error ? (
        <Container className="py-5 text-center">
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              padding: "14px",
              borderRadius: "10px",
              display: "inline-block",
              color: "#b91c1c",
            }}
          >
            {error?.data?.message || error.error}
          </div>
        </Container>
      ) : (
        <Container fluid="md" className="py-4" style={{ maxWidth: "900px" }}>
          {/* HEADER */}
          <h1
            className="mb-4"
            style={{
              fontWeight: 700,
              fontSize: "32px",
              letterSpacing: "-0.5px",
            }}
          >
            Latest Products
          </h1>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "26px",
            }}
          >
            {products && products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product._id}
                  style={{
                    transition: "0.25s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-3px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0px)")
                  }
                >
                  <Product product={product} />
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "40px",
                  borderRadius: "14px",
                  background: "#f9fafb",
                  border: "1px dashed #cbd5e1",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: "16px", color: "#6b7280" }}>
                  No products found.
                </p>
              </div>
            )}
          </div>
        </Container>
      )}
    </>
  );
};

export default HomeScreen;
