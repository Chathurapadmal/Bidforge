export async function readJsonSafe(res: Response) {
  try {
    const txt = await res.text();
    if (!txt) return null;
    return JSON.parse(txt);
  } catch (e) {
    return null;
  }
}
