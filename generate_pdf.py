from playwright.sync_api import sync_playwright
import os
import http.server
import socketserver
import threading

# Set up a simple HTTP server
PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
		def __init__(self, *args, **kwargs):
				super().__init__(*args, directory=DIRECTORY, **kwargs)

def run_server():
		with socketserver.TCPServer(("", PORT), Handler) as httpd:
				print(f"Serving at port {PORT}")
				httpd.serve_forever()

# Start the server in a separate thread
server_thread = threading.Thread(target=run_server)
server_thread.daemon = True
server_thread.start()

def generate_pdf():
		with sync_playwright() as p:
				browser = p.chromium.launch()
				context = browser.new_context()

				# Enable request interception for fonts
				context.route("**/*.{woff,woff2,ttf,otf}", lambda route: route.continue_())
				context.route("https://fonts.googleapis.com/**", lambda route: route.continue_())
				context.route("https://fonts.gstatic.com/**", lambda route: route.continue_())

				page = context.new_page()

				# Navigate to the HTML file via local server
				page.goto(f'http://localhost:{PORT}/dist/index.html', wait_until='networkidle')

				# Wait for font to load
				page.evaluate('''
						() => {
								return new Promise((resolve) => {
										const font400 = new FontFace('IBM Plex Sans', 'url(https://fonts.gstatic.com/s/ibmplexsans/v14/zYXgKVElMYYaJe8bpLHnCwDKhdHeFaxOedc.woff2)', { weight: '400' });
										const font500 = new FontFace('IBM Plex Sans', 'url(https://fonts.gstatic.com/s/ibmplexsans/v14/zYX9KVElMYYaJe8bpLHnCwDKjSL9AIFsdP3pBms.woff2)', { weight: '500' });

										Promise.all([font400.load(), font500.load()]).then((loadedFonts) => {
												loadedFonts.forEach(font => document.fonts.add(font));
												setTimeout(resolve, 1000);
										});
								});
						}
				''')

				page.pdf(path='/dist/tatiana-fokina-cv.pdf', format='A4')

				browser.close()

if __name__ == "__main__":
		generate_pdf()
		print("PDF generated successfully 🎉")
