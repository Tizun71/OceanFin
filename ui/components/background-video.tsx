"use client"

export function BackgroundVideo() {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className="fixed inset-0 w-full h-full object-cover z-0"
      ref={(video) => {
        if (video) {
          video.playbackRate = 1.2;
        }
      }}
    >
      <source src="/videos/bg-ocean-video.mp4" type="video/mp4" />
      <source src="/videos/bg-ocean-video.webm" type="video/webm" />
    </video>
  );
}
