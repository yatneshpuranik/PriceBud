import { Container } from "react-bootstrap";
import { useLocation } from "react-router-dom";

import Product from "../component/Product";
import { useGetProductsQuery } from "../slices/productsApiSlice";

const HomeScreen = () => {
  const { search } = useLocation();
  const keyword = new URLSearchParams(search).get("search") || "";
const { data: products , isLoading , error } = useGetProductsQuery(keyword);


  
  return (
    <>
      {isLoading ? (
        <h2>Loading...</h2>
      ) : error ? (
        <div>{error?.data?.message || error.error}</div>
      ) : (
        <Container fluid="md" className="py-3">
          <h1 className="mb-4">Latest Products</h1>

          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            {products && products.length > 0 ? (
              products.map((product) => (
                <Product key={product._id} product={product} />
              ))
            ) : (
              <p className="text-muted">No products found.</p>
            )}
          </div>
        </Container>
      )}
    </>
  );
};

export default HomeScreen;
