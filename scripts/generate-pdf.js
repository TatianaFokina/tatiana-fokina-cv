const PATHS = require("./lib/config/paths");
const { readYamlFiles, ensureDirectory, updatePdfUrl } = require("./lib/utils/file-system");
const { generatePDF } = require("./lib/pdf/generator");

// Generate PDFs for all CV versions
async function generatePDFs() {
	try {
		// Setup
		ensureDirectory(PATHS.out.pdf);
		const { cvVersions } = await readYamlFiles();

		// Generate PDFs and update URLs
		for (const [version, cvData] of Object.entries(cvVersions)) {
			await generatePDF(
				PATHS.out.patterns.html(version),
				PATHS.out.patterns.pdf(version),
				{
					title: `${cvData.name} — CV`,
					creator: cvData.name,
					description: cvData.summary
				}
			);

			// Update PDF URL in YAML
			await updatePdfUrl(version, cvData);

			console.log(`🎉 All PDFs generated and URLs updated`);
		}
	} catch (error) {
		console.error("❌ PDF generation failed:", error);
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	generatePDFs();
}

module.exports = generatePDFs;
