"use client";

export default function StatsTab({ history, onDelete }) {
  const reading = history.filter(h => h.status === 'reading');
  const paused = history.filter(h => h.status === 'paused');
  const finished = history.filter(h => h.status === 'finished');

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const calculateDuration = (start, end) => {
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays + " days";
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 pl-4 md:px-0">
        <div className="w-full sketch-card p-5 md:p-8 bg-paper">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 underline decoration-wavy decoration-blue-400 text-center" style={{fontFamily: 'var(--font-gaegu)'}}>
                My Journey
            </h2>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[var(--ink)] scrollbar-track-transparent">
                
                {/* Currently Reading */}
                {reading.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-green-600" style={{fontFamily: 'var(--font-gaegu)'}}>Currently Reading</h3>
                        <ul className="space-y-2">
                            {reading.map((book) => (
                                <li key={book.id} className="sketch-border p-3 bg-white/80 flex justify-between items-center group">
                                    <div className="flex flex-col overflow-hidden mr-2">
                                        <span className="font-bold text-lg truncate">{book.title}</span>
                                        <span className="text-xs font-bold text-gray-400">Since {formatDate(book.startDate)}</span>
                                    </div>
                                    <button 
                                        onClick={() => onDelete(book)}
                                        className="p-2 text-red-500 hover:text-red-700 transition-colors focus:opacity-100"
                                        title="Reset to Wheel"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Paused */}
                {paused.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-orange-500" style={{fontFamily: 'var(--font-gaegu)'}}>On Pause</h3>
                        <ul className="space-y-2">
                            {paused.map((book) => (
                                <li key={book.id} className="sketch-border p-3 bg-white/60 flex justify-between items-center border-dashed group">
                                    <div className="flex flex-col overflow-hidden mr-2">
                                        <span className="font-bold text-lg truncate opacity-70">{book.title}</span>
                                        <span className="text-xs font-bold text-gray-400">Paused {formatDate(book.pausedDate)}</span>
                                    </div>
                                    <button 
                                        onClick={() => onDelete(book)}
                                        className="p-2 text-red-500 hover:text-red-700 transition-colors focus:opacity-100"
                                        title="Reset to Wheel"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Finished */}
                {finished.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-500" style={{fontFamily: 'var(--font-gaegu)'}}>Finished</h3>
                        <ul className="space-y-2">
                            {finished.map((book) => (
                                <li key={book.id} className="sketch-border p-3 bg-green-50 flex justify-between items-center group">
                                    <div className="flex flex-col overflow-hidden mr-2">
                                        <span className="font-bold text-lg truncate line-through decoration-2 decoration-green-400">{book.title}</span>
                                        <span className="text-xs font-bold text-gray-400">{calculateDuration(book.startDate, book.endDate)}</span>
                                    </div>
                                    <button 
                                        onClick={() => onDelete(book)}
                                        className="p-2 text-red-500 hover:text-red-700 transition-colors focus:opacity-100"
                                        title="Reset to Wheel"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {history.length === 0 && (
                    <div className="text-center text-gray-400 font-bold text-xl py-10" style={{fontFamily: 'var(--font-gaegu)'}}>
                        No history yet. Spin the wheel to start reading!
                    </div>
                )}

            </div>
        </div>
    </div>
  );
}
