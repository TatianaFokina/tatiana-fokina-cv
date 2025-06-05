const { PDFName, PDFArray, PDFDict } = require("pdf-lib");

const examineLinkStructure = (pdfDoc) => {
	try {
		console.log("\n🔗 PDF Link Structure Analysis");
		console.log("═════════════════════════════");

		const results = {
			links: [],
			unnestedLinks: [],
			annotations: [],
			unstructuredAnnotations: [],
			hasIssues: false
		};

		// Check StructTreeRoot
		const structTreeRootRef = pdfDoc.catalog.get(PDFName.of("StructTreeRoot"));
		const structTreeRoot = structTreeRootRef?.constructor?.name === "PDFRef" ?
			pdfDoc.context.lookup(structTreeRootRef) : structTreeRootRef;

		console.log("Structure Tree:", {
			exists: !!structTreeRoot,
			type: structTreeRoot?.constructor?.name,
			hasDict: !!structTreeRoot?.dict
		});

		if (structTreeRoot?.dict) {
			// Process structure tree
			processStructureTree(structTreeRoot, results);

			// Process annotations starting from Pages dictionary
			const pagesRef = pdfDoc.catalog.get(PDFName.of("Pages"));

			if (pagesRef) {
				const pages = resolveNode(pagesRef, 0, pdfDoc.context);
				if (pages instanceof PDFDict) {
					processAnnotations(pages, results);
				}
			}

			results.hasIssues = results.unnestedLinks.length > 0 ||
					results.unstructuredAnnotations.length > 0;

			displayResults(results);
		} else {
			console.log("❌ No valid structure tree found");
		}

		return results;
	} catch (error) {
		console.error("❌ Error examining structure:", error.message);
		throw error;
	}
};

const processAnnotations = (node, results, depth = 0) => {
	const resolvedNode = resolveNode(node, depth);
	if (!resolvedNode) return;

	if (resolvedNode instanceof PDFDict) {
		// Check if this is a Pages or Page node
		const type = resolvedNode.get(PDFName.of("Type"))?.toString();

		// Handle both Pages and Page types
		if (type === "/Pages" || type === "/Page") {
			// Process page annotations
			const annots = resolvedNode.get(PDFName.of("Annots"));

			if (annots) {
				const resolvedAnnots = resolveNode(annots, depth);

				if (resolvedAnnots instanceof PDFArray) {
					resolvedAnnots.array.forEach(annot => {
						const resolvedAnnot = resolveNode(annot, depth + 1, resolvedNode.context);

						if (resolvedAnnot instanceof PDFDict) {
							const subtype = resolvedAnnot.get(PDFName.of("Subtype"))?.toString();

								if (subtype === "/Link") {
									const structParent = resolvedAnnot.get(PDFName.of("StructParent"));

									results.annotations.push({
										node: resolvedAnnot,
										depth: depth + 1,
										hasStructParent: !!structParent
									});

									if (!structParent) {
										results.unstructuredAnnotations.push({
											node: resolvedAnnot,
											depth: depth + 1
										});
									}
								}
							}
						});
					}
				}
			}

		// Always process Kids for page tree traversal
		const kids = resolvedNode.get(PDFName.of("Kids"));
		if (kids instanceof PDFArray) {
			kids.array.forEach(kid => {
				const resolvedKid = resolveNode(kid, depth + 1, resolvedNode.context);
				if (resolvedKid) {
					processAnnotations(resolvedKid, results, depth + 1);
				}
			});
		}
	}
};

const resolveNode = (node, depth = 0, context = null) => {
	if (!node) return null;

	try {
		if (node.constructor?.name === "PDFRef") {
			const ctx = context || node.context;
			if (!ctx) return null;
			return ctx.lookup(node);
		}
		return node;
	} catch (error) {
		return null;
	}
};

const processStructureTree = (node, results, depth = 0, parentType = null, context = null) => {
	if (!node) return;

	const resolvedNode = resolveNode(node, depth, context);
	if (!resolvedNode) return;

	if (resolvedNode instanceof PDFDict) {
		const structType = resolvedNode.get(PDFName.of("S"))?.toString();
		const kids = resolvedNode.get(PDFName.of("K"));
		const mcid = resolvedNode.get(PDFName.of("MCID"));

		if (structType === "/Link") {
			const isProperlyNested = ["/P", "/NonStruct", "/Div", "/H1", "/H2", "/H3", "/H4", "/H5", "/H6"]
				.includes(parentType);

			results.links.push({
				node: resolvedNode,
				depth,
				parentType,
				mcid: mcid?.toString()
			});

			if (!isProperlyNested) {
				results.unnestedLinks.push({
					node: resolvedNode,
					depth,
					parentType,
					mcid: mcid?.toString()
				});
			}
		}

		if (kids) {
			if (kids instanceof PDFArray) {
				kids.array.forEach(kid => {
					processStructureTree(kid, results, depth + 1, structType, resolvedNode.context);
				});
			} else {
				processStructureTree(kids, results, depth + 1, structType, resolvedNode.context);
			}
		}
	}

	if (resolvedNode instanceof PDFArray) {
		resolvedNode.array.forEach(item => {
			processStructureTree(item, results, depth, parentType, resolvedNode.context);
		});
	}
};

const displayResults = (results) => {
	if (results.unnestedLinks.length > 0) {
		console.log("\n⚠️  Link Structure Issues");
		console.log("════════════════════════");
		console.log(`Found ${results.unnestedLinks.length} unnested links out of ${results.links.length} total links:`);

		results.unnestedLinks.forEach((link, index) => {
			console.log(`${index + 1}. Link at depth ${link.depth} under ${link.parentType || "no parent"}`);
		});
	} else {
		console.log("\n✅  Link Structure Check");
		console.log("══════════════════════════");
		console.log(`All ${results.links.length} links are properly nested`);
	}

	if (results.unstructuredAnnotations.length > 0) {
		console.log("\n⚠️  Link Annotations Issues");
		console.log("════════════════════════════");
		console.log(`Found ${results.unstructuredAnnotations.length} unstructured annotations out of ${results.annotations.length} total annotations:`);

		results.unstructuredAnnotations.forEach((annot, index) => {
			console.log(`${index + 1}. Link annotation at depth ${annot.depth} without StructParent`);
		});
	} else {
		console.log("\n✅ Link Annotations");
		console.log("══════════════════════════");
		console.log(`All ${results.annotations.length} link annotations are properly nested`);
	}

	if (!results.hasIssues) {
		console.log("\n✅ All links and annotations are properly structured");
	}
};

module.exports = { examineLinkStructure };
