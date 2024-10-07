import pdfkit
from PyPDF2 import PdfReader, PdfWriter
from pdfminer.high_level import extract_text

def generate_pdf():
    url = 'docs/index.html'

    # Path for the output PDF
    output_path = 'docs/tatiana-fokina-cv.pdf'

    # Configure pdfkit options
    options = {
        'enable-local-file-access': None,
        'javascript-delay': 1000,
    }

    try:
        # Generate PDF
        pdfkit.from_file(url, output_path, options=options)

        # Use PyPDF2 to read the generated PDF
        reader = PdfReader(output_path)
        writer = PdfWriter()

        # Copy all pages to the writer
        for page in reader.pages:
            writer.add_page(page)

        # Save the final PDF
        with open(output_path, 'wb') as f:
            writer.write(f)

        # Use PDFMiner to extract text (for verification)
        text = extract_text(output_path)
        print("PDF content preview:")
        print(text[:500])  # Print first 500 characters

        print("PDF generated successfully 🎉")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    generate_pdf()
