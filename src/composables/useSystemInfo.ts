import { computed, ref } from 'vue'
import { ClockIcon, GitCommitIcon, PackageIcon, WifiIcon } from '@lucide/vue'
import { buildInfo, commitUrl } from '@/lib/build'
import { probeNetwork } from '@/lib/network'
import type { InfoRow, InfoSection, NetworkInfo } from '@/types/system'

/**
 * Data behind the footer's system information panel.
 *
 * Build facts come straight from `src/lib/build.ts`. The network rows are filled
 * in later: they cannot exist during prerendering, and probing from page-load
 * code would add a request to every page for a panel almost nobody opens.
 */
export function useSystemInfo() {
  const network = ref<NetworkInfo | null>(null)
  const probing = ref(false)

  /**
   * The commit's own message: its subject, or failing that its first body line.
   *
   * The fallback matters for a repository whose commits are written without a
   * subject line -- `%s` is then empty and the row would otherwise vanish, which
   * is the one row that should never disappear from this panel.
   */
  const commitMessage = computed(() => {
    const { subject, body } = buildInfo.commit
    if (subject.trim()) return subject.trim()
    return body
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line !== '') ?? ''
  })

  /**
   * Keep only rows that have something to say.
   *
   * Every fact here is optional in principle -- a build outside git has no
   * commit, a manifest without `version` has no site version, a request answered
   * without CDN headers has no edge -- and dropping those rows reads far better
   * than a column of "unknown".
   */
  const rows = (candidates: Array<InfoRow | null>): InfoRow[] =>
    candidates.filter((row): row is InfoRow => row !== null && row.value !== '')

  const versionSection = computed<InfoSection>(() => ({
    title: '版本',
    icon: PackageIcon,
    // The `v` is display only -- the manifest holds `2.0.0`, and the tool cards
    // badge their versions the same way.
    rows: rows([
      { label: '站点版本', value: buildInfo.version.site ? `v${buildInfo.version.site}` : '', mono: true },
      { label: '当前提交', value: buildInfo.commit.hash, mono: true },
      { label: '提交信息', value: commitMessage.value },
    ]),
  }))

  const buildSection = computed<InfoSection>(() => ({
    title: '构建',
    icon: ClockIcon,
    rows: rows([
      {
        label: '构建时间',
        value: buildInfo.build.time,
        mono: true,
      },
      buildInfo.build.platform
        ? {
            label: '构建平台',
            value: `${buildInfo.build.platform} ${buildInfo.build.arch} · ${buildInfo.build.nodeVersion}`,
            mono: true,
          }
        : null,
    ]),
  }))

  const networkRows = computed<InfoRow[]>(() => {
    if (probing.value || network.value === null) return [{ label: 'CDN', value: '检测中…' }]
    if (network.value.error) return [{ label: 'CDN', value: '检测失败' }]

    return rows([
      { label: 'CDN', value: network.value.cdn ?? '未检测到 CDN' },
      network.value.edge ? { label: '边缘节点', value: network.value.edge, mono: true } : null,
    ])
  })

  const networkSection = computed<InfoSection>(() => ({
    title: '网络',
    icon: WifiIcon,
    rows: networkRows.value,
  }))

  const sections = computed<InfoSection[]>(() =>
    [versionSection.value, buildSection.value, networkSection.value].filter(
      (section) => section.rows.length > 0,
    ),
  )

  /**
   * Fill in the network rows, once.
   *
   * Successful results are kept; a failure can be retried, since the common
   * causes (offline, request blocked) are transient. Re-entrant calls while a
   * probe is in flight are ignored so a double "open" cannot fire two requests.
   */
  async function probe(): Promise<void> {
    if (probing.value) return
    if (network.value && !network.value.error) return

    probing.value = true
    try {
      network.value = await probeNetwork()
    } finally {
      probing.value = false
    }
  }

  return {
    buildInfo,
    commitUrl,
    commitMessage,
    sections,
    network,
    probing,
    probe,
    icons: { commit: GitCommitIcon },
  }
}
