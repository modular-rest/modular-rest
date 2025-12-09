export function join(args: string[]): string {
  let url = "";

  for (let i = 0; i < args.length; i++) {
    let segment = args[i] || "";
    
    // Remove leading slash (except for first segment to preserve absolute paths)
    if (i > 0 && segment.startsWith("/")) {
      segment = segment.slice(1);
    }
    
    // Remove trailing slash
    if (segment.endsWith("/")) {
      segment = segment.slice(0, -1);
    }

    url += segment;
    
    // Add separator between segments (only if current segment is not empty)
    if (i < args.length - 1 && segment) {
      url += "/";
    }
  }

  return url;
}
