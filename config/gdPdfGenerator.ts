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

  // --- 1. HEADER SECTION ---

  // Main Titles (Center)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("INDIAN RAILWAYS", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.text("RAILWAY PROTECTION FORCE", 105, 26, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Daily Diary (Roznamacha)", 105, 32, { align: "center" });

  // --- 2. METADATA ROW ---
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

  // --- 3. THE TABLE ---
  const tableColumn = [
    "Date & Time", 
    "No.",         
    "Abstract",
    "Details of Report",
    "Signature"
  ];

  const tableRows: any[] = [];

  gd.entries.forEach((entry) => {
    // Format: 11/02/2026
    const dateStr = new Date(entry.timeOfSubmission).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    // Format: 09:30
    const timeStr = new Date(entry.timeOfSubmission).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, 
    });

    // ✅ SAFE SIGNATURE BLOCK
    // Using || " " ensures it doesn't crash if data is missing
    const rank = entry.signature.rank || "";
    const forceNo = entry.signature.forceNumber ? ` (${entry.signature.forceNumber})` : "";
    const officerPost = entry.signature.post || "";

    // Combines: "Name \n Rank (ForceNo) \n Post"
    const signatureBlock = `${entry.signature.officerName}\n${rank}${forceNo}\n${officerPost}`;

    const entryData = [
      `${dateStr}\n${timeStr}`,      
      entry.entryNo,                 
      entry.abstract.toUpperCase(),  
      entry.details,                 
      signatureBlock,                
    ];
    tableRows.push(entryData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 55,
    theme: "grid", 
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [80, 80, 80], 
      lineWidth: 0.1,
      textColor: [0, 0, 0],
      font: "helvetica",
      valign: "top", 
    },
    headStyles: {
      fillColor: [230, 230, 230], 
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      halign: "center" 
    },
    columnStyles: {
      0: { cellWidth: 22, halign: "center" }, 
      1: { cellWidth: 12, halign: "center", fontStyle: "bold" }, 
      2: { cellWidth: 35, fontStyle: "bold" }, 
      3: { cellWidth: "auto" }, 
      4: { cellWidth: 35, halign: "center" }, // Signature
    },
  });

  // --- 4. FOOTER ---
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