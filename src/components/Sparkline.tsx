'use client'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface Props {
  data: { date: string; close: number }[]
  positive?: boolean
}

export function Sparkline({ data, positive = true }: Props) {
  const color = positive ? '#1a5c35' : '#7a1a1a'
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line type="monotone" dataKey="close" stroke={color} strokeWidth={1} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
