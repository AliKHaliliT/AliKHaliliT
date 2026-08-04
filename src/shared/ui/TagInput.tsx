import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

/** A chip field: type to add a tag, backspace or click to remove one. */
export const TagInput = ({
  tags,
  onChange,
  placeholder = "Add tag...",
}: TagInputProps) => {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      onChange([...tags, input.trim()]);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 bg-well border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-signal/50 text-ink placeholder-gray-400"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 bg-surface border border-line text-muted rounded-lg hover:bg-line transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-ctl border border-line-strong px-2 py-[3px] font-mono text-[10.5px] uppercase tracking-[0.09em] text-muted"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="hover:text-signal ml-1 cursor-pointer"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
