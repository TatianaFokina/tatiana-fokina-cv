from weasyprint import HTML, CSS
from PyPDF2 import PdfReader, PdfWriter
from pdfminer.high_level import extract_text
import os

def generate_pdf():
    # Paths
    html_path = 'docs/index.html'
    css_path = 'docs/styles.css'
    output_path = 'docs/tatiana-fokina-cv.pdf'

    try:
        # Generate PDF using WeasyPrint
        HTML(html_path).write_pdf(
            output_path,
            stylesheets=[CSS(css_path)],
            presentational_hints=True
        )

        # Add metadata and improve structure with PyPDF2
        reader = PdfReader(output_path)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        writer.add_metadata({
            '/Title': 'Tatiana Fokina CV',
            '/Subject': 'Accessibility Engineer Resume',
            '/Keywords': 'accessibility, web development, frontend',
            '/Author': 'Tatiana Fokina'
        })

        # Save the final PDF
        with open(output_path, 'wb') as f:
            writer.write(f)

        # Verify content with PDFMiner
        text = extract_text(output_path)
        print("PDF content preview:")
        print(text[:500])  # Print first 500 characters

        print("PDF generated successfully 🎉")

        # Print file size for verification
        print(f"PDF file size: {os.path.getsize(output_path)} bytes")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    generate_pdf()
