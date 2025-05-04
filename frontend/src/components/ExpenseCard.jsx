import React, { useState } from "react";
import Modal from "./Modal.jsx";
import validator from "validator";

const API_BASE_EXPENSES = "http://localhost:5050/expenses";

const ExpenseCard = ({ expense, refreshData }) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDeleteExpense = () => {
    if (!window.confirm("Delete this expense?")) return;
    fetch(`${API_BASE_EXPENSES}/${expense._id}`, {
      method: "DELETE",
    }).then(() => refreshData());
  };

  const handleSaveExpense = (formData) => {
    const updates = {
      name: validator.trim(formData.name),
      description: formData.description
        ? validator.trim(formData.description)
        : "",
      amount: parseFloat(formData.amount),
      date: formData.date,
    };
    fetch(`${API_BASE_EXPENSES}/${expense._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).then(() => {
      setShowEditModal(false);
      refreshData();
    });
  };

  const formattedDate = new Date(expense.date).toLocaleDateString("en-US");

  return (
    <div className="border rounded p-3 my-2 bg-blue-200 text-purple-800 flex justify-between items-center">
      <div>
        <p className="font-semibold">{expense.name}</p>
        <p className="text-sm text-purple-800">{expense.description}</p>
        <p className="text-sm text-purple-800">
          ${expense.amount.toFixed(2)} | {formattedDate}
        </p>
      </div>
      <div className="flex space-x-2">
        <button
          className="!bg-white text-black px-3 py-1 rounded"
          onClick={() => setShowEditModal(true)}>
          Edit
        </button>
        <button
          className="!bg-white text-black px-3 py-1 rounded"
          onClick={handleDeleteExpense}>
          Delete
        </button>
      </div>

      {showEditModal && (
        <Modal
          title="Edit Expense"
          fields={[
            {
              name: "name",
              label: "Expense Name",
              required: true,
              defaultValue: expense.name,
            },
            {
              name: "description",
              label: "Description",
              defaultValue: expense.description,
            },
            {
              name: "amount",
              label: "Amount",
              type: "text",
              required: true,
              defaultValue: expense.amount.toString(),
            },
            {
              name: "date",
              label: "Date (YYYY-MM-DD)",
              type: "date",
              required: true,
              defaultValue: expense.date.slice(0, 10),
            },
          ]}
          onSubmit={handleSaveExpense}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default ExpenseCard;
