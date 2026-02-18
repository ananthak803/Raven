import React, { useState } from "react";
import { MdGifBox, MdAttachment, MdSend } from "react-icons/md";
import { BsEmojiGrin } from "react-icons/bs";
import EmojiPicker from "./EmojiPicker";
import { useDmStore } from "../../store/useDmStore";
// import socket from "../../socket/socket";
import { socket } from "../../socket";

const InputBar = () => {
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const activeDm = useDmStore((state) => state.activeDm);

  const handleSend = () => {
  if (!content.trim()) return;

  socket.emit("send_message", {
    channelId: activeDm.channelId,
    content,
    attachment: null,
  });

  setContent("");
};


  return (
    <div
      className="h-[70%] w-[90%] rounded-xl 
      bg-[#1a1a1a]/90 backdrop-blur-md
      border border-white/10
      flex items-center px-4 justify-between
      shadow-[0_0_20px_rgba(0,0,0,0.4)]"
    >
      <input
        type="text"
        placeholder="Message..."
        className="flex-1 bg-transparent outline-none 
        text-white placeholder-gray-400
        text-sm tracking-wide"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
      />

      <div className="ml-4 flex items-center gap-4 text-gray-400">
        <MdAttachment
          size={22}
          className="hover:text-white cursor-pointer transition"
        />

        <BsEmojiGrin
          size={20}
          onClick={() => setShowEmoji((prev) => !prev)}
          className="hover:text-white cursor-pointer transition"
        />

        {showEmoji && (
          <EmojiPicker
            onSelect={(emoji) => {
              setContent((prev) => prev + emoji);
              setShowEmoji(false);
            }}
          />
        )}

        <MdGifBox
          size={24}
          className="hover:text-white cursor-pointer transition"
        />

        {/* Send Button */}
        <MdSend
          size={22}
          onClick={handleSend}
          className="hover:text-white cursor-pointer transition text-blue-400"
        />
      </div>
    </div>
  );
};

export default InputBar;
