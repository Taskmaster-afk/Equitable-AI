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
  return (
    <div id="scholarship-matcher-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-5">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-[#e2e8f0] dark:border-[#2a2a2a] rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block mb-0.5">
            Financial Access & Grants Directory
          </span>
          <h2 className="text-lg font-bold text-[#111827] dark:text-white tracking-tight">
            Class 6–12 Public Scholarship & Financial Aid Matcher
          </h2>
          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-0.5">
            Transparent eligibility matching for government & non-profit grants with verified criteria checks.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Advisory Only • Privacy Isolated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Criteria Filter Form (4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1a1a1a] border border-[#e2e8f0] dark:border-[#2a2a2a] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] dark:border-[#2a2a2a]">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7280] font-bold block">
                Criteria
              </span>
              <h3 className="text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider">
                Student Profile Parameters
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">Live</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af] font-bold block mb-1">
                Class / Grade:
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="clean-input font-medium"
              >
                <option value="Grade 11-12">Class 11 & 12 (Higher Secondary)</option>
                <option value="Grade 9-10">Class 9 & 10 (Secondary)</option>
                <option value="Grade 6-8">Class 6 to 8 (Middle)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af] font-bold">
                  Family Annual Income:
                </label>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">₹{annualIncome.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="800000"
                step="25000"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#9ca3af] dark:text-[#6b7280] mt-0.5 font-mono">
                <span>₹50K</span>
                <span>₹3.5L (Cap)</span>
                <span>₹8L</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af] font-bold block mb-1">
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="clean-input font-medium"
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
                <label className="text-[10px] uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af] font-bold block mb-1">
                  Gender:
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="clean-input font-medium"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af] font-bold block mb-1">
                  Academic Score (%):
                </label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  value={academicScore}
                  onChange={(e) => setAcademicScore(Number(e.target.value))}
                  className="clean-input font-mono font-bold"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-[#111827] dark:text-white">
                <input
                  type="checkbox"
                  checked={firstGen}
                  onChange={(e) => setFirstGen(e.target.checked)}
                  className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
                />
                <span className="font-semibold text-xs">First-Generation High-School Learner</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Matched Schemes List & Detail Pane (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-[#1a1a1a] border border-[#e2e8f0] dark:border-[#2a2a2a] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e2e8f0] dark:border-[#2a2a2a]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7280] font-bold block">
                  Opportunities
                </span>
                <h3 className="text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wider">
                  Available Aid Schemes ({matches.filter((m) => m.isEligible).length} Eligible)
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {matches.map((item) => {
                const isSelected = selectedScheme?.scheme.id === item.scheme.id;
                return (
                  <div
                    key={item.scheme.id}
                    onClick={() => setSelectedScheme(item)}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs"
                        : item.isEligible
                        ? "border-[#e2e8f0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e2e] hover:border-indigo-300 dark:hover:border-indigo-600"
                        : "border-[#e2e8f0] dark:border-[#2a2a2a] bg-[#f8fafc] dark:bg-[#14141a] opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-[#111827] dark:text-white text-sm">
                          {item.scheme.title}
                        </h4>
                        <p className="text-[#6b7280] dark:text-[#9ca3af] text-xs mt-0.5">
                          {item.scheme.provider} • <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{item.scheme.amountOrBenefit}</span>
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {item.isEligible ? (
                          <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Eligible
                          </span>
                        ) : (
                          <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-neutral-400" />
                            Criteria Unmet
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#e2e8f0] dark:border-[#2a2a2a] text-[#4b5563] dark:text-[#cbd5e1]">
                      <p className="text-[11px] leading-relaxed">
                        <strong className="text-[#111827] dark:text-white text-[10px] uppercase tracking-wider">Reason: </strong>
                        {item.plainLanguageReasoning}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed View Card */}
          {selectedScheme && (
            <div className="bg-white dark:bg-[#1a1a1a] border border-[#e2e8f0] dark:border-[#2a2a2a] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#e2e8f0] dark:border-[#2a2a2a]">
                <div>
                  <h3 className="text-sm font-bold text-[#111827] dark:text-white">
                    {selectedScheme.scheme.title}
                  </h3>
                  <p className="text-xs text-[#6b7280] dark:text-[#9ca3af]">
                    {selectedScheme.scheme.provider} ({selectedScheme.scheme.providerType})
                  </p>
                </div>

                <a
                  href={selectedScheme.scheme.officialPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="clean-button-primary py-1.5 px-3 text-xs uppercase tracking-wider font-bold"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#f8fafc] dark:bg-[#1e1e2e] p-3 rounded-lg border border-[#e2e8f0] dark:border-[#2a2a2a]">
                  <span className="text-[10px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7280] font-bold block mb-0.5">Grant Value</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{selectedScheme.scheme.amountOrBenefit}</span>
                </div>
                <div className="bg-[#f8fafc] dark:bg-[#1e1e2e] p-3 rounded-lg border border-[#e2e8f0] dark:border-[#2a2a2a]">
                  <span className="text-[10px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7280] font-bold block mb-0.5">Deadline</span>
                  <span className="font-semibold text-[#111827] dark:text-white flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    {selectedScheme.scheme.deadline}
                  </span>
                </div>
                <div className="bg-[#f8fafc] dark:bg-[#1e1e2e] p-3 rounded-lg border border-[#e2e8f0] dark:border-[#2a2a2a] col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#9ca3af] dark:text-[#6b7280] font-bold block mb-0.5">Income Limit</span>
                  <span className="font-medium text-[#111827] dark:text-white">{selectedScheme.scheme.maxFamilyIncomeLabel}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#111827] dark:text-white mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Required Documents:
                </h4>
                <ul className="space-y-1.5 text-xs text-[#4b5563] dark:text-[#cbd5e1] bg-[#f8fafc] dark:bg-[#1e1e2e] p-3 rounded-lg border border-[#e2e8f0] dark:border-[#2a2a2a]">
                  {(selectedScheme?.scheme?.requiredDocuments || []).map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
