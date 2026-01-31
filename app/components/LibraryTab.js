"use client";
import { useState } from "react";

export default function LibraryTab({ books, setBooks, activeBook, triggerHaptic }) {
  const [newBookInput, setNewBookInput] = useState("");

  const handleAdd = () => {
    if (!newBookInput.trim()) return;

    // Split by commas, trim each, filter empty
    const newEntries = newBookInput.split(',')
        .map(b => b.trim())
        .filter(b => b.length > 0);
    
    if (newEntries.length > 0) {
        setBooks([...books, ...newEntries]);
        setNewBookInput("");
        triggerHaptic(10);
    }
  };

  const removeBook = (index) => {
    // Optional: Protect active book from being deleted or handle it?
    // User can delete even if active.
    
    // Prevent emptying list completely?
    if (books.length <= 2) {
        alert("Keep at least 2 books for the spinner!");
        return;
    }

    const newBooks = [...books];
    const removed = newBooks.splice(index, 1)[0];
    setBooks(newBooks);
    
    // If we removed the active book, clear active state
    if (removed === activeBook) {
        setActiveBook(null);
    }
    triggerHaptic(5);
  };



  return (
    <div className="flex flex-col items-center w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 pl-4 md:px-0">
        <div className="w-full sketch-card p-5 md:p-8 bg-paper">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 underline decoration-wavy decoration-red-400 text-center" style={{fontFamily: 'var(--font-gaegu)'}}>
                My Library
            </h2>

            {/* Input Area */}
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
            <input
                type="text"
                value={newBookInput}
                onChange={(e) => setNewBookInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Book A, Book B..."
                className="flex-1 p-2 md:p-4 sketch-border focus:outline-none text-lg md:text-xl bg-white/50 placeholder:text-gray-400 w-full"
                style={{fontFamily: 'var(--font-gaegu)'}}
            />
            <button
                onClick={handleAdd}
                className="sketch-button px-4 py-2 md:px-6 font-bold text-lg"
            >
                Add
            </button>
            </div>

            {/* Book List */}
            <div className="max-h-[300px] md:max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[var(--ink)] scrollbar-track-transparent">
            <ul className="space-y-3">
                {books.map((book, index) => (
                <li
                    key={index}
                    className={`flex justify-between items-center p-3 md:p-3 sketch-border transition-all duration-200 ${activeBook === book ? 'bg-orange-50 border-l-[6px] border-l-orange-400' : 'bg-white/80 hover:bg-white'}`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {/* Active Toggle Star */}


                        <span className={`text-lg md:text-2xl font-bold truncate ${activeBook === book ? 'text-[var(--ink)]' : 'text-gray-700'}`} style={{fontFamily: 'var(--font-gaegu)'}}>
                            {book}
                        </span>
                    </div>

                    <button
                        onClick={() => removeBook(index)}
                        className="text-red-400 hover:text-red-600 hover:scale-125 transition-transform p-1 ml-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </li>
                ))}
            </ul>
            </div>

        </div>
    </div>
  );
}
