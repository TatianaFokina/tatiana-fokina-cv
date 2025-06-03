const path = require("path");
const { PATHS } = require("../config/paths");
const fs = require("fs-extra");
const yaml = require("js-yaml");

// Read and combine CV YAML files with site data
/**
	* @param { string } cvDir — Directory containing CV YAML files
	* @param { string } siteYaml — Path to site.yaml file
	* @returns { Promise<Object> } Combined data object
*/

async function readYamlFiles(cvDir = PATHS.src.cv, siteYaml = PATHS.src.site) {
	try {
		// Verify directories exist
		if (!fs.existsSync(cvDir)) {
			throw new Error(`CV directory not found: ${cvDir}`);
		}

		if (!fs.existsSync(siteYaml)) {
			throw new Error(`Site YAML not found: ${siteYaml}`);
		}

		// Read all CV version files
		const files = fs.readdirSync(cvDir).filter(file => file.endsWith(".yaml"));
		const cvVersions = {};

		// Read site configuration
		const siteData = yaml.load(fs.readFileSync(siteYaml, "utf8"));

		// Process each CV version
		for (const file of files) {
			const version = path.basename(file, ".yaml");
			const filePath = path.join(cvDir, file);
			cvVersions[version] = yaml.load(fs.readFileSync(filePath, "utf8"));
			console.log(`✅ Loaded CV version: ${version}`);
		}

		return {
			cvVersions,
			siteData
		};
	} catch (error) {
		console.error("❌ Error reading YAML files:", error.message);
		throw error;
	}
}

// Read and combine CSS files
/**
	* @param { string[] } cssPaths — Array of CSS file paths
	* @returns { Promise<string> } Combined CSS content
*/

async function readCSSFiles() {
	try {
		const stylePaths = [
			PATHS.out.styles.main,
			PATHS.out.styles.print
		];

		const cssContents = await Promise.all(
			stylePaths.map(path => fs.readFile(path, "utf8"))
		);

		console.log("🎉 CSS files combined successfully");
		return cssContents.join("\n");
	} catch (error) {
		console.error("❌ Error reading CSS files:", error);
		throw error;
	}
}

// Ensure directory exists, create if needed
/**
	* @param { string } dirPath — Directory path
*/

function ensureDirectory(dirPath) {
	try {
		if (typeof dirPath !== "string") {
			throw new TypeError("❌ Directory path must be a string");
		}
		fs.ensureDirSync(dirPath);
		console.log(`✅ Directory ready: ${dirPath}`);
	} catch (error) {
		console.error(`❌ Error creating directory ${dir}:`, error.message);
		throw error;
	}
}

// Read HTML template file
/**
	* @param { string } htmlPath — Path to HTML file
	* @returns { Promise<string> } HTML content
*/

async function readHTML(htmlPath) {
	try {
		return await fs.readFile(htmlPath, "utf8");
	} catch (error) {
		console.error("❌ Error reading HTML file:", error.message);
		throw error;
	}
}

// Update PDF URL in CV YAML file
/**
	* @param { string } version — CV version identifier
	* @param { Object } cvData — CV data object
*/
async function updatePdfUrl(version, cvData) {
	try {
		const cvPath = path.join(PATHS.src.cv, `${version}.yaml`);

		// Update PDF URL in data
		cvData.personal.pdf.url = PATHS.out.patterns.pdfUrl(version);

		// Write updated YAML
		const updatedYaml = yaml.dump(cvData, {
			indent: 2,
			lineWidth: -1,
			quotingType: '"'
		});

		await fs.writeFile(cvPath, `---\n${updatedYaml}`);
		console.log(`✅ Updated PDF URL in ${version}.yaml`);
	} catch (error) {
		console.error(`✅ Failed to update PDF URL in ${version}.yaml:`, error);
		throw error;
	}
}

module.exports = {
	readYamlFiles,
	readCSSFiles,
	ensureDirectory,
	readHTML,
	updatePdfUrl
};
