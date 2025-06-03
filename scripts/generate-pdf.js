const { PATHS } = require("./lib/config/paths");
const { readYamlFiles, ensureDirectory, updatePdfUrl } = require("./lib/utils/file-system");
const { generatePDF } = require("./lib/pdf/generator");

// Generate PDFs for all CV versions
async function generatePDFs() {
	try {
		// Setup
		ensureDirectory(PATHS.out.pdf);

		// Pass required paths to readYamlFiles
		const { cvVersions } = await readYamlFiles(
			PATHS.src.cv,
			PATHS.src.site
		);

		// Generate PDFs and update URLs
		for (const [version, cvData] of Object.entries(cvVersions)) {
			await generatePDF(
				PATHS.out.patterns.html(version),
				PATHS.out.patterns.pdf(version),
				{
					title: `${cvData.personal["candidate name"]} — CV`,
					creator: cvData.personal["candidate name"],
					description: cvData.summary.paragraphs[0]
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
