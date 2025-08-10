import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Youtube from '@tiptap/extension-youtube';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, all } from 'lowlight';
import Image from '@tiptap/extension-image';
import Math from '@tiptap/extension-mathematics';


const lowlight = createLowlight(all);

const Editor = () => {
  const editor = useEditor({
    extensions: [
      Document, 
      Paragraph, 
      Text, 
      Youtube, 
      CodeBlockLowlight.configure({lowlight}),
      Image,
      Math.configure({
        
      })
    ],
    content: '<p>Hello World</p>',
  })

  if (!editor) {
    return (<></>)
  }
  
  return (
    <EditorContent editor={editor} />
  )
}

export default Editor