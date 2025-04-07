import React from "react";

const Button = ({ type = "submit", text = "Företag", onClick }) => {
  return (
    <div>
      <button type={type} onClick={onClick}>
        {text}
      </button>
    </div>
  );
};

export default Button;
