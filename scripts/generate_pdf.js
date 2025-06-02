const fs = require("fs-extra");
const path = require("path");
const puppeteer = require("puppeteer");
const yaml = require("js-yaml");
const { PDFDocument, PDFName } = require("pdf-lib");

function generateXMPMetadata(metadata) {
	return `
		<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
			<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.4-c006 80.159825, 2016/09/16-03:31:08">
				<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
					<rdf:Description rdf:about=""
						xmlns:pdfuaid="http://www.aiim.org/pdfua/ns/id/"
						xmlns:dc="http://purl.org/dc/elements/1.1/">
						<pdfuaid:part>1</pdfuaid:part>
						<dc:title>
							<rdf:Alt>
								<rdf:li xml:lang="x-default">${metadata.title}</rdf:li>
							</rdf:Alt>
						</dc:title>
						<dc:creator>
							<rdf:Seq>
								<rdf:li>${metadata.creator}</rdf:li>
							</rdf:Seq>
						</dc:creator>
							<dc:description>
								<rdf:Alt>
									<rdf:li xml:lang="x-default">${metadata.description}</rdf:li>
								</rdf:Alt>
							</dc:description>
					</rdf:Description>
				</rdf:RDF>
			</x:xmpmeta>
		<?xpacket end="w"?>`.trim();
}

// Create metadata with pdf-lib
async function addPDFMeta(pdfPath, metadata) {
	const pdfDoc = await PDFDocument.load(await fs.readFile(pdfPath));
	const pages = pdfDoc.getPages();

	// Create XMP metadata
	const xmpMetadata = generateXMPMetadata(metadata);

	// Add XMP metadata
	const metadataStream = pdfDoc.context.flateStream(xmpMetadata);
	const metadataStreamRef = pdfDoc.context.register(metadataStream);
	pdfDoc.catalog.set(PDFName.of("Metadata"), metadataStreamRef);

	// Add PDF/UA identifier
	pdfDoc.setSubject("PDF/UA-1");

	// Set tab order for all pages
	pages.forEach((page) => {
		page.node.set(PDFName.of("Tabs"), PDFName.of("S"));
	});

	const pdfBytes = await pdfDoc.save({ updateMetadata: false });
	await fs.writeFile(pdfPath, pdfBytes);
}

// Generate PDF with puppeteer
async function generatePDF() {
	const outDir = path.join(__dirname, "..", "docs");
	const dataDir = path.join(__dirname, "..", "src", "data");
	const cvDir = path.join(dataDir, "cv");
	const siteDir = path.join(dataDir, "site.yaml");

	try {
			// Get all CV YAML files
			const cvFiles = fs.readdirSync(cvDir).filter(file => file.endsWith('.yaml'));

			for (const cvFile of cvFiles) {
					const version = path.basename(cvFile, '.yaml');
					const htmlPath = path.join(outDir, `index-${version}.html`);
					const cssPath = [
							path.join(outDir, "styles", "styles.css"),
							path.join(outDir, "styles", "print-styles.css"),
					];

					// Create version-specific PDF filename (e.g., fokina-a11y-engineer-v1.0.pdf)
					const pdfFileName = `fokina-${version}.pdf`;
					const outputPath = path.join(outDir, "pdf", pdfFileName);

					console.log(`Generating PDF for version ${version} ⏳`);

					const html = await fs.readFile(htmlPath, "utf8");
					const css = await Promise.all(
							cssPath.map((path) => fs.readFile(path, "utf8"))
					);
					const combinedCss = css.join("\n");

					const content = `${html}<style>${combinedCss}</style>`;

					const yamlFile = await fs.readFile(path.join(cvDir, cvFile), "utf8");
					const metadata = yaml.load(yamlFile);

					const browser = await puppeteer.launch();
					const page = await browser.newPage();

					await page.setContent(content, { waitUntil: "networkidle0" });
					await page.pdf({
							path: outputPath,
							displayHeaderFooter: false,
							printBackground: true,
							preferCSSPageSize: true,
							pdfA: true,
							displayTitle: true,
							outline: true,
							annotating: true,
							tagged: true,
							generateTaggedPDF: true,
							structureTreeRoot: true,
							metadata: metadata,
					});

					await browser.close();
					await addPDFMeta(outputPath, metadata);

					const stats = await fs.stat(outputPath);

					console.log(`PDF version ${version} generated successfully 🎉`);
					console.log(`File saved as: ${pdfFileName}`);
					console.log(`File size: ${stats.size} bytes`);
			}
	} catch (error) {
			console.error("An error occurred:", error);
	}
}

generatePDF();
