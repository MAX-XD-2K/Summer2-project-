export enum Role {
  USER = "user",
  ADMIN = "admin"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
  avatarUrl?: string;
  xp: number;
  streak: number;
  lastActiveDate?: string;
  badges: string[];
  createdAt: string;
}

export interface StudyDoc {
  id: string;
  userId: string;
  title: string;
  subject: string;
  uploadDate: string;
  pageCount: number;
  fileSize: string; // e.g. "1.2 MB"
  fileType: "pdf" | "docx" | "pptx" | "txt";
  processingStatus: "pending" | "processed" | "failed";
  extractedContent: string;
}

export interface DocSummary {
  id: string;
  docId: string;
  shortSummary: string;
  detailedSummary: string;
  bulletNotes: string[];
  keyConcepts: { concept: string; definition: string }[];
  importantDefinitions: { term: string; explanation: string }[];
}

export interface Note {
  id: string;
  userId: string;
  docId?: string;
  title: string;
  subject: string;
  content: string;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  userId: string;
  docId?: string;
  subject: string;
  front: string; // Question
  back: string;  // Answer
  isBookmarked: boolean;
  isLearned: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: "mcq" | "boolean" | "fill" | "short";
  question: string;
  options?: string[]; // for MCQ
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  userId: string;
  docId?: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  attemptedAt: string;
}

export interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface AIChat {
  id: string;
  userId: string;
  docId: string;
  docTitle: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

export interface StudyScheduleDay {
  day: string; // e.g., "Monday"
  topics: {
    topic: string;
    completed: boolean;
    missed: boolean;
  }[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  examDate: string;
  subjects: string[];
  dailyStudyHours: number;
  schedule: StudyScheduleDay[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: "success" | "info" | "alert";
  isRead: boolean;
  timestamp: string;
}

export interface UserSettings {
  userId: string;
  theme: "light" | "dark";
  voiceSpeed: number; // 0.5 to 2.0
  language: string; // "en" | "es" | "fr" | "de"
}

export interface MindMapNode {
  id: string;
  label: string;
  type?: "root" | "main" | "sub";
  children?: MindMapNode[];
}

export interface Formula {
  id: string;
  docId: string;
  equation: string;
  name: string;
  description: string;
}

export interface Keyword {
  id: string;
  docId: string;
  word: string;
  importance: "high" | "medium" | "low";
  definition: string;
}
