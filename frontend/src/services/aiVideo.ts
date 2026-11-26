export const videoStyles = ['Workshop documentary', 'Studio showcase', 'Festive gifting'] as const;
export type VideoStyle = typeof videoStyles[number];

export interface VideoRequest {
  images: File[];
  style?: VideoStyle;
}

export function requestShowcaseVideo(_request: VideoRequest): { status: 'coming-soon'; message: string } {
  // TODO: Connect a server-side image-to-video provider when the feature is available.
  // TODO: Add seller consent, upload validation, job progress and output moderation before enabling generation.
  return { status: 'coming-soon', message: 'Video generation is coming soon. Your selected images stayed on this device.' };
}
