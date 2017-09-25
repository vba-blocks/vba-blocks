import { file } from 'tmp';

export default async function tmpFile(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    file((err: any, path: string) => {
      if (err) return reject(err);
      resolve(path);
    });
  });
}
