const path = require("path");

const ROOT_DIR = path.join(__dirname, "..", "..", "..");

const PATHS = {
	// Source paths
	src: {
		root: path.join(ROOT_DIR, "src"),
		views: path.join(ROOT_DIR, "src", "views"),
		data: path.join(ROOT_DIR, "src", "data"),
		cv: path.join(ROOT_DIR, "src", "data", "cv"),
		site: path.join(ROOT_DIR, "src", "data", "site.yaml"),
		template: path.join(ROOT_DIR, "src", "views", "index.njk")
	},

	// Output paths
	out: {
		root: path.join(ROOT_DIR, "docs"),
		pdf: path.join(ROOT_DIR, "docs", "pdf"),
		styles: {
			dir: path.join(ROOT_DIR, "docs", "styles"),
			main: path.join(ROOT_DIR, "docs", "styles", "styles.css"),
			print: path.join(ROOT_DIR, "docs", "styles", "print-styles.css")
		},
		patterns: {
			html: (version) => path.join(ROOT_DIR, "docs", `index-${version}.html`),
			pdf: (version) => path.join(ROOT_DIR, "docs", "pdf", `FokinaCV_${version}.pdf`)
		}
	},
};

module.exports = PATHS;
