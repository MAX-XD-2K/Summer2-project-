import { useState, useEffect } from "react";
import { 
  Layers, BookOpen, Star, Sparkles, CheckCircle, ArrowLeft, ArrowRight,
  RefreshCw, Trash2, HelpCircle, CheckCircle2, Bookmark, BookmarkCheck 
} from "lucide-react";
import { StudyDoc, Flashcard } from "../types";

interface FlashcardsViewProps {
  documents: StudyDoc[];
  user: any;
  theme: "light" | "dark";
  onUpdated: () => void;
}

export default function FlashcardsView({ documents, user, theme, onUpdated }: FlashcardsViewProps) {
  const isDark = theme === "dark";
  const [selectedDocId, setSelectedDocId] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [cardCount, setCardCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Subject filtering
  const [filterSubject, setFilterSubject] = useState("All");

  useEffect(() => {
    async function loadCards() {
      try {
        const response = await fetch("/api/flashcards", {
          headers: { "x-user-id": user?.id || "user-123" }
        });
        if (response.ok) {
          const data = await response.json();
          setCards(data.flashcards);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCards();
  }, [user, documents]);

  // Set default document if available
  useEffect(() => {
    if (documents.length > 0 && !selectedDocId) {
      const processed = documents.find((d) => d.processingStatus === "processed");
      if (processed) setSelectedDocId(processed.id);
    }
  }, [documents]);

  const handleGenerateCards = async () => {
    if (!selectedDocId) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify({
          docId: selectedDocId,
          count: cardCount
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCards([...data.flashcards, ...cards]);
        setActiveCardIndex(0);
        setIsFlipped(false);
        onUpdated(); // Refresh global XP / Streak
      } else {
        const data = await response.json();
        alert(data.error || "Flashcard generation failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleBookmark = async (cardId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/flashcards/${cardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify({ isBookmarked: !currentStatus })
      });
      if (response.ok) {
        setCards(cards.map((c) => c.id === cardId ? { ...c, isBookmarked: !currentStatus } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLearned = async (cardId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/flashcards/${cardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify({ isLearned: !currentStatus })
      });
      if (response.ok) {
        setCards(cards.map((c) => c.id === cardId ? { ...c, isLearned: !currentStatus } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Delete this flashcard?")) return;
    try {
      const response = await fetch(`/api/flashcards/${cardId}`, {
        method: "DELETE",
        headers: { "x-user-id": user?.id || "user-123" }
      });
      if (response.ok) {
        const remaining = cards.filter((c) => c.id !== cardId);
        setCards(remaining);
        if (activeCardIndex >= remaining.length) {
          setActiveCardIndex(Math.max(0, remaining.length - 1));
        }
        setIsFlipped(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCards = cards.filter((c) => filterSubject === "All" || c.subject === filterSubject);
  const activeCard = filteredCards[activeCardIndex];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight">Active Flashcards Desk</h2>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Test your active recall, track definitions, and manage study cards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form: Flashcard Generator */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-200 shadow-sm"
        }`}>
          <h3 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
            <span>AI Flashcards Compiler</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Select Study Material</label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-xl border outline-hidden ${
                  isDark ? "bg-[#161e31] border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                {documents.filter((d) => d.processingStatus === "processed").length === 0 ? (
                  <option value="">No Processed Documents</option>
                ) : (
                  documents
                    .filter((d) => d.processingStatus === "processed")
                    .map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))
                )}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Number of Flashcards</label>
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                className={`w-full text-xs p-2.5 rounded-xl border outline-hidden ${
                  isDark ? "bg-[#161e31] border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              >
                <option value={5}>5 Flashcards</option>
                <option value={10}>10 Flashcards</option>
                <option value={15}>15 Flashcards</option>
              </select>
            </div>

            <button
              onClick={handleGenerateCards}
              disabled={generating || !selectedDocId}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 font-semibold text-xs text-white rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              {generating ? "Parsing & Compiling Flashcards..." : "Generate AI Flashcards"}
            </button>
          </div>

          <div className={`mt-6 pt-4 border-t text-[10px] leading-relaxed text-gray-500 ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            Syllabus models parse terms dynamically to match standard university level criteria.
          </div>
        </div>

        {/* Right Pane: Flashcards carousel card flip */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Card subject quick selector */}
          <div className="flex justify-between items-center pb-2">
            <span className="text-xs font-bold text-indigo-500 font-mono">
              Active Deck: {filteredCards.length} Cards
            </span>
            <div className="flex gap-1">
              {["All", "Computer Science", "Information Technology"].map((subj) => (
                <button
                  key={subj}
                  onClick={() => {
                    setFilterSubject(subj);
                    setActiveCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase border transition-all cursor-pointer ${
                    filterSubject === subj
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : isDark ? "border-gray-800 text-gray-400 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {subj === "All" ? "All" : subj.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {filteredCards.length === 0 ? (
            <div className={`p-10 rounded-2xl border text-center py-20 ${
              isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-100"
            }`}>
              <Layers className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Generate or upload a course textbook to populate flashcards.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Recalls card with 3D Flip */}
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative h-64 w-full cursor-pointer group [perspective:1000px]"
              >
                <div className={`relative w-full h-full duration-500 [transform-style:preserve-3d] ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}>
                  {/* Card Front Question Side */}
                  <div className={`absolute inset-0 w-full h-full rounded-2xl border p-6 flex flex-col justify-between backface-hidden [backface-visibility:hidden] ${
                    isDark ? "bg-[#111625] border-indigo-500/20 text-white" : "bg-white border-indigo-200 text-gray-800 shadow-md"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold font-mono text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Question Side • Index {activeCardIndex + 1}/{filteredCards.length}
                      </span>
                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleBookmark(activeCard.id, activeCard.isBookmarked)}
                          className={`p-1 rounded-md border ${
                            activeCard.isBookmarked ? "text-amber-500 border-amber-500/30" : "text-gray-500 border-gray-800"
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${activeCard.isBookmarked ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <div className="text-center py-4">
                      <p className="text-sm font-semibold leading-relaxed px-4 font-display">
                        {activeCard.front}
                      </p>
                    </div>

                    <p className="text-[10px] text-gray-500 text-center uppercase tracking-wider font-mono font-bold animate-pulse">
                      Click anywhere to flip answer
                    </p>
                  </div>

                  {/* Card Back Answer Side */}
                  <div className={`absolute inset-0 w-full h-full rounded-2xl border p-6 flex flex-col justify-between backface-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    isDark ? "bg-[#0f1c2d] border-emerald-500/20 text-white" : "bg-emerald-50/20 border-emerald-100 text-gray-800 shadow-md"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Answer Verification
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(activeCard.id);
                        }}
                        className="p-1 rounded-md border border-gray-800 text-gray-500 hover:text-rose-500 cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-center py-2 overflow-y-auto">
                      <p className="text-xs leading-relaxed text-gray-300 font-sans px-4">
                        {activeCard.back}
                      </p>
                    </div>

                    <div className="flex justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleLearned(activeCard.id, activeCard.isLearned)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider uppercase border transition-all ${
                          activeCard.isLearned 
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                            : "bg-gray-800 border-gray-800 text-gray-400 hover:border-gray-700"
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{activeCard.isLearned ? "Marked Learned" : "Mark Learned"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carousel navigation controls */}
              <div className="flex justify-between items-center px-4">
                <button
                  disabled={activeCardIndex === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setActiveCardIndex(activeCardIndex - 1);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase text-gray-400 border border-gray-800 rounded-lg hover:border-gray-700 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Prev
                </button>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-500 font-bold px-2 py-1 border border-indigo-500/10">
                    {activeCardIndex + 1}
                  </span>
                </div>

                <button
                  disabled={activeCardIndex === filteredCards.length - 1}
                  onClick={() => {
                    setIsFlipped(false);
                    setActiveCardIndex(activeCardIndex + 1);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase text-gray-400 border border-gray-800 rounded-lg hover:border-gray-700 disabled:opacity-30 cursor-pointer"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
