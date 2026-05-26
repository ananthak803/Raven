import React, { useState, useRef, useEffect } from "react";
import { MdAttachment, MdSend } from "react-icons/md";
import { BsEmojiGrin } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import EmojiPicker from "./EmojiPicker";
import { useDmStore } from "../../store/useDmStore";
import { socket } from "../../socket";
import axios from "axios";
import { encryptText, fileToBase64, encryptFileBase64 } from "../../utils/cryptoHelper";

const InputBar = () => {
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const emojiContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiContainerRef.current && !emojiContainerRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };

    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmoji]);

  const activeDm = useDmStore((state) => state.activeDm);
  const url = import.meta.env.VITE_BACKEND_URL;

  const handleSend = async () => {
    if (isUploading || !activeDm?.channelId) return;

    // Case 1: File is selected
    if (selectedFile) {
      try {
        setIsUploading(true);

        // 1. Convert selected file to base64
        const base64Str = await fileToBase64(selectedFile);

        // 2. Encrypt the file base64 data URL client-side
        const encryptedFile = encryptFileBase64(base64Str, activeDm.channelId);

        // 3. Package encrypted cipher text into a raw text blob
        const blob = new Blob([encryptedFile], { type: "text/plain" });

        // 4. Set up Cloudinary signature-free preset parameters
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const formData = new FormData();
        formData.append("file", blob, `${selectedFile.name}.enc`);
        formData.append("upload_preset", "raven_data");

        // 5. Upload to Cloudinary auto-raw destination
        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          formData
        );

        const secure_url = uploadRes.data.secure_url;

        // 6. Encrypt caption text. If caption is empty, encrypt an empty string
        const textPayload = content.trim() ? content.trim() : "";
        const encryptedText = encryptText(textPayload, activeDm.channelId);

        // 7. Emit secure socket payload
        socket.emit("send_message", {
          channelId: activeDm.channelId,
          content: encryptedText,
          attachment: secure_url,
        });

        // 8. Clean state and revoke preview URL to clear memory
        setContent("");
        setSelectedFile(null);
        if (filePreview) {
          URL.revokeObjectURL(filePreview);
          setFilePreview(null);
        }

      } catch (error) {
        console.error("Failed to encrypt or upload selected file:", error);
        alert("Failed to encrypt and send file. Please verify your Cloudinary setup and try again.");
      } finally {
        setIsUploading(false);
      }
    } 
    // Case 2: Standard text message (no file queued)
    else {
      if (!content.trim()) return;

      const encryptedContent = encryptText(content.trim(), activeDm.channelId);

      socket.emit("send_message", {
        channelId: activeDm.channelId,
        content: encryptedContent,
        attachment: null,
      });

      setContent("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 20MB file limit
    if (file.size > 20 * 1024 * 1024) {
      alert("File is too large! Maximum limit is 20MB.");
      return;
    }

    setSelectedFile(file);
    
    // Revoke previous object URL if any to avoid memory leak
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    
    setFilePreview(URL.createObjectURL(file));
  };

  const handleDiscardFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Queued Attachment Preview Container */}
      {selectedFile && (
        <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-white/[0.05] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/[0.05]">
            {filePreview && selectedFile.type.startsWith("image/") ? (
              <img
                src={filePreview}
                alt="Upload Preview"
                className="w-12 h-12 rounded-lg object-cover border border-white/10"
              />
            ) : filePreview && selectedFile.type.startsWith("video/") ? (
              <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/10 text-indigo-400 overflow-hidden">
                <video src={filePreview} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/10 text-indigo-400">
                <MdAttachment size={20} />
              </div>
            )}
            <div className="flex flex-col max-w-[200px] sm:max-w-[400px]">
              <span className="text-xs font-semibold text-zinc-100 truncate">{selectedFile.name}</span>
              <span className="text-[10px] text-zinc-500 uppercase font-bold">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
          
          <button
            onClick={handleDiscardFile}
            disabled={isUploading}
            className="p-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white rounded-lg transition active:scale-95 border border-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoClose size={18} />
          </button>
        </div>
      )}

      {/* Input Controls Row */}
      <div
        className="rounded-2xl 
        flex items-center px-4 justify-between relative
        "
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <input
          type="text"
          placeholder={
            isUploading 
              ? "Encrypting and uploading attachment..." 
              : selectedFile 
                ? "Add a caption..." 
                : "Message..."
          }
          disabled={isUploading}
          className="flex-1 bg-transparent px-2 py-3 outline-none 
          text-zinc-100 placeholder-zinc-500/80
          text-[15px] font-medium tracking-wide disabled:opacity-50"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <div className="ml-4 flex items-center gap-3 pr-2 text-zinc-500">
          {isUploading ? (
            <AiOutlineLoading3Quarters
              size={20}
              className="animate-spin text-indigo-400"
            />
          ) : (
            <MdAttachment
              size={22}
              onClick={() => fileInputRef.current?.click()}
              className="hover:text-white cursor-pointer transition active:scale-95 text-zinc-400"
            />
          )}

          <div ref={emojiContainerRef} className="relative flex items-center">
            <BsEmojiGrin
              size={20}
              onClick={() => !isUploading && setShowEmoji((prev) => !prev)}
              className={`hover:text-zinc-300 cursor-pointer transition active:scale-95 ${
                isUploading ? "opacity-30 cursor-not-allowed" : "text-zinc-400"
              }`}
            />

            {showEmoji && !isUploading && (
              <EmojiPicker
                onSelect={(emoji) => {
                  setContent((prev) => prev + emoji);
                  setShowEmoji(false);
                }}
              />
            )}
          </div>

          <MdSend
            size={22}
            onClick={handleSend}
            className={`hover:text-white cursor-pointer transition active:scale-95 ${
              isUploading ? "opacity-30 cursor-not-allowed" : "text-zinc-400"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default InputBar;
