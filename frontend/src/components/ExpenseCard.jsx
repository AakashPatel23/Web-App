import React, { useState } from "react";
import validator from "validator";

const API_BASE_EXPENSES = "http://localhost:5050/expenses";

const ExpenseCard = ({ expense, refreshData }) => {
  const [editedName, setEditedName] = useState(expense.name);
  const [editedDesc, setEditedDesc] = useState(expense.description || "");
  const [editedAmount, setEditedAmount] = useState(expense.amount.toString());
  const [editedDate, setEditedDate] = useState(
    expense.date ? expense.date.split("T")[0] : ""
  );

  const handleSaveExpense = () => {
    if (!editedName.trim()) {
      alert("Expense name cannot be empty.");
      return;
    }

    const amountValue = parseFloat(editedAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid positive number for the amount.");
      return;
    }

    if (editedDate && isNaN(Date.parse(editedDate))) {
      alert("Please enter a valid date (YYYY-MM-DD).");
      return;
    }

    if (editedDate) {
      const today = new Date();
      const selectedDate = new Date(editedDate);
      if (selectedDate > today) {
        alert("Date cannot be in the future.");
        return;
      }
    }

    const updates = {};
    if (editedName.trim() !== expense.name)
      updates.name = validator.trim(editedName);
    if (editedDesc.trim() !== expense.description)
      updates.description = validator.trim(editedDesc);
    if (amountValue !== expense.amount) updates.amount = amountValue;
    if (editedDate && editedDate !== expense.date.split("T")[0])
      updates.date = editedDate;

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
    <div className="border rounded p-3 my-2 flex justify-between items-center shadow bg-gray-200 text-black">
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
        <div className="flex items-center">
          <span className="text-sm mr-1">$</span>
          <input
            type="text"
            value={editedAmount}
            onChange={(e) => setEditedAmount(e.target.value)}
            className="w-full text-sm bg-transparent focus:outline-none"
            placeholder="Enter amount (e.g., 12.99)"
          />
        </div>
        <input
          type="date"
          value={editedDate}
          onChange={(e) => setEditedDate(e.target.value)}
          className="w-full text-sm bg-transparent focus:outline-none"
        />
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
