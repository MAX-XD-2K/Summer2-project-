import React, { useState } from "react";
import { 
  UploadCloud, FileText, Trash2, Edit2, Download, Eye, 
  BookMarked, Sparkles, CheckCircle, AlertCircle, X, Search, FileDown 
} from "lucide-react";
import { StudyDoc, DocSummary } from "../types";

interface DocumentsViewProps {
  documents: StudyDoc[];
  theme: "dark" | "light";
  onDocumentUploaded: () => void;
  user: any;
}

export default function DocumentsView({ documents, theme, onDocumentUploaded, user }: DocumentsViewProps) {
  const isDark = theme === "dark";
  const [dragActive, setDragActive] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Computer Science");
  const [fileType, setFileType] = useState<"pdf" | "docx" | "pptx" | "txt">("txt");
  const [pasteContent, setPasteContent] = useState("");
  const [fileSizeStr, setFileSizeStr] = useState("");
  const [uploading, setUploading] = useState(false);

  // Search and Filters
  const [searchFilter, setSearchFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");

  // Summarize Modal State
  const [activeSummaryDoc, setActiveSummaryDoc] = useState<StudyDoc | null>(null);
  const [docSummary, setDocSummary] = useState<DocSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Inline rename state
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const subjects = ["All", "Computer Science", "Information Technology", "Business Management", "Engineering", "General Studies"];

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop File
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setTitle(file.name);
      
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (["pdf", "docx", "pptx", "txt"].includes(ext || "")) {
        setFileType(ext as any);
      }
      
      const sizeKb = Math.round(file.size / 1024);
      setFileSizeStr(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);

      const reader = new FileReader();
      reader.onload = (event) => {
        setPasteContent(event.target?.result as string || "");
      };
      reader.readAsText(file);
    }
  };

  // Custom File Selector
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTitle(file.name);
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (["pdf", "docx", "pptx", "txt"].includes(ext || "")) {
        setFileType(ext as any);
      }
      const sizeKb = Math.round(file.size / 1024);
      setFileSizeStr(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);

      const reader = new FileReader();
      reader.onload = (event) => {
        setPasteContent(event.target?.result as string || "");
      };
      reader.readAsText(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !pasteContent) {
      alert("Please enter document details and paste syllabus or textbook notes content to parse.");
      return;
    }

    setUploading(true);
    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify({
          title,
          subject,
          fileType,
          content: pasteContent,
          fileSize: fileSizeStr || "18 KB"
        })
      });

      if (response.ok) {
        setTitle("");
        setPasteContent("");
        setFileSizeStr("");
        onDocumentUploaded();
      } else {
        const data = await response.json();
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload service error");
    } finally {
      setUploading(false);
    }
  };

  // Fetch Summary Modal data
  const handleViewSummary = async (doc: StudyDoc) => {
    setActiveSummaryDoc(doc);
    setLoadingSummary(true);
    setDocSummary(null);

    try {
      const response = await fetch(`/api/documents/${doc.id}/summary`, {
        headers: { "x-user-id": user?.id || "user-123" }
      });
      if (response.ok) {
        const data = await response.json();
        setDocSummary(data.summary);
      } else {
        alert("Syllabus AI is still summarizing this file. Please refresh or check back in a few seconds!");
        setActiveSummaryDoc(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleRename = async (docId: string) => {
    if (!newName.trim()) return;
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "user-123"
        },
        body: JSON.stringify({ title: newName })
      });
      if (response.ok) {
        setRenamingDocId(null);
        setNewName("");
        onDocumentUploaded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document and all its AI notes, flashcards, and quizzes?")) return;
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
        headers: { "x-user-id": user?.id || "user-123" }
      });
      if (response.ok) {
        onDocumentUploaded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export Mock note download
  const handleExportTxt = (doc: StudyDoc) => {
    const text = `STUDY GUIDE: ${doc.title}\nSubject: ${doc.subject}\nDate: ${new Date(doc.uploadDate).toLocaleString()}\n\n---\nExtracted content:\n${doc.extractedContent}`;
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/\.[^/.]+$/, "")}_study_guide.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Filter list
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          doc.subject.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesSubject = subjectFilter === "All" || doc.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight">Syllabus & Document Repository</h2>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Manage your textbooks, lecture notes, slide transcripts, and files.
          </p>
        </div>
      </div>

      {/* Upload area and past content form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload form */}
        <div className={`p-5 rounded-2xl border lg:col-span-2 ${
          isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-100 shadow-sm"
        }`}>
          <h3 className="text-sm font-bold font-display mb-4 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-indigo-500" />
            <span>Ingest Study Material</span>
          </h3>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Document / Module Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Computer Networks Lecture 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border outline-hidden ${
                    isDark ? "bg-[#161e31] border-gray-800 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-200 focus:bg-white text-gray-800"
                  }`}
                />
              </div>

              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Subject Domain
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl border outline-hidden ${
                    isDark ? "bg-[#161e31] border-gray-800 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-200 focus:bg-white text-gray-800"
                  }`}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Business Management">Business Management</option>
                  <option value="Engineering">Engineering</option>
                  <option value="General Studies">General Studies</option>
                </select>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center text-center transition-all ${
                dragActive 
                  ? "border-indigo-500 bg-indigo-500/5" 
                  : isDark ? "border-gray-800 hover:border-gray-700 bg-[#161e31]/30" : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
              }`}
            >
              <UploadCloud className="w-10 h-10 text-gray-400 mb-3 animate-bounce" />
              <p className="text-xs font-semibold">
                Drag and drop your syllabus file here, or{" "}
                <label className="text-indigo-500 hover:text-indigo-400 cursor-pointer select-none">
                  browse files
                  <input type="file" onChange={handleFileChange} className="hidden" accept=".txt,.pdf,.docx,.pptx" />
                </label>
              </p>
              <p className="text-[10px] text-gray-500 mt-2">Supports .txt, .pdf, .docx, .pptx files (Max 50MB)</p>
            </div>

            {/* Paste Content Form */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Material Content Transcript (Paste Textbook Text or Slides transcript)
              </label>
              <textarea
                required
                rows={4}
                placeholder="Paste course slides, textbook syllabus, chapter snippets, or study texts here for RAG chat and quiz generation..."
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                className={`w-full text-xs p-3 rounded-xl border outline-hidden resize-none font-mono ${
                  isDark ? "bg-[#161e31] border-gray-800 text-white focus:border-indigo-500" : "bg-gray-50 border-gray-200 focus:bg-white text-gray-800"
                }`}
              ></textarea>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFileType("pdf")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    fileType === "pdf" ? "bg-red-500/10 border-red-500 text-red-500" : isDark ? "border-gray-800 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}
                >
                  PDF Sim
                </button>
                <button
                  type="button"
                  onClick={() => setFileType("docx")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    fileType === "docx" ? "bg-blue-500/10 border-blue-500 text-blue-500" : isDark ? "border-gray-800 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}
                >
                  DOCX Sim
                </button>
                <button
                  type="button"
                  onClick={() => setFileType("pptx")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    fileType === "pptx" ? "bg-orange-500/10 border-orange-500 text-orange-500" : isDark ? "border-gray-800 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}
                >
                  PPTX Sim
                </button>
                <button
                  type="button"
                  onClick={() => setFileType("txt")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    fileType === "txt" ? "bg-indigo-500/10 border-indigo-500 text-indigo-500" : isDark ? "border-gray-800 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}
                >
                  TXT Text
                </button>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 font-semibold text-xs text-white rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                {uploading ? "Analyzing Syllabus..." : "Ingest & Index Material"}
              </button>
            </div>
          </form>
        </div>

        {/* Info card */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-100 shadow-sm"
        }`}>
          <div className="space-y-4">
            <h4 className="text-xs font-bold font-display uppercase tracking-wider text-indigo-400">AI Processing Engine</h4>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h5 className="text-xs font-bold">Llm Parsing and Embedding</h5>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                  Upon upload, our model parses concepts, builds vector context maps for semantic querying, auto-creates high-yield summaries, bullet reviews, flashcards, and quizzes in under 2 seconds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 mt-4">
              <BookMarked className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold">RAG Ready Mapping</h5>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                  Indexed nodes are safe-gated. Our chat guarantees no hallucinations, responding solely using your document parameters.
                </p>
              </div>
            </div>
          </div>

          <div className={`mt-6 pt-4 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-2">Subject Index Distribution</h5>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between items-center font-semibold">
                <span>Computer Science</span>
                <span className="font-mono">{documents.filter((d) => d.subject === "Computer Science").length} Files</span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span>Information Technology</span>
                <span className="font-mono">{documents.filter((d) => d.subject === "Information Technology").length} Files</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Filter and list */}
      <div className={`p-5 rounded-2xl border ${
        isDark ? "bg-[#111625] border-gray-800" : "bg-white border-gray-100 shadow-sm"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <h3 className="text-sm font-bold font-display">Ingested Courseworks Inventory</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Selector */}
            <div className="flex rounded-lg border border-gray-800 overflow-hidden text-[10px]">
              {subjects.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSubjectFilter(subj)}
                  className={`px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                    subjectFilter === subj
                      ? "bg-indigo-600 text-white font-bold"
                      : isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {subj === "All" ? "All Subjects" : subj}
                </button>
              ))}
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter files..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className={`text-[10px] py-1.5 pl-8 pr-3 rounded-lg border outline-hidden ${
                  isDark ? "bg-[#161e31] border-gray-800 text-white" : "bg-gray-50 border-gray-200 text-gray-700"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Table list of documents */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xs text-gray-500">No documents match the current index criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[10px] font-bold uppercase tracking-wider border-b ${
                  isDark ? "text-gray-400 border-gray-800" : "text-gray-500 border-gray-200"
                }`}>
                  <th className="pb-3 pl-2">Title</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Size</th>
                  <th className="pb-3">Uploaded</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40 text-xs">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className={`group hover:bg-[#161e31]/10 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    <td className="py-3 pl-2">
                      {renamingDocId === doc.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="p-1 rounded-sm border border-indigo-500 bg-[#161e31] text-white text-xs outline-hidden"
                          />
                          <button 
                            onClick={() => handleRename(doc.id)} 
                            className="bg-emerald-500 text-white px-2 py-1 rounded-md text-[9px] font-bold cursor-pointer"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setRenamingDocId(null)} 
                            className="bg-gray-600 text-white px-2 py-1 rounded-md text-[9px] font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold truncate max-w-[220px]">{doc.title}</span>
                          <span className="text-[9px] uppercase bg-gray-800 px-1 rounded-sm font-mono text-gray-500">{doc.fileType}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400">
                        {doc.subject}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-gray-500">{doc.fileSize}</td>
                    <td className="py-3 font-mono text-[11px] text-gray-500">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                    <td className="py-3">
                      {doc.processingStatus === "processed" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-2.5 h-2.5" /> Indexed
                        </span>
                      ) : doc.processingStatus === "pending" ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse">
                          Pending...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewSummary(doc)}
                          disabled={doc.processingStatus !== "processed"}
                          className="p-1.5 rounded-lg border border-gray-800 hover:border-gray-700 bg-indigo-500/10 text-indigo-400 disabled:opacity-40 cursor-pointer"
                          title="View AI Summarization"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setRenamingDocId(doc.id);
                            setNewName(doc.title);
                          }}
                          className="p-1.5 rounded-lg border border-gray-800 hover:border-gray-700 bg-gray-500/10 text-gray-400 cursor-pointer"
                          title="Rename File"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleExportTxt(doc)}
                          className="p-1.5 rounded-lg border border-gray-800 hover:border-gray-700 bg-emerald-500/10 text-emerald-400 cursor-pointer"
                          title="Download Study Material"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 rounded-lg border border-gray-800 hover:border-gray-700 bg-rose-500/10 text-rose-400 cursor-pointer"
                          title="Delete File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Dialog Modal */}
      {activeSummaryDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-3xl rounded-2xl border flex flex-col max-h-[85vh] ${
            isDark ? "bg-[#111625] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-800"
          }`}>
            <div className="flex justify-between items-center p-5 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
                <h3 className="text-sm font-bold font-display">AI Ingestion Intelligence Summary</h3>
              </div>
              <button 
                onClick={() => setActiveSummaryDoc(null)} 
                className="p-1 rounded-lg hover:bg-gray-800/50 cursor-pointer"
              >
                <X className="w-4.5 h-4.5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingSummary ? (
                <div className="space-y-4 py-8 animate-pulse">
                  <div className="h-5 bg-gray-800 rounded-md w-1/3"></div>
                  <div className="h-20 bg-gray-800 rounded-xl"></div>
                  <div className="h-5 bg-gray-800 rounded-md w-1/4"></div>
                  <div className="h-24 bg-gray-800 rounded-xl"></div>
                </div>
              ) : docSummary ? (
                <>
                  {/* Doc Info Bar */}
                  <div className="flex items-center gap-4 text-[10px] font-bold tracking-wider text-gray-500 uppercase font-mono">
                    <span>File: {activeSummaryDoc.title}</span>
                    <span>•</span>
                    <span>Subject: {activeSummaryDoc.subject}</span>
                    <span>•</span>
                    <span>Size: {activeSummaryDoc.fileSize}</span>
                  </div>

                  {/* Short summary */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Brief Overview</h4>
                    <p className="text-sm leading-relaxed">{docSummary.shortSummary}</p>
                  </div>

                  {/* Long summary */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Detailed Lecture Summary</h4>
                    <p className="text-xs leading-relaxed text-gray-400">{docSummary.detailedSummary}</p>
                  </div>

                  {/* Bullet Takeaways */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Key Syllabus Bullet points</h4>
                    <ul className="list-disc list-inside text-xs space-y-1.5 text-gray-300">
                      {docSummary.bulletNotes?.map((bullet, i) => (
                        <li key={i} className="leading-relaxed">{bullet}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Key concepts */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Extracted Key Concepts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {docSummary.keyConcepts?.map((concept, i) => (
                        <div key={i} className="p-3 rounded-xl border border-gray-800/50 bg-[#161d31]/50">
                          <p className="text-xs font-bold text-white">{concept.concept}</p>
                          <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{concept.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Important definitions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Important Definitions & Terms</h4>
                    <div className="space-y-2">
                      {docSummary.importantDefinitions?.map((def, i) => (
                        <div key={i} className="p-2.5 rounded-lg border border-gray-800/20 bg-[#161d31]/20 flex justify-between items-start">
                          <span className="text-xs font-bold text-indigo-400 shrink-0 w-1/4 truncate">{def.term}</span>
                          <span className="text-[10px] text-gray-400 flex-1 leading-relaxed">{def.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 text-rose-500" />
                  <p className="text-xs">Unable to load the parsed AI summary model.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-end shrink-0">
              <button
                onClick={() => setActiveSummaryDoc(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
