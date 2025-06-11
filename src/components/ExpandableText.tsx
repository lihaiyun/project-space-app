import { useRef, useState, useEffect } from "react";

interface ExpandableTextProps {
  text: string;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  text
}) => {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    }
  }, [text]);

  return (
    <div>
      <p
        ref={textRef}
        className={`text-gray-700 mb-2 whitespace-pre-line transition-all duration-200 ease-in-out ${
          expanded ? "" : `line-clamp-2`
        }`}
      >
        {text}
      </p>
      {isOverflowing && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;
