export default function staticImageLoader({ src, width }: { src: string; width: number }): string {
  if (!src.startsWith("/") || src.endsWith(".svg")) return src;
  return `/_img/${width}${src.replace(/\.(png|jpe?g|webp|avif)$/i, ".webp")}`;
}
