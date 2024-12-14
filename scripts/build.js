const fs = require("fs-extra");
const path = require("path");
const nunjucks = require("nunjucks");
const { minify } = require("html-minifier-terser");
const yaml = require('js-yaml');

const srcDir = path.join(__dirname, "..", "src", "views");
const outDir = path.join(__dirname, "..", "docs");
const dataDir = path.join(__dirname, "..", "src", "data");

// Configure Nunjucks
nunjucks.configure(srcDir, { autoescape: true });

// Ensure the output directory exists
fs.ensureDirSync(outDir);

// Read YAML data
const cvData = yaml.load(
	fs.readFileSync(path.join(dataDir, "cv.yaml"), "utf8")
);
const siteData = yaml.load(
	fs.readFileSync(path.join(dataDir, "site.yaml"), "utf8")
);

// Combine data
const data = {
	cv: cvData,
	site: siteData,
};

// Minification options
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

// Compile and minify a template
async function compileAndMinifyTemplate(templatePath, outputPath) {
	const renderedHtml = nunjucks.render(path.basename(templatePath), {
		cv: cvData,
		site: siteData,
	});
	const minifiedHtml = await minify(renderedHtml, minifyOptions);
	fs.writeFileSync(outputPath, minifiedHtml);
	console.log(`Compiled and minified: ${outputPath}`);
}

// Compile and minify index.njk
(async () => {
	await compileAndMinifyTemplate(
		path.join(srcDir, "index.njk"),
		path.join(outDir, "index.html"),
		data
	);
	// Add more templates if you need
})();
