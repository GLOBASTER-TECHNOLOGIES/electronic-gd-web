import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Entry {
  entryNo: number;
  timeOfSubmission: string;
  abstract: string;
  details: string;
  signature: {
    officerName: string;
    rank: string;
    post: string;
    forceNumber: string;
  };
}

interface GDData {
  division: string;
  post: string;
  diaryDate: string;
  pageSerialNo: number;
  entries: Entry[];
}

export const generateGDPDF = (gd: GDData) => {
  const doc = new jsPDF();

  // --- 1. HEADER SECTION (Mimicking the Paper Form) ---
  
  // Top Right Code
  doc.setFontSize(8);
  doc.text("R.S.B./F. 2/RPF/G. 2", 150, 10);
  doc.text("P.L.83055022", 160, 14);

  // Main Titles (Center)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("INDIAN RAILWAYS", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.text("RAILWAY PROTECTION FORCE", 105, 26, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Daily Diary (Roznamacha)", 105, 32, { align: "center" });

  // --- 2. METADATA ROW (Division | Date | Post) ---
  const startY = 45;
  
  // Division (Left)
  doc.setFontSize(9);
  doc.text("Division / District:", 14, startY);
  doc.setFont("helvetica", "bold");
  doc.text(gd.division.toUpperCase(), 45, startY);
  doc.line(45, startY + 1, 80, startY + 1); // Underline

  // Date (Center)
  doc.setFont("helvetica", "normal");
  doc.text("Date:", 90, startY);
  doc.setFont("helvetica", "bold");
  doc.text(new Date(gd.diaryDate).toLocaleDateString("en-GB"), 100, startY);
  doc.line(100, startY + 1, 130, startY + 1); // Underline

  // Post (Right)
  doc.setFont("helvetica", "normal");
  doc.text("Lines / Post / O.P.:", 140, startY);
  doc.setFont("helvetica", "bold");
  doc.text(gd.post.toUpperCase(), 170, startY);
  doc.line(170, startY + 1, 195, startY + 1); // Underline

  // --- 3. THE TABLE (Ruled Style) ---
  const tableColumn = [
    "Date and Time",
    "Entry No.",
    "Abstract",
    "Details of Report",
    "Signature"
  ];

  const tableRows: any[] = [];

  gd.entries.forEach((entry) => {
    const time = new Date(entry.timeOfSubmission).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format looks more official usually
    });

    const date = new Date(entry.timeOfSubmission).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    });

    const entryData = [
      `${date}\n${time}`,           // Col 1
      entry.entryNo,                 // Col 2
      entry.abstract.toUpperCase(),  // Col 3
      entry.details,                 // Col 4
      `${entry.signature.officerName}\n${entry.signature.rank}`, // Col 5
    ];
    tableRows.push(entryData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 55,
    theme: "grid", // Gives that "Ruled Paper" look
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [40, 40, 40], // Dark Grey Lines
      lineWidth: 0.1,
      textColor: [0, 0, 0],
      font: "helvetica",
      valign: "top", // Text aligns to top like a register
    },
    headStyles: {
      fillColor: [220, 220, 220], // Light Grey Header
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Date & Time
      1: { cellWidth: 15, halign: "center" }, // Entry No
      2: { cellWidth: 35, fontStyle: "bold" }, // Abstract
      3: { cellWidth: "auto" }, // Details (Takes remaining space)
      4: { cellWidth: 30 }, // Signature
    },
  });

  // --- 4. FOOTER (S.R. Code from image) ---
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("S.R.06/01-2020/31900299/10.000 bks.x200lvs", 14, pageHeight - 10);
  
  // Page Serial
  doc.text(`Page Serial No: ${gd.pageSerialNo}`, 150, pageHeight - 10);

  // Save
  const fileName = `RPF_GD_${gd.post}_${new Date(gd.diaryDate).toLocaleDateString("en-GB").replace(/\//g, "-")}.pdf`;
  doc.save(fileName);
};