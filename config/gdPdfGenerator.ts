import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Interfaces ---
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

// --- Font Loader Helper ---
const loadLocalFont = async (doc: jsPDF) => {
  try {
    const response = await fetch("/fonts/NotoSansDevanagari-Regular.ttf");

    if (!response.ok) {
      throw new Error(
        "Font file missing. Check public/fonts/NotoSansDevanagari-Regular.ttf",
      );
    }

    const blob = await response.blob();

    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64data = result.split(",")[1];

        if (base64data) {
          doc.addFileToVFS("NotoSans.ttf", base64data);
          doc.addFont("NotoSans.ttf", "NotoSans", "normal");
          doc.setFont("NotoSans", "normal");
        }
        resolve();
      };
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Font loading error:", err);
    doc.setFont("helvetica");
  }
};

// --- Main Generator Function ---
export const generateGDPDF = async (gd: GDData) => {
  const doc = new jsPDF("p", "pt", "a4");

  const SCALE = 1.14; // 🔥 Global font scaling (10% increase)

  // 1. Load Custom Font
  await loadLocalFont(doc);
  doc.setFont("NotoSans", "normal");

  // --- 2. HEADER SECTION ---

  doc.setFontSize(8 * SCALE);
  doc.text("रे. सु. ब./फा. 2 /RPF/G. 2", 550, 30, { align: "right" });
  doc.text("P.L.83055022", 550, 42, { align: "right" });

  doc.setFontSize(10 * SCALE);
  doc.text("भारतीय रेल / INDIAN RAILWAYS", 297, 40, { align: "center" });

  doc.setFontSize(12 * SCALE);
  doc.text("रेलवे सुरक्षा बल / RAILWAY PROTECTION FORCE", 297, 56, {
    align: "center",
  });

  doc.setFontSize(10 * SCALE);
  doc.text("दैनिक डायरी (रोजनामचा) / Daily Diary (Roznamacha)", 297, 72, {
    align: "center",
  });

  doc.setFontSize(14 * SCALE);
  doc.text("E", 340, 90);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16 * SCALE);
  doc.text(gd.pageSerialNo.toString(), 550, 75, { align: "right" });

  doc.setFont("NotoSans", "normal");

  // --- 3. METADATA ROW ---
  const startY = 110;

  doc.setFontSize(9 * SCALE);
  doc.text("डिभीजन/जिला", 40, startY - 12);
  doc.text("Division/District", 40, startY);

  doc.setFontSize(11 * SCALE);
  doc.text(gd.division.toUpperCase(), 120, startY - 2);
  doc.line(115, startY + 2, 200, startY + 2);

  const dateStr = new Date(gd.diaryDate)
    .toLocaleDateString("en-GB")
    .replace(/\//g, " . ");
  doc.setFontSize(12 * SCALE);
  doc.text(dateStr, 297, startY - 2, { align: "center" });

  doc.setFontSize(9 * SCALE);
  doc.text("लाइन/थाना/चौकी..........................", 360, startY - 12);
  doc.text("Lines/Post/O.P..........................", 360, startY);

  doc.setFontSize(10 * SCALE);
  doc.text(gd.post.toUpperCase(), 434, startY - 2);

  // --- 4. THE TABLE ---
  const tableColumn = [
    { header: "दिनांक व समय\nDate and Time", dataKey: "dateTime" },
    { header: "प्रविष्टि सं.\nEntry No.", dataKey: "entryNo" },
    { header: "सार\nAbstract", dataKey: "abstract" },
    { header: "रिपोर्ट का विवरण\nDetails of Report", dataKey: "details" },
    { header: "हस्ताक्षर\nSignature", dataKey: "signature" },
  ];

  const tableRows = gd.entries.map((entry) => {
    const dateStr = new Date(entry.timeOfSubmission).toLocaleDateString(
      "en-GB",
    );
    const timeStr = new Date(entry.timeOfSubmission).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
    );

    const name = entry.signature.officerName || "";
    const force = entry.signature.forceNumber
      ? `${entry.signature.forceNumber}`
      : "";
    const rank = entry.signature.rank || "";
    const officerPost = entry.signature.post || "";

    const signatureBlock = [name, force, rank, officerPost]
      .filter((item) => item.trim() !== "")
      .join("\n");

    return {
      dateTime: `${dateStr}\n${timeStr}`,
      entryNo: entry.entryNo,
      abstract: entry.abstract.toUpperCase(),
      details: entry.details,
      signature: signatureBlock,
    };
  });

  autoTable(doc, {
    columns: tableColumn,
    body: tableRows,
    startY: 125,
    theme: "grid",
    styles: {
      font: "NotoSans",
      fontStyle: "normal",
      fontSize: 9 * SCALE,
      cellPadding: 6,
      lineColor: [80, 80, 80],
      lineWidth: 0.5,
      textColor: [0, 0, 0],
      valign: "top",
    },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: "normal",
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
      halign: "center",
      valign: "middle", // 🔥 Centers text vertically
      cellPadding: { top: 10, bottom: 6, left: 6, right: 6 }, // 🔥 Push text downward
    },

    columnStyles: {
      0: { cellWidth: 70, halign: "center" },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: 80, fontStyle: "normal" },
      3: { cellWidth: "auto" },
      4: { cellWidth: 100, halign: "left" },
    },
  });

  // --- 5. FOOTER ---
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8 * SCALE);
  doc.setFont("helvetica", "normal");
  doc.text("S.R.06/01-2020/31900299/10.000 bks.x200lvs", 40, pageHeight - 20);

  const fileName = `RPF_GD_${gd.post}_${new Date(gd.diaryDate).toLocaleDateString("en-GB").replace(/\//g, "-")}.pdf`;
  doc.save(fileName);
};
