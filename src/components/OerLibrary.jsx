import { useState, useEffect } from "react";
import { Search, Shield } from "lucide-react";
import { api } from "../services/api";
export const OerLibrary = ({ currentStudent }) => {
  const [corpus, setCorpus] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState(
    currentStudent?.gradeLevel || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (currentStudent?.gradeLevel) {
      setSelectedGrade(currentStudent.gradeLevel);
    }
  }, [currentStudent?.id, currentStudent?.gradeLevel]);
  useEffect(() => {
    loadCorpus();
  }, [selectedSubject]);
  const loadCorpus = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOerCorpus({
        subject: selectedSubject !== "all" ? selectedSubject : void 0
      });
      setCorpus(data.corpus);
      if (data.corpus.length > 0 && !selectedDoc) {
        setSelectedDoc(data.corpus[0]);
      }
    } catch (err) {
      console.error("Failed to load NCERT corpus:", err);
    } finally {
      setIsLoading(false);
    }
  };
  const filteredDocs = corpus.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.chapter.toLowerCase().includes(searchQuery.toLowerCase()) || d.keyConcepts.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGrade = selectedGrade === "all" || selectedGrade === "Grade 11-12" && d.gradeLevel === "Grade 11-12" || selectedGrade === "Grade 9-10" && d.gradeLevel === "Grade 9-10" || selectedGrade === "Grade 6-8" && d.gradeLevel === "Grade 6-8";
    return matchesSearch && matchesGrade;
  });
  return <div id="oer-library-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
      {
    /* Streamlined Header */
  }
      <div className="bg-white border border-[#E5E7EB] p-4 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-0.5">
            Grounded RAG Knowledge Index
          </span>
          <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">
            NCERT National Curriculum Knowledge Base
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Transparent index of NCERT Class 11, 12, 9, 10, and middle school textbooks across Mathematics, Physics, Chemistry, and Biology.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-1.5 font-bold uppercase tracking-wider text-[#4B5563]">
          <Shield className="w-3.5 h-3.5 text-black" />
          <span>NCERT Open National Curriculum Standard</span>
        </div>
      </div>

      {
    /* Filter & Search Bar */
  }
      <div className="bg-white border border-[#E5E7EB] p-3 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {
    /* Class Filter */
  }
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF]">Class:</span>
            {[
    { label: "All Classes", value: "all" },
    { label: "Class 11 & 12", value: "Grade 11-12" },
    { label: "Class 9 & 10", value: "Grade 9-10" },
    { label: "Class 6 to 8", value: "Grade 6-8" }
  ].map((gr) => <button
    key={gr.value}
    onClick={() => setSelectedGrade(gr.value)}
    className={`text-[11px] px-2.5 py-1 border transition-colors font-medium ${selectedGrade === gr.value ? "bg-black text-white border-black font-semibold" : "bg-[#F8F9FA] text-[#4B5563] border-[#E5E7EB] hover:bg-[#E5E7EB]"}`}
  >
                {gr.label}
              </button>)}
          </div>

          {
    /* Subject Filter */
  }
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF]">Subject:</span>
            {["all", "Mathematics", "Physics", "Chemistry", "Biology"].map((subj) => <button
    key={subj}
    onClick={() => setSelectedSubject(subj)}
    className={`text-[11px] px-2.5 py-1 border transition-colors font-medium ${selectedSubject === subj ? "bg-black text-white border-black font-semibold" : "bg-[#F8F9FA] text-[#4B5563] border-[#E5E7EB] hover:bg-[#E5E7EB]"}`}
  >
                {subj === "all" ? "All Subjects" : subj}
              </button>)}
          </div>
        </div>

        {
    /* Search */
  }
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
          <input
    type="text"
    placeholder="Search chapters or formulas..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] pl-8 pr-3 py-1.5 text-xs text-[#1A1A1A] outline-none"
  />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {
    /* Document Directory List (5 cols) */
  }
        <div className="lg:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
          {filteredDocs.map((doc) => {
    const isSelected = selectedDoc?.id === doc.id;
    return <div
      key={doc.id}
      onClick={() => setSelectedDoc(doc)}
      className={`p-3 border text-xs cursor-pointer transition-colors ${isSelected ? "border-black bg-[#F8F9FA]" : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"}`}
    >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-[#1A1A1A] text-sm">{doc.title}</span>
                  <span className="bg-black text-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0">
                    {doc.publisher}
                  </span>
                </div>
                <p className="text-[#4B5563] text-xs mb-1.5">
                  {doc.chapter} &bull; <span className="text-[#6B7280]">{doc.section}</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {doc.keyConcepts.slice(0, 3).map((concept, i) => <span key={i} className="bg-[#F0F2F5] text-[#374151] px-1.5 py-0.5 text-[10px] font-mono">
                      {concept}
                    </span>)}
                </div>
              </div>;
  })}
        </div>

        {
    /* Selected Document Full View (7 cols) */
  }
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] p-5">
          {selectedDoc ? <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF]">
                    {selectedDoc.subject} &bull; {selectedDoc.gradeLevel}
                  </span>
                  <h3 className="text-base font-bold text-[#1A1A1A] mt-0.5">
                    {selectedDoc.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {selectedDoc.chapter} &bull; {selectedDoc.section}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#9CA3AF] shrink-0">
                  {selectedDoc.license}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">Official Reference:</span>
                <p className="text-xs text-[#1A1A1A] bg-[#F8F9FA] p-2 border border-[#E5E7EB] font-mono">
                  {selectedDoc.pageOrRef}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">Core Summary:</span>
                <p className="text-xs text-[#374151] leading-relaxed bg-[#F8F9FA] p-3 border border-[#E5E7EB] font-sans">
                  {selectedDoc.summary}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">NCERT Textbook Content:</span>
                <div className="whitespace-pre-wrap font-mono text-xs text-[#1A1A1A] leading-relaxed bg-[#F8F9FA] p-3.5 border border-[#E5E7EB] overflow-x-auto max-h-72">
                  {selectedDoc.content}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">Indexed Concept Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoc.keyConcepts.map((concept, idx) => <span
    key={idx}
    className="bg-white text-[#1A1A1A] border border-[#E5E7EB] px-2 py-0.5 text-xs font-mono"
  >
                      {concept}
                    </span>)}
                </div>
              </div>
            </div> : <div className="text-center py-16 text-[#9CA3AF] text-xs">
              Select an NCERT chapter from the list to view the indexed textbook passage and derivations.
            </div>}
        </div>
      </div>
    </div>;
};
