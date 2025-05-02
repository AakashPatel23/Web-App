import React, { useState, useEffect } from "react";
import CategoryCard from "./components/CategoryCard.jsx";
import Modal from "./components/Modal.jsx";

const API_BASE_CATEGORIES = "http://localhost:5050/categories";
const API_BASE_EXPENSES = "http://localhost:5050/expenses";

function App() {
  const [categories, setCategories] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  const fetchData = () => {
    fetch(`${API_BASE_CATEGORIES}/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
      });

    fetch(`${API_BASE_EXPENSES}/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const total = data.expenses.reduce(
            (acc, curr) => acc + curr.amount,
            0
          );
          setTotalExpense(total);
        }
      });
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const handleAddCategory = (formData) => {
    fetch(`${API_BASE_CATEGORIES}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).then(() => {
      setRefresh((prev) => prev + 1);
      setShowAddCategoryModal(false);
    });
  };

  const handleDeleteCategory = (categoryId) => {
    if (!window.confirm("Delete this category?")) return;
    fetch(`${API_BASE_CATEGORIES}/${categoryId}`, { method: "DELETE" }).then(
      () => setRefresh((prev) => prev + 1)
    );
  };

  const handleEditCategory = (categoryId, updates) => {
    fetch(`${API_BASE_CATEGORIES}/${categoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).then(() => setRefresh((prev) => prev + 1));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5">
    <div className="max-w-3xl mx-auto p-5 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2 text-center">
        Personal Financial Tracker
      </h1>
      <p className="text-lg text-center mb-4">
        Total Expenses: ${totalExpense.toFixed(2)}
      </p>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShowAddCategoryModal(true)}>
        + Add Category
      </button>

      {categories.map((category) => (
        <CategoryCard
          key={category._id}
          category={category}
          onDeleteCategory={handleDeleteCategory}
          onEditCategory={handleEditCategory}
          refreshData={() => setRefresh((prev) => prev + 1)}
        />
      ))}

      {showAddCategoryModal && (
        <Modal
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
