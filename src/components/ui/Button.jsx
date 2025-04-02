import React from "react";

const Button = ({ type = "submit", text = "Företag" }) => {
  return (
    <div>
      <button type={type}>{text}</button>
    </div>
  );
};

export default Button;
