import './globals.css'  // 後で必要になったら追加するで

export const metadata = {
  title: 'SF6 Honda Tool',
  description: 'Street Fighter 6 ホンダツールやで〜',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  )
}