const { PDFDocument } = require("pdf-lib");
const fs = require("fs-extra");
const path = require("path");
const { examineLinkStructure } = require("./lib/pdf/link-structure");

async function checkPDFStructure(pdfPath) {
	try {
		console.log(`\n📄 Examining PDF structure of ${path.basename(pdfPath)}`);

		const pdfBytes = await fs.readFile(pdfPath);
		const pdfDoc = await PDFDocument.load(pdfBytes);

		const results = await examineLinkStructure(pdfDoc);
		return results;
	} catch (error) {
		console.error("❌ Error checking PDF structure:", error.message);
		throw error;
	}
}

// Run as standalone script or export for use in other modules
if (require.main === module) {
	const pdfPath = process.argv[2] ||
		path.join(__dirname, "..", "docs", "pdf", "fokina-a11y-engineer-v1.0.pdf");

	checkPDFStructure(pdfPath)
		.catch(error => {
			console.error("Failed to check PDF structure:", error);
			process.exit(1);
		});
} else {
	module.exports = checkPDFStructure;
}
