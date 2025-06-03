const nunjucks = require("nunjucks");

// Custom template filters
/**
	* @type { Object }
*/

const filters = {
	// Convert markdown-style links to HTML
	/**
		* @param { string } text — Text containing markdown links
		* @returns { string } — HTML with converted links
	*/

	urlize(text) {
		// Convert URLs in text to HTML links
		if (!text || typeof text !== "string") {
			return "";
		}

		return text.replace(
			/\[([^\]]+)\]\(([^)]+)\)(?:{([^}]+)})?/g,
			function(match, text, url, classes) {
				const existingClasses = classes ? classes.trim() : "";
				const allClasses = existingClasses
					? `cv__link ${existingClasses}`
					: "cv__link";
				return `<a href="${url}" class="${allClasses}">${text}</a>`;
			}
		);
	},

	// Format date in locale-specific format
	/**
		* @param {string} date — Date string
		* @returns {string} Formatted date
	*/
	formatDate(date) {
		if (!date) return "";
		return new Date(date).toLocaleDateString("en-GB", {
			year: "numeric",
			month: "long"
		});
	}
};

// Configure Nunjucks environment
/**
	* @param { string } templatesDir — Directory containing templates
	* @returns { nunjucks.Environment } Configured Nunjucks environment
*/

function configureNunjucks(templatesDir) {
	try {
		const env = nunjucks.configure(templatesDir, {
			autoescape: true,
			// trimBlocks: true,
			// lstripBlocks: true
		});

		// Register custom filters
		Object.entries(filters).forEach(([name, fn]) => {
			env.addFilter(name, fn);
		});

		console.log("✅ Nunjucks environment configured");
		return env;
	} catch (error) {
		console.error("❌ Failed to configure Nunjucks", error);
		throw error;
	}
}

// Render template with data
/**
	* @param { string } templatePath — Template file path
	* @param { Object } data — Template data
	* @returns { string } Rendered HTML
*/

function renderTemplate(templatePath, data) {
	try {
		const html = nunjucks.render(templatePath, data);
		console.log(`✅ Template rendered: ${templatePath}`);
		return html;
	} catch (error) {
		console.error(`❌ Failed to render template: ${templatePath}`, error);
		throw error;
	}
}

// Compile all CV versions
/**
	* @param { string } templatePath — Path to template file
	* @param { Array } versionsData — Array of CV version data
	* @returns { Promise<Object> } Object with compiled HTML for each version
*/

async function compileAllVersions(templatePath, versionsData) {
	try {
		const compiledVersions = {};

		for (const { version, data } of versionsData) {
			console.log(`✅ Compiling version: ${version}`);
			compiledVersions[version] = await compileTemplate(templatePath, data);
		}

		return compiledVersions;
	} catch (error) {
		console.error("❌ Failed to compile CV versions", error);
		throw error;
	}
}

module.exports = {
	configureNunjucks,
	renderTemplate,
	filters,
	compileAllVersions
};
