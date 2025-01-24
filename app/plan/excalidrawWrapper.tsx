'use client'
import React from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import "./common.scss";

const ExcalidrawWrapper = () => {
  return (
    <div style={{height:"500px", width:"500px"}}>
      <Excalidraw />
    </div>
  );
};

export default ExcalidrawWrapper;