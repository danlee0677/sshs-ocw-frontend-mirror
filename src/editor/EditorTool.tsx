// Toolbar.tsx
import { useCurrentEditor } from "@tiptap/react";
import { useState } from "react";

export function Toolbar() {
  const { editor } = useCurrentEditor();
  const [url, setUrl] = useState("");

  if (!editor) return null;

  const insertYoutube = () => {
    // Tiptap’s YouTube command
    editor.commands.setYoutubeVideo({
      src: url,
      width: 640,
      height: 360,
      // start: 30, modestBranding, etc. if you want
    });
  };

  return (
    <div>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste YouTube URL"
      />
      <button onClick={insertYoutube}>Insert</button>
    </div>
  );
}
