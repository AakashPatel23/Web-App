import React, { useState, useEffect } from "react";
import CategoryRow from "./components/CategoryRow.jsx";

const API_BASE_URL_CATEGORIES = "http://localhost:5050/api/categories";
const API_BASE_EXPENSES = "http://localhost:5050/api/expenses";

function App() {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  // Fetch categories when the component mounts
  useEffect(() => {
    fetch(`${API_BASE_URL_CATEGORIES}/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
        } else {
          console.error("Failed to fetch categories:", data.message);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Function to add a category
  const addCategory = () => {
    if (category.trim() === "") return;
    fetch(`${API_BASE_URL_CATEGORIES}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: category }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories([...categories, data.category]); // Update UI
          setCategory("");
        } else {
          console.error("Failed to add category:", data.message);
        }
      })
      .catch((err) => console.error("Error adding category:", err));
  };

  // Function to delete a category
  const deleteCategory = (categoryId) => {
    fetch(`${API_BASE_URL_CATEGORIES}/${categoryId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(categories.filter((cat) => cat._id !== categoryId)); // Remove from UI
          console.log("Category deleted successfully");
        } else {
          console.error("Failed to delete category:", data.message);
        }
      })
      .catch((err) => console.error("Error deleting category:", err));
  };

  // Function to edit a category
  const editCategory = (categoryId, newName) => {
    fetch(`${API_BASE_URL_CATEGORIES}/${categoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(
            categories.map((cat) =>
              cat._id === categoryId ? { ...cat, name: newName } : cat
            )
          );
        } else {
          console.error("Failed to edit category:", data.message);
        }
      })
      .catch((err) => console.error("Error updating category:", err));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
      }}>
      <h2>Category Manager</h2>

      <input
        type="text"
        placeholder="Enter category name"
        value={category.name}
        onChange={(e) => setCategory(e.target.value)}
        style={{ padding: "8px", marginRight: "8px" }}
      />

      <button onClick={addCategory} style={{ padding: "8px 12px" }}>
        Add Category
      </button>

      <table
        style={{
          width: "80%",
          marginTop: "20px",
          borderCollapse: "collapse",
          border: "1px solid black",
          textAlign: "center",
        }}>
        <thead>
          <tr style={{ backgroundColor: "#ddd" }}>
            <th style={{ padding: "10px", border: "1px solid black" }}>
              Category
            </th>
            <th style={{ padding: "10px", border: "1px solid black" }}>
              Add Expense
            </th>
            <th style={{ padding: "10px", border: "1px solid black" }}>Edit</th>
            <th style={{ padding: "10px", border: "1px solid black" }}>
              Delete
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <CategoryRow
              key={category._id}
              category={category}
              onDelete={deleteCategory}
              onEdit={editCategory}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
