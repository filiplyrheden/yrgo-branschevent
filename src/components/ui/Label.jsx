import React from "react";
import styled from "styled-components";

const StyledLabel = styled.p`
  display: inline-block;
  border-radius: 0.125rem;
  border: 1px solid #4f4f4f;
  color: ${props => props.active ? "#fff" : "#4f4f4f"};
  background-color: ${props => props.active ? "#001a52" : "transparent"};
  font-family: "IBM Plex Mono", monospace;
  font-size: 1rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding: 0.25rem 0.75rem;
  margin: 0;
  transition: all 0.2s ease;
`;

const Label = ({ text, active, onClick }) => {
  return (
    <StyledLabel active={active} onClick={onClick}>
      {text}
    </StyledLabel>
  );
};

export default Label;