import React, { useState, useEffect } from "react";
import ExpenseCard from "./ExpenseCard.jsx";
import Modal from "./Modal.jsx";
import validator from "validator";

const API_BASE_EXPENSES = "http://localhost:5050/expenses";

const CategoryCard = ({
  category,
  onDeleteCategory,
  onEditCategory,
  refreshData,
  filteredExpenses,
  filteredTotal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [editedName, setEditedName] = useState(category.name);
  const [editedDesc, setEditedDesc] = useState(category.description || "");
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchExpenses = () => {
    fetch(`${API_BASE_EXPENSES}/category/${category._id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setExpenses(data.expenses);
          const sum = data.expenses.reduce((acc, e) => acc + e.amount, 0);
          setTotal(sum);
        } else {
          setExpenses([]);
          setTotal(0);
        }
      });
  };

  useEffect(() => {
    if (filteredExpenses !== undefined) {
      setExpenses(filteredExpenses);
      setTotal(filteredTotal || 0);
    } else {
      fetchExpenses();
    }
  }, [filteredExpenses, filteredTotal, category._id, refreshData]);

  const handleSaveCategory = () => {
    const updates = {};
    if (editedName.trim() !== category.name)
      updates.name = validator.trim(editedName);
    if (editedDesc.trim() !== category.description)
      updates.description = validator.trim(editedDesc);
    if (Object.keys(updates).length > 0) {
      onEditCategory(category._id, updates);
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

    if (formData.date && isNaN(Date.parse(formData.date))) {
      alert("Please enter a valid date (YYYY-MM-DD).");
      return;
    }

    if (formData.date) {
      const today = new Date();
      const selectedDate = new Date(formData.date);
      if (selectedDate > today) {
        alert("Date cannot be in the future.");
        return;
      }
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
      fetchExpenses();
      refreshData();
    });
  };

  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <div className="border rounded my-3 shadow w-full">
      <div
        className="flex justify-between items-center p-3"
        style={{ backgroundColor: "#cce5ff" }} // Softer Easter-blue
      >
        <div className="flex-1 space-y-1">
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full font-bold text-lg bg-transparent focus:outline-none text-purple-700"
          />
          <input
            type="text"
            value={editedDesc}
            onChange={(e) => setEditedDesc(e.target.value)}
            className="w-full text-sm bg-transparent focus:outline-none text-purple-600"
          />
          <p className="text-sm mt-1 text-purple-600">
            Total: ${total.toFixed(2)}
          </p>
        </div>
        <div className="flex space-x-2 ml-2">
          <button
            className="bg-pink-300 hover:bg-pink-400 text-white px-3 py-1 rounded"
            onClick={() => setShowAddExpenseModal(true)}>
            Add Expense
          </button>
          <button
            className="bg-yellow-300 hover:bg-yellow-400 text-white px-3 py-1 rounded"
            onClick={handleSaveCategory}>
            Save
          </button>
          <button
            className="bg-red-300 hover:bg-red-400 text-white px-3 py-1 rounded"
            onClick={() => onDeleteCategory(category._id)}>
            Delete
          </button>
          <button
            className="bg-purple-300 hover:bg-purple-400 text-white px-3 py-1 rounded"
            onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "▲ Hide" : "▼ Show"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 bg-[#f9f3f9]">
          {expenses.length === 0 ? (
            <p className="text-gray-500 italic">No expenses yet.</p>
          ) : (
            expenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                refreshData={fetchExpenses}
              />
            ))
          )}
        </div>
      )}

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
