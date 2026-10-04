import { computed } from 'vue'

export interface GitInfo {
  hash: string
  hashFull: string
  subject: string
  body: string
  insertions: number
  deletions: number
  filesChanged: number
}

export function useGitInfo() {
  const gitInfo: GitInfo = {
    hash: __COMMIT_HASH__,
    hashFull: __COMMIT_HASH_FULL__,
    subject: __COMMIT_SUBJECT__,
    body: __COMMIT_BODY__,
    insertions: Number(__COMMIT_INSERTIONS__),
    deletions: Number(__COMMIT_DELETIONS__),
    filesChanged: Number(__FILES_CHANGED__),
  }

  // The repository URL is injected at build time. `hashFull` is empty when the
  // build ran outside a git checkout (CI tarball), so only offer a link when
  // there is a commit to link to.
  const commitUrl = gitInfo.hashFull ? `${__GITHUB_REPO__}/commit/${gitInfo.hashFull}` : ''

  // Commit bodies can be long: keep the first three non-empty lines.
  const formattedBody = computed(() => {
    const lines = gitInfo.body.split('\n').filter((line) => line.trim())
    if (lines.length === 0) return null
    if (lines.length > 3) return `${lines.slice(0, 3).join('\n')}...`
    return lines.join('\n')
  })

  return { gitInfo, commitUrl, formattedBody }
}
