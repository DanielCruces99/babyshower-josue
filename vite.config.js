import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { EVENT, isPending } from './src/config/event.config.js'
import { PALETTE } from './src/config/palette.mjs'

const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// Rellena título, Open Graph y theme-color de index.html con los datos de event.config.js.
function eventMetaPlugin() {
  const babyName = isPending(EVENT.baby.name) ? '' : ' de ' + EVENT.baby.name
  const values = {
    TITLE: `${EVENT.texts.tagline} | ${EVENT.texts.eventKind}${babyName}`,
    DESCRIPTION: EVENT.texts.shareDescription,
    SITE_URL: EVENT.site.url,
    OG_IMAGE: new URL('og-image.jpg', EVENT.site.url).href,
    THEME_COLOR: PALETTE.rosaPalo,
  }
  return {
    name: 'event-meta',
    transformIndexHtml: html => html.replace(/%EVENT_(\w+)%/g, (m, key) => key in values ? escapeHtml(values[key]) : m),
  }
}

// public/models/source/ guarda los originales sin optimizar: nunca se publican.
function dropModelSourcesPlugin() {
  let outDir
  return {
    name: 'drop-model-sources',
    apply: 'build',
    configResolved: config => { outDir = path.resolve(config.root, config.build.outDir) },
    closeBundle: () => fs.rmSync(path.join(outDir, 'models/source'), { recursive: true, force: true }),
  }
}

export default defineConfig({
  plugins: [react(), eventMetaPlugin(), dropModelSourcesPlugin()],
  base: '/babyshower-josue/',
})
