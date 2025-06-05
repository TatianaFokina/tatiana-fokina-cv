const { PDFDocument, PDFName } = require("pdf-lib");
const fs = require("fs-extra");
const yaml = require("yaml");
const path = require("path");

// Generate XMP metadata XML string
/**
	* @param { Object } metadata — PDF metadata object
	* @returns { string } — XMP metadata XML
*/

function createPDFMetadata() {
	const yamlFile = fs.readFileSync(path.join(__dirname, "../../../src/data/site.yaml"), "utf8");
	const siteMetadata = yaml.parse(yamlFile);
	const xmp = siteMetadata?.xmp;
	const currentDate = new Date();

	return {
		title: xmp.title,
		subject: xmp.subject,
		creator: xmp.creator,
		producer: xmp.producer,
		keywords: xmp.keywords.split(",").map(k => k.trim()),
		creationDate: currentDate,
		modificationDate: currentDate,
		// description: xmp.description,
		// format: xmp.format,
		pdfua: {
			part: 1,
			conformance: "U"
		},
		markInfo: {
			marked: true,
			userProperties: false,
			suspects: false
		}
	};
}

// Set PDF page properties
/**
	* @param { PDFDocument } pdfDoc — PDF document instance
*/

function setPageProperties(pdfDoc) {
	const pages = pdfDoc.getPages();

	// Set tab order for all pages
	pages.forEach((page) => {
		page.node.set(PDFName.of("Tabs"), PDFName.of("S"));
	});
}

// Add metadata to PDF file
/**
	* @param { string } pdfPath — Path to PDF file
	* @param { Object } metadata — Metadata object
	* @returns { Promise<void> }
*/

async function addMetadata(pdfPath, metadata) {
	try {
		const pdfBytes = await fs.readFile(pdfPath);
		const pdfDoc = await PDFDocument.load(pdfBytes, {
			updateMetadata: false,
			preserveStructTree: true
		});

		const pdfMetadata = createPDFMetadata(metadata);

		// Set basic metadata
		pdfDoc.setTitle(pdfMetadata.title);
		pdfDoc.setSubject(pdfMetadata.subject);
		pdfDoc.setCreator(pdfMetadata.creator);
		pdfDoc.setProducer(pdfMetadata.producer);
		pdfDoc.setCreationDate(pdfMetadata.creationDate);
		pdfDoc.setModificationDate(pdfMetadata.modificationDate);
		pdfDoc.setKeywords(pdfMetadata.keywords);

		// Only update MarkInfo if it doesn't exist
		const existingMarkInfo = pdfDoc.catalog.get(PDFName.of("MarkInfo"));
			if (!existingMarkInfo) {
				pdfDoc.catalog.set(PDFName.of("MarkInfo"),
					pdfDoc.context.obj({
						Marked: true,
						UserProperties: false,
						Suspects: false
				})
			);
		}

		// Generate and add XMP metadata
		const xmpMetadata = `
			<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
			<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.4-c006 80.159825, 2016/09/16-03:31:08">
				<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
				<rdf:Description rdf:about=""
					xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
					xmlns:pdfuaid="http://www.aiim.org/pdfua/ns/id/"
					xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"
					xmlns:dc="http://purl.org/dc/elements/1.1/"
					xmlns:xmp="http://ns.adobe.com/xap/1.0/">
					<pdfuaid:part>1</pdfuaid:part>
					<pdf:Producer>Puppeteer with PDF/UA support</pdf:Producer>
					<dc:format>application/pdf</dc:format>
					<dc:title>
						<rdf:Alt>
							<rdf:li xml:lang="x-default">${pdfMetadata.title}</rdf:li>
						</rdf:Alt>
					</dc:title>
					<dc:creator>
						<rdf:Seq>
							<rdf:li>${pdfMetadata.creator}</rdf:li>
						</rdf:Seq>
					</dc:creator>
					<dc:description>
						<rdf:Alt>
							<rdf:li xml:lang="x-default">${pdfMetadata.description}</rdf:li>
						</rdf:Alt>
					</dc:description>
					<xmp:CreatorTool>PDF Generator Script</xmp:CreatorTool>
					<xmp:CreateDate>${pdfMetadata.creationDate.toISOString()}</xmp:CreateDate>
					<xmp:ModifyDate>${pdfMetadata.modificationDate.toISOString()}</xmp:ModifyDate>
				</rdf:Description>
			</rdf:RDF>
		</x:xmpmeta>
		<?xpacket end="w"?>`.trim();

		// Add XMP metadata to PDF
		const metadataStream = pdfDoc.context.flateStream(xmpMetadata);
		const metadataStreamRef = pdfDoc.context.register(metadataStream);
		pdfDoc.catalog.set(PDFName.of("Metadata"), metadataStreamRef);

		// Set page properties
		setPageProperties(pdfDoc);

		// Save with structure preservation
		const updatedPdfBytes = await pdfDoc.save({
			updateMetadata: false,
			addDefaultPage: false,
			preserveStructTree: true
		});

		await fs.writeFile(pdfPath, updatedPdfBytes);

		console.log(`✅ Added metadata to ${pdfPath}`);
	} catch (error) {
		console.error(`❌ Failed to add metadata to ${pdfPath}:`, error.message);
		throw error;
	}
}

module.exports = {
	addMetadata,
	createPDFMetadata,
	setPageProperties
};
