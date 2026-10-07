import type { Component } from 'vue'

/**
 * Shapes for the system information panel.
 *
 * The panel is table-driven: the build's own facts are assembled once in
 * `src/lib/build.ts`, and the view renders whatever rows survived. Rows missing a
 * value are dropped rather than shown as "unknown", so a build without git or
 * without a CDN does not spend three lines saying so.
 */

/** One label/value line in the panel. */
export interface InfoRow {
  label: string
  value: string
  /** Render the value in the monospace font (hashes, versions, platforms). */
  mono?: boolean
  /** Secondary line under the value, e.g. a relative age. */
  hint?: string
}

export interface InfoSection {
  title: string
  icon: Component
  rows: InfoRow[]
}

/** Everything the build knew about itself, captured at build time. */
export interface BuildInfo {
  commit: {
    hash: string
    hashFull: string
    subject: string
    body: string
  }
  version: {
    site: string
  }
  build: {
    time: string
    timestamp: number
    platform: string
    arch: string
    nodeVersion: string
  }
}

/**
 * Result of the runtime network probe.
 *
 * Both fields are optional because a platform without either signal is normal:
 * a local preview answers with no CDN headers at all, and an aborted request
 * leaves nothing to report. The distinction matters -- "no CDN" is an answer,
 * "the request failed" is not.
 */
export interface NetworkInfo {
  /** CDN / edge provider inferred from response headers. */
  cdn?: string
  /** Edge location code, currently only Cloudflare's `cf-ray` carries one. */
  edge?: string
  /** True when the probe request threw; `cdn` then has no meaning. */
  error: boolean
}
