import React from "react";

const Input = ({ id = "mejl", label = "Mejl", placeholder = "Mejl..." }) => {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input type="text" id={id} placeholder={placeholder} />
    </div>
  );
};

export default Input;
