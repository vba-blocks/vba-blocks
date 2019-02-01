export async function loadWorkspace(manifest) {
    return {
        root: manifest,
        members: []
    };
}
