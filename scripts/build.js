const path = require("path");
const { PATHS, createVersionAlias } = require("./lib/config/paths");
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
		// Use createVersionAlias to generate the filename
		const alias = createVersionAlias(version);
		const outputFile = path.join(PATHS.out.html, `${alias}.html`);

		// Render and minify
		const html = renderTemplate(PATHS.src.template, {
			...data,
			version,
			PATHS
		});

		const minified = await minifyHtml(html);

		// Save output
		await fs.writeFile(outputFile, minified);
		console.log(`✅ Save built version: ${version} as ${alias}.html`);
	} catch (error) {
		console.error(`❌ Failed to save build version: ${version}`, error);
		throw error;
	}
}

async function build() {
	try {
		// Create required directories
		await Promise.all([
			ensureDirectory(PATHS.out.root),
			ensureDirectory(PATHS.out.html),
			ensureDirectory(PATHS.out.pdf)
		]);

		configureNunjucks(PATHS.src.views);

		// Load CV and site data
		const { cvVersions, siteData } = await readYamlFiles(
			PATHS.src.cv,
			PATHS.src.site
		);

		// Build all versions
		await Promise.all(
			Object.entries(cvVersions).map(([version, cvData]) =>
				buildVersion(version, {
					cv: cvData,
					site: siteData
				})
			)
		);

		console.log("🎉 Build completed successfully");
	} catch (error) {
		console.error("❌ Build failed:", error);
		console.error("PATHS object:", PATHS);
		process.exit(1);
	}
}

// Run build if called directly
if (require.main === module) {
	build();
}

module.exports = build;
