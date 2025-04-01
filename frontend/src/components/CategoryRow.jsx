import React, { useState } from "react";

const CategoryRow = ({ category, index, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategory, setEditedCategory] = useState(category);

  // Save edited category
  const handleSave = () => {
    onEdit(category._id, editedCategory.name);
    setIsEditing(false);
  };


    const handleChange = (e) => {
      setEditedCategory({ ...editedCategory, name: e.target.value });
    };

  return (
    <tr>
      <td style={{ padding: "10px", border: "1px solid black" }}>
        {isEditing ? (
          <input
            type="text"
            value={editedCategory.name}
            onChange={handleChange}
          />
        ) : (
          <tr>
            <td>{category.name}</td> {/* Render the name of the category */}
            <td>{category.description}</td>{" "}
          </tr>
        )}
      </td>
      <td style={{ padding: "10px", border: "1px solid black" }}>
        <button
          onClick={() => alert(`Add expense for ${category.name}`)}
          style={{ padding: "5px 10px" }}>
          Add Expense
        </button>
      </td>
      <td style={{ padding: "10px", border: "1px solid black" }}>
        {isEditing ? (
          <button onClick={handleSave} style={{ padding: "5px 10px" }}>
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            style={{ padding: "5px 10px" }}>
            Edit
          </button>
        )}
      </td>
      <td style={{ padding: "10px", border: "1px solid black" }}>
        <button
          onClick={() => onDelete(category._id)}
          style={{
            padding: "5px 10px",
            backgroundColor: "red",
            color: "white",
          }}>
          Delete
        </button>
      </td>
    </tr>
  );
};

export default CategoryRow;
