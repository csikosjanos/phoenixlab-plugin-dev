export interface RawDocs {
  content: string;
  source: "llms.txt";
  url: string;
  fetchedAt: Date;
}

export interface Release {
  tagName: string;
  name: string;
  body: string;
  publishedAt: Date;
  url: string;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
}

export interface FetchAllResult {
  docs: RawDocs;
  releases: Release[];
}

const OFFICIAL_DOCS_URL = "https://code.claude.com/docs/llms.txt";
const GITHUB_RELEASES_URL = "https://api.github.com/repos/anthropics/claude-code/releases";
const DEFAULT_RELEASE_LIMIT = 20;

export class DocsFetcher {
  async fetchOfficialDocs(): Promise<RawDocs> {
    const response = await fetch(OFFICIAL_DOCS_URL, {
      headers: {
        "User-Agent": "phoenixlab-plugin-dev/0.1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch official docs: ${response.status}`);
    }

    const content = await response.text();

    return {
      content,
      source: "llms.txt",
      url: OFFICIAL_DOCS_URL,
      fetchedAt: new Date(),
    };
  }

  async fetchGitHubReleases(limit: number = DEFAULT_RELEASE_LIMIT): Promise<Release[]> {
    const response = await fetch(GITHUB_RELEASES_URL, {
      headers: {
        "User-Agent": "phoenixlab-plugin-dev/0.1.0",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub releases: ${response.status}`);
    }

    const data: GitHubRelease[] = await response.json();

    return data.slice(0, limit).map((release) => ({
      tagName: release.tag_name,
      name: release.name,
      body: release.body,
      publishedAt: new Date(release.published_at),
      url: release.html_url,
    }));
  }

  async fetchAll(releaseLimit?: number): Promise<FetchAllResult> {
    const [docs, releases] = await Promise.all([
      this.fetchOfficialDocs(),
      this.fetchGitHubReleases(releaseLimit),
    ]);

    return { docs, releases };
  }
}
