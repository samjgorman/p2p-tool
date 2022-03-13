import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

export const Sidebar = styled.div`
  padding-top: 5%;

  padding-left: 5%;
  flex-direction: column;
  background-color: #f3f3f3;
  padding-right: 10%;
`;

export const SidebarContainer = styled.div`
  position: fixed;
  background-color: #f3f3f3;
  padding-right: 10%;
  height: 100%;
  margin-left: 0px;
`;

export const Main = styled.div`
  padding-top: 5%;
  padding-left: 5%;
  flex-direction: column;
  padding-right: 5%;
`;

export const Text = styled.p`
  margin-top: 24px;
  font-size: 18px;
  font-weight: 800;
`;
