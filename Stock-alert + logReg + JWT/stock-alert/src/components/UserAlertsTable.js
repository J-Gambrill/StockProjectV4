import React, { useEffect, useState } from "react";
import { IoRefreshOutline, IoTrashOutline } from "react-icons/io5";
import axios from "axios";
import "./UserAlertsTable.css";

const UserAlertsTable = () => {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  // Searching/filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("");

  // Deleting
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());

  // Inline editing
  const [editingAlert, setEditingAlert] = useState({});
  // e.g. { id: 12, field: "symbol", value: "AAPL" }

  // Local client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => {
      fetchAlerts();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get("/user_alerts", {
        withCredentials: true,
      });
      setAlerts(response.data.alerts);
      setError(null);
    } catch (err) {
      setError("Failed to fetch alerts. Please try again later.");
    }
  };

  const handleCheckboxChange = (alertId) => {
    setSelectedAlerts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedAlerts.size === 0) return;
    try {
      await axios.post(
        "/delete_user_alerts",
        { alert_ids: Array.from(selectedAlerts) },
        { withCredentials: true }
      );
      setSelectedAlerts(new Set());
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  // Sorting / filtering
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

  const filteredAlerts = alerts.filter((alert) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      alert.symbol.toLowerCase().includes(lowerSearch) ||
      String(alert.price).toLowerCase().includes(lowerSearch) ||
      alert.price_type.toLowerCase().includes(lowerSearch)
    );
  });

  const finalAlerts = sortAlerts(filteredAlerts);
  const totalPages = Math.ceil(finalAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pagedAlerts = finalAlerts.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // -----------------------------
  // Inline editing logic
  // -----------------------------

  // Called when user clicks on any cell (symbol/price/price_type)
  const handleCellClick = async (alertId, field, currentValue) => {
    // If we are editing a different row or field, first finalize the old row
    if (
      editingAlert.id && // we are editing something
      (editingAlert.id !== alertId || editingAlert.field !== field)
    ) {
      await updateAlert(); // commit previous changes automatically
    }
    // Now open editing for the newly clicked cell
    setEditingAlert({ id: alertId, field, value: currentValue });
  };

  const handleEditChange = (e) => {
    setEditingAlert((prev) => ({ ...prev, value: e.target.value }));
  };

  // Press Enter to commit changes
  const handleEditKeyDown = async (e) => {
    if (e.key === "Enter") {
      await updateAlert();
    }
  };

  // PUT to server, then update local table
  const updateAlert = async () => {
    if (!editingAlert.id) return; // not currently editing anything

    try {
      const { id, field, value } = editingAlert;
      const originalAlert = alerts.find((a) => a.id === id);
      if (!originalAlert) return;

      const updated = {
        id: originalAlert.id,
        symbol: originalAlert.symbol,
        price: originalAlert.price,
        price_type: originalAlert.price_type,
      };

      // Update only the field we were editing
      if (field === "symbol") updated.symbol = value;
      if (field === "price") updated.price = parseFloat(value) || 0;
      if (field === "price_type") updated.price_type = value;

      await axios.put("/update_alert", updated, {
        withCredentials: true,
      });

      // Update local state
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
      );
    } catch (error) {
      console.error("Error updating alert:", error);
    } finally {
      // Clear editing state so the cell returns to display mode
      setEditingAlert({});
    }
  };

  return (
    <div className="alerts-table-container">
      <div className="card">
        <div className="card-header">
          <h2 className="mb-0">Active Alerts</h2>
        </div>
        <div className="card-body">
          {alerts.length === 0 ? (
            <p>No alerts found. Please create an alert above.</p>
          ) : (
            <>
              <div className="table-controls">
                <div className="pagination-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </button>
                </div>
                <div className="action-controls">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value)}
                  >
                    <option value="">No Filter/Sort</option>
                    <option value="A-Z">A-Z (Symbol)</option>
                    <option value="Z-A">Z-A (Symbol)</option>
                    <option value="price asc">Price Asc</option>
                    <option value="price desc">Price Desc</option>
                    <option value="price type high">Price Type: High</option>
                    <option value="price type low">Price Type: Low</option>
                  </select>
                  <button className="btn-delete btn" onClick={handleDeleteSelected}>
                    <IoTrashOutline />
                  </button>
                  <button className="btn-refresh btn" onClick={fetchAlerts}>
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
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAlerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedAlerts.has(alert.id)}
                            onChange={() => handleCheckboxChange(alert.id)}
                          />
                        </td>

                        {/* Symbol cell: single-click to edit */}
                        <td
                          onClick={() =>
                            handleCellClick(alert.id, "symbol", alert.symbol)
                          }
                        >
                          {editingAlert.id === alert.id &&
                          editingAlert.field === "symbol" ? (
                            <input
                              type="text"
                              value={editingAlert.value}
                              onChange={handleEditChange}
                              onKeyDown={handleEditKeyDown}
                              autoFocus
                            />
                          ) : (
                            alert.symbol
                          )}
                        </td>

                        {/* Price cell: single-click to edit */}
                        <td
                          onClick={() =>
                            handleCellClick(alert.id, "price", alert.price)
                          }
                        >
                          {editingAlert.id === alert.id &&
                          editingAlert.field === "price" ? (
                            <input
                              type="number"
                              step="any"
                              value={editingAlert.value}
                              onChange={handleEditChange}
                              onKeyDown={handleEditKeyDown}
                              autoFocus
                            />
                          ) : (
                            alert.price
                          )}
                        </td>

                        {/* Price Type cell: single-click to edit */}
                        <td
                          onClick={() =>
                            handleCellClick(
                              alert.id,
                              "price_type",
                              alert.price_type
                            )
                          }
                        >
                          {editingAlert.id === alert.id &&
                          editingAlert.field === "price_type" ? (
                            <select
                              value={editingAlert.value}
                              onChange={handleEditChange}
                              onKeyDown={handleEditKeyDown}
                              autoFocus
                            >
                              <option value="high">High</option>
                              <option value="low">Low</option>
                            </select>
                          ) : (
                            alert.price_type
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-center mt-2">
                <span>
                  Page {currentPage} of {totalPages || 1}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAlertsTable;
