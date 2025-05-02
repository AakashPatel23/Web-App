import React, { useState } from "react";
import validator from "validator";

const API_BASE_EXPENSES = "http://localhost:5050/expenses";

const ExpenseCard = ({ expense, refreshData }) => {
  const [editedName, setEditedName] = useState(expense.name);
  const [editedDesc, setEditedDesc] = useState(expense.description || "");
  const [editedAmount, setEditedAmount] = useState(expense.amount);

  const handleSaveExpense = () => {
    if (!editedName.trim()) {
      alert("Expense name cannot be empty.");
      return;
    }

    if (isNaN(editedAmount) || editedAmount <= 0) {
      alert("Please enter a valid positive number for the amount.");
      return;
    }

    const updates = {};
    if (editedName.trim() !== expense.name)
      updates.name = validator.trim(editedName);
    if (editedDesc.trim() !== expense.description)
      updates.description = validator.trim(editedDesc);
    if (editedAmount !== expense.amount) updates.amount = editedAmount;

    if (Object.keys(updates).length > 0) {
      fetch(`${API_BASE_EXPENSES}/${expense._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).then(() => {
        refreshData();
      });
    }
  };

  const handleDeleteExpense = () => {
    if (!window.confirm("Delete this expense?")) return;
    fetch(`${API_BASE_EXPENSES}/${expense._id}`, { method: "DELETE" }).then(
      () => {
        refreshData();
      }
    );
  };

  return (
    <div className="border rounded p-3 my-2 flex justify-between items-center shadow bg-200 text-white">
      <div className="flex-1 space-y-1">
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className="w-full font-bold bg-transparent focus:outline-none"
        />
        <input
          type="text"
          value={editedDesc}
          onChange={(e) => setEditedDesc(e.target.value)}
          className="w-full text-sm bg-transparent focus:outline-none"
        />
        <input
          type="number"
          value={editedAmount}
          onChange={(e) => setEditedAmount(parseFloat(e.target.value))}
          className="w-full text-sm bg-transparent focus:outline-none"
        />
        <p className="text-sm text-gray-500">
          {new Date(expense.date).toLocaleDateString()}
        </p>
      </div>
      <div className="flex space-x-2 ml-2">
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
          onClick={handleSaveExpense}>
          Save
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          onClick={handleDeleteExpense}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default ExpenseCard;
