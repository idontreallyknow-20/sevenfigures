import { ImageResponse } from 'next/og'

export const alt = 'sevenfigures, a stock research tracker by Joseph Leung'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 80, background: '#f7f4ec', color: '#211f1b', fontFamily: 'serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, background: '#1f4a3a', color: '#f7f4ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>7</div>
          <div style={{ fontSize: 40, color: '#1f4a3a', fontWeight: 600 }}>sevenfigures</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, lineHeight: 1.1, fontWeight: 300 }}>Stock research, scored out of 35.</div>
          <div style={{ fontSize: 32, color: '#5a5750', marginTop: 24 }}>Seven-dimension scores, theses and a decision journal.</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, color: '#5a5750', borderTop: '1px solid rgba(33,31,27,0.2)', paddingTop: 24 }}>
          <span>Built by Joseph Leung</span>
          <span>Richmond Hill, Ontario</span>
        </div>
      </div>
    ),
    size
  )
}
