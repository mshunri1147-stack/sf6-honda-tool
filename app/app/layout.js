export const metadata = {
  title: 'SF6 Honda Tool',
  description: 'ストリートファイター6 ホンダツールやで〜',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}