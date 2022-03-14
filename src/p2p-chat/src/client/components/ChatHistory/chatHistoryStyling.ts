import styled from "styled-components";

export const ChatHistoryContainer = styled.div`
  height: 70vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
  overflow: auto;
`;

//Used as a wrapper to render bottom of list without
//reversing orientation of content
export const ChatHistoryWrapper = styled.div``;
