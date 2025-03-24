import React from "react";
import styled from "styled-components";

const StyledInput = styled.input`
  display: flex;
  width: 18.48rem;
  height: 3rem;
  border-radius: 0.25rem;
  border: 1px solid #f2f2f2;
  background: #f2f2f2;
  padding: 0.5rem;
  font-size: 1rem;
`;

const Input = ({ id = "mejl", label = "Mejl:", placeholder = "Mejl..." }) => {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <StyledInput type="text" id={id} placeholder={placeholder} />
    </div>
  );
};

export default Input;
