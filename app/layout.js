'use client';

export const metadata = {
  title: 'SF6 Honda Tool',
  description: 'ストリートファイター6 ホンダツールやで〜',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#000' }}>
        {children}
      </body>
    </html>
  )
}