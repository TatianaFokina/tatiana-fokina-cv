async function enableSkipLinks() {
	try {
		const anchorLinks = document.querySelectorAll(".cv-header__skip-link");
		anchorLinks.forEach(link => {
			link.addEventListener("click", () => {
				const href = link.getAttribute("href");

				if (!href || !href.includes("#")) return;

				const targetId = href.split("#")[1];
				const target = document.getElementById(targetId);

				if (target) {
					target.setAttribute("tabindex", "-1");
					target.addEventListener("blur", () => {
						target.removeAttribute("tabindex");
					}, { once: true });
					target.focus();
				}
			}, { passive: true });
		});
	} catch (error) {
		console.error("Error enabling skip links:", error);
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", enableSkipLinks);
} else {
	enableSkipLinks();
}
