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

// Easter-themed Pie chart colors (pastel shades)
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
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState("");

  const refreshDataAndTotals = () => {
    fetch(`${API_BASE_CATEGORIES}/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAllCategories(data.categories);
          setFilteredCategories(data.categories);

          // Fetch all expenses and calculate the grand total
          Promise.all(
            data.categories.map((category) =>
              fetch(`${API_BASE_EXPENSES}/category/${category._id}`)
                .then((res) => res.json())
                .then((expenseData) => {
                  if (expenseData.success) {
                    return expenseData.expenses.reduce(
                      (acc, e) => acc + e.amount,
                      0
                    );
                  } else {
                    return 0;
                  }
                })
            )
          ).then((totals) => {
            const grandTotal = totals.reduce((sum, curr) => sum + curr, 0);
            setTotalExpense(grandTotal);
          });
        } else {
          setAllCategories([]);
          setFilteredCategories([]);
          setTotalExpense(0);
        }
      });
  };

  useEffect(() => {
    refreshDataAndTotals(); // Initial load includes totals
  }, []);

  const validateDates = () => {
    if (startDate && isNaN(Date.parse(startDate))) {
      alert("Invalid Start Date.");
      return false;
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      alert("Invalid End Date.");
      return false;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert("Start Date cannot be after End Date.");
      return false;
    }
    return true;
  };

  const handleApplyFilters = () => {
    if (!validateDates()) return;

    Promise.all(
      allCategories.map((category) =>
        fetch(
          `${API_BASE_EXPENSES}/category/${
            category._id
          }?search=${encodeURIComponent(searchTerm)}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (!data.success) return null;

            let expenses = data.expenses;

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

            const categoryTotal = expenses.reduce(
              (acc, e) => acc + e.amount,
              0
            );

            return {
              ...category,
              expenses,
              filteredTotal: categoryTotal,
            };
          })
      )
    ).then((updated) => {
      const cleaned = updated.filter(Boolean);
      setFilteredCategories(cleaned);

      const newTotal = cleaned.reduce(
        (acc, cat) => acc + (cat.filteredTotal || 0),
        0
      );
      setTotalExpense(newTotal);
    });
  };

  const handleGenerateReport = () => {
    if (!validateDates()) return;

    Promise.all(
      allCategories.map((category) =>
        fetch(
          `${API_BASE_EXPENSES}/category/${
            category._id
          }?search=${encodeURIComponent(searchTerm)}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (!data.success) return null;

            let expenses = data.expenses;

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
      )
    ).then((results) => {
      const cleaned = results.filter(Boolean);
      const allExpenses = cleaned.flatMap((r) => r.expenses);

      if (allExpenses.length === 0) {
        setReport(null);
        setReportError("No expenses found in this date range.");
        return;
      }

      const totalSpent = allExpenses.reduce((acc, e) => acc + e.amount, 0);

      const categorySums = cleaned.map((r) => {
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

      const reportData = {
        totalSpent,
        categorySums,
        mostExpensive,
      };

      setReport(reportData);
      setReportError("");
    });
  };

  const handleAddCategory = (formData) => {
    fetch(`${API_BASE_CATEGORIES}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).then(() => {
      setShowAddCategoryModal(false);
      refreshDataAndTotals();
    });
  };

  const handleDeleteCategory = (categoryId) => {
    if (!window.confirm("Delete this category?")) return;
    fetch(`${API_BASE_CATEGORIES}/${categoryId}`, { method: "DELETE" }).then(
      () => refreshDataAndTotals()
    );
  };

  const handleEditCategory = (categoryId, updates) => {
    fetch(`${API_BASE_CATEGORIES}/${categoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).then(() => refreshDataAndTotals());
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

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 w-full">
          <button
            className="bg-pink-300 hover:bg-pink-400 text-white px-4 py-2 rounded"
            onClick={() => setShowAddCategoryModal(true)}>
            + Add Category
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
            className="bg-purple-300 hover:bg-purple-400 text-white px-3 py-2 rounded"
            onClick={handleApplyFilters}>
            Apply Filters
          </button>

          <button
            className="bg-yellow-300 hover:bg-yellow-400 text-white px-3 py-2 rounded"
            onClick={handleGenerateReport}>
            Generate Report
          </button>
        </div>

        {/* Report */}
        {reportError && (
          <div className="text-red-500 text-center my-4">{reportError}</div>
        )}

        {report && (
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
              {report.categorySums.map((cat, index) => (
                <p key={cat.name}>
                  {cat.name}: ${cat.amount.toFixed(2)} ({cat.percent}%)
                </p>
              ))}
            </div>
            <div className="mt-3">
              <h3 className="font-semibold">Top Expense:</h3>
              <p>
                The most expensive item you have is{" "}
                <strong>{report.mostExpensive.name}</strong> from category{" "}
                <strong>{report.mostExpensive.category.name}</strong>.
              </p>
            </div>

            {/* Pie Chart */}
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
        )}

        {/* Category Cards */}
        <div className="w-full mt-6 space-y-4">
          {filteredCategories.length === 0 ? (
            <p className="text-gray-500 italic text-center">
              No categories or expenses found for current filters.
            </p>
          ) : (
            filteredCategories.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                onDeleteCategory={handleDeleteCategory}
                onEditCategory={handleEditCategory}
                refreshData={refreshDataAndTotals} // 🟢 Pass the refresh handler here
                filteredExpenses={category.expenses}
                filteredTotal={category.filteredTotal}
              />
            ))
          )}
        </div>

        {/* Modal */}
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
