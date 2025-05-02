import React, { useState, useEffect } from "react";
import ExpenseCard from "./ExpenseCard.jsx";
import Modal from "./Modal.jsx";

const API_BASE_EXPENSES = "http://localhost:5050/expenses";

const CategoryCard = ({
  category,
  onDeleteCategory,
  onEditCategory,
  refreshData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [editedName, setEditedName] = useState(category.name);
  const [editedDesc, setEditedDesc] = useState(category.description || "");
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE_EXPENSES}/category/${category._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setExpenses(data.expenses);
          }
        });
    }
  }, [isOpen, category._id, refreshData]);

  const handleSaveCategory = () => {
    const updates = {};
    if (editedName !== category.name) updates.name = editedName;
    if (editedDesc !== category.description) updates.description = editedDesc;
    if (Object.keys(updates).length > 0) {
      onEditCategory(category._id, updates);
    }
  };

  const handleAddExpense = (formData) => {
    fetch(`${API_BASE_EXPENSES}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, category: category._id }),
    }).then(() => {
      setShowAddExpenseModal(false);
      setIsOpen(true);
      refreshData();
    });
  };

  return (
    <div className="border rounded my-3 shadow w-full">
      <div
        className="flex justify-between items-center p-3 bg-blue-200 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}>
        <div className="flex-1 space-y-1">
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full font-bold text-lg bg-transparent border-b border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            value={editedDesc}
            onChange={(e) => setEditedDesc(e.target.value)}
            className="w-full text-sm bg-transparent border-b border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex space-x-2 ml-2">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddExpenseModal(true);
            }}>
            Add Expense
          </button>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveCategory();
            }}>
            Save
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCategory(category._id);
            }}>
            Delete
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense._id}
              expense={expense}
              refreshData={refreshData}
            />
          ))}
        </div>
      )}

      {showAddExpenseModal && (
        <Modal
          title="Add New Expense"
          fields={[
            { name: "name", label: "Expense Name", required: true },
            { name: "description", label: "Description" },
            { name: "amount", label: "Amount", type: "number", required: true },
            { name: "date", label: "Date (YYYY-MM-DD)", type: "date" },
          ]}
          onSubmit={handleAddExpense}
          onClose={() => setShowAddExpenseModal(false)}
        />
      )}
    </div>
  );
};

export default CategoryCard;
