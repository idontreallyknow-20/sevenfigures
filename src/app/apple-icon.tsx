import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1f4a3a', color: '#f7f4ec', fontSize: 128, fontFamily: 'serif' }}>
        7
      </div>
    ),
    size
  )
}
