import React from "react";

const Message = ({ message }) => {
  return (
    <div className="flex gap-3 px-4 py-2 hover:bg-zinc-900 transition-colors duration-200">
      <img
        src={message.sender.avatarUrl}
        alt="avatar"
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex flex-col max-w-[70%]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white text-sm">
            {message.sender.username}
          </span>

          <span className="text-xs text-gray-400">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {message.content && (
          <p className="text-gray-300 text-sm mt-1 break-words">
            {message.content}
          </p>
        )}

        {message.attachment && (
          <div className="mt-2">
            <img
              src={message.attachment}
              alt="attachment"
              className="rounded-lg max-h-72 object-cover border border-zinc-700 hover:scale-105 transition-transform duration-200 cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
