import React from "react";

const ExpenseCard = ({ expense, onEditExpense, onDeleteExpense }) => {
  return (
    <div className="border rounded p-3 my-2 flex justify-between items-center shadow">
      <div>
        <h4 className="font-bold">{expense.name}</h4>
        <p>{expense.description}</p>
        <p className="text-sm text-gray-500">
          {new Date(expense.date).toLocaleDateString()}
        </p>
        <p className="font-semibold">${expense.amount.toFixed(2)}</p>
      </div>
      <div className="flex space-x-2">
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
          onClick={() => onEditExpense(expense)}>
          Edit
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          onClick={() => onDeleteExpense(expense._id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default ExpenseCard;
