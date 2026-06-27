import fs from "fs";
import path from "path";
import { 
  User, StudyDoc, DocSummary, Note, Flashcard, Quiz, QuizAttempt, 
  AIChat, StudyPlan, Notification, UserSettings, Role 
} from "./src/types.js";

const DATA_DIR = process.env.VERCEL 
  ? path.join("/tmp", "data")
  : path.join(process.cwd(), "data");

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile<T>(filename: string, defaultValue: T): T {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultValue, null, 2));
    return defaultValue;
  }
  try {
    const data = fs.readFileSync(filepath, "utf8");
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  const filepath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}

// Memory caches loaded from disk
export const db = {
  getUsers: () => readJsonFile<User[]>("users.json", []),
  saveUsers: (users: User[]) => writeJsonFile("users.json", users),

  getDocs: () => readJsonFile<StudyDoc[]>("docs.json", []),
  saveDocs: (docs: StudyDoc[]) => writeJsonFile("docs.json", docs),

  getSummaries: () => readJsonFile<DocSummary[]>("summaries.json", []),
  saveSummaries: (summaries: DocSummary[]) => writeJsonFile("summaries.json", summaries),

  getNotes: () => readJsonFile<Note[]>("notes.json", []),
  saveNotes: (notes: Note[]) => writeJsonFile("notes.json", notes),

  getFlashcards: () => readJsonFile<Flashcard[]>("flashcards.json", []),
  saveFlashcards: (flashcards: Flashcard[]) => writeJsonFile("flashcards.json", flashcards),

  getQuizzes: () => readJsonFile<Quiz[]>("quizzes.json", []),
  saveQuizzes: (quizzes: Quiz[]) => writeJsonFile("quizzes.json", quizzes),

  getQuizAttempts: () => readJsonFile<QuizAttempt[]>("quiz_attempts.json", []),
  saveQuizAttempts: (attempts: QuizAttempt[]) => writeJsonFile("quiz_attempts.json", attempts),

  getChats: () => readJsonFile<AIChat[]>("chats.json", []),
  saveChats: (chats: AIChat[]) => writeJsonFile("chats.json", chats),

  getPlans: () => readJsonFile<StudyPlan[]>("plans.json", []),
  savePlans: (plans: StudyPlan[]) => writeJsonFile("plans.json", plans),

  getNotifications: () => readJsonFile<Notification[]>("notifications.json", []),
  saveNotifications: (notifications: Notification[]) => writeJsonFile("notifications.json", notifications),

  getSettings: () => readJsonFile<UserSettings[]>("settings.json", []) ,
  saveSettings: (settings: UserSettings[]) => writeJsonFile("settings.json", settings),
};

// Bootstrap database with rich seed data for a professional look and feel
export function seedDatabase() {
  const users = db.getUsers();
  if (users.length === 0) {
    const seedUser: User = {
      id: "user-123",
      name: "Alex Mercer",
      email: "maansgh21@gmail.com", // Set default to user email from environment
      role: Role.USER,
      isVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      xp: 1250,
      streak: 5,
      lastActiveDate: new Date().toISOString().split("T")[0],
      badges: ["First Upload", "Quiz Master", "7-Day Streak"],
      createdAt: new Date().toISOString()
    };
    db.saveUsers([seedUser]);

    const seedSettings: UserSettings = {
      userId: "user-123",
      theme: "light",
      voiceSpeed: 1.0,
      language: "en"
    };
    db.saveSettings([seedSettings]);

    // Preloaded Document 1
    const doc1: StudyDoc = {
      id: "doc-1",
      userId: "user-123",
      title: "Introduction to Operating Systems.txt",
      subject: "Computer Science",
      uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      pageCount: 3,
      fileSize: "24 KB",
      fileType: "txt",
      processingStatus: "processed",
      extractedContent: `An Operating System (OS) is software that acts as an interface between computer hardware components and the user. Every computer system must have at least one operating system to run other programs.
Applications like MS Word, Chrome, and games need some environment in which it runs and performs its tasks.

Major Functions of Operating Systems:
1. Process Management: The OS manages process execution, scheduling, creation, and termination. It allocates CPU cycles to different tasks.
2. Memory Management: Allocation and deallocation of primary memory (RAM) as programs require it.
3. File System Management: Managing directories, files, storage devices, and disk access.
4. Device Management: Using device drivers to facilitate communication with printers, monitors, keyboards, etc.
5. Security & Protection: Ensuring secure user login, setting access permissions, and guarding against unauthorized access.

Types of Operating Systems:
- Batch OS: Executes jobs in batches without interactive user control.
- Time-Sharing (Multitasking) OS: Enables multiple users to share resources simultaneously (e.g., Linux, Windows).
- Real-Time OS (RTOS): Used where strict timing constraints exist, such as embedded systems, robotics, and aviation.
- Distributed OS: Manages a group of independent computers and makes them appear to be a single system.`
    };

    // Preloaded Document 2
    const doc2: StudyDoc = {
      id: "doc-2",
      userId: "user-123",
      title: "Cloud Computing Fundamentals.txt",
      subject: "Information Technology",
      uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      pageCount: 5,
      fileSize: "32 KB",
      fileType: "txt",
      processingStatus: "processed",
      extractedContent: `Cloud computing is the on-demand delivery of IT resources over the Internet with pay-as-you-go pricing. Instead of buying, owning, and maintaining physical data centers and servers, you can access technology services, such as computing power, storage, and databases, on an as-needed basis from a cloud provider like Amazon Web Services (AWS), Microsoft Azure, or Google Cloud Platform (GCP).

Key Characteristics of Cloud Computing:
1. On-Demand Self-Service: Users can provision computing capabilities automatically without requiring human interaction with the service provider.
2. Broad Network Access: Capabilities are available over the network and accessed through standard mechanisms (e.g., mobile phones, tablets, laptops).
3. Resource Pooling: The provider's computing resources are pooled to serve multiple consumers using a multi-tenant model.
4. Rapid Elasticity: Capabilities can be elastically provisioned and released, scaling outward and inward dynamically with demand.
5. Measured Service: Cloud systems automatically control and optimize resource use by leveraging a metering capability.

Cloud Service Models:
- Infrastructure as a Service (IaaS): Offers basic compute, storage, and networking resources (e.g., AWS EC2, Google Compute Engine).
- Platform as a Service (PaaS): Provides a platform allowing customers to develop, run, and manage applications without the complexity of building the infrastructure (e.g., Heroku, Google App Engine).
- Software as a Service (SaaS): Delivers fully functioning software applications over the web on a subscription model (e.g., Gmail, Microsoft 365, Slack).`
    };

    db.saveDocs([doc1, doc2]);

    // Seed Summaries
    const summary1: DocSummary = {
      id: "sum-1",
      docId: "doc-1",
      shortSummary: "A comprehensive guide on operating systems, detailing their core definitions, functions, and standard types.",
      detailedSummary: "This document serves as an introductory textbook module on Operating Systems (OS). It establishes that the OS functions as a crucial mediator between hardware and users. It elaborates on five primary functions: Process Management, Memory Allocation, File System control, Device Input/Output, and Security Protocols. It further categories systems into Batch processing, Time-sharing, Real-time constraints, and Distributed networks.",
      bulletNotes: [
        "Operating systems act as a bridge between the physical hardware and human users.",
        "Crucial functions include managing CPU scheduler, RAM allocations, disk files, hardware peripherals, and user permissions.",
        "Batch OS runs tasks grouped sequentially without active user intervention.",
        "Time-Sharing OS allows many interactive sessions by rapidly swapping computing cycles.",
        "Real-Time OS (RTOS) guarantees strict milliseconds-bound response times, crucial in medical or defense machinery."
      ],
      keyConcepts: [
        { concept: "Operating System", definition: "System software managing computer hardware resources and providing common services for applications." },
        { concept: "Process Management", definition: "The mechanism of controlling active execution units, utilizing scheduling algorithms to share CPU cycles." }
      ],
      importantDefinitions: [
        { term: "RAM Allocation", explanation: "The division of primary address space among running software tasks to execute instructions securely." },
        { term: "RTOS", explanation: "Real-Time Operating System designed to handle process execution with deterministic scheduling and microscopic delays." }
      ]
    };

    const summary2: DocSummary = {
      id: "sum-2",
      docId: "doc-2",
      shortSummary: "An introduction to Cloud Computing concepts, characteristics, and SaaS/PaaS/IaaS service paradigms.",
      detailedSummary: "Cloud Computing replaces traditional capital-intensive servers with utility-based Internet deployments. This text outlines the five fundamental pillars (On-Demand, Broad Network Access, Resource Pooling, Rapid Elasticity, and Metered billing). It breaks down the classic stack: IaaS (raw machines), PaaS (development sandboxes), and SaaS (ready-made web applications).",
      bulletNotes: [
        "Cloud Computing treats digital infrastructure as an on-demand utility like electricity.",
        "Broad network access enables clients to interact with data servers from any browser or smartphone.",
        "Elasticity refers to scaling resources automatically to handle viral web spikes and scale down during quiet hours.",
        "SaaS stands for Software as a Service, distributing direct applications via web interfaces."
      ],
      keyConcepts: [
        { concept: "Cloud Computing", definition: "Providing database space, server memory, and software intelligence as a subscription service over the web." },
        { concept: "Elasticity", definition: "The automated capacity to expand or shrink virtual CPU and storage pools based on real-time traffic." }
      ],
      importantDefinitions: [
        { term: "IaaS", explanation: "Infrastructure as a Service, leasing core hardware virtual machines, virtual networks, and raw hard drives." },
        { term: "PaaS", explanation: "Platform as a Service, giving pre-configured environments where coders upload scripts without handling server OS patches." }
      ]
    };

    db.saveSummaries([summary1, summary2]);

    // Seed Notes
    const note1: Note = {
      id: "note-1",
      userId: "user-123",
      docId: "doc-1",
      title: "Core OS Concepts - Study Guide",
      subject: "Computer Science",
      content: `### Operating System Architecture Notes

#### 1. Core Services
* **CPU Virtualization**: Making one physical processor appear as multiple virtual CPUs.
* **Concurrency**: Managing multiple concurrent threads of execution without race conditions.
* **Persistence**: Structuring physical disks into clean directories and file handles.

#### 2. Key Terms to Remember
* **Kernel**: The innermost core of the OS with absolute hardware access privileges.
* **System Call**: An API that safe-gates user applications transitioning into privileged kernel execution mode.
* **Interrupt**: A hardware signal alerting the processor to pause its current work and handle an urgent external event.`,
      isAiGenerated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.saveNotes([note1]);

    // Seed Flashcards
    const flashcards: Flashcard[] = [
      {
        id: "fc-1",
        userId: "user-123",
        docId: "doc-1",
        subject: "Computer Science",
        front: "What is the primary role of an Operating System?",
        back: "To act as an intermediary interface between physical hardware components and the software applications/users, coordinating resources.",
        isBookmarked: true,
        isLearned: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "fc-2",
        userId: "user-123",
        docId: "doc-1",
        subject: "Computer Science",
        front: "Explain the difference between a Batch OS and a Multitasking OS.",
        back: "Batch OS runs pre-grouped sequences of non-interactive jobs. Multitasking OS shares CPU time dynamically among multiple interactive users/apps.",
        isBookmarked: false,
        isLearned: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "fc-3",
        userId: "user-123",
        docId: "doc-2",
        subject: "Information Technology",
        front: "What is Rapid Elasticity in Cloud Computing?",
        back: "The ability to dynamically and automatically provision or deprovision computing resource pools (CPU, RAM, storage) in immediate response to changing load demands.",
        isBookmarked: false,
        isLearned: false,
        createdAt: new Date().toISOString()
      }
    ];

    db.saveFlashcards(flashcards);

    // Seed Quiz
    const quiz1: Quiz = {
      id: "quiz-1",
      userId: "user-123",
      docId: "doc-1",
      title: "Operating Systems Fundamentals Quiz",
      subject: "Computer Science",
      questions: [
        {
          id: "q-1",
          type: "mcq",
          question: "Which of the following functions is responsible for managing directories, storage devices, and disk access?",
          options: ["Process Management", "Memory Management", "File System Management", "Device Management"],
          correctAnswer: "File System Management",
          explanation: "File System Management controls how data is structured, read, and stored on physical disks and virtual directory handles."
        },
        {
          id: "q-2",
          type: "boolean",
          question: "A Real-Time Operating System (RTOS) is primarily used where strict timing limits must be guaranteed.",
          correctAnswer: "True",
          explanation: "True. RTOS executes programs with deterministic timing schedules, essential for medical implants, automotive breaking, or industrial sensors."
        },
        {
          id: "q-3",
          type: "fill",
          question: "The innermost core of the operating system that has absolute hardware access privileges is called the ________.",
          correctAnswer: "kernel",
          explanation: "The kernel sits at the absolute center of OS architectures, loading system drivers and interacting directly with motherboard silicon."
        }
      ],
      createdAt: new Date().toISOString()
    };

    db.saveQuizzes([quiz1]);

    // Seed Quiz Attempt
    const attempt1: QuizAttempt = {
      id: "att-1",
      userId: "user-123",
      quizId: "quiz-1",
      quizTitle: "Operating Systems Fundamentals Quiz",
      score: 100,
      totalQuestions: 3,
      correctAnswers: 3,
      wrongAnswers: 0,
      attemptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    };

    db.saveQuizAttempts([attempt1]);

    // Seed AIChat
    const chat1: AIChat = {
      id: "chat-1",
      userId: "user-123",
      docId: "doc-1",
      docTitle: "Introduction to Operating Systems.txt",
      title: "Operating Systems Basics Inquiry",
      messages: [
        { sender: "user", text: "What is an Operating System?", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
        { sender: "ai", text: "Based on your study material, an Operating System (OS) is software that acts as an interface between computer hardware components and the user. Every computer system must have at least one operating system to run other programs.", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000 + 1000).toISOString() }
      ],
      updatedAt: new Date().toISOString()
    };

    db.saveChats([chat1]);

    // Seed Study Plan
    const plan1: StudyPlan = {
      id: "plan-1",
      userId: "user-123",
      examDate: "2026-08-15",
      subjects: ["Computer Science", "Information Technology"],
      dailyStudyHours: 3,
      schedule: [
        {
          day: "Monday",
          topics: [
            { topic: "Operating System Functions", completed: true, missed: false },
            { topic: "RAM vs ROM Allocations", completed: false, missed: true }
          ]
        },
        {
          day: "Tuesday",
          topics: [
            { topic: "Cloud Deployment Types", completed: true, missed: false },
            { topic: "IaaS vs PaaS Architectures", completed: true, missed: false }
          ]
        },
        {
          day: "Wednesday",
          topics: [
            { topic: "Quiz: Operating Systems Basics", completed: true, missed: false }
          ]
        },
        {
          day: "Thursday",
          topics: [
            { topic: "SaaS Models & Characteristics", completed: false, missed: false }
          ]
        }
      ],
      createdAt: new Date().toISOString()
    };

    db.savePlans([plan1]);

    // Seed Notifications
    const notifications: Notification[] = [
      {
        id: "notif-1",
        userId: "user-123",
        message: "Your uploaded document 'Introduction to Operating Systems.txt' has been processed successfully.",
        type: "success",
        isRead: false,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "notif-2",
        userId: "user-123",
        message: "A new AI Quiz has been generated for you based on 'Cloud Computing Fundamentals.txt'. Try it now!",
        type: "info",
        isRead: false,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "notif-3",
        userId: "user-123",
        message: "Fantastic! You maintained your 5-day study streak today. Keep up the high focus!",
        type: "success",
        isRead: true,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];

    db.saveNotifications(notifications);
  }
}
