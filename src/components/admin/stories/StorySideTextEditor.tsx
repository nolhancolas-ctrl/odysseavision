"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/core";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";
import {
  normalizeStorySideTextHtml,
  storySideTextHasContent,
} from "@/components/stories/storySideText";

type Props = {
  value: string;
  ariaLabel: string;
  placeholder: string;
  className: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onEditorReady: (editor: Editor | null) => void;
};

export function StorySideTextEditor({
  value,
  ariaLabel,
  placeholder,
  className,
  onChange,
  onFocus,
  onEditorReady,
}: Props) {
  const elementRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onFocusRef = useRef(onFocus);
  const onEditorReadyRef = useRef(onEditorReady);
  const [empty, setEmpty] = useState(() => !storySideTextHasContent(value));

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
    onFocusRef.current = onFocus;
    onEditorReadyRef.current = onEditorReady;
  }, [onChange, onEditorReady, onFocus, value]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || editorRef.current) return;

    const editor = new Editor({
      element,
      content: normalizeStorySideTextHtml(valueRef.current) || "<p></p>",
      extensions: [
        StarterKit.configure({
          heading: false,
          blockquote: false,
          codeBlock: false,
          horizontalRule: false,
          link: {
            openOnClick: false,
            autolink: false,
          },
        }),
        TextAlign.configure({
          types: ["paragraph"],
        }),
      ],
      editorProps: {
        attributes: {
          class: "story-side-text-editor-content",
          role: "textbox",
          "aria-label": ariaLabel,
          "aria-multiline": "true",
          spellcheck: "true",
        },
      },
      onFocus: () => onFocusRef.current(),
      onCreate: ({ editor: createdEditor }) => {
        setEmpty(createdEditor.isEmpty);
      },
      onUpdate: ({ editor: updatedEditor }) => {
        const nextValue = normalizeStorySideTextHtml(updatedEditor.getHTML());
        setEmpty(!storySideTextHasContent(nextValue));
        onChangeRef.current(nextValue);
      },
    });

    editorRef.current = editor;
    onEditorReadyRef.current(editor);

    return () => {
      onEditorReadyRef.current(null);
      editor.destroy();
      editorRef.current = null;
    };
  }, [ariaLabel]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const normalizedValue = normalizeStorySideTextHtml(value);
    const currentValue = normalizeStorySideTextHtml(editor.getHTML());
    if (normalizedValue === currentValue) return;

    editor.commands.setContent(normalizedValue || "<p></p>", {
      emitUpdate: false,
    });
    setEmpty(!storySideTextHasContent(normalizedValue));
  }, [value]);

  return (
    <div className={className} data-empty={empty ? "true" : "false"}>
      <div ref={elementRef} />
      {empty ? (
        <span aria-hidden="true" className="story-side-text-placeholder">
          {placeholder}
        </span>
      ) : null}
    </div>
  );
}
