import React, { useEffect, useState } from "react";
import { IoRefreshOutline, IoTrashOutline } from "react-icons/io5";
import axios from "axios";
import "./HistoryPage.css";

const HistoryPage = ({ navigateToMain }) => {
  const [historyAlerts, setHistoryAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("");
  const [selectedHistory, setSelectedHistory] = useState(new Set());

  useEffect(() => {
    fetchHistoryAlerts();
    const interval = setInterval(() => {
      fetchHistoryAlerts();
    }, 60000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const fetchHistoryAlerts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/alert_history?page=${currentPage}&per_page=${perPage}`,
        { withCredentials: true }
      );
      setHistoryAlerts(response.data.history_alerts);
      setTotalPages(response.data.pages || 1);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch alerts. Please try again later.");
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedHistory((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedHistory.size === 0) return;
    try {
      await axios.post(
        "/delete_history_alerts",
        { history_ids: Array.from(selectedHistory) },
        { withCredentials: true }
      );
      setSelectedHistory(new Set());
      fetchHistoryAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const sortAlerts = (data) => {
    let sorted = [...data];
    switch (filterOption) {
      case "A-Z":
        sorted.sort((a, b) => a.symbol.localeCompare(b.symbol));
        break;
      case "Z-A":
        sorted.sort((a, b) => b.symbol.localeCompare(a.symbol));
        break;
      case "price asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "price type high":
        sorted = sorted.filter((alert) => alert.price_type === "high");
        break;
      case "price type low":
        sorted = sorted.filter((alert) => alert.price_type === "low");
        break;
      default:
        break;
    }
    return sorted;
  };

  const filteredAlerts = historyAlerts.filter((alert) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      alert.symbol.toLowerCase().includes(lowerSearch) ||
      String(alert.price).toLowerCase().includes(lowerSearch) ||
      alert.price_type.toLowerCase().includes(lowerSearch) ||
      alert.activated_at.toLowerCase().includes(lowerSearch)
    );
  });

  const finalAlerts = sortAlerts(filteredAlerts);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-header">
          <h2 className="mb-0">Your Alert History</h2>
        </div>
        <div className="card-body">
          <div className="table-controls">
            <div className="pagination-buttons">
              <button className="btn btn-primary" onClick={handlePrevious} disabled={currentPage === 1}>
                Previous
              </button>
              <button className="btn btn-primary" onClick={handleNext} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
            <div className="action-controls">
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
                <option value="">No Filter/Sort</option>
                <option value="A-Z">A-Z (Symbol)</option>
                <option value="Z-A">Z-A (Symbol)</option>
                <option value="price asc">Price Asc</option>
                <option value="price desc">Price Desc</option>
                <option value="price type high">Price Type: High</option>
                <option value="price type low">Price Type: Low</option>
              </select>
              <button className="btn-delete btn btn-danger" onClick={handleDeleteSelected}>
                <IoTrashOutline />
              </button>
              <button className="btn-refresh btn btn-secondary" onClick={fetchHistoryAlerts}>
                <IoRefreshOutline />
              </button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Stock Symbol</th>
                  <th>Price</th>
                  <th>Price Type</th>
                  <th>Activated At</th>
                </tr>
              </thead>
              <tbody>
                {finalAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <input type="checkbox" checked={selectedHistory.has(alert.id)} onChange={() => handleCheckboxChange(alert.id)} />
                    </td>
                    <td>{alert.symbol}</td>
                    <td>${alert.price.toFixed(2)}</td>
                    <td>{alert.price_type.charAt(0).toUpperCase() + alert.price_type.slice(1)}</td>
                    <td>{alert.activated_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
