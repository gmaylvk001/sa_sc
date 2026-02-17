import React, { useRef, useEffect, useCallback } from "react";

const CustomQuill = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);
  const savedRangeRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || "";
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Save the current selection before focus is lost (needed for color pickers)
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Restore saved selection
  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  const handleFormat = (command, val = null) => {
    editorRef.current.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleHeading = (e) => {
    editorRef.current.focus();
    document.execCommand("formatBlock", false, e.target.value);
    handleInput();
  };

  const handleInsertLink = () => {
    // Save selection before prompt steals focus
    saveSelection();
    const url = prompt("Enter URL:", "https://");
    if (!url) return;

    // Restore selection then insert link
    editorRef.current.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      // Wrap selected text in <a> tag — do NOT insert URL as text
      document.execCommand("createLink", false, url);
      // Make link open in new tab
      const links = editorRef.current.querySelectorAll("a");
      links.forEach((a) => {
        if (a.href === url || a.getAttribute("href") === url) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
      });
    } else {
      // No text selected — insert link text as clickable text
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = url;
      const range = sel.getRangeAt(0);
      range.insertNode(a);
      range.setStartAfter(a);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    handleInput();
  };

  const handleApplyColor = (color) => {
    editorRef.current.focus();
    restoreSelection();
    document.execCommand("foreColor", false, color);
    handleInput();
  };

  const handleApplyHighlight = (color) => {
    editorRef.current.focus();
    restoreSelection();
    document.execCommand("hiliteColor", false, color);
    handleInput();
  };

  // ── SVG Icons ──
  const BoldIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
    </svg>
  );
  const ItalicIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
    </svg>
  );
  const UnderlineIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
    </svg>
  );
  const StrikeIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 19h4v-3h-4v3zM5 4v3h6v3h2V7h6V4H5zM3 14h18v-2H3v2z"/>
    </svg>
  );
  const OLIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-7v2h14V4H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
    </svg>
  );
  const ULIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
    </svg>
  );
  const AlignLeftIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
    </svg>
  );
  const AlignCenterIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
    </svg>
  );
  const AlignRightIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
    </svg>
  );
  const LinkIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
    </svg>
  );
  const IndentIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/>
    </svg>
  );
  const OutdentIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 17h10v-2H11v2zM3 12l4 4V8l-4 4zm-2 9h18v-2H1v2zM1 3v2h18V3H1zm10 6h10V7H11v2zm0 4h10v-2H11v2z"/>
    </svg>
  );
  const ClearIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  );
  // ── End Icons ──

  const Divider = () => (
    <div className="w-px h-5 bg-gray-300 mx-0.5 self-center flex-shrink-0" />
  );

  const Btn = ({ onClick, title, children }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="w-7 h-7 border border-gray-300 rounded bg-white text-gray-600 flex items-center justify-center hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-colors flex-shrink-0"
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden shadow-sm">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-2 bg-gray-50 border-b border-gray-300">

        {/* Heading select */}
        <select
          onChange={handleHeading}
          defaultValue="p"
          className="h-7 text-xs border border-gray-300 rounded px-1.5 bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-red-300"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <Divider />

        <Btn title="Bold (Ctrl+B)"      onClick={() => handleFormat("bold")}><BoldIcon /></Btn>
        <Btn title="Italic (Ctrl+I)"    onClick={() => handleFormat("italic")}><ItalicIcon /></Btn>
        <Btn title="Underline (Ctrl+U)" onClick={() => handleFormat("underline")}><UnderlineIcon /></Btn>
        <Btn title="Strikethrough"      onClick={() => handleFormat("strikeThrough")}><StrikeIcon /></Btn>

        <Divider />

        <Btn title="Ordered List"  onClick={() => handleFormat("insertOrderedList")}><OLIcon /></Btn>
        <Btn title="Bullet List"   onClick={() => handleFormat("insertUnorderedList")}><ULIcon /></Btn>

        <Divider />

        <Btn title="Align Left"   onClick={() => handleFormat("justifyLeft")}><AlignLeftIcon /></Btn>
        <Btn title="Align Center" onClick={() => handleFormat("justifyCenter")}><AlignCenterIcon /></Btn>
        <Btn title="Align Right"  onClick={() => handleFormat("justifyRight")}><AlignRightIcon /></Btn>

        <Divider />

        {/* ── Text Color: save selection on mousedown, apply on color change ── */}
        <label
          title="Text Color"
          onMouseDown={saveSelection}
          className="w-7 h-7 border border-gray-300 rounded bg-white text-gray-600 flex items-center justify-center hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-colors cursor-pointer relative flex-shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 7L6.5 18h1.69l.96-2.5h5.69l.96 2.5h1.69L12 7h-1zm-1.26 7l2.01-5.21L13.76 14H9.74z"/>
          </svg>
          <input
            type="color"
            defaultValue="#000000"
            className="absolute opacity-0 w-0 h-0"
            onChange={(e) => handleApplyColor(e.target.value)}
          />
        </label>

        {/* ── Highlight Color: save selection on mousedown, apply on color change ── */}
        <label
          title="Highlight Color"
          onMouseDown={saveSelection}
          className="w-7 h-7 border border-gray-300 rounded bg-white flex items-center justify-center hover:bg-red-50 hover:border-red-400 transition-colors cursor-pointer relative flex-shrink-0"
        >
          <span className="text-xs font-bold px-0.5 rounded" style={{ background: "#fde047", color: "#000" }}>H</span>
          <input
            type="color"
            defaultValue="#fde047"
            className="absolute opacity-0 w-0 h-0"
            onChange={(e) => handleApplyHighlight(e.target.value)}
          />
        </label>

        <Divider />

        {/* ── Link: saves selection before prompt ── */}
        <Btn title="Insert Link" onClick={handleInsertLink}><LinkIcon /></Btn>

        <Divider />

        <Btn title="Indent"  onClick={() => handleFormat("indent")}><IndentIcon /></Btn>
        <Btn title="Outdent" onClick={() => handleFormat("outdent")}><OutdentIcon /></Btn>

        <Divider />

        <Btn title="Clear Formatting" onClick={() => handleFormat("removeFormat")}><ClearIcon /></Btn>

      </div>

      {/* ── Editor Area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        spellCheck={false}
        data-placeholder="Write your blog content here..."
        className="min-h-[160px] max-h-[400px] overflow-y-auto p-3 text-sm text-gray-800 focus:outline-none leading-relaxed"
      />

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
        [contenteditable] h1 { font-size: 1.75rem; font-weight: 700; margin: 0.3rem 0; line-height: 1.2; }
        [contenteditable] h2 { font-size: 1.4rem;  font-weight: 700; margin: 0.3rem 0; line-height: 1.3; }
        [contenteditable] h3 { font-size: 1.15rem; font-weight: 600; margin: 0.3rem 0; line-height: 1.4; }
        [contenteditable] p  { margin: 0.2rem 0; line-height: 1.6; }
        [contenteditable] ul { list-style: disc;    padding-left: 1.5rem; margin: 0.3rem 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5rem; margin: 0.3rem 0; }
        [contenteditable] a  { color: #0000EE; text-decoration: underline; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default CustomQuill;
