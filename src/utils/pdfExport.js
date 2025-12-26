import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (filename, title, columns, data, storeConfig, footerText = '') => {
    try {
        const doc = new jsPDF();
        const storeName = storeConfig?.storeName || 'My Store';
        const storeAddress = storeConfig?.storeAddress || '';

        // Header
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(storeName, 105, 15, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        if (storeAddress) {
            doc.text(storeAddress, 105, 22, { align: "center" });
        }

        // Title & Date
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(title, 14, 35);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(`Date: ${dateStr}`, 14, 42);

        // Table - Explicit Call
        autoTable(doc, {
            head: [columns],
            body: data,
            startY: 50,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [66, 66, 66] }
        });

        // Footer / Signature
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 60;
        const pageHeight = doc.internal.pageSize.height;

        // Check if enough space for signature, else add page
        if (finalY + 50 > pageHeight) {
            doc.addPage();
            doc.text("Signature Page", 14, 20);
        }

        const signatureY = finalY + 20;
        const rightMargin = 180;

        doc.setFontSize(10);
        // Location and Date for Signature
        const location = storeAddress ? storeAddress.split(',')[0] : 'Tempat';
        doc.text(`${location}, ${dateStr}`, rightMargin, signatureY, { align: 'right' });

        doc.text("Dibuat Oleh,", rightMargin - 20, signatureY + 10, { align: 'center' });

        // Line for signature
        doc.line(rightMargin - 40, signatureY + 35, rightMargin, signatureY + 35);

        doc.text("( .................... )", rightMargin - 20, signatureY + 40, { align: 'center' });

        // Save
        doc.save(`${filename}.pdf`);
    } catch (error) {
        console.error("PDF Export Error:", error);
        alert(`Failed to export PDF: ${error.message}`);
    }
};
