import type { BuildInfo } from '@/types/system'

/**
 * Facts the build recorded about itself, assembled once.
 *
 * Every value behind this object comes from a constant that `define` inlined in
 * vite.config.ts, which in turn read it from a command (`git …`), the process
 * (`process.platform`) or the manifest (`package.json`). Nothing here is written
 * down twice, so nothing here can go stale.
 *
 * The module is imported during prerendering too, which is safe precisely
 * because it touches no browser API and no filesystem: it only unwraps values
 * the bundler already replaced.
 */
export const buildInfo: BuildInfo = {
  commit: {
    hash: __COMMIT_HASH__,
    hashFull: __COMMIT_HASH_FULL__,
    subject: __COMMIT_SUBJECT__,
    body: __COMMIT_BODY__,
  },
  version: {
    site: __PKG_VERSION__,
  },
  build: {
    time: __BUILD_TIME__,
    timestamp: Number(__BUILD_TIMESTAMP__),
    platform: __BUILD_PLATFORM__,
    arch: __BUILD_ARCH__,
    nodeVersion: __BUILD_NODE_VERSION__,
  },
}

/**
 * Link to the deployed commit on GitHub.
 *
 * Empty when the build ran outside a git checkout (a CI tarball has no commit to
 * link to), and callers treat that as "render no link" rather than rendering a
 * broken one.
 */
export const commitUrl: string = buildInfo.commit.hashFull
  ? `${__GITHUB_REPO__}/commit/${buildInfo.commit.hashFull}`
  : ''
