const path = require("path");

const ROOT_DIR = path.join(__dirname, "..", "..", "..");

// Generate short alias from full version name
/**
	* @param { string } version — Full version name (e.g. "a11y-engineer-v1.0")
	* @returns { string } — Short alias (e.g. "a11y-1.0.html")
*/
function createVersionAlias(version) {
	const parts = version.match(/^(?<role>[a-z]+\d*[a-z]+)-(?<title>[a-z]+)-v(?<version>\d+\.\d+)$/i);

	// Return original if pattern doesn't match
	if (!parts?.groups) {
		console.log("❌ No match found, returning original");
		return version;
	}

	const { role, version: ver } = parts.groups;
	const alias = `${role}-${ver}`;
	console.log("✅ Created alias:", alias);

	return alias;
}

const PATHS = {
	src: {
		root: path.join(ROOT_DIR, "src"),
		views: path.join(ROOT_DIR, "src", "views"),
		data: path.join(ROOT_DIR, "src", "data"),
		cv: path.join(ROOT_DIR, "src", "data", "cv"),
		site: path.join(ROOT_DIR, "src", "data", "site.yaml"),
		template: path.join(ROOT_DIR, "src", "views", "index.njk")
	},
	out: {
		root: path.join(ROOT_DIR, "docs"),
		pdf: path.join(ROOT_DIR, "docs", "pdf"),
		html: path.join(ROOT_DIR, "docs", "html"),
		styles: {
			dir: path.join(ROOT_DIR, "docs", "styles"),
			main: path.join(ROOT_DIR, "docs", "styles", "styles.css"),
			print: path.join(ROOT_DIR, "docs", "styles", "print-styles.css")
		},
		patterns: {
			html: (version) => path.join(PATHS.out.html, `${createVersionAlias(version)}.html`),
			pdf: (version) => path.join(PATHS.out.pdf, `fokina-${version}.pdf`),
			pdfUrl: (version) => `/pdf/fokina-${version}.pdf`
		}
	},
};

module.exports = {
	PATHS,
	createVersionAlias
};
