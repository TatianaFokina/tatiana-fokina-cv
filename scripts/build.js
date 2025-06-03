const PATHS = require("./lib/config/paths");
const fs = require("fs-extra");
const { readYamlFiles, ensureDirectory } = require("./lib/utils/file-system");
const { configureNunjucks, renderTemplate } = require("./lib/build/templating");
const { minifyHtml } = require("./lib/build/compiler");

// Process single CV version
/**
	* @param { string } version — CV version identifier
	* @param { Object } data — Template data
*/

async function buildVersion(version, data) {
	try {
		const outputFile = PATHS.out.patterns.html(version);

		// Render and minify
		const html = renderTemplate(PATHS.src.template, data);
		const minified = await minifyHtml(html);

		// Save output
		await fs.writeFile(outputFile, minified);
		console.log(`✅ Save built version: ${version}`);
	} catch (error) {
		console.error(`❌ Failed to save build version: ${version}`, error);
		throw error;
	}
}

// Main build process
async function build() {
	try {
		// Initialize
		ensureDirectory(PATHS.out.root);
		configureNunjucks(PATHS.src.views);

		// Load data
		const { cvVersions, siteData } = await readYamlFiles(
			PATHS.cvDir,
			PATHS.siteConfig
		);

		// Process each version
		const builds = Object.entries(cvVersions).map(([version, cvData]) =>
			buildVersion(version, {
				cv: cvData,
				site: siteData
			})
		);

		// Wait for all versions to build
		await Promise.all(builds);
		console.log("🎉 Build completed successfully");
	} catch (error) {
		console.error("❌ Build failed", error);
		process.exit(1);
	}
}

// Run build if called directly
if (require.main === module) {
	build();
}

module.exports = build;
