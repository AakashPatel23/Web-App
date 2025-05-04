import React, { useState } from "react";
import ExpenseCard from "./ExpenseCard.jsx";
import Modal from "./Modal.jsx";
import validator from "validator";

const API_BASE_EXPENSES = "http://localhost:5050/expenses";
const API_BASE_CATEGORIES = "http://localhost:5050/categories";

const CategoryCard = ({ category, refreshData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  const handleDeleteCategory = () => {
    if (!window.confirm("Delete this category and all its expenses?")) return;
    fetch(`${API_BASE_CATEGORIES}/${category._id}`, {
      method: "DELETE",
    }).then(() => refreshData());
  };

  const handleSaveCategory = (formData) => {
    const updates = {};
    if (formData.name && formData.name.trim() !== category.name)
      updates.name = validator.trim(formData.name);
    if (
      formData.description &&
      formData.description.trim() !== category.description
    )
      updates.description = validator.trim(formData.description);
    if (Object.keys(updates).length > 0) {
      fetch(`${API_BASE_CATEGORIES}/${category._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).then(() => {
        setShowEditModal(false);
        refreshData();
      });
    }
  };

  const handleAddExpense = (formData) => {
    const amountValue = parseFloat(formData.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid positive number for the amount.");
      return;
    }
    if (!formData.name.trim()) {
      alert("Expense name cannot be empty.");
      return;
    }
    const safeData = {
      name: validator.trim(formData.name),
      description: formData.description
        ? validator.trim(formData.description)
        : "",
      amount: amountValue,
      date: formData.date || new Date().toISOString().split("T")[0],
      category: category._id,
    };
    fetch(`${API_BASE_EXPENSES}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safeData),
    }).then(() => {
      setShowAddExpenseModal(false);
      refreshData();
    });
  };

  const total = category.expenses.reduce((acc, e) => acc + e.amount, 0);
  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <div className="border rounded shadow w-full bg-purple-100">
      <div className="flex justify-between items-center p-3 bg-pink-200 text-purple-800">
        <div className="flex-1 space-y-1">
          <p className="font-bold text-lg">{category.name}</p>
          <p className="text-sm">{category.description}</p>
          <p className="text-sm mt-1">Total: ${total.toFixed(2)}</p>
        </div>
        <div className="flex space-x-2 ml-2">
          <button
            className="!bg-white text-black border border-gray-300 px-3 py-1 rounded shadow-sm"
            onClick={() => setShowAddExpenseModal(true)}>
            Add Expense
          </button>
          <button
            className="!bg-white text-black border border-gray-300 px-3 py-1 rounded shadow-sm"
            onClick={() => setShowEditModal(true)}>
            Edit
          </button>
          <button
            className="!bg-white text-black border border-gray-300 px-3 py-1 rounded shadow-sm"
            onClick={handleDeleteCategory}>
            Delete
          </button>
          <button
            className="!bg-white text-black border border-gray-300 px-3 py-1 rounded shadow-sm"
            onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "▲ Hide" : "▼ Show"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3">
          {category.expenses.length === 0 ? (
            <p className="text-purple-800 italic">No expenses yet.</p>
          ) : (
            category.expenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                refreshData={refreshData}
              />
            ))
          )}
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <Modal
          title="Edit Category"
          fields={[
            {
              name: "name",
              label: "Category Name",
              required: true,
              defaultValue: category.name,
            },
            {
              name: "description",
              label: "Description",
              defaultValue: category.description,
            },
          ]}
          onSubmit={handleSaveCategory}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <Modal
          title="Add New Expense"
          fields={[
            { name: "name", label: "Expense Name", required: true },
            { name: "description", label: "Description" },
            {
              name: "amount",
              label: "Amount",
              type: "text",
              required: true,
              placeholder: "Enter amount (e.g., 12.99)",
            },
            {
              name: "date",
              label: "Date (YYYY-MM-DD)",
              type: "date",
              defaultValue: todayDate,
            },
          ]}
          onSubmit={handleAddExpense}
          onClose={() => setShowAddExpenseModal(false)}
        />
      )}
    </div>
  );
};

export default CategoryCard;
