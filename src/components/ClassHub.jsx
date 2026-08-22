import { useState } from "react";
import {
  Calendar,
  BookOpen,
  Clock,
  User,
  Building,
  ShieldCheck
} from "lucide-react";
export const ClassHub = ({ currentStudent, classInfo }) => {
  const info = classInfo || currentStudent?.classInfo;
  const [selectedDay, setSelectedDay] = useState("Monday");
  if (!info) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 text-center">
        <div className="bg-white border border-[#E5E7EB] p-8 max-w-md mx-auto">
          <BookOpen className="w-8 h-8 mx-auto text-[#6B7280] mb-3" />
          <h3 className="font-bold text-sm text-[#1A1A1A]">No Class Details Linked</h3>
          <p className="text-xs text-[#6B7280] mt-1">
            You are currently browsing as an independent student. Register with a class code to link your school timetable and syllabus.
          </p>
        </div>
      </div>;
  }
  const currentTimetableDay = info.timetable?.find((t) => t.day === selectedDay) || info.timetable?.[0];
  return <div id="class-hub-container" className="max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-5">
      {
    /* Class Header Banner */
  }
      <div className="bg-white border border-[#E5E7EB] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0F2F5] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                Class Code: {info.classCode}
              </span>
              <span className="text-xs text-[#6B7280] font-medium">
                Academic Year {info.academicYear}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">
              {info.className}
            </h1>
            <p className="text-xs text-[#4B5563] flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>{info.school}</span>
              <span className="text-[#D1D5DB]">&bull;</span>
              <User className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Teacher In-Charge: <strong>{info.teacherName}</strong></span>
            </p>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E5E7EB] p-3 text-right text-xs">
            <div className="text-[10px] uppercase font-bold text-[#9CA3AF]">Curriculum Framework</div>
            <div className="font-bold text-[#1A1A1A]">{info.curriculum}</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">Stream: {info.stream}</div>
          </div>
        </div>

        {
    /* Subjects Badges */
  }
        <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">Core NCERT Subjects:</span>
            {info.subjects.map((sub) => <span key={sub} className="bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 text-xs font-semibold text-[#1A1A1A]">
                {sub}
              </span>)}
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Private Student Environment &bull; Classmates' data is hidden</span>
          </div>
        </div>
      </div>

      {
    /* Two Column Layout: Weekly Timetable & Syllabus Roadmap */
  }
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {
    /* Left Column: Weekly Timetable (7 cols) */
  }
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-[#E5E7EB]">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-black" />
                <h2 className="text-sm font-bold text-[#1A1A1A]">
                  Weekly Class Timetable
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#6B7280]">
                NCERT Period Breakdown
              </span>
            </div>

            {
    /* Day Selector Tabs */
  }
            <div className="flex border-b border-[#E5E7EB] bg-[#FAFAFA] overflow-x-auto">
              {info.timetable?.map((daySchedule) => <button
    key={daySchedule.day}
    onClick={() => setSelectedDay(daySchedule.day)}
    className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${selectedDay === daySchedule.day ? "border-black text-[#1A1A1A] bg-white" : "border-transparent text-[#6B7280] hover:text-black"}`}
  >
                  {daySchedule.day}
                </button>)}
            </div>

            {
    /* Timetable Period List */
  }
            <div className="p-4 space-y-2.5">
              {currentTimetableDay && currentTimetableDay.periods.length > 0 ? currentTimetableDay.periods.map((p) => <div
    key={p.periodNumber}
    className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#9CA3AF] transition-colors flex items-start justify-between gap-3"
  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-black text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                        {p.periodNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#1A1A1A]">
                            {p.subject}
                          </span>
                          <span className="text-[10px] bg-white border border-[#E5E7EB] px-1.5 py-0.2 font-mono text-[#4B5563]">
                            {p.room}
                          </span>
                        </div>
                        <p className="text-xs text-[#4B5563] mt-0.5 font-medium">
                          {p.topic}
                        </p>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                          Faculty: {p.teacher}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono font-medium text-[#6B7280] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#9CA3AF]" />
                        <span>{p.time}</span>
                      </span>
                    </div>
                  </div>) : <p className="text-xs text-[#6B7280] p-4 text-center">No periods scheduled for this day.</p>}
            </div>
          </div>
        </div>

        {
    /* Right Column: Syllabus Roadmap (5 cols) */
  }
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E5E7EB]">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-black" />
                <h2 className="text-sm font-bold text-[#1A1A1A]">
                  NCERT Syllabus Roadmap
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#6B7280]">
                {info.syllabus?.length || 0} Units
              </span>
            </div>

            <div className="p-4 space-y-3 max-h-[540px] overflow-y-auto">
              {info.syllabus?.map((unit) => <div
    key={unit.unitNumber}
    className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] space-y-2"
  >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">
                        Unit {unit.unitNumber} &bull; {unit.subject}
                      </span>
                      <h3 className="text-xs font-bold text-[#1A1A1A]">
                        {unit.unitTitle}
                      </h3>
                    </div>
                    <span
    className={`text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wider shrink-0 ${unit.status === "Completed" ? "bg-emerald-100 text-emerald-800" : unit.status === "In Progress" ? "bg-blue-100 text-blue-800" : "bg-[#E5E7EB] text-[#4B5563]"}`}
  >
                      {unit.status}
                    </span>
                  </div>

                  {
    /* Chapters List */
  }
                  <div className="text-[11px] text-[#4B5563] space-y-0.5">
                    {unit.chapters.map((ch, idx) => <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-[#9CA3AF] rounded-full" />
                        <span>{ch}</span>
                      </div>)}
                  </div>

                  {
    /* Weightage and Period breakdown */
  }
                  <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[10px] font-mono text-[#6B7280]">
                    <span>Board Weightage: <strong>{unit.weightageMarks} Marks</strong></span>
                    <span>Total Periods: <strong>{unit.totalPeriods}</strong></span>
                  </div>
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
