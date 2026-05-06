import React from 'react';

type Connector = <T>(node: T) => T;

const connect: Connector = node => node;

export function DndProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useDrag() {
  return [{ isDragging: false }, connect, connect] as const;
}

export function useDrop() {
  return [{ isOver: false, canDrop: true }, connect] as const;
}
