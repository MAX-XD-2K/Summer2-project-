import { useState, useEffect } from "react";
import { 
  GraduationCap, Sparkles, BookOpen, Clock, Play, CheckCircle, 
  AlertCircle, ChevronRight, RotateCcw, Award, Info, HelpCircle 
} from "lucide-react";
import { StudyDoc, Quiz, QuizAttempt } from "../types";

interface QuizzesViewProps {
  documents: StudyDoc[];
  user: any;
  theme: "light" | "dark";
  onUpdated: () => void;
}

export default function QuizzesView({ documents, user, theme, onUpdated }: QuizzesViewProps) {
  const isDark = theme === "dark";
  const [selectedDocId, setSelectedDocId] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizCount, setQuizCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  // Active playing quiz states
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  
  // Submit attempts result states
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const response = await fetch("/api/quizzes", {
          headers: { "x-user-id": user?.id || "user-123" }
        });
        if (response.ok) {
          const data = await response.json();
          setQuizzes(data.quizzes);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadQuizzes();
  }, [user, documents]);

  // Set default document if available
  useEffect(() => {
    if (documents.length > 0 && !selectedDocId) {
      const processed = documents.find((d) => d.processingStatus === "processed");
      if (processed) setSelectedDocId(processed.id);
    }
  }, [documents]);

  const handleGenerateQuiz = async () => {
    if (!selectedDocId) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify({
          docId: selectedDocId,
          count: quizCount
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes([data.quiz, ...quizzes]);
        handleStartQuiz(data.quiz);
        onUpdated(); // Refresh global level / XP
      } else {
        const data = await response.json();
        alert(data.error || "Quiz generation failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setAttemptResult(null);
  };

  const handleSelectOption = (questionIndex: number, option: string) => {
    if (attemptResult) return; // Read-only once submitted
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: option
    });
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/quizzes/${activeQuiz.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify({ answers: selectedAnswers })
      });

      if (response.ok) {
        const data = await response.json();
        setAttemptResult(data.attempt);
        onUpdated(); // Refresh global XP
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setAttemptResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight">Academic Quizzes Arena</h2>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Generate and solve multiple choice and boolean logic questions parsed directly from course nodes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form: Quiz configuration compiler */}
        {!activeQuiz && (
          <div className={`p-5 rounded-2xl border h-fit ${
            isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-200 shadow-sm"
          }`}>
            <h3 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
              <span>AI Quiz Generator</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Target Course material</label>
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
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">Question Density</label>
                <select
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                  className={`w-full text-xs p-2.5 rounded-xl border outline-hidden ${
                    isDark ? "bg-[#161e31] border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={generating || !selectedDocId}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 font-semibold text-xs text-white rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                {generating ? "Parsing Syllabus MCQs..." : "Generate & Start Quiz"}
              </button>
            </div>
          </div>
        )}

        {/* Right list or Playing Quiz frame */}
        <div className="lg:col-span-2">
          {activeQuiz ? (
            /* Active Interactive Playing Module */
            <div className={`p-5 rounded-2xl border ${
              isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-200 shadow-sm"
            }`}>
              
              {/* Active Header indicator */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-800/50 mb-5">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest block">
                    Active Assessment Quiz
                  </span>
                  <h4 className="text-xs font-semibold truncate max-w-[280px] mt-0.5">{activeQuiz.title}</h4>
                </div>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-2.5 py-1 text-[10px] font-bold uppercase text-gray-400 border border-gray-800 rounded-lg hover:border-gray-700 cursor-pointer"
                >
                  Back to List
                </button>
              </div>

              {attemptResult ? (
                /* Attempt results statistics summary card */
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-center space-y-3">
                    <Award className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
                    <div>
                      <h4 className="text-lg font-bold font-display">Assessment Scored!</h4>
                      <p className="text-sm font-bold mt-1 text-indigo-400">
                        Total score: {attemptResult.score}/{attemptResult.totalQuestions} ({Math.round((attemptResult.score / attemptResult.totalQuestions) * 100)}%)
                      </p>
                      <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-wider">
                        Syllabus Progress Saved & Analyzed
                      </p>
                    </div>
                  </div>

                  {/* Review breakdown questions */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Question Step-by-Step Explanations</h5>
                    {(activeQuiz.questions || []).map((q, idx) => {
                      const isCorrect = attemptResult.answersReview[idx];
                      const chosenOption = attemptResult.chosenAnswers[idx];
                      const correctOption = q.correctAnswer;

                      return (
                        <div key={idx} className={`p-4 rounded-xl border ${
                          isCorrect ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"
                        }`}>
                          <p className="text-xs font-bold text-white">Q{idx + 1}: {q.questionText}</p>
                          
                          <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                            <div className="p-2 rounded-lg bg-[#161d31]/50 border border-gray-800">
                              <span className="text-gray-500 font-bold block uppercase tracking-wider">Your selection</span>
                              <span className={`font-semibold ${isCorrect ? "text-emerald-500" : "text-rose-500"}`}>{chosenOption || "No answer"}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-[#161d31]/50 border border-gray-800">
                              <span className="text-gray-500 font-bold block uppercase tracking-wider">Correct Syllabus answer</span>
                              <span className="text-emerald-500 font-semibold">{correctOption}</span>
                            </div>
                          </div>

                          {/* AI Explanation reasoning */}
                          {q.explanation && (
                            <div className="mt-3 p-2.5 rounded-lg bg-[#161d31]/30 text-[10px] leading-relaxed text-gray-400 border border-gray-800/40">
                              <Info className="w-3.5 h-3.5 text-indigo-400 inline mr-1.5 shrink-0 align-text-bottom" />
                              <span className="italic">{q.explanation}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleResetQuiz}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white rounded-xl shadow-md cursor-pointer"
                  >
                    Attempt Quiz Again
                  </button>
                </div>
              ) : (
                /* Question slider pane */
                <div className="space-y-6">
                  {/* Progress indicators bar */}
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1.5 font-bold">
                      <span>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>
                      <span>{Math.round(((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100)}% Complete</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div 
                        style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                        className="h-full bg-indigo-600"
                      ></div>
                    </div>
                  </div>

                  {/* Question question content */}
                  <div className="p-4 rounded-xl bg-[#161e31]/50 border border-gray-800 min-h-[80px] flex items-center justify-center text-center">
                    <p className="text-sm font-semibold leading-relaxed font-display">
                      {activeQuiz.questions[currentQuestionIndex].questionText}
                    </p>
                  </div>

                  {/* Options select grid */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {(activeQuiz.questions[currentQuestionIndex].options || []).map((opt) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelectOption(currentQuestionIndex, opt)}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600/15 border-indigo-500 text-white font-semibold"
                              : isDark ? "bg-[#161e31]/40 border-gray-800/80 text-gray-300 hover:bg-[#161e31]/80 hover:border-gray-700" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center border shrink-0 ${
                              isSelected ? "bg-indigo-600 border-indigo-500 text-white" : "border-gray-800 text-gray-500 bg-gray-800/10"
                            }`}>
                              ✓
                            </span>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Control slide footer buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-800/40">
                    <button
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                      className="px-3.5 py-1.5 text-[10px] font-bold uppercase text-gray-400 border border-gray-800 rounded-lg hover:border-gray-700 disabled:opacity-35 cursor-pointer"
                    >
                      Previous
                    </button>

                    {currentQuestionIndex === activeQuiz.questions.length - 1 ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={submitting}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg shadow-md cursor-pointer"
                      >
                        {submitting ? "Analyzing Answers..." : "Submit Quiz Assessment"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        className="px-3.5 py-1.5 text-[10px] font-bold uppercase text-indigo-400 border border-indigo-500/20 rounded-lg hover:border-indigo-500/40 cursor-pointer"
                      >
                        Next Question
                      </button>
                    )}
                  </div>

                </div>
              )}

            </div>
          ) : (
            /* Inactive list of available quizzes */
            <div className={`p-5 rounded-2xl border ${
              isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-200 shadow-sm"
            }`}>
              <h3 className="text-sm font-bold font-display mb-4">Available Syllabus Quizzes</h3>
              {quizzes.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-gray-500">No quizzes generated yet. Choose a study document and tap "Generate & Start Quiz"!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.map((quiz) => (
                    <div 
                      key={quiz.id} 
                      className="p-3.5 rounded-xl border border-gray-800/80 bg-[#161e31]/30 flex justify-between items-center group hover:border-gray-700 transition-all"
                    >
                      <div className="min-w-0 pr-4">
                        <h4 className="text-xs font-semibold truncate text-white">{quiz.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[9px] font-bold uppercase tracking-wider text-gray-500 font-mono">
                          <span>{quiz.subject}</span>
                          <span>•</span>
                          <span>{(quiz.questions || []).length} Questions</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
