import React from "react";
import styled from "styled-components";

const StyledButton = styled.button`
  background-color: ${props => props.variant === "secondary" ? "white" : "var(--Primary-Navy)"};
  color: ${props => props.variant === "secondary" ? "var(--Primary-Navy)" : "white"};
  font-family: var(--Font-Inter);
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 62.4375rem;
  border: ${props => props.variant === "secondary" ? "1px solid var(--Primary-Navy)" : "none"};
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  
  /* Focus styles for keyboard navigation - improved accessibility */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 26, 82, 0.4);
  }
  
  /* Hover styles */
  &:hover:not(:disabled) {
    background-color: ${props => props.variant === "secondary" ? "rgba(0, 26, 82, 0.05)" : "#001440"};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  /* Active styles */
  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: none;
  }
  
  /* Disabled styles */
  &:disabled {
    background-color: ${props => props.variant === "secondary" ? "#f5f5f5" : "#cccccc"};
    color: ${props => props.variant === "secondary" ? "#999999" : "#f5f5f5"};
    cursor: not-allowed;
    border-color: ${props => props.variant === "secondary" ? "#cccccc" : "transparent"};
  }
  
  /* Loading spinner styles */
  &[aria-busy="true"]::after {
    content: "";
    position: absolute;
    right: 10px;
    width: 1rem;
    height: 1rem;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Wrapper div to provide consistent spacing
const ButtonWrapper = styled.div`
  margin: ${props => props.noMargin ? "0" : "0.5rem 0"};
  display: ${props => props.fullWidth ? "block" : "inline-block"};
  width: ${props => props.fullWidth ? "100%" : "auto"};
`;

const Button = ({ 
  type = "button", 
  text, 
  onClick, 
  disabled = false,
  variant = "primary", // "primary" or "secondary"
  icon = null, // Can accept a React component
  iconPosition = "start", // "start" or "end"
  fullWidth = false,
  noMargin = false, 
  className,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  "aria-busy": ariaBusy = "false",
  ...rest
}) => {
  return (
    <ButtonWrapper fullWidth={fullWidth} noMargin={noMargin} className={className}>
      <StyledButton
        type={type}
        onClick={onClick}
        disabled={disabled}
        variant={variant}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-busy={ariaBusy}
        {...rest}
      >
        {icon && iconPosition === "start" && icon}
        {text}
        {icon && iconPosition === "end" && icon}
      </StyledButton>
    </ButtonWrapper>
  );
};

export default Button;