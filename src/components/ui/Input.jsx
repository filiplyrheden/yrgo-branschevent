import React from "react";
import styled from "styled-components";

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

const InputLabel = styled.label`
  font-family: var(--Font-Inter);
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--Text-Dark-Grey);
`;

const InputField = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props["aria-invalid"] === "true" ? "#E51236" : "#f2f2f2"};
  border-radius: 4px;
  background-color: var(--Grey);
  font-size: 1rem;
  font-family: var(--Font-Inter);
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--Primary-Navy);
    box-shadow: 0 0 0 2px rgba(0, 26, 82, 0.2);
  }
  
  &::placeholder {
    color: #757575;
  }
  
  &:disabled {
    background-color: #e9e9e9;
    cursor: not-allowed;
  }
  
  &[aria-invalid="true"] {
    border-color: #E51236;
    
    &:focus {
      box-shadow: 0 0 0 2px rgba(229, 18, 54, 0.2);
    }
  }
`;

const RequiredAsterisk = styled.span`
  color: #E51236;
  margin-left: 4px;
`;

const Input = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  onKeyDown,
  onBlur,
  type = "text",
  required = false,
  disabled = false,
  readOnly = false,
  autoComplete,
  className,
  min,
  max,
  step,
  pattern,
  maxLength,
  minLength,
  "aria-describedby": ariaDescribedby,
  "aria-invalid": ariaInvalid = "false",
  ...rest
}) => {
  return (
    <InputContainer className={className}>
      <InputLabel htmlFor={id}>
        {label}
        {required && <RequiredAsterisk aria-hidden="true">*</RequiredAsterisk>}
      </InputLabel>
      <InputField
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={autoComplete}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        maxLength={maxLength}
        minLength={minLength}
        aria-required={required ? "true" : "false"}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        {...rest}
      />
    </InputContainer>
  );
};

export default Input;