export function join([...args]) {
  let url = "";

  for (let i = 0; i < args.length; i++) {
    const path = args[i];

    let parts = path.split("");
    if (path.startsWith("/")) parts[0] = "";
    if (path.endsWith("/")) parts[parts.length - 1] = "";

    url += parts.join("");

    if (i < args.length-1) url += "/";
  }

  return url;
}
