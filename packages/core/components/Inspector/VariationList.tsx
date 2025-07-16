import React, { useState, useRef, useEffect } from "react";
import { useGraphStore } from "../../graphStore";

export interface VariationListProps {
  nodeId: string;
  variations: string[];
  onAdd?: (variation: string) => void;
  onRemove?: (index: number) => void;
  onUpdate?: (index: number, newValue: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  maxVariations?: number;
  placeholder?: string;
  allowQuickEntry?: boolean;
}

export const VariationList: React.FC<VariationListProps> = ({
  nodeId,
  variations,
  onAdd,
  onRemove,
  onUpdate,
  onReorder,
  maxVariations = 50,
  placeholder = "Add a variation...",
  allowQuickEntry = true,
}) => {
  const [newVariation, setNewVariation] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [quickEntryMode, setQuickEntryMode] = useState(false);
  const [quickEntryText, setQuickEntryText] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const { addVariation, removeVariation, updateVariation, reorderVariations } = useGraphStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingIndex]);

  const handleAdd = () => {
    if (!newVariation.trim()) return;
    
    if (onAdd) {
      onAdd(newVariation.trim());
    } else {
      addVariation(nodeId, newVariation.trim());
    }
    
    setNewVariation("");
  };

  const handleRemove = (index: number) => {
    if (onRemove) {
      onRemove(index);
    } else {
      removeVariation(nodeId, index);
    }
  };

  const handleUpdate = (index: number, newValue: string) => {
    if (onUpdate) {
      onUpdate(index, newValue);
    } else {
      updateVariation(nodeId, index, newValue);
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (onReorder) {
      onReorder(fromIndex, toIndex);
    } else {
      reorderVariations(nodeId, fromIndex, toIndex);
    }
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(variations[index]);
  };

  const commitEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      handleUpdate(editingIndex, editingValue.trim());
    }
    setEditingIndex(null);
    setEditingValue("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const handleQuickEntry = () => {
    const entries = quickEntryText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    entries.forEach(entry => {
      addVariation(nodeId, entry);
    });
    
    setQuickEntryText("");
    setQuickEntryMode(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      handleReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        marginBottom: 12 
      }}>
        <label style={{ 
          fontSize: 12, 
          fontWeight: 600, 
          color: "#e2e8f0" 
        }}>
          Variations ({variations.length})
        </label>
        {allowQuickEntry && (
          <button
            onClick={() => setQuickEntryMode(!quickEntryMode)}
            style={{
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 11,
              cursor: "pointer",
              color: "#6b7280",
            }}
            title="Quick entry (comma-separated)"
          >
            {quickEntryMode ? "List" : "Quick"}
          </button>
        )}
      </div>

      {quickEntryMode ? (
        <div style={{ marginBottom: 12 }}>
          <textarea
            value={quickEntryText}
            onChange={(e) => setQuickEntryText(e.target.value)}
            placeholder="Enter variations separated by commas..."
            style={{
              width: "100%",
              height: 80,
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
          <div style={{ 
            display: "flex", 
            gap: 8, 
            marginTop: 8 
          }}>
            <button
              onClick={handleQuickEntry}
              disabled={!quickEntryText.trim()}
              style={{
                background: quickEntryText.trim() ? "#3b82f6" : "#9ca3af",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "6px 12px",
                fontSize: 12,
                cursor: quickEntryText.trim() ? "pointer" : "not-allowed",
              }}
            >
              Add All
            </button>
            <button
              onClick={() => {
                setQuickEntryMode(false);
                setQuickEntryText("");
              }}
              style={{
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                padding: "6px 12px",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ 
            display: "flex", 
            gap: 8, 
            marginBottom: 12 
          }}>
            <input
              ref={inputRef}
              type="text"
              value={newVariation}
              onChange={(e) => setNewVariation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder={placeholder}
              disabled={variations.length >= maxVariations}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={handleAdd}
              disabled={!newVariation.trim() || variations.length >= maxVariations}
              style={{
                background: newVariation.trim() && variations.length < maxVariations ? "#3b82f6" : "#9ca3af",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: 14,
                cursor: newVariation.trim() && variations.length < maxVariations ? "pointer" : "not-allowed",
              }}
            >
              Add
            </button>
          </div>
        </>
      )}

      <div style={{ 
        maxHeight: 200, 
        overflowY: "auto",
        border: "1px solid #4a5568",
        borderRadius: 6,
        background: "#2d3748",
      }}>
        {variations.length === 0 ? (
          <div style={{
            padding: 20,
            textAlign: "center",
            color: "#9ca3af",
            fontStyle: "italic",
            fontSize: 13,
          }}>
            No variations yet. Add some above.
          </div>
        ) : (
          variations.map((variation, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                borderBottom: index < variations.length - 1 ? "1px solid #f3f4f6" : "none",
                background: dragOverIndex === index ? "#f0f9ff" : "transparent",
                opacity: draggedIndex === index ? 0.5 : 1,
                cursor: "move",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  marginRight: 8,
                  color: "#9ca3af",
                  cursor: "move",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ⋮⋮
              </div>
              {editingIndex === index ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitEdit();
                    } else if (e.key === 'Escape') {
                      cancelEdit();
                    }
                  }}
                  onBlur={commitEdit}
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    border: "1px solid #3b82f6",
                    borderRadius: 4,
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              ) : (
                <span
                  onClick={() => startEdit(index)}
                  style={{
                    flex: 1,
                    cursor: "pointer",
                    fontSize: 14,
                    color: "#374151",
                  }}
                  title="Click to edit"
                >
                  {variation}
                </span>
              )}
              <button
                onClick={() => handleRemove(index)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: 14,
                  marginLeft: 8,
                  padding: 4,
                }}
                title="Remove variation"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {variations.length >= maxVariations && (
        <div style={{
          marginTop: 8,
          fontSize: 12,
          color: "#ef4444",
          textAlign: "center",
        }}>
          Maximum {maxVariations} variations reached
        </div>
      )}
    </div>
  );
};