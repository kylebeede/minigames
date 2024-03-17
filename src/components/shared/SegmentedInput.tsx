import { useCallback, useEffect, useState, useRef } from "react";
import { Input, InputRef } from "antd";

interface RefMapping {
  [key: number]: InputRef | null;
}
interface SegmentedInputProps {
  length: number;
  onChange: (value: string) => void;
}
function SegmentedInput({ length, onChange }: SegmentedInputProps) {
  const [value, setValue] = useState(Array.from({ length }, () => ""));
  const [focusIndex, setFocusIndex] = useState(0);
  const refs = useRef<RefMapping>({});

  const handlePaste = async () => {};

  const handleType = (input: string, index: number) => {
    // check if there is no value but there previously was a value
    const hasDeleted = !input && value[index] !== "";
    // map through the current code and alter the current value that's been edited
    const currentCode = value.map((curr, i) => {
      if (i === index) {
        return input;
      }
      return curr;
    });

    // if we haven't deleted, and we aren't on the last input, then move onto the next ref
    if (!hasDeleted && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
    // set local state (array) code
    setValue(currentCode);

    // set the parent components state. As this expects a string, we can just use .join('')
    onChange(currentCode.join(""));
  };

  const handleChange = async (value: string, index: number) => {
    if (value.length > 1) {
      await handlePaste();
      return;
    }
    handleType(value, index);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Backspace" && focusIndex !== 0 && !value[focusIndex]) {
        refs.current[focusIndex - 1]?.focus();
      }
    },
    [focusIndex, value]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return Array.from({ length }, (_, i) => i).map((_, i) => {
    return (
      <Input
        key={_}
        ref={(el) => (refs.current[i] = el)}
        value={value[i]}
        maxLength={1}
        onFocus={() => setFocusIndex(i)}
        onChange={(value) => handleChange(value.target.value, i)}
        style={{
          // total width - horizontalPadding at either side of screen - horizontalPadding / 2 multiplied by number of inputs
          // this will give us evenly spaced inputs that have 20 pixels at either side
          width: "35px",
          // check focus
        }}
      />
    );
  });
}

export default SegmentedInput;
