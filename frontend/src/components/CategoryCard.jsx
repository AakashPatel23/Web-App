import React, { useState, useEffect } from "react";
import ExpenseCard from "./ExpenseCard.jsx";

const API_BASE_EXPENSES = "http://localhost:5050/expenses";

const CategoryCard = ({
  category,
  onDeleteCategory,
  onEditCategory,
  refreshData,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);

  // Fetch expenses for this category
  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE_EXPENSES}/category/${category._id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setExpenses(data.expenses);
          } else {
            console.error("Failed to fetch expenses:", data.message);
          }
        });
    }
  }, [isOpen, category._id, refreshData]);

  const handleAddExpense = () => {
    const name = prompt("Expense name:");
    const amount = parseFloat(prompt("Amount:"));
    const description = prompt("Description:");

    if (!name || isNaN(amount)) {
      alert("Invalid input");
      return;
    }

    fetch(`${API_BASE_EXPENSES}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        amount,
        category: category._id,
        description,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setIsOpen(true); // keep open and refresh expenses
      });
  };

  const handleEditExpense = (expense) => {
    const newName = prompt("New name:", expense.name);
    const newAmount = parseFloat(prompt("New amount:", expense.amount));
    const newDescription = prompt("New description:", expense.description);

    fetch(`${API_BASE_EXPENSES}/${expense._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        amount: newAmount,
        description: newDescription,
      }),
    }).then(() => {
      setIsOpen(true); // refresh
    });
  };

  const handleDeleteExpense = (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    fetch(`${API_BASE_EXPENSES}/${expenseId}`, { method: "DELETE" }).then(
      () => {
        setIsOpen(true); // refresh
      }
    );
  };

  return (
    <div className="border rounded my-3 shadow">
      <div
        className="flex justify-between items-center p-3 bg-gray-200 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}>
        <div>
          <h3 className="font-bold">{category.name}</h3>
          <p className="text-sm">{category.description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              handleAddExpense();
            }}>
            Add Expense
          </button>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              const newName = prompt("New category name:", category.name);
              const newDesc = prompt("New description:", category.description);
              onEditCategory(category._id, newName, newDesc);
            }}>
            Edit
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
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
