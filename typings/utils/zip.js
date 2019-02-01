import { createWriteStream } from 'fs';
export async function zip(dir, file) {
    const { create: createArchive } = await import('archiver');
    return new Promise((resolve, reject) => {
        try {
            const output = createWriteStream(file);
            const archive = createArchive('zip');
            output.on('close', () => resolve());
            output.on('error', reject);
            archive.pipe(output);
            archive.on('error', reject);
            archive.directory(dir, '/');
            archive.finalize();
        }
        catch (err) {
            reject(err);
        }
    });
}
export async function unzip(file, dest) {
    const decompress = (await import('decompress'));
    await decompress(file, dest);
}
