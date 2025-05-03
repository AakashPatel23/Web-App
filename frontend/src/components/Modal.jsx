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
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      {/* BACKDROP LAYER: blur only */}
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* OVERLAY LAYER: semi-transparent */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* MODAL CONTENT */}
      <div className="relative bg-[#ffe6f0] text-purple-800 p-6 rounded-lg shadow-lg w-80 border-2 border-pink-200 z-10">
        <h2 className="text-lg font-bold mb-4 text-pink-600">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1 text-purple-700">
                {field.label}
              </label>
              <input
                type={field.type || "text"}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
                placeholder={field.placeholder || ""}
                className="w-full border border-purple-300 rounded px-2 py-1 text-black focus:outline-pink-300"
              />
            </div>
          ))}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-pink-200 hover:bg-pink-300 text-purple-800 px-3 py-1 rounded">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-purple-300 hover:bg-purple-400 text-white px-3 py-1 rounded">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
