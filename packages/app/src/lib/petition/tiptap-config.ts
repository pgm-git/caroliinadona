/**
 * Configuração do Tiptap editor para petições.
 * Define extensions, toolbar e preset jurídico (margens, fonte, espaçamento).
 *
 * TODO: Descomente após instalar @tiptap/react, @tiptap/starter-kit, @tiptap/extension-text-align
 */

// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import TextAlign from "@tiptap/extension-text-align";

/**
 * Opções de configuração do editor Tiptap para petições.
 * Será implementado após instalar dependências Tiptap.
 */
export const petitionEditorOptions = {
  // TODO: Descomente após instalar Tiptap
  // extensions: [
  //   StarterKit,
  //   TextAlign.configure({
  //     types: ["heading", "paragraph"],
  //     alignments: ["left", "center", "right", "justify"],
  //   }),
  // ],
  content: "<p>Comece a editar sua petição aqui...</p>",
  editorProps: {
    attributes: {
      class:
        "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none " +
        "font-serif text-base leading-relaxed text-justify " +
        "min-h-96 p-4 border border-gray-300 rounded-md " +
        "bg-white dark:bg-slate-950 dark:text-white",
    },
  },
};

/**
 * Estilos CSS para o editor Tiptap.
 * Preset jurídico: Times New Roman, 12pt, espaçamento 1.5, margens 3cm.
 */
export const petitionEditorStyles = `
  .petition-editor {
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    margin: 3cm;
    text-align: justify;
  }

  .petition-editor p {
    margin: 0.5cm 0;
    text-indent: 1.25cm;
  }

  .petition-editor h1,
  .petition-editor h2,
  .petition-editor h3 {
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    margin: 1cm 0 0.5cm 0;
    text-indent: 0;
  }

  .petition-editor ul,
  .petition-editor ol {
    margin-left: 1cm;
    margin-bottom: 0.5cm;
  }

  .petition-editor li {
    margin: 0.25cm 0;
  }

  .petition-editor blockquote {
    border-left: 3px solid #ccc;
    margin: 1cm 0;
    padding-left: 1cm;
  }

  .petition-editor code {
    font-family: "Courier New", monospace;
    background-color: #f4f4f4;
    padding: 0.2cm 0.4cm;
    border-radius: 0.2cm;
  }

  .ProseMirror {
    position: relative;
  }

  .ProseMirror > * + * {
    margin-top: 0.75em;
  }

  .ProseMirror ul,
  .ProseMirror ol {
    padding: 0 1rem;
  }

  .ProseMirror h1,
  .ProseMirror h2,
  .ProseMirror h3,
  .ProseMirror h4,
  .ProseMirror h5,
  .ProseMirror h6 {
    line-height: 1.1;
  }

  .ProseMirror code {
    background-color: rgba(97, 97, 97, 0.1);
    color: #616161;
  }

  pre {
    background: #0d0d0d;
    color: #fff;
    font-family: "JetBrainsMono", monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
  }

  pre code {
    color: inherit;
    padding: 0;
    background: none;
    font-size: 0.8rem;
  }

  .hljs-attr,
  .hljs-attribute {
    color: #e6db74;
  }

  .hljs-name,
  .hljs-number,
  .hljs-literal {
    color: #ae81ff;
  }

  .hljs-attr {
    color: #a6e22e;
  }

  .hljs-string {
    color: #e6db74;
  }

  .hljs-title.class_,
  .hljs-title.class_old {
    color: #a6e22e;
  }

  .hljs-title.function_ {
    color: #a6e22e;
  }

  a {
    color: #0969da;
    cursor: pointer;
  }

  a:hover {
    text-decoration: underline;
  }

  mark {
    background-color: #fff59d;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  hr {
    margin: 1rem 0;
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;
  }

  table td,
  table th {
    border: 1px solid #ccc;
    box-sizing: border-box;
    min-width: 1em;
    padding: 3px 3px;
    vertical-align: top;
  }

  table th {
    background-color: #f4f4f4;
    font-weight: bold;
    text-align: left;
  }

  table.selectedCell::after {
    background-color: rgba(200, 200, 255, 0.4);
    content: "";
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
    position: absolute;
  }

  .selectedCell {
    background-color: rgba(200, 200, 255, 0.2);
  }

  .column-resize-handle {
    background-color: #0d0d0d;
    cursor: col-resize;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    user-select: none;
    width: 4px;
  }

  p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
`;
