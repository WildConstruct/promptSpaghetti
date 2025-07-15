import React, { useState, useEffect, useMemo } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { getRandomVariation, hasVariations } from "../../utils/nodeDataUtils";

export interface PreviewSectionProps {
  node: any;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({ node }) => {
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [numExamples, setNumExamples] = useState(3);
  const [seed, setSeed] = useState(12345);
  const [examples, setExamples] = useState<string[]>([]);

  // Generate preview examples based on node type and data
  const generateExamples = useMemo(() => {
    if (!node || !node.data) return [];

    const { type, data } = node;
    const results: string[] = [];

    // Check if node has variations and use them
    const nodeHasVariations = hasVariations(data);
    
    // Generate multiple examples using variations or default logic
    for (let i = 0; i < numExamples; i++) {
      const currentSeed = seed + i;
      let example = "";

      if (nodeHasVariations) {
        // Use variations if available
        example = getRandomVariation(data, currentSeed);
      } else {
        // Fallback to type-specific generation
        switch (type) {
          case "WeightedChoice":
            const options = data.options || [];
            if (options.length > 0) {
              const randomIndex = Math.floor((currentSeed % options.length));
              example = options[randomIndex];
            } else {
              example = "No options defined";
            }
            break;

          case "Concat":
            const delimiter = data.delimiter || ", ";
            example = `[Child 1]${delimiter}[Child 2]${delimiter}[Child 3]`;
            break;

          case "Output":
            const prompt = data.prompt || "No prompt defined";
            example = prompt;
            break;

          case "Include":
            const ref = data.ref || "No reference defined";
            example = `[Included: ${ref}]`;
            break;

          case "SetVariable":
            const varName = data.name || "unnamed";
            const varValue = data.value || "undefined";
            example = `${varName} = ${varValue}`;
            break;

          case "GetVariable":
            const getName = data.name || "unnamed";
            example = `${getName} = [current value]`;
            break;

          case "Subject":
            const subjects = data.subjects || [];
            if (subjects.length > 0) {
              const randomIndex = Math.floor((currentSeed % subjects.length));
              example = subjects[randomIndex];
            } else {
              example = "No subjects defined";
            }
            break;

          case "Connector":
            const connectors = data.connectors || [];
            if (connectors.length > 0) {
              const randomIndex = Math.floor((currentSeed % connectors.length));
              example = connectors[randomIndex];
            } else {
              example = "No connectors defined";
            }
            break;

          case "Attribute":
            const attributes = data.attributes || [];
            if (attributes.length > 0) {
              const randomIndex = Math.floor((currentSeed % attributes.length));
              example = attributes[randomIndex];
            } else {
              example = "No attributes defined";
            }
            break;

          case "Action":
            const actions = data.actions || [];
            if (actions.length > 0) {
              const randomIndex = Math.floor((currentSeed % actions.length));
              example = actions[randomIndex];
            } else {
              example = "No actions defined";
            }
            break;

          default:
            example = `Preview for ${type} not implemented`;
        }
      }

      results.push(example);
    }

    return results;
  }, [node, numExamples, seed]);

  useEffect(() => {
    setExamples(generateExamples);
  }, [generateExamples]);

  const refreshExamples = () => {
    setSeed(Math.floor(Math.random() * 100000));
  };

  return (
    <CollapsibleSection
      title="Preview"
      collapsed={previewCollapsed}
      onToggle={() => setPreviewCollapsed(!previewCollapsed)}
    >
      <div style={{ padding: "16px 20px 8px" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 12, 
            marginBottom: 12 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label 
                htmlFor="num-examples" 
                style={{ 
                  fontSize: 12, 
                  fontWeight: 600, 
                  color: "#666" 
                }}
              >
                Examples:
              </label>
              <input
                id="num-examples"
                type="number"
                min="1"
                max="10"
                value={numExamples}
                onChange={(e) => setNumExamples(Number(e.target.value))}
                style={{
                  width: 60,
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              />
            </div>
            <button
              onClick={refreshExamples}
              style={{
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                padding: "4px 8px",
                fontSize: 12,
                cursor: "pointer",
                color: "#374151",
              }}
              title="Refresh examples"
            >
              ↻
            </button>
          </div>
        </div>

        <div style={{ 
          background: "#fff", 
          border: "1px solid #e5e7eb", 
          borderRadius: 6,
          minHeight: 100,
        }}>
          {examples.length > 0 ? (
            <div style={{ padding: 12 }}>
              {examples.map((example, index) => (
                <div
                  key={index}
                  style={{
                    padding: "8px 12px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: 4,
                    marginBottom: index < examples.length - 1 ? 8 : 0,
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: "#374151",
                  }}
                >
                  {example}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: 20,
              textAlign: "center",
              color: "#9ca3af",
              fontStyle: "italic",
              fontSize: 13,
            }}>
              No preview available
            </div>
          )}
        </div>

        <div style={{ 
          marginTop: 12, 
          fontSize: 11, 
          color: "#6b7280",
          fontStyle: "italic" 
        }}>
          Preview shows example outputs for this node type
        </div>
      </div>
    </CollapsibleSection>
  );
};