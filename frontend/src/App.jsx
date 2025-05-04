import React, { useState, useEffect } from "react";
import CategoryCard from "./components/CategoryCard.jsx";
import Modal from "./components/Modal.jsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE_CATEGORIES = "http://localhost:5050/categories";
const API_BASE_EXPENSES = "http://localhost:5050/expenses";

const COLORS = [
  "#f8b195",
  "#f67280",
  "#c06c84",
  "#6c5b7b",
  "#355c7d",
  "#d6d6f5",
  "#b3e6b3",
  "#ffe0ac",
];

function App() {
  const [allCategories, setAllCategories] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [filtersActive, setFiltersActive] = useState(false);

  const fetchData = () => {
    if (filtersActive) {
      applyFilters();
    } else {
      fetch(`${API_BASE_CATEGORIES}/with-expenses`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAllCategories(data.categories);
            const sum = data.categories.reduce(
              (acc, cat) =>
                acc + cat.expenses.reduce((eAcc, e) => eAcc + e.amount, 0),
              0
            );
            setTotalExpense(sum);
          } else {
            setAllCategories([]);
            setTotalExpense(0);
          }
        });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const applyFilters = () => {
    fetch(`${API_BASE_CATEGORIES}/with-expenses`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setAllCategories([]);
          setTotalExpense(0);
          return;
        }

        const filtered = data.categories
          .map((category) => {
            let expenses = category.expenses;

            // Filter by name (search term)
            if (searchTerm) {
              expenses = expenses.filter((e) =>
                e.name.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }

            // Filter by date
            if (startDate) {
              expenses = expenses.filter(
                (e) => new Date(e.date) >= new Date(startDate)
              );
            }
            if (endDate) {
              expenses = expenses.filter(
                (e) => new Date(e.date) <= new Date(endDate)
              );
            }

            const totalFiltered = expenses.reduce(
              (acc, e) => acc + e.amount,
              0
            );

            return {
              ...category,
              expenses,
              totalFiltered,
            };
          })
          .filter((cat) => cat.expenses.length > 0); // Remove empty categories

        setAllCategories(filtered);

        const sum = filtered.reduce(
          (acc, cat) => acc + (cat.totalFiltered || 0),
          0
        );
        setTotalExpense(sum);
      });
  };

  const handleApplyFilters = () => {
    setFiltersActive(true);
    applyFilters();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setFiltersActive(false);
    fetchData();
  };

  const handleAddCategory = (formData) => {
    fetch(`${API_BASE_CATEGORIES}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).then(() => {
      setShowAddCategoryModal(false);
      fetchData();
    });
  };

  const handleGenerateReport = () => {
    fetch(`${API_BASE_CATEGORIES}/with-expenses`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setReport(null);
          setReportError("Failed to fetch data for the report.");
          setShowReport(true);
          return;
        }

        const filtered = data.categories
          .map((category) => {
            let expenses = category.expenses;

            // Filter by name (search term)
            if (searchTerm) {
              expenses = expenses.filter((e) =>
                e.name.toLowerCase().includes(searchTerm.toLowerCase())
              );
            }

            // Filter by date
            if (startDate) {
              expenses = expenses.filter(
                (e) => new Date(e.date) >= new Date(startDate)
              );
            }
            if (endDate) {
              expenses = expenses.filter(
                (e) => new Date(e.date) <= new Date(endDate)
              );
            }

            return {
              category,
              expenses,
            };
          })
          .filter((r) => r.expenses.length > 0);

        const allExpenses = filtered.flatMap((r) => r.expenses);
        if (allExpenses.length === 0) {
          setReport(null);
          setReportError("No expenses found for current filters.");
          setShowReport(true);
          return;
        }

        const totalSpent = allExpenses.reduce((acc, e) => acc + e.amount, 0);

        const categorySums = filtered.map((r) => {
          const sum = r.expenses.reduce((acc, e) => acc + e.amount, 0);
          return {
            name: r.category.name,
            amount: sum,
            percent: ((sum / totalSpent) * 100).toFixed(1),
          };
        });

        const mostExpensive = allExpenses.reduce((prev, curr) =>
          curr.amount > prev.amount ? curr : prev
        );

        setReport({
          totalSpent,
          categorySums,
          mostExpensive,
        });
        setReportError("");
        setShowReport(true);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen p-5 text-purple-800 bg-[#ffe6f0]">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2 text-center text-pink-600">
          Personal Financial Tracker
        </h1>
        <p className="text-lg text-center mb-4 text-pink-500">
          Total Expenses: ${totalExpense.toFixed(2)}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-6 w-full">
          <button
            className="!bg-white hover:bg-pink-400 text-black px-4 py-2 rounded"
            onClick={() => setShowAddCategoryModal(true)}>
            Add Category
          </button>
          <input
            type="text"
            placeholder="Search expenses"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-purple-300 rounded px-2 py-2 w-48 text-black"
          />
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-purple-700">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-purple-300 rounded px-2 py-1 text-black"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-purple-700">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-purple-300 rounded px-2 py-1 text-black"
            />
          </div>
          <button
            className="!bg-white hover:bg-green-500 text-black px-3 py-2 rounded"
            onClick={handleApplyFilters}>
            Apply Filters
          </button>
          <button
            className="!bg-white hover:bg-gray-400 text-black px-3 py-2 rounded"
            onClick={handleResetFilters}>
            Reset Filters
          </button>
          <button
            className="!bg-white hover:bg-yellow-400 text-black px-3 py-2 rounded"
            onClick={handleGenerateReport}>
            Generate Report
          </button>
          {showReport && (
            <button
              className="!bg-white hover:bg-gray-500 text-black px-3 py-2 rounded"
              onClick={() => setShowReport(false)}>
              Hide Report
            </button>
          )}
        </div>

        {/* Report */}
        {showReport &&
          (reportError ? (
            <div className="text-red-500 text-center my-4">{reportError}</div>
          ) : report ? (
            <div className="bg-[#fdf1f8] text-black border rounded p-4 mt-4 w-full">
              <h2 className="text-xl font-bold mb-2 text-purple-700">
                Expense Report
              </h2>
              <p>
                You spent ${report.totalSpent.toFixed(2)}{" "}
                {startDate || endDate ? (
                  <>
                    from {startDate || "the beginning"} to {endDate || "today"}.
                  </>
                ) : (
                  <>in total (all time).</>
                )}
              </p>
              <div className="mt-3">
                <h3 className="font-semibold mb-1">By Category:</h3>
                {report.categorySums.map((cat) => (
                  <p key={cat.name}>
                    {cat.name}: ${cat.amount.toFixed(2)} ({cat.percent}%)
                  </p>
                ))}
              </div>
              <div className="mt-3">
                <h3 className="font-semibold">Top Expense:</h3>
                <p>
                  The most expensive item is{" "}
                  <strong>
                    {report.mostExpensive.name} (${report.mostExpensive.amount})
                  </strong>{" "}
                  from category{" "}
                  <strong>{report.mostExpensive.category.name}</strong>.
                </p>
              </div>
              <div className="mt-6" style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={report.categorySums}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label>
                      {report.categorySums.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null)}

        {/* Category Cards */}
        <div className="w-full mt-6 space-y-4">
          {allCategories.length === 0 ? (
            <p className="text-gray-500 italic text-center">
              No categories or expenses found.
            </p>
          ) : (
            allCategories.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                refreshData={fetchData}
              />
            ))
          )}
        </div>

        {showAddCategoryModal && (
          <Modal
            key={Date.now()}
            title="Add New Category"
            fields={[
              { name: "name", label: "Category Name", required: true },
              { name: "description", label: "Description" },
            ]}
            onSubmit={handleAddCategory}
            onClose={() => setShowAddCategoryModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
