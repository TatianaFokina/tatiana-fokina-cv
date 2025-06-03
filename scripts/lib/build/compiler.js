const { minify } = require("html-minifier-terser");

// HTML minification options
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

// Compile template with data and minify output
/**
	* @param { string } html — HTML content to minify
	* @returns { Promise<string> } Minified HTML
*/

async function minifyHtml(html) {
	try {
		const minified = await minify(html, minifyOptions);

		console.log(`✅ HTML minified successfully`);
		return minified;
	} catch (error) {
		console.error(`❌ Failed to minify HTML:`, error);
		throw error;
	}
}

module.exports = {
	minifyHtml,
	minifyOptions
};
