import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDmStore } from "../../store/useDmStore";
import { optimizeAvatar } from "../../utils/optimizeAvatar";
import { decryptText, decryptFileBase64 } from "../../utils/cryptoHelper";
import axios from "axios";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdAttachment } from "react-icons/md";
import { IoClose } from "react-icons/io5";

// Sleek component to asynchronously fetch, decrypt and render secure Cloudinary attachments
const DecryptedAttachment = ({ attachmentUrl, channelId }) => {
  const [decryptedData, setDecryptedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadAttachment = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Fetch encrypted file payload from Cloudinary secure storage
        const res = await axios.get(attachmentUrl);
        const encryptedText = res.data;

        if (!active) return;

        // Decrypt the file base64 data URL
        const decrypted = decryptFileBase64(encryptedText, channelId);
        if (decrypted) {
          setDecryptedData(decrypted);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to load or decrypt secure attachment:", err);
        setError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (attachmentUrl && channelId) {
      loadAttachment();
    }

    return () => {
      active = false;
    };
  }, [attachmentUrl, channelId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/30 w-64 animate-pulse mt-2">
        <AiOutlineLoading3Quarters className="animate-spin text-zinc-500 text-xs" />
        <span className="text-[11px] text-zinc-400">Decrypting attachment...</span>
      </div>
    );
  }

  if (error || !decryptedData) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-950/20 text-red-400/80 rounded-xl border border-red-900/30 w-64 mt-2">
        <span className="text-xs">Failed to decrypt attachment</span>
      </div>
    );
  }

  // Determine standard file mime categories from base64 header
  const isImage = decryptedData.startsWith("data:image/");
  const isVideo = decryptedData.startsWith("data:video/");

  if (isImage) {
    return (
      <>
        <img
          src={decryptedData}
          alt="Secure Attachment"
          className="max-h-72 object-cover rounded-xl w-full cursor-pointer hover:scale-[1.01] transition-transform duration-300 mt-1 border border-white/[0.08] shadow-sm"
          onClick={() => setIsPreviewOpen(true)}
        />

        {isPreviewOpen && createPortal(
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 animate-in fade-in duration-200 cursor-zoom-out"
            onClick={() => setIsPreviewOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition active:scale-95 z-[10000] border border-white/10 cursor-pointer"
            >
              <IoClose size={26} />
            </button>
            
            {/* Main preview image container */}
            <div 
              className="max-w-[95vw] max-h-[95vh] relative flex items-center justify-center animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={decryptedData}
                alt="Preview"
                className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl border border-white/10 cursor-default select-none"
              />
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  if (isVideo) {
    return (
      <video
        src={decryptedData}
        controls
        className="max-h-72 w-full object-cover rounded-xl mt-1"
      />
    );
  }

  const fileExt = decryptedData.split(";")[0].split("/")[1] || "file";

  return (
  <div className="mt-2 flex items-center justify-between gap-2 p-2 bg-zinc-800/60 rounded-lg border border-zinc-700/40 hover:bg-zinc-800 transition w-fit">
    
    <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-md">
      <MdAttachment size={18} />
    </div>

    <a
      href={decryptedData}
      download={`secure_file.${fileExt}`}
      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-[11px] font-medium transition active:scale-95 shadow-sm"
    >
      Download
    </a>

  </div>
);
};

const formatMessageTime = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    const isToday = date.toDateString() === now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return `Today at ${time}`;
    if (isYesterday) return `Yesterday at ${time}`;
    
    return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${time}`;
  } catch (err) {
    return "";
  }
};

const Message = ({ message }) => {
  const currentUser = useDmStore((state) => state.currentUser);
  const activeDm = useDmStore((state) => state.activeDm);
  
  const isOwnMessage = currentUser?._id === message.sender._id;

  // Decrypt content using the active channelId as the secret key
  const decryptedText = decryptText(message.content, activeDm?.channelId);

  const hasAttachment = !!message.attachment;
  const isOnlyAttachment = hasAttachment && !decryptedText;

  // Render transparent background and zero padding for pure attachments to let them be clean/flush
  const bubbleStyle = isOnlyAttachment
    ? "bg-transparent border-none shadow-none p-0"
    : isOwnMessage
      ? "bg-zinc-800/80 px-4 py-3 border border-white/[0.04] shadow-lg shadow-black/10 backdrop-blur-md"
      : "bg-white/[0.03] backdrop-blur-md border border-white/[0.05] px-4 py-3 shadow-lg shadow-black/5";

  return (
    <div className={`flex gap-3 rounded-[1.25rem] w-fit max-w-[85%] ${bubbleStyle} ${
      isOwnMessage 
        ? "ml-auto flex-row-reverse" 
        : "mr-auto"
    } transition-all duration-300 hover:scale-[1.01]`}>
      
      {/* Premium squircle avatar with border ring */}
      <div className="relative flex-shrink-0 group self-start mt-0.5">
        <img
          src={optimizeAvatar(message.sender.avatarUrl)}
          alt="avatar"
          className="w-10 h-10 rounded-xl object-cover border border-white/10 group-hover:border-indigo-500/30 transition-all duration-300 shadow-md"
        />
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none -z-10" />
      </div>

      <div className="flex flex-col">
        {/* Dynamic header with username and premium time format */}
        <div className={`flex items-center gap-2.5 px-1 pt-0.5 pb-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
          <span className={`font-bold text-xs tracking-wide transition-colors ${
            isOwnMessage 
              ? 'text-indigo-300 hover:text-indigo-200' 
              : 'text-zinc-200 hover:text-white'
          }`}>
            {message.sender.username}
          </span>

          {isOwnMessage && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-extrabold tracking-wider scale-90 select-none uppercase">
              You
            </span>
          )}

          <span className="text-[10px] tracking-wide text-zinc-500 font-medium whitespace-nowrap">
            {formatMessageTime(message.createdAt)}
          </span>
        </div>

        {decryptedText && (
          <p className={`text-sm px-1 pb-1 mt-0.5 leading-relaxed break-words ${isOwnMessage ? 'text-white' : 'text-zinc-300'} ${isOwnMessage ? 'text-right' : 'text-left'} max-w-[280px] sm:max-w-[450px]`}>
            {decryptedText}
          </p>
        )}

        {message.attachment && activeDm?.channelId && (
          <DecryptedAttachment
            attachmentUrl={message.attachment}
            channelId={activeDm.channelId}
          />
        )}
      </div>
    </div>
  );
};

export default Message;
