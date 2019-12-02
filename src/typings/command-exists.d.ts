declare module 'command-exists' {
  export default async function commandExists(command: string): Promise<boolean>;
}
