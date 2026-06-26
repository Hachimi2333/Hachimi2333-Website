import { computed } from 'vue'

export interface GitInfo {
  hash: string
  hashFull: string
  subject: string
  body: string
  branch: string
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
    branch: __BRANCH_NAME__,
    insertions: Number(__COMMIT_INSERTIONS__),
    deletions: Number(__COMMIT_DELETIONS__),
    filesChanged: Number(__FILES_CHANGED__),
  }

  const GITHUB_REPO = 'https://github.com/Hachimi2333/Hachimi2333-Website'
  const commitUrl = `${GITHUB_REPO}/commit/${gitInfo.hashFull}`

  // 处理提交内容：限制最多显示3行，...接在第三行末尾
  const formattedBody = computed(() => {
    if (!gitInfo.body) return null
    const lines = gitInfo.body.split('\n').filter(line => line.trim())
    if (lines.length === 0) return null
    if (lines.length > 3) {
      return lines.slice(0, 3).join('\n') + '...'
    }
    return lines.join('\n')
  })

  // 计算 Diffstat Blocks（5个方块，与 GitHub 一致）
  const diffstatBlocks = computed(() => {
    const total = gitInfo.insertions + gitInfo.deletions
    if (total === 0) return Array(5).fill('neutral')

    // 按比例四舍五入计算绿色方块数量
    const greenCount = Math.round((gitInfo.insertions / total) * 5)
    const redCount = 5 - greenCount

    return [
      ...Array(greenCount).fill('green'),
      ...Array(redCount).fill('red'),
    ]
  })

  return {
    gitInfo,
    commitUrl,
    formattedBody,
    diffstatBlocks,
  }
}
