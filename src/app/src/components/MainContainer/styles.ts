import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const Container = styled.div`
  display: flex;
  margin-left: 5%;
  margin-right: 5%;
  margin-top: 5%;
  margin-bottom: 5%;
`;

export const Sidebar = styled.div`
  flex-direction: column;
  background-color: F3F3F3;
  padding-right: 10%;
`;

export const Main = styled.div`
  flex-direction: column;
`;

export const Image = styled.img`
  width: 240px;
  animation: ${rotate} 15s linear infinite;
`;

export const Text = styled.p`
  margin-top: 24px;
  font-size: 18px;
  font-weight: 800;
`;
