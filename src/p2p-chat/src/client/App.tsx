import { GlobalStyle } from "./styles/GlobalStyle";

import { MainContainer } from "./components/MainContainer/mainContainer";
import React from "react";

export function App() {
  return (
    <>
      <GlobalStyle />
      <MainContainer />
    </>
  );
}
