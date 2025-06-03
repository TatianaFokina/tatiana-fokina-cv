const PATHS = require("./lib/config/paths");
const { readYamlFiles, ensureDirectory } = require("./lib/utils/file-system");
const { generatePDF } = require("./lib/pdf/generator");

// Generate PDFs for all CV versions
async function generatePDFs() {
	try {
		// Setup
		ensureDirectory(PATHS.out.pdf);
		const { cvVersions } = await readYamlFiles();

		// Generate PDFs
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

			console.log(`🎉 All PDFs generated successfully`);
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
