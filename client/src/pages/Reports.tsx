import { FileText, TrendingUp, Users, Award } from "lucide-react";
import { useState } from "react";

const FORMAT_OPTIONS = ["pdf", "csv", "xlsx", "json"] as const;

function ReportTile({
  report,
}: {
  report: { name: string; description: string };
}) {
  const [format, setFormat] = useState<(typeof FORMAT_OPTIONS)[number]>("pdf");
  const key = reportKeyMap[report.name] || "";

  const generate = async () => {
    if (!key) return alert("Report not available for generation");
    try {
      const params = new URLSearchParams();
      params.set("format", format);
      params.set("save", "1");
      const resp = await fetch(`/api/reports/${key}?${params.toString()}`);
      const data = await resp.json();
      if (data?.success && data?.url) {
        // open saved report
        window.open(data.url, "_blank");
      } else if (data?.success && data?.data && format === "json") {
        // if JSON and server returns inline, open in new tab
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        alert("Failed to generate report");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate report");
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-[#F6FAFD] rounded-xl hover:bg-[#B3CFE5]/30 transition-all group">
      <div className="flex-1">
        <h3 className="font-medium text-[#0A1931] mb-1">{report.name}</h3>
        <p className="text-sm text-gray-600">{report.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <select
          aria-label={`format-${report.name}`}
          value={format}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormat(e.target.value as (typeof FORMAT_OPTIONS)[number])
          }
          className="px-2 py-1 border rounded"
        >
          {FORMAT_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f.toUpperCase()}
            </option>
          ))}
        </select>
        <button
          title="Generate and save report"
          onClick={generate}
          className="px-3 py-2 bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white rounded"
        >
          Generate
        </button>
      </div>
    </div>
  );
}

const reportKeyMap: Record<string, string> = {
  "Employee Directory": "employee_directory",
  "Department Distribution": "department_distribution",
  "Employment Status": "employment_status",
  "New Hires Report": "new_hires",
  "Evaluation Summary": "evaluation_summary",
  "Top Performers": "top_performers",
  "Performance Trends": "performance_trends",
  "Open Positions": "open_positions",
  "Application Pipeline": "application_pipeline",
  "Training Attendance": "training_attendance",
  "Completion Rates": "training_completion",
  "Training Costs": "training_costs",
  "Skills Development": "skills_development",
};

export default function Reports() {
  const reportCategories = [
    {
      title: "Employee Reports",
      icon: Users,
      bgColor: "from-[#0A1931] to-[#1A3D63]",
      reports: [
        {
          name: "Employee Directory",
          description: "Complete list of all employees",
        },
        {
          name: "Department Distribution",
          description: "Employees by department",
        },
        {
          name: "Employment Status",
          description: "Active, inactive, and on-leave employees",
        },
        { name: "New Hires Report", description: "Recently hired employees" },
      ],
    },
    {
      title: "Performance Reports",
      icon: TrendingUp,
      bgColor: "from-[#1A3D63] to-[#4A7FA7]",
      reports: [
        {
          name: "Evaluation Summary",
          description: "Overview of all evaluations",
        },
        { name: "Top Performers", description: "Highest scoring employees" },
        { name: "Performance Trends", description: "Performance over time" },
        { name: "Goals Achievement", description: "Goal completion rates" },
      ],
    },
    {
      title: "Recruitment Reports",
      icon: FileText,
      bgColor: "from-[#4A7FA7] to-[#1A3D63]",
      reports: [
        { name: "Open Positions", description: "Current job openings" },
        {
          name: "Application Pipeline",
          description: "Application status breakdown",
        },
        { name: "Time to Hire", description: "Hiring process duration" },
        {
          name: "Candidate Sources",
          description: "Where applicants come from",
        },
      ],
    },
    {
      title: "Training Reports",
      icon: Award,
      bgColor: "from-[#1A3D63] to-[#0A1931]",
      reports: [
        {
          name: "Training Attendance",
          description: "Participation statistics",
        },
        { name: "Completion Rates", description: "Training completion data" },
        { name: "Training Costs", description: "Budget and expenses" },
        {
          name: "Skills Development",
          description: "Skill acquisition tracking",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0A1931]">Reports</h1>
        <p className="text-gray-600 mt-1">
          Generate and export HR analytics reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.title}
              className="bg-white rounded-2xl p-6 shadow-lg shadow-blue-100/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${category.bgColor} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="text-white" size={24} />
                </div>
                <h2 className="text-xl font-bold text-[#0A1931]">
                  {category.title}
                </h2>
              </div>

              <div className="space-y-3">
                {category.reports.map((report) => (
                  <ReportTile key={report.name} report={report} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-blue-100/50">
        <h2 className="text-xl font-bold text-[#0A1931] mb-4">
          Export Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#0A1931] to-[#1A3D63] text-white rounded-xl hover:shadow-lg transition-all">
            <FileText size={20} />
            Export as PDF
          </button>
          <button className="flex items-center justify-center gap-3 px-6 py-4 bg-[#B3CFE5] text-[#0A1931] rounded-xl hover:bg-[#4A7FA7] hover:text-white transition-all">
            <FileText size={20} />
            Export as Excel
          </button>
          <button className="flex items-center justify-center gap-3 px-6 py-4 bg-[#B3CFE5] text-[#0A1931] rounded-xl hover:bg-[#4A7FA7] hover:text-white transition-all">
            <FileText size={20} />
            Export as CSV
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#0A1931] to-[#1A3D63] rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Custom Reports</h2>
        <p className="text-[#B3CFE5] mb-6">
          Need a specialized report? Contact the system administrator to create
          custom analytics tailored to your needs.
        </p>
        <button className="px-6 py-3 bg-white text-[#0A1931] rounded-xl font-medium hover:bg-[#B3CFE5] transition-all">
          Request Custom Report
        </button>
      </div>
    </div>
  );
}
