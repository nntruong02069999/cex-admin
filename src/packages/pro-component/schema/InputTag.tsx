import { useEffect, useRef, useState } from "react";
import { isEqual } from "lodash";
import { Input, message, Tag } from "antd";
import { useUpdateEffect } from "@src/packages/pro-table/component/util";

type TagInputProps = {
  schema: Record<string, any>;
  disabled?: boolean;
  invalid?: boolean;
  value?: string[];
  onChange?: (val: any) => void;
};
const TagInput = ({ value, onChange, schema }: TagInputProps) => {
  const [tags, setTags] = useState<string[]>(value ?? []);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<Input>(null);

  useEffect(() => {
    if (isEqual(value, tags)) return;
    if (typeof value === "string") value = [];
    setTags(value ?? []);
  }, [value]);

  useUpdateEffect(() => {
    if (onChange && !isEqual(value, tags)) {
      onChange(tags);
    }
  }, [tags]);

  const handleInputChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (tags.indexOf(inputValue) !== -1) {
      message.destroy();
      message.error(`Tag "${inputValue}" đã tồn tại`);
      return;
    }
    if (inputValue && tags.indexOf(inputValue) === -1) {
      setTags([...tags, inputValue]);
      setInputValue("");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && inputValue === "") {
      e.preventDefault();
      const newTags = [...tags];
      let last = newTags.pop();
      setInputValue(last || "");
      setTags(newTags);
    }
  };

  const onTagRemove = (index: any) => {
    setTags((p) => {
      return p.filter((_, i) => i !== index);
    });
    inputRef.current!.focus();
  };

  return (
    <div className={`wrap-input-tag ${isFocused ? "focused" : ""}`}>
      {tags.map((tag, index) => (
        <Tag
          key={tag}
          closable={!schema.disabled}
          onClose={() => onTagRemove(index)}
        >
          {tag}
        </Tag>
      ))}
      <Input
        ref={inputRef}
        className="input-tag"
        value={inputValue}
        onChange={handleInputChange}
        onPressEnter={handleInputConfirm}
        placeholder={schema.placeholder}
        disabled={schema.disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleInputKeyDown}
      />
    </div>
  );
};
export default TagInput;
