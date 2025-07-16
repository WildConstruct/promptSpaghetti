import React, { useState } from "react";

export interface SimpleVariationListProps {
  variations: string[];
  onChange: (variations: string[]) => void;
  placeholder?: string;
  addButtonText?: string;
  emptyMessage?: string;
}

export const SimpleVariationList: React.FC<SimpleVariationListProps> = ({
  variations,
  onChange,
  placeholder = "Add item...",
  addButtonText = "Add",
  emptyMessage = "No items defined.",
}) => {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    if (newItem.trim()) {
      onChange([...variations, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemove = (index: number) => {
    onChange(variations.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, value: string) => {
    const updated = [...variations];
    updated[index] = value;
    onChange(updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div style={{ marginBottom: 12 }}>
      {variations.length === 0 ? (
        <div style={{
          padding: 12,
          background: "#2d3748",
          border: "1px dashed #4a5568",
          borderRadius: 4,
          textAlign: "center",
          color: "#a0aec0",
          fontSize: 12,
          fontStyle: "italic",
          marginBottom: 8,
        }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{
          background: "#2d3748",
          border: "1px solid #4a5568",
          borderRadius: 4,
          padding: 8,
          marginBottom: 8,
        }}>
          {variations.map((variation, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: index < variations.length - 1 ? 8 : 0,
              }}
            >
              <input
                type="text"
                value={variation}
                onChange={(e) => handleUpdate(index, e.target.value)}
                style={{
                  flex: 1,
                  padding: 6,
                  border: "1px solid #4a5568",
                  borderRadius: 2,
                  background: "#1a202c",
                  color: "#e2e8f0",
                  fontSize: 12,
                }}
              />
              <button
                onClick={() => handleRemove(index)}
                style={{
                  padding: "4px 6px",
                  background: "#e53e3e",
                  border: "none",
                  borderRadius: 2,
                  color: "white",
                  cursor: "pointer",
                  fontSize: 10,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: 6,
            border: "1px solid #4a5568",
            borderRadius: 4,
            background: "#2d3748",
            color: "#e2e8f0",
            fontSize: 12,
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!newItem.trim()}
          style={{
            padding: "6px 12px",
            background: newItem.trim() ? "#4299e1" : "#4a5568",
            border: "none",
            borderRadius: 4,
            color: "white",
            cursor: newItem.trim() ? "pointer" : "not-allowed",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {addButtonText}
        </button>
      </div>
    </div>
  );
};