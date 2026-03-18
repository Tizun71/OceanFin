import { Action, Module } from "@/types/defi";

export const createDefiNode = ({
  module,
  action,
  index,
  onDelete,
}: {
  module: Module;
  action: Action;
  index: number;
  onDelete: (id: string) => void;
}) => {
  const id = crypto.randomUUID();

  return {
    id,
    type: "defiNode",
    position: {
      x: 250,
      y: index * 180 + 80,
    },
    data: {
      id,
      module,
      action,
      onDelete,
      isLastNode: true,
    },
  };
};

export const createDefiEdge = (sourceId: string, targetId: string) => ({
  id: `${sourceId}-${targetId}`,
  source: sourceId,
  target: targetId,
  sourceHandle: "bottom",
  targetHandle: "top",
  type: "smoothstep",
  animated: true,
  style: {
    stroke: "#6366f1",
    strokeWidth: 2,
  },
});

export const markLastNode = (nodes: any[]) =>
  nodes.map((node, index) => ({
    ...node,
    data: {
      ...node.data,
      isLastNode: index === nodes.length - 1,
    },
  }));