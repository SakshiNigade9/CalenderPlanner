import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "College Report"
  );

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data, title) => {
  const doc = new jsPDF();

  doc.text(title, 14, 10);

  autoTable(doc, {
    head: [["College", "Completed", "Pending", "Performance"]],
    body: data.map((item) => [
      item.name,
      item.completed,
      item.pending,
      item.performance,
    ]),
  });

  doc.save(`${title}.pdf`);
};