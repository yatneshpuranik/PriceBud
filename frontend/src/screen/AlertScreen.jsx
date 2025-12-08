import  { useEffect, useState } from "react";
import axios from "axios";

const AlertScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // Fetch user alerts
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/alerts", { withCredentials: true });
      setAlerts(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load alerts");
      setLoading(false);
    }
  };

  // Fetch all products for dropdown
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchProducts();
  }, []);

  // Add new alert
  const handleAddAlert = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !targetPrice) {
      setError("Please select a product and enter target price");
      return;
    }
    try {
      const { data } = await axios.post(
        "/api/alerts",
        { productId: selectedProduct, targetPrice },
        { withCredentials: true }
      );
      setAlerts(data.alerts);
      setSelectedProduct("");
      setTargetPrice("");
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add alert");
    }
  };

  // Delete alert
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;

    try {
      const { data } = await axios.delete(`/api/alerts/${id}`, { withCredentials: true });
      setAlerts(data.alerts);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete alert");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Alerts</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Add Alert Form */}
      <form onSubmit={handleAddAlert} className="flex gap-2 mb-6">
        <select
          className="border p-2 rounded flex-1"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="border p-2 rounded w-32"
          placeholder="Target Price"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      {/* Alerts List */}
      {loading ? (
        <p>Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p>No alerts yet.</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert) => (
            <li
              key={alert._id}
              className="border p-3 flex justify-between items-center rounded shadow-sm"
            >
              <div>
                <p className="font-semibold">{alert.product.name}</p>
                <p>Target Price: ${alert.targetPrice}</p>
              </div>
              <button
                onClick={() => handleDelete(alert._id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertScreen;
