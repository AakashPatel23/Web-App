import React, { useState, useEffect } from "react";

const Modal = ({ title, fields, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const initialData = {};
    fields.forEach((field) => {
      initialData[field.name] = field.defaultValue || "";
    });
    setFormData(initialData);
  }, [fields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-pink-50 text-purple-900 p-6 rounded shadow-lg w-80">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
              </label>
              <input
                type={field.type || "text"}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
                placeholder={field.placeholder || ""}
                className="w-full border rounded px-2 py-1 text-black"
              />
            </div>
          ))}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-white px-3 py-1 rounded">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
