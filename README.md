# Tatiana Fokina Resume

This small project includes two versions of my resume: a web page and a PDF.

## Technologies

HTML, CSS, JavaScript, [Node.js](https://nodejs.org/en/), [GitHub workflows](https://docs.github.com/en/actions/writing-workflows/).

## Commands

Install [pnpm](https://pnpm.io/):

```bash
npm install -g pnpm
```

The second installation option:

```bash
pnpm install
```

For Windows users run the standalone script and open your IDE or PowerShell as administrator (″run as administrator″):

```bash
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

Build HTML:

```bash
pnpm run build
```

Generate PDF version based on HTML:

```bash
pnpm run generate-pdf
```

## Caveats

Currently, the PDF version of the CV isn't fully accessible from the box. I'm going to fix it one day but not today 😅

Document accessibility issues:

- ″StructParent″ entry missing the annotation (`<a>`)
- Path object not tagged (`<b>`, `border`, bullet points)
- ″Link″ annotation is not nested inside a ″Link″ structure element (`<a>`)
- Alternative description missing for an annotation (`<a>`)
- ″LI″ element must content exactly one ″LBody″ element and may contain ″Lbl″ elements (`<ul>`, `<li>`).

[Explanations of issues](https://pac.pdf-accessibility.org/en/resources/pac-2024-quality-checks/) 🤔

For evaluating the accessibility of PDF files I recommended using [PAC (PDF Accessibility Checker)](https://pac.pdf-accessibility.org/en/) and screen readers.

## Licenses

Icons are from [Lucide](https://lucide.dev) and licensed under [the ISC License](https://lucide.dev/license). The font, IBM Plex, is licensed under [OFL](https://github.com/IBM/plex/blob/master/LICENSE.txt).
