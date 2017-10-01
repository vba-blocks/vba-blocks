export default async function tmpFile(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Defer requiring tmp as it adds process listeners that can cause warnings
    require('tmp').file((err: any, path: string) => {
      if (err) return reject(err);
      resolve(path);
    });
  });
}
