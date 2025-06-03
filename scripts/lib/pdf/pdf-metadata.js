const { PDFDocument, PDFName } = require("pdf-lib");
const fs = require("fs-extra");

// Generate XMP metadata XML string
/**
	* @param { Object } metadata — PDF metadata object
	* @returns { string } — XMP metadata XML
*/

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
		const pdfDoc = await PDFDocument.load(await fs.readFile(pdfPath));

		const xmpMetadata = generateXMPMetadata(metadata);
		const metadataStream = pdfDoc.context.flateStream(xmpMetadata);
		const metadataStreamRef = pdfDoc.context.register(metadataStream);

		// Set metadata
		pdfDoc.catalog.set(PDFName.of("Metadata"), metadataStreamRef);
		pdfDoc.setSubject("PDF/UA-1");

		// Set page properties
		setPageProperties(pdfDoc);

		// Save changes
		const pdfBytes = await pdfDoc.save({ updateMetadata: false });
		await fs.writeFile(pdfPath, pdfBytes);

		console.log(`✅ Added metadata to ${pdfPath}`);
	} catch (error) {
		console.error(`❌ Failed to add metadata to ${pdfPath}:`, error.message);
		throw error;
	}
}

module.exports = {
	addMetadata,
	generateXMPMetadata,
	setPageProperties
};
