import { useMemo, useCallback } from "react";
import { Editor } from "@tiptap/react";

// key for storing editor things in localstorage

export function addYoutubeVideo(editor: Editor | null) {
  if (!editor) return;

  const url = prompt('Enter Youtube URL')

  if (url) {
    editor.commands.setYoutubeVideo({
      src: url,
    })
  }
}


// todo: send module id along