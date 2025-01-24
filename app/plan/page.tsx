'use client'
import dynamic from "next/dynamic";

const ExcalidrawWrapper = dynamic(
  async () => (await import("./excalidrawWrapper")).default,
);

export default function Page() {
  return (
    <ExcalidrawWrapper />
  );
}