const fs = require("fs-extra");
const path = require("path");
const nunjucks = require("nunjucks");
const { minify } = require("html-minifier-terser");
const yaml = require("js-yaml");

const srcDir = path.join(__dirname, "..", "src", "views");
const outDir = path.join(__dirname, "..", "docs");
const dataDir = path.join(__dirname, "..", "src", "data");
const cvDir = path.join(dataDir, "cv");
const siteDir = path.join(dataDir, "site.yaml");

// Configure Nunjucks
const env = nunjucks.configure(srcDir, { autoescape: true });

// Convert URLs in text to HTML links
env.addFilter("urlize", function (text) {
	if (!text || typeof text !== "string") {
		return "";
	}

	return text.replace(
		/\[([^\]]+)\]\(([^)]+)\)(?:{([^}]+)})?/g,
		function (match, text, url, classes) {
			const existingClasses = classes ? classes.trim() : "";
			const allClasses = existingClasses
				? `cv__link ${existingClasses}`
				: "cv__link";
			return `<a href="${url}" class="${allClasses}">${text}</a>`;
		}
	);
});

// Ensure the output directory exists
fs.ensureDirSync(outDir);

// Read YAML data
function readYamlFiles() {
	if (!fs.existsSync(cvDir)) {
			console.error("CV directory not found:", cvDir);
			return null;
	}

	try {
			const files = fs.readdirSync(cvDir).filter(file => file.endsWith('.yaml'));

			const siteData = yaml.load(fs.readFileSync(siteDir, "utf8"));

			const cvVersions = {};
			files.forEach(file => {
					const filePath = path.join(cvDir, file);
					const fileName = path.basename(file, '.yaml');
					cvVersions[fileName] = yaml.load(fs.readFileSync(filePath, "utf8"));
					console.log(`Loaded CV version: ${fileName}`);
			});

			return {
					cvVersions,
					siteData
			};
	} catch (error) {
			console.error("Error reading YAML files:", error);
			return null;
	}
}

const yamlData = readYamlFiles();
if (!yamlData) {
	process.exit(1);
}

// Combine data
const allVersionsData = Object.entries(yamlData.cvVersions).map(([version, cvData]) => ({
	version,
	data: {
			cv: cvData,
			site: yamlData.siteData
	}
}));

// Compile and minify a template
const minifyOptions = {
	collapseWhitespace: true,
	removeComments: true,
	removeOptionalTags: true,
	removeRedundantAttributes: true,
	removeScriptTypeAttributes: true,
	removeTagWhitespace: true,
	useShortDoctype: true,
	minifyCSS: true,
};

async function compileAndMinifyTemplate(templatePath, outputPath, data) {
	const renderedHtml = nunjucks.render(path.basename(templatePath), data);
	const minifiedHtml = await minify(renderedHtml, minifyOptions);
	fs.writeFileSync(outputPath, minifiedHtml);
	console.log(`Compiled and minified: ${outputPath}`);
}

// Compile and minify index.njk
(async () => {
	for (const { version, data } of allVersionsData) {
			const outputFile = `index-${version}.html`;
			await compileAndMinifyTemplate(
					path.join(srcDir, "index.njk"),
					path.join(outDir, outputFile),
					data
			);
	}
})();
