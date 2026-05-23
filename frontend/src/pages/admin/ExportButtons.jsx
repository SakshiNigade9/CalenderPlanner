import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

const ExportButtons = ({
  college,
  type,
}) => {

  // OVERALL EXPORT DATA

  const overallData = [
    [
      "No. of Colleges Completed Trainings",
      1,
      0,
      2,
      1,
    ],

    [
      "No. of Presentations",
      196,
      517,
      311,
      212,
    ],

    [
      "Students Sensitized",
      40591,
      107705,
      61716,
      40011,
    ],

    [
      "Impact Activities",
      710,
      321,
      355,
      152,
    ],

    [
      "Impact Outreach",
      7468,
      13852,
      14598,
      6100,
    ],
  ];

  // SINGLE COLLEGE DATA

  const singleCollegeData =
    college?.weeklyData?.map((week) => [

      week.week,

      week.target,
      week.completed,

      week.students,

      week.impactTarget,
      week.impactDone,

      week.outreach,

    ]) || [];

  // PDF EXPORT

  const exportPDF = () => {

    const doc = new jsPDF("landscape");

    doc.setFontSize(18);

    doc.text(
      type === "overall"
        ? "Overall Colleges Report"
        : `${college.name} Report`,
      14,
      20
    );

    autoTable(doc, {

      startY: 30,

      head: [
        type === "overall"
          ? [
              "Particulars",
              "Week 1",
              "Week 2",
              "Week 3",
              "Week 4",
            ]
          : [
              "Week",
              "Presentations Target",
              "Presentations Done",
              "Students",
              "Impact Target",
              "Impact Done",
              "Outreach",
            ],
      ],

      body:
        type === "overall"
          ? overallData
          : singleCollegeData,

      theme: "grid",

      styles: {
        fontSize: 8,
      },

      headStyles: {
        fillColor: [19, 41, 61],
      },
    });

    doc.save(
      type === "overall"
        ? "Overall_Report.pdf"
        : `${college.name}_Report.pdf`
    );
  };

  // EXCEL EXPORT

  const exportExcel = () => {

    const worksheet =
      XLSX.utils.aoa_to_sheet([

        type === "overall"
          ? [
              "Particulars",
              "Week 1",
              "Week 2",
              "Week 3",
              "Week 4",
            ]
          : [
              "Week",
              "Presentations Target",
              "Presentations Done",
              "Students",
              "Impact Target",
              "Impact Done",
              "Outreach",
            ],

        ...(type === "overall"
          ? overallData
          : singleCollegeData),
      ]);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Report"
    );

    const excelBuffer = XLSX.write(
      workbook,
      {
        bookType: "xlsx",
        type: "array",
      }
    );

    const data = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }
    );

    saveAs(
      data,

      type === "overall"
        ? "Overall_Report.xlsx"
        : `${college.name}_Report.xlsx`
    );
  };

  return (

    <div className="flex gap-4 mb-6">

      {/* EXCEL */}

      <button
        onClick={exportExcel}
        className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold"
      >
        Export Excel
      </button>

      {/* PDF */}

      <button
        onClick={exportPDF}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
      >
        Export PDF
      </button>

    </div>
  );
};

export default ExportButtons;