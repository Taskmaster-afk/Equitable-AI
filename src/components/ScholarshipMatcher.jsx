import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Calendar,
  FileCheck,
  ShieldCheck
} from "lucide-react";
import { api } from "../services/api";
export const ScholarshipMatcher = ({ currentStudent }) => {
  const [gradeLevel, setGradeLevel] = useState(currentStudent?.gradeLevel || "Grade 11-12");
  const [annualIncome, setAnnualIncome] = useState(14e4);
  const [category, setCategory] = useState(currentStudent?.category || "OBC");
  const [gender, setGender] = useState(currentStudent?.gender || "Male");
  const [academicScore, setAcademicScore] = useState(currentStudent?.academicScorePercent || 75);
  const [firstGen, setFirstGen] = useState(currentStudent?.firstGenerationLearner || true);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  useEffect(() => {
    if (currentStudent) {
      setGradeLevel(currentStudent.gradeLevel);
      setCategory(currentStudent.category);
      setGender(currentStudent.gender);
      setAcademicScore(currentStudent.academicScorePercent);
      setFirstGen(currentStudent.firstGenerationLearner);
    }
  }, [currentStudent]);
  const runMatch = async () => {
    setIsLoading(true);
    try {
      const res = await api.matchScholarships({
        gradeLevel,
        familyIncomeAnnual: annualIncome,
        category,
        gender,
        academicScorePercent: academicScore,
        firstGenerationLearner: firstGen
      });
      setMatches(res.matches);
      if (res.matches.length > 0) {
        setSelectedScheme(res.matches[0]);
      }
    } catch (err) {
      console.error("Failed to match scholarships:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    runMatch();
  }, [gradeLevel, annualIncome, category, gender, academicScore, firstGen]);
  return <div id="scholarship-matcher-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
      {
    /* Header */
  }
      <div className="bg-white border border-[#E5E7EB] p-4 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-0.5">
            Financial Access & Grants Directory
          </span>
          <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">
            Class 6–12 Public Scholarship & Financial Aid Matcher
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Transparent eligibility matching for government & non-profit grants with verified criteria checks.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#4B5563] bg-[#F8F9FA] border border-[#E5E7EB] px-3 py-1.5 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Advisory Only &bull; Zero Privacy Leak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {
    /* Left Column: Criteria Filter Form (4 Cols) */
  }
        <div className="lg:col-span-4 bg-white border border-[#E5E7EB] p-4 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block">
                Criteria
              </span>
              <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                Student Profile Parameters
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#6B7280]">Live</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">
                Class / Grade:
              </label>
              <select
    value={gradeLevel}
    onChange={(e) => setGradeLevel(e.target.value)}
    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-[#1A1A1A] font-medium outline-none"
  >
                <option value="Grade 11-12">Class 11 & 12 (Higher Secondary)</option>
                <option value="Grade 9-10">Class 9 & 10 (Secondary)</option>
                <option value="Grade 6-8">Class 6 to 8 (Middle)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">
                Family Annual Income: <span className="font-mono text-black font-semibold">₹{annualIncome.toLocaleString()}</span>
              </label>
              <input
    type="range"
    min="50000"
    max="800000"
    step="25000"
    value={annualIncome}
    onChange={(e) => setAnnualIncome(Number(e.target.value))}
    className="w-full accent-black cursor-pointer"
  />
              <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-0.5 font-mono">
                <span>₹50K</span>
                <span>₹3.5L (Cap)</span>
                <span>₹8L</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">
                Category:
              </label>
              <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-[#1A1A1A] font-medium outline-none"
  >
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
                <option value="Minority">Minority Communities</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">
                  Gender:
                </label>
                <select
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-[#1A1A1A] font-medium outline-none"
  >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-1">
                  Marks %:
                </label>
                <input
    type="number"
    min="40"
    max="100"
    value={academicScore}
    onChange={(e) => setAcademicScore(Number(e.target.value))}
    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] px-2.5 py-1 text-xs font-mono"
  />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-[#1A1A1A]">
                <input
    type="checkbox"
    checked={firstGen}
    onChange={(e) => setFirstGen(e.target.checked)}
    className="accent-black"
  />
                <span className="font-medium text-xs">First-Gen High-School Learner</span>
              </label>
            </div>
          </div>
        </div>

        {
    /* Right Column: Matched Schemes List & Detail Pane (8 Cols) */
  }
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-[#E5E7EB] p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E5E7EB]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block">
                  Opportunities
                </span>
                <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Available Aid Schemes ({matches.filter((m) => m.isEligible).length} Eligible)
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {matches.map((item) => {
    const isSelected = selectedScheme?.scheme.id === item.scheme.id;
    return <div
      key={item.scheme.id}
      onClick={() => setSelectedScheme(item)}
      className={`p-3 border text-xs cursor-pointer transition-colors ${isSelected ? "border-black bg-[#F8F9FA]" : item.isEligible ? "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]" : "border-[#E5E7EB] bg-[#F8F9FA] opacity-75"}`}
    >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-[#1A1A1A] text-sm">
                          {item.scheme.title}
                        </h4>
                        <p className="text-[#6B7280] text-xs mt-0.5">
                          {item.scheme.provider} &bull; <span className="font-bold font-mono text-emerald-700">{item.scheme.amountOrBenefit}</span>
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {item.isEligible ? <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Eligible
                          </span> : <span className="bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB] px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-[#9CA3AF]" />
                            Criteria Unmet
                          </span>}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#E5E7EB] text-[#4B5563]">
                      <p className="text-[11px] leading-relaxed">
                        <strong className="text-[#1A1A1A] text-[10px] uppercase tracking-wider">Reason: </strong>
                        {item.plainLanguageReasoning}
                      </p>
                    </div>
                  </div>;
  })}
            </div>
          </div>

          {
    /* Detailed View Card */
  }
          {selectedScheme && <div className="bg-white border border-[#E5E7EB] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#E5E7EB]">
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">
                    {selectedScheme.scheme.title}
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    {selectedScheme.scheme.provider} ({selectedScheme.scheme.providerType})
                  </p>
                </div>

                <a
    href={selectedScheme.scheme.officialPortalUrl}
    target="_blank"
    rel="noreferrer"
    className="clean-button-primary py-1 px-3 text-xs uppercase tracking-wider font-bold"
  >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-[#F8F9FA] p-2.5 border border-[#E5E7EB]">
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-0.5">Grant Value</span>
                  <span className="font-bold font-mono text-emerald-700">{selectedScheme.scheme.amountOrBenefit}</span>
                </div>
                <div className="bg-[#F8F9FA] p-2.5 border border-[#E5E7EB]">
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-0.5">Deadline</span>
                  <span className="font-semibold text-[#1A1A1A] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-[#6B7280]" />
                    {selectedScheme.scheme.deadline}
                  </span>
                </div>
                <div className="bg-[#F8F9FA] p-2.5 border border-[#E5E7EB] col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold block mb-0.5">Income Limit</span>
                  <span className="font-medium text-[#1A1A1A]">{selectedScheme.scheme.maxFamilyIncomeLabel}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A] mb-1 flex items-center gap-1 uppercase tracking-wider">
                  <FileCheck className="w-3.5 h-3.5 text-black" />
                  Required Documents:
                </h4>
                <ul className="space-y-1 text-xs text-[#4B5563] bg-[#F8F9FA] p-2.5 border border-[#E5E7EB]">
                  {selectedScheme.scheme.requiredDocuments.map((doc, idx) => <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-black shrink-0" />
                      <span>{doc}</span>
                    </li>)}
                </ul>
              </div>
            </div>}
        </div>
      </div>
    </div>;
};
