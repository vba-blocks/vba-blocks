export default function isPackaged() {
  return 'pkg' in process;
}
