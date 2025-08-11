import React from 'react';
import { EditorProvider, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Youtube from '@tiptap/extension-youtube';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, all } from 'lowlight';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';
import Math from '@tiptap/extension-mathematics';
import FloatingMenu from '@tiptap/extension-floating-menu';
import BubbleMenu from '@tiptap/extension-bubble-menu';

const lowlight = createLowlight(all);

const EditorShell = ({children}: {children: React.ReactNode}) => {
  const extensions = [
    StarterKit,
    Highlight.configure({
      multicolor: true,
    }),
    Youtube.configure({

    }), 
    CodeBlockLowlight.configure({
      lowlight
    }),
    Image,
    Math,
  ]

  const content = "<p>Hello</p>"
  
  return (
    <EditorProvider extensions={extensions} content={content}>
      {children}
    </EditorProvider>
  )
}

export default EditorShell;