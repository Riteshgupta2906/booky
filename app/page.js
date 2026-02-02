"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import WheelTab from "./components/WheelTab";
import LibraryTab from "./components/LibraryTab";
import StatsTab from "./components/StatsTab";
import { get, set } from "./utils/db";

export default function Home() {
  const [activeTab, setActiveTab] = useState("spin");
  const [isSpinning, setIsSpinning] = useState(false);

  
  // Initialize with defaults
  const [books, setBooks] = useState([
    "Pride and Prejudice",
    "The Hobbit",
    "1984",
    "Dune",
    "Little Women",
    "Frankenstein",
    "The Great Gatsby",
    "The Night Circus",
  ]);
  const [activeBook, setActiveBook] = useState(null);
  const [activeTimestamp, setActiveTimestamp] = useState(null);
  const [winner, setWinner] = useState(null);
  const [bookHistory, setBookHistory] = useState([]);
  const [showManageModal, setShowManageModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showWinnerDropdown, setShowWinnerDropdown] = useState(false);



  // Load from DB (with migration) on mount
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
      const loadData = async () => {
        try {
            // Check if we migrated
            const migrated = await get("migrated-from-ls");
            
            if (!migrated && typeof window !== "undefined") {
                // Perform Migration
                const lsBooks = localStorage.getItem("tbr-books");
                const lsActive = localStorage.getItem("tbr-active-book");
                const lsActiveTs = localStorage.getItem("tbr-active-timestamp");
                const lsHistory = localStorage.getItem("tbr-history");

                if (lsBooks) await set("tbr-books", JSON.parse(lsBooks));
                if (lsActive) await set("tbr-active-book", lsActive);
                if (lsActiveTs) await set("tbr-active-timestamp", parseInt(lsActiveTs));
                if (lsHistory) await set("tbr-history", JSON.parse(lsHistory));
                
                await set("migrated-from-ls", true);
            }

            // Load from DB
            const savedBooks = await get("tbr-books");
            const savedActive = await get("tbr-active-book");
            const savedTimestamp = await get("tbr-active-timestamp");
            const savedHistory = await get("tbr-history");

            if (savedBooks) setBooks(savedBooks);
            if (savedActive) setActiveBook(savedActive);
            if (savedTimestamp) setActiveTimestamp(savedTimestamp);
            if (savedHistory) setBookHistory(savedHistory);

        } catch (e) {
            console.error("Failed to load data from DB", e);
        } finally {
            setIsLoaded(true);
        }
      };
      
      loadData();
  }, []);

  // Save to DB on changes - ONLY after initial load
  useEffect(() => {
      if (!isLoaded) return;
      set("tbr-books", books);
  }, [books, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      set("tbr-history", bookHistory);
  }, [bookHistory, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      if (activeBook) {
        set("tbr-active-book", activeBook);
      } else {
        set("tbr-active-book", null);
      }
  }, [activeBook, isLoaded]);

  useEffect(() => {
      if (!isLoaded) return;
      if (activeTimestamp) {
        set("tbr-active-timestamp", activeTimestamp);
      } else {
        set("tbr-active-timestamp", null);
      }
  }, [activeTimestamp, isLoaded]);

  // Haptic feedback helper
  const triggerHaptic = (pattern) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // State for client-side time to avoid hydration mismatch/impure render
  const [now, setNow] = useState(null);
  
  // Set 'now' on mount to handle time calculations purely
  useEffect(() => {
    // Delay slightly to avoid "synchronous setState" warning and hydration mismatch
    const timer = setTimeout(() => setNow(Date.now()), 0);
    // Update every minute (optional)
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => {
        clearTimeout(timer);
        clearInterval(interval);
    };
  }, []);

  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    }
  };

  const [showActiveBookError, setShowActiveBookError] = useState(false);

  return (
    <div className="h-screen relative overflow-hidden p-4 flex flex-col items-center">
      {/* Background Layers */}
      <div className="fixed inset-0 -z-20 flex items-center justify-center bg-[#fdfaf6]">
          <div 
            className="relative w-full h-full max-w-[1000px] max-h-[1000px]"
            style={{
                transform: 'translate(0px, 190px) scale(1)',
            }}
          >
            <Image 
              src="/Growth.svg"
              alt="Background"
              fill
              className="object-contain opacity-90"
              priority
            />
          </div>
      </div>
     
      {/* Sidebar Buttons */}
      <div className="fixed left-0 top-[60%] -translate-y-1/2 z-[60] flex flex-col gap-8 pl-0">
        <button
            onClick={() => setActiveTab("spin")}
            className={`sketch-button py-6 w-10 md:w-12 rounded-r-xl rounded-l-none border-l-0 origin-left transition-all duration-300 font-bold flex flex-col items-center justify-center ${activeTab === "spin" ? "scale-105 shadow-[3px_3px_0px_rgba(0,0,0,0.2)] bg-orange-50 translate-x-0 z-50" : "bg-white hover:scale-105 shadow-md -translate-x-1 opacity-90"}`}
            style={{ fontFamily: 'var(--font-gaegu)' }}
            onClickCapture={() => triggerHaptic(10)}
        >
            <span className="[writing-mode:vertical-rl] rotate-180 text-lg md:text-xl tracking-widest leading-none">WHEEL</span>
        </button>
        <button
            onClick={() => setActiveTab("library")}
            className={`sketch-button py-6 w-10 md:w-12 rounded-r-xl rounded-l-none border-l-0 origin-left transition-all duration-300 font-bold flex flex-col items-center justify-center ${activeTab === "library" ? "scale-105 shadow-[3px_3px_0px_rgba(0,0,0,0.2)] bg-orange-50 translate-x-0 z-50" : "bg-white hover:scale-105 shadow-md -translate-x-1 opacity-90"}`}
            style={{ fontFamily: 'var(--font-gaegu)' }}
            onClickCapture={() => triggerHaptic(10)}
        >
            <span className="[writing-mode:vertical-rl] rotate-180 text-lg md:text-xl tracking-widest leading-none">LIBRARY</span>
        </button>
        <button
            onClick={() => setActiveTab("stats")}
            className={`sketch-button py-6 w-10 md:w-12 rounded-r-xl rounded-l-none border-l-0 origin-left transition-all duration-300 font-bold flex flex-col items-center justify-center ${activeTab === "stats" ? "scale-105 shadow-[3px_3px_0px_rgba(0,0,0,0.2)] bg-orange-50 translate-x-0 z-50" : "bg-white hover:scale-105 shadow-md -translate-x-1 opacity-90"}`}
            style={{ fontFamily: 'var(--font-gaegu)' }}
            onClickCapture={() => triggerHaptic(10)}
        >
            <span className="[writing-mode:vertical-rl] rotate-180 text-lg md:text-xl tracking-widest leading-none">STATS</span>
        </button>
        {deferredPrompt && (
          <button
              onClick={handleInstallClick}
              className={`sketch-button py-6 w-10 md:w-12 rounded-r-xl rounded-l-none border-l-0 origin-left transition-all duration-300 font-bold flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 shadow-md -translate-x-1 opacity-90`}
              style={{ fontFamily: 'var(--font-gaegu)' }}
              onClickCapture={() => triggerHaptic(10)}
          >
              <span className="[writing-mode:vertical-rl] rotate-180 text-lg md:text-xl tracking-widest leading-none text-blue-600">INSTALL</span>
          </button>
        )}
      </div>

      {/* Right Action Button (Spin) - Only visible on Wheel tab */}
      {activeTab === "spin" && (
        <div className="fixed right-0 top-[55%] -translate-y-1/2 z-[60] pr-0 animate-in slide-in-from-right-4 duration-500">
            <button
                onClick={() => {
                   if (activeBook) {
                       setShowActiveBookError(true);
                       triggerHaptic([50, 50, 50]); // Aggressive haptic for error
                       setTimeout(() => setShowActiveBookError(false), 3000);
                       return;
                   }
                   setIsSpinning(true);
                }}
                disabled={isSpinning}
                className="sketch-button py-8 w-12 md:w-16 rounded-l-xl rounded-r-none border-r-0 origin-right hover:scale-105 active:scale-95 transition-all font-bold flex flex-col items-center justify-center bg-[#FF6B6B] text-white shadow-lg border-[var(--ink)]"
                style={{ fontFamily: 'var(--font-gaegu)' }}
                onClickCapture={() => triggerHaptic(10)}
            >
                <span className="[writing-mode:vertical-rl] rotate-180 text-xl md:text-2xl tracking-widest leading-tight">
                    {isSpinning ? "..." : "SPIN"}
                </span>
            </button>
        </div>
      )}

      {/* Error Toast */}
      {showActiveBookError && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] animate-in fade-in zoom-in duration-300 pointer-events-none w-full max-w-md px-4 text-center">
            <div className="bg-white text-[var(--ink)] px-6 py-4 rounded-xl shadow-[5px_5px_0px_rgba(0,0,0,0.2)] border-2 border-[var(--ink)] transform -rotate-2">
                <p className="text-xl md:text-2xl font-bold" style={{fontFamily: 'var(--font-gaegu)'}}>
                    ahh ahh pls pause or close the active book ☝️🤓
                </p>
            </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`relative ${activeTab === 'library' ? 'z-50' : 'z-10'} flex flex-col items-center w-full max-w-4xl px-4`}>
        {activeTab === "spin" && (
            <WheelTab 
                books={books.filter(book => !bookHistory.some(h => h.title === book))} 
                isSpinning={isSpinning} 
                onSpin={setIsSpinning} 
                triggerHaptic={triggerHaptic}
                activeBook={activeBook}
                onWin={setWinner}
            />
        )}

        {activeTab === "library" && (
            <LibraryTab 
                books={books} 
                setBooks={setBooks} 
                activeBook={activeBook}
                triggerHaptic={triggerHaptic}
            />
        )}

        {activeTab === "stats" && (
            <StatsTab history={bookHistory} onDelete={setItemToDelete} />
        )}
      </div>

      {/* Active Book Display - Bottom Right */}
      {activeBook && (
        <div className="fixed right-0 top-[78%] -translate-y-1/2 z-[60] pr-0 animate-in slide-in-from-right-4 duration-500">
            <div
                className="sketch-button py-6 w-12 md:w-16 rounded-l-xl rounded-r-none border-r-0 origin-right hover:scale-105 transition-all font-bold flex flex-col items-center justify-center bg-[#fffbe6] text-[var(--ink)] shadow-md border-[var(--ink)]"
                style={{ fontFamily: 'var(--font-gaegu)' }}
                onClick={() => setShowManageModal(true)}
                onClickCapture={() => triggerHaptic(10)}
            >
               
                 {activeTimestamp && now && (
                    <span className="text-[8px] md:text-[10px] mb-2 [writing-mode:vertical-rl] rotate-180 text-red-400 font-bold tracking-widest">
                        {(() => {
                            const days = Math.floor((now - activeTimestamp) / (1000 * 60 * 60 * 24));
                            return days < 1 ? "Today" : `${days} Days`;
                        })()}
                    </span>
                 )}

                <span className="[writing-mode:vertical-rl] rotate-180 text-lg md:text-xl tracking-widest leading-tight line-clamp-1 max-h-[120px] overflow-hidden">
                    {activeBook.length > 12 ? activeBook.substring(0, 12) + "..." : activeBook}
                </span>
            </div>
        </div>
      )}

      {/* Manage Book Modal */}
      {showManageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
             <div className="sketch-card p-6 md:p-8 w-full max-w-sm text-center">
                <h3 className="text-2xl font-bold mb-4" style={{fontFamily: 'var(--font-gaegu)'}}>Manage Book</h3>
                <p className="text-lg mb-6 font-bold text-gray-600">{activeBook}</p>
                
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            // Finish Book
                            const newHistory = bookHistory.map(h => 
                                h.status === 'reading' && h.title === activeBook ? { ...h, status: 'finished', endDate: Date.now() } : h
                            );
                            setBookHistory(newHistory);
                            setActiveBook(null);
                            setActiveTimestamp(null);
                            setShowManageModal(false);
                            triggerHaptic(50);
                        }}
                        className="sketch-button py-3 bg-green-100 text-green-700 font-bold text-xl"
                    >
                        Finish Book
                    </button>
                    <button
                        onClick={() => {
                            // Pause Book
                            const newHistory = bookHistory.map(h => 
                                h.status === 'reading' && h.title === activeBook ? { ...h, status: 'paused', pausedDate: Date.now() } : h
                            );
                            setBookHistory(newHistory);
                            setActiveBook(null);
                            setActiveTimestamp(null);
                            setShowManageModal(false);
                            triggerHaptic(20);
                        }}
                        className="sketch-button py-3 bg-orange-100 text-orange-700 font-bold text-xl"
                    >
                        Pause Book
                    </button>
                    <button
                        onClick={() => setShowManageModal(false)}
                        className="sketch-button py-3 bg-gray-100 text-gray-500 font-bold text-xl mt-2"
                    >
                        Cancel
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* Winner Modal Overlay - Lifted here for Z-Index */}
      {winner && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
            onClick={() => {
                setWinner(null);
                setIsSpinning(false);
                setShowWinnerDropdown(false);
            }}
        >
            <div 
                className="sketch-card p-6 md:p-10 w-full max-w-sm md:max-w-md text-center transform scale-100 md:scale-110"
                onClick={(e) => e.stopPropagation()}
            >
            <p className="text-xl md:text-2xl mb-2">✨ Destiny has chosen ✨</p>
            <div className="relative mb-6 md:mb-8">
                <div className="flex items-center justify-center gap-2">
                    <h2 className="text-3xl md:text-5xl font-bold text-red-600 leading-tight break-words">
                        {winner}
                    </h2>
                    <button 
                        onClick={() => setShowWinnerDropdown(!showWinnerDropdown)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                </div>

                {showWinnerDropdown && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full max-w-[280px] max-h-[200px] overflow-y-auto bg-white border-2 border-[var(--ink)] rounded-lg shadow-lg z-50">
                        <ul className="py-2">
                             {books.filter(book => !bookHistory.some(h => h.title === book) && book !== winner).map((book, i) => (
                                <li key={i}>
                                    <button
                                        onClick={() => {
                                            setWinner(book);
                                            setShowWinnerDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-orange-50 font-bold text-[var(--ink)] truncate"
                                        style={{fontFamily: 'var(--font-gaegu)'}}
                                    >
                                        {book}
                                    </button>
                                </li>
                             ))}
                             {books.filter(book => !bookHistory.some(h => h.title === book) && book !== winner).length === 0 && (
                                <li className="px-4 py-2 text-gray-400 font-bold text-center text-sm">No other books available</li>
                             )}
                        </ul>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-3 w-full">
                <button
                    onClick={() => {
                        console.log("Page: Modal OK clicked");
                        const now = Date.now();
                        setActiveBook(winner);
                        setActiveTimestamp(now);
                        
                        // Add to History
                        const newEntry = {
                            id: now.toString(),
                            title: winner,
                            status: 'reading',
                            startDate: now,
                            endDate: null,
                            pausedDate: null
                        };
                        setBookHistory([...bookHistory, newEntry]);

                        setWinner(null);
                        setIsSpinning(false); // Reset spinning state
                        setShowWinnerDropdown(false);
                        triggerHaptic([10, 50, 10]);
                    }}
                    className="sketch-button px-8 py-3 md:px-10 md:py-4 text-xl md:text-2xl font-bold w-full bg-[#9ae6b4] hover:bg-[#68d391]"
                >
                    I&apos;m ready!
                </button>
                <button
                    onClick={() => {
                        console.log("Page: Modal Spin Again clicked");
                        setWinner(null);
                        setIsSpinning(true);
                        setShowWinnerDropdown(false);
                        triggerHaptic(10);
                    }}
                    className="sketch-button px-6 py-2 md:px-8 md:py-3 text-lg md:text-xl font-bold w-full bg-white text-gray-500 hover:text-gray-700"
                >
                    Spin Again
                </button>
            </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
             <div className="sketch-card p-6 w-full max-w-sm text-center">
                <h3 className="text-2xl font-bold mb-4" style={{fontFamily: 'var(--font-gaegu)'}}>Reset Book?</h3>
                <p className="text-gray-600 mb-6 font-bold">
                    It will reset the stat of the book.
                </p>
                
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            // Delete Logic
                            const newHistory = bookHistory.filter(h => h.id !== itemToDelete.id);
                            setBookHistory(newHistory);
                            
                            // If it was active, clear active state
                            if (activeBook === itemToDelete.title && itemToDelete.status === 'reading') {
                                setActiveBook(null);
                                setActiveTimestamp(null);
                            }

                            setItemToDelete(null);
                            triggerHaptic(50);
                        }}
                        className="sketch-button py-3 bg-red-100 text-red-700 font-bold text-xl"
                    >
                        Yes, Reset it
                    </button>
                    <button
                        onClick={() => setItemToDelete(null)}
                        className="sketch-button py-3 bg-gray-100 text-gray-500 font-bold text-xl"
                    >
                        Cancel
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
}