import React from "react";
import emojiData from "unicode-emoji-json";

const EmojiPicker = ({ onSelect }) => {
  const emojis = Object.keys(emojiData);

  return (
    <div
      className="absolute bottom-14 right-0 z-50
      w-80 bg-[#1a1a1a] rounded-xl
      border border-white/10 shadow-xl"
    >
      <div className="grid grid-cols-8 gap-2 p-3 max-h-64 overflow-y-auto">
        {emojis.map((emoji, i) => (
          <button
            key={i}
            onClick={() => onSelect(emoji)}
            className="text-xl hover:scale-125 transition"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
