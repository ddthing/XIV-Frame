import { DocumentPage } from '@/components/content/DocumentPage'
import Link from 'next/link'

export function AboutJa() {
  return (
    <DocumentPage
      eyebrow="04 / ABOUT"
      title="XIV Frameについて"
      description="XIV Frameの機能と、画像・設定の扱いについて確認できます。"
      updatedLabel="最終更新"
      updated="2026年8月13日"
      asideLabel="このページ"
      sections={[
        {
          id: 'what-is-xiv-frame',
          index: '01',
          title: 'XIV Frameとは？',
          children: (
            <>
              <p>XIV Frameは、ファイナルファンタジーXIV（FF14）のスクリーンショットを1枚のPNGにまとめるブラウザベースの編集ツールです。複雑な画像編集ソフトを開かずに、複数の画像を配置し、キャラクター名やサーバー名、ロゴを追加して保存できます。</p>
              <ul>
                <li>最大4枚のスクリーンショットを追加して順番を変更できます。</li>
                <li>分割、縦並び、グリッドのレイアウトとキャンバス比率を選べます。</li>
                <li>画像ごとの拡大率・位置、テキスト署名・ロゴを調整できます。</li>
              </ul>
            </>
          ),
        },
        {
          id: 'who-it-is-for',
          index: '02',
          title: 'どんな時に使えますか？',
          children: (
            <>
              <p>キャラクターを複数の角度から見せたい時、ミラプリやハウジングの記録を整理したい時、コミュニティ投稿用のショーケース画像を作りたい時に便利です。</p>
              <p>基本の順番は<strong>画像を追加 → レイアウトを選ぶ → 署名を調整 → PNGを保存</strong>です。<Link href="/ja/blog">ガイド</Link>もこの順番で、エディターに表示されるラベルに沿って説明しています。</p>
            </>
          ),
        },
        {
          id: 'data-and-storage',
          index: '03',
          title: '画像と設定の扱い',
          children: (
            <>
              <p>アップロードしたスクリーンショットはブラウザで読み込み、キャンバスに描画します。現在のエディターではアカウント登録や画像サーバーへのアップロードは必要ありません。スクリーンショットはページを更新すると再度選択する必要があります。</p>
              <p>レイアウト、署名、位置などの設定は、次回も使えるようブラウザのローカルストレージに保存される場合があります。アップロードしたロゴはサイズを調整したデータとしてローカルに保存されるため、共有パソコンでは利用後にブラウザデータを確認してください。</p>
            </>
          ),
        },
        {
          id: 'open-source-and-rights',
          index: '04',
          title: 'オープンソースと権利について',
          children: (
            <>
              <p>ソースコードは<a href="https://github.com/ddthing/XIV-Frame" target="_blank" rel="noopener noreferrer">XIV FrameのGitHubリポジトリ</a>で確認できます。バグ報告やフィードバックは<Link href="/ja/contact">お問い合わせページ</Link>からお送りください。</p>
              <p>ファイナルファンタジーXIVのゲームコンテンツおよび商標の権利は各権利者に帰属します。XIV Frameはスクウェア・エニックスと提携または公式承認されたサービスではありません。</p>
            </>
          ),
        },
      ]}
    />
  )
}
