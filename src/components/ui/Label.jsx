import React from "react";
import styled from "styled-components";

const StyledLabel = styled.p`
  display: inline-block;
  border-radius: 0.125rem;
  border: 1px solid #4f4f4f;
  color: #4f4f4f;
  font-family: "IBM Plex Mono", monospace;
  font-size: 1rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  padding: 0.25rem 0.75rem;
  margin: 0;
`;

const Label = ({ text }) => {
  return <StyledLabel>{text}</StyledLabel>;
};

export default Label;
