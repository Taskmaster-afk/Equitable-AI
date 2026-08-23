import React, { useState } from "react";
import { Send, Book, Sparkles, AlertCircle } from "lucide-react";

export const BookPedia = ({ currentStudent }) => {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question.trim();
    setQuestion("");
    const newHistory = [...history, { role: "user", text: userQ }];
    setHistory(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch("/api/bookpedia/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQ, studentId: currentStudent?.id }),
      });
      const data = await res.json();
      
      if (res.ok && data.answer) {
        setHistory([...newHistory, { role: "agent", text: data.answer }]);
      } else {
        setHistory([...newHistory, { role: "agent", text: "Error: Could not connect to Book-Pedia." }]);
      }
    } catch (err) {
      console.error(err);
      setHistory([...newHistory, { role: "agent", text: "Error: " + err.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-white dark:bg-[#1A1A1A] border border-[#E5E7EB] dark:border-[#2A2A2A] shadow-xs">
      <div className="px-4 py-2.5 border-b border-[#E5E7EB] dark:border-[#2A2A2A] bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-bold text-xs text-[#1A1A1A] dark:text-white">
            Book-Pedia (Resource AI)
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Continuous Analysis Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFB] dark:bg-[#121212]">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
              <Book className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Book-Pedia AI</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                I strictly answer questions based on the resources uploaded to the Library & Dump.
              </p>
            </div>
          </div>
        ) : (
          history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user" 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-br-none" 
                  : "bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-zinc-800 rounded-bl-none shadow-sm text-slate-800 dark:text-slate-200"
              }`}>
                {msg.role === "agent" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-emerald-600">
                    {msg.text.split("\n").map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2 text-slate-500">
              <Sparkles className="w-4 h-4 animate-spin text-emerald-500" />
              <span className="text-xs font-medium">Analyzing library resources...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-white dark:bg-[#1A1A1A] border-t border-[#E5E7EB] dark:border-[#2A2A2A]">
        <form onSubmit={handleAsk} className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask Book-Pedia about uploaded resources..."
            className="w-full bg-[#F3F4F6] dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-white text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="absolute right-2 top-1.5 bottom-1.5 aspect-square bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
