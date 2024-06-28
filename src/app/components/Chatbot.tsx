"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; user: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { text: input, user: true }];
      setMessages(newMessages);
      setInput("");

      try {
        setLoading(true);
        const response = await axios.post(
          process.env.NEXT_PUBLIC_AI_KEY ?? "",
          {
            contents: [
              {
                parts: [
                  {
                    text: input,
                  },
                ],
              },
            ],
          }
        );
        console.log(response);
        const botResponse = response.data.candidates[0].content.parts[0].text;
        setLoading(false);
        setMessages([...newMessages, { text: botResponse, user: false }]);
      } catch (error) {
        console.error("Error sending message:", error);
        setLoading(false);
        setMessages([
          ...newMessages,
          { text: "Error: Could not get response from AI", user: false },
        ]);
      }
    }
  };

  useEffect(() => {
    if (isChatbotVisible && messages.length === 0) {
      setMessages([
        {
          text: "Hello 👋, Your friendly assistant here! How can I help you?",
          user: false,
        },
      ]);
    }
  }, [isChatbotVisible]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end h-screen z-50">
      <button
        onClick={() => setIsChatbotVisible(!isChatbotVisible)}
        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg"
      >
        {isChatbotVisible ? "Close" : "Open"}
      </button>
      {isChatbotVisible && (
        <div className="bg-white w-80 h-96 shadow-lg rounded-lg overflow-hidden mt-4">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 ">
            <h1 className="text-white text-lg font-bold text-center">Welcome to Jeevansathi</h1>
          </div>
          <div className="p-4 h-64 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.user ? "justify-end" : "justify-start"} mb-2`}
              >
                <div
                  className={`rounded-lg p-2 shadow-md max-w-xs ${
                    msg.user ? "bg-red-300 text-black" : "bg-red-500 text-white"
                  }`}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center mb-2">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-red-400 rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-red-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-4 h-4 bg-red-400 rounded-full animate-bounce delay-150"></div>
                </div>
                <p className="ml-2 text-red-400">Loading...</p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t border-gray-200 flex items-center">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-grow border border-gray-300 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;