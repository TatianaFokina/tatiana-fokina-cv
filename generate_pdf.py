from weasyprint import HTML, CSS
from PyPDF2 import PdfReader, PdfWriter
from pdfminer.high_level import extract_text
import os

def generate_pdf():
    html_path = 'docs/index.html'
    css_path = 'docs/styles.css'
    output_path = 'docs/tatiana-fokina-cv.pdf'

    try:
        HTML(html_path).write_pdf(
            output_path,
            stylesheets=[CSS(css_path)],
            pdf_version="2.0",
            pdf_variant="pdf/ua-2",
            # optimize_images=True,
            zoom=1,
            # attachments=[css_path]
        )

        # Add metadata with PyPDF2
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

        # Add outline
        writer.add_outline_item("Personal Information", 0)
        writer.add_outline_item("Work Experience", 0)
        writer.add_outline_item("Education", 0)
        writer.add_outline_item("Other", 0)

        with open(output_path, "wb") as f:
            writer.write(f)

        # Verify content with PDFMiner
        text = extract_text(output_path)
        print("PDF content preview:")
        print(text[:500])

        print("Starting PDF generation…")
        print(f"HTML path: {html_path}")
        print(f"CSS path: {css_path}")
        HTML(html_path).write_pdf(
            output_path,
            stylesheets=[CSS(css_path)]
        )
        print("PDF generation completed")

        print("PDF generated successfully 🎉")
        print(f"PDF file size: {os.path.getsize(output_path)} bytes")

    except Exception as e:
        print(f"Attention! An error occurred: {e}")

if __name__ == "__main__":
    generate_pdf()
