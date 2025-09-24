import React, { useState, useEffect } from "react";
import './index.css';

const UserForm = ({ user, onAddOrEditUser, onCancel }) => {
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    department: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        department: user.department || "",
      });
    } else {
      setFormData({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        department: "",
      });
    }
    setErrors({});
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }
    
    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }
    
    if (!user && (!formData.id || formData.id <= 0)) {
      newErrors.id = "Valid ID is required for new users";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onAddOrEditUser(formData);
    
    if (!user) {
      setFormData({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        department: "",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      department: "",
    });
    setErrors({});
    if (onCancel) onCancel();
  };

  return (
    <div className="user-form-container">
      <form onSubmit={handleSubmit} className="user-form">
        <h3>{user ? "Edit User" : "Add User"}</h3>
        
        <div className="form-group">
          <label>ID:</label>
          <input
            type="number"
            name="id"
            value={formData.id}
            onChange={handleChange}
            disabled={!!user}
            min="1"
          />
          {errors.id && <span className="error-text">{errors.id}</span>}
        </div>

        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Department:</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
          />
          {errors.department && <span className="error-text">{errors.department}</span>}
        </div>

        <div className="form-buttons">
          <button type="submit" className="submit-btn">
            {user ? "Update" : "Add"} User
          </button>
          {user && (
            <button type="button" onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserForm;