import fetch from 'node-fetch';

interface Release {
  tag_name: string;
  [key: string]: string;
}

export async function getLatestRelease(options: { owner: string; repo: string }): Promise<Release> {
  const { owner, repo } = options;
  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const headers = { Accept: 'application/vnd.github.v3+json' };

  const response = await fetch(url, { headers });
  const release: Release = await response.json();

  console.log('release', release);
  return release;
}
