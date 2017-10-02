import walkSync from 'walk-sync';

export default async function walk(dir: string): Promise<string[]> {
  return walkSync(dir);
}
