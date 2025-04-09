import React from "react";

const Input = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}) => {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
};

export default Input;
