"use client";
import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";

import "./common.scss";

const ExcalidrawWrapper: React.FC = () => {
  console.info(convertToExcalidrawElements([{
    type: "rectangle",
    id: "rect-1",
    width: 186.47265625,
    height: 141.9765625,
    x: 0,
    y: 0,
  },]));
  return (
    <div style={{height:"500px", width:"500px"}}>
      <Excalidraw />
    </div>
  );
};
export default ExcalidrawWrapper;