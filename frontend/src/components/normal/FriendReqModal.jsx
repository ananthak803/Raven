import React, { useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import axios from "axios";
import { useDmStore } from "../../store/useDmStore";

const FriendReqModal = ({ setView }) => {
  const [username, setUsername] = useState("");
  const [activeTab, setActiveTab] = useState("send");
  const [requests, setRequests] = useState([]);
  const setDms = useDmStore((state) => state.setDms);

  const url = import.meta.env.VITE_BACKEND_URL;
  const fetchDms = async () => {
    try {
      const res = await axios.get(`${url}/channel/dms`, {
        withCredentials: true,
      });

      setDms(res.data);
    } catch (error) {
      console.error("Error fetching DMs:", error);
    }
  };

  const sendFriendReq = async () => {
    if (!username.trim()) {
      alert("Enter username");
      return;
    }

    try {
      await axios.post(
        `${url}/friend/request/${username}`,
        {},
        { withCredentials: true },
      );
      setUsername("");
      alert("Request sent");
    } catch (err) {
      alert("Error sending request");
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${url}/friend/requests`, {
        withCredentials: true,
      });
      console.log("from inside func:", res.data.data);
      setRequests(res.data.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "pending") {
      fetchRequests();
    }
  }, [activeTab]);

  const handleAccept = async (requesterId) => {
    try {
      await axios.post(
        `${url}/friend/accept/${requesterId}`,
        {},
        { withCredentials: true },
      );
      setRequests((prev) =>
        prev.filter((req) => req.requester._id !== requesterId),
      );
      await fetchDms();
    } catch (error) {
      console.error("Accept error:", error);
    }
  };

  const handleReject = async (requesterId) => {
    try {
      await axios.post(
        `${url}/friend/reject/${requesterId}`,
        {},
        { withCredentials: true },
      );

      setRequests((prev) =>
        prev.filter((req) => req.requester._id !== requesterId),
      );
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-[#141414] h-[70%] w-[30%] rounded-lg p-4 relative flex flex-col">
        <button
          onClick={() => setView(false)}
          className="absolute top-3 right-3 text-white hover:scale-110 transition"
        >
          <IoIosClose size={25} />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Friend Requests</h2>

        <div className="flex border-b border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab("send")}
            className={`flex-1 py-2 text-sm ${
              activeTab === "send"
                ? "text-white border-b-2 border-white"
                : "text-gray-400"
            }`}
          >
            Send Request
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2 text-sm ${
              activeTab === "pending"
                ? "text-white border-b-2 border-white"
                : "text-gray-400"
            }`}
          >
            Pending Requests
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "send" && (
            <div className="flex flex-col gap-4 h-full">
              <input
                type="text"
                placeholder="Enter username"
                className="px-3 py-2 rounded outline-none border bg-transparent text-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <div className="flex-1" />

              <button
                className="bg-green-700/80 text-white py-2 rounded hover:bg-green-800 transition"
                onClick={sendFriendReq}
              >
                Send Request
              </button>
            </div>
          )}

          {activeTab === "pending" && (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <p className="text-gray-400 text-sm">No pending requests</p>
              ) : (
                requests.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between bg-[#1e1e1e] p-3 rounded"
                  >
                    <span className="text-white">{req.requester.username}</span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req.requester._id)}
                        className="bg-green-600 px-2 py-1 text-xs rounded"
                      >
                        Accept
                      </button>

                      <button
                        onClick={() => handleReject(req.requester._id)}
                        className="bg-red-600 px-2 py-1 text-xs rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendReqModal;
