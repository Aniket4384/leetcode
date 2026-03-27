import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utility/axiosClient";
import { Send } from 'lucide-react';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: "Hi! I'm your AI coding assistant. How can I help you with this problem?" }] }
    ]);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        const userMessage = data.message;
        if (!userMessage) return;

        setMessages(prev => [...prev, { role: 'user', parts: [{ text: userMessage }] }]);
        reset();
        setLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: userMessage,
                title: problem?.title,
                description: problem?.description,
                testCases: problem?.visibleTestCases,
                startCode: problem?.startCode
            });

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response.data.message || "No response received." }]
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: "Sorry, I'm having trouble connecting. Please try again." }]
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px] max-h-[70vh]">
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        <div className={`chat-bubble max-w-[85%] sm:max-w-[70%] ${
                            msg.role === "user" 
                                ? "bg-blue-600 text-white" 
                                : "bg-gray-700 text-gray-100"
                        }`}>
                            <div className="text-sm whitespace-pre-wrap break-words">
                                {msg.parts[0]?.text || ""}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="chat chat-start">
                        <div className="chat-bubble bg-gray-700 text-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="sticky bottom-0 p-3 sm:p-4 bg-gray-800 border-t border-gray-700"
            >
                <div className="flex items-center gap-2">
                    <input
                        placeholder="Ask me anything about this problem..."
                        className="flex-1 input input-bordered bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm sm:text-base"
                        {...register("message", { required: true, minLength: 2 })}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary btn-sm sm:btn-md"
                        disabled={errors.message || loading}
                    >
                        <Send size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;