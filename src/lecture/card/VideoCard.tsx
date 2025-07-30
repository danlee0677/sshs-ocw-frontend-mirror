import React from "react";
import { AspectRatio } from "@mantine/core";

function VideoCard({src}: {src: string}) {
  return (
    <AspectRatio ratio={16 / 9} w="100%">
      <iframe
        src={src}
        title="Lecture"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </AspectRatio>
  )
}

export default VideoCard