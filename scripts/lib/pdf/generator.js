const PATHS = require("../config/paths");
const fs = require("fs-extra");
const puppeteer = require("puppeteer");
const { addMetadata } = require("./pdf-metadata");

// PDF generation options
const PDF_OPTIONS = {
	displayHeaderFooter: false,
	printBackground: true,
	preferCSSPageSize: true,
	pdfA: true,
	displayTitle: true,
	outline: true,
	annotating: true,
	tagged: true,
	generateTaggedPDF: true,
	structureTreeRoot: true,
};

// Combine CSS files for PDF generation
/**
	* @returns { Promise<string> } Combined CSS content
*/
async function getCombinedStyles() {
	try {
		const stylePaths = [
			PATHS.out.styles.main,
			PATHS.out.styles.print
		];

		const cssContents = await Promise.all(
			stylePaths.map(path => fs.readFile(path, "utf8"))
		);

		console.log("✅ CSS files combined successfully");
		return cssContents.join("\n");
	} catch (error) {
		console.error("❌ Failed to combine CSS files:", error);
		throw error;
	}
}

// Generate PDF from HTML content
/**
	* @param {string} htmlPath — Path to HTML file
	* @param {string} outputPath — Where to save PDF
	* @param {Object} metadata — PDF metadata
*/
async function generatePDF(htmlPath, outputPath, metadata) {
	// const browser = await puppeteer.launch();
	const browser = await puppeteer.launch({
		executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
		headless: true,
		args: process.env.CI ? [
			'--disable-dev-shm-usage',
			'--disable-gpu',
			'--disable-web-security',
			'--disable-features=VizDisplayCompositor'
			] : []
	});

	try {
		// Read HTML and CSS
		const html = await fs.readFile(htmlPath, "utf8");
		const css = await getCombinedStyles();
		const content = `${html}<style>${css}</style>`;

		// Generate PDF
		const page = await browser.newPage();
		await page.setContent(content, { waitUntil: "networkidle0" });

		await page.pdf({
			...PDF_OPTIONS,
			path: outputPath,
			metadata: metadata
		});

		// Add metadata
		await addMetadata(outputPath, metadata);

		console.log(`✅ Generated PDF: ${outputPath}`);
	} catch (error) {
		console.error("❌ Failed to generate PDF:", error);
		throw error;
	} finally {
		await browser.close();
	}
}

module.exports = {
	generatePDF,
	getCombinedStyles,
	PDF_OPTIONS
};
