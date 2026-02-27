"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateStrategyModal({
  open,
  loading,
  onClose,
  onCreate,
}: Props) {

  const [name, setName] = useState("");

  if (!open) return null;

  const handleSubmit = () => {

    if (!name.trim()) return;

    onCreate(name);

  };

  return (

    <div className="fixed inset-0 z-[100] flex items-center justify-center">

      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* modal */}
      <div
        className="
        relative
        w-[400px]
        bg-[#18182a]
        border border-white/10
        rounded-2xl
        p-6
        shadow-2xl
        "
      >

        <h2 className="text-lg font-semibold text-white mb-4">
         Strategy Name
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter strategy name"
          className="
          w-full
          px-4
          py-3
          rounded-xl
          bg-[#141420]
          border border-white/10
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500
          mb-4
          text-white
          "
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="defi-btn-glass w-full"
        >

          {loading ? "Creating..." : "Create Strategy"}

        </button>

      </div>

    </div>

  );

}