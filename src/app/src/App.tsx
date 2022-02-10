import { GlobalStyle } from './styles/GlobalStyle'

import { Greetings } from './components/Greetings'
import React from 'react'

export function App() {
  return (
    <>
      <GlobalStyle />
      <Greetings />
    </>
  )
}