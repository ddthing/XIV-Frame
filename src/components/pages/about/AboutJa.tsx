import { DocumentPage } from '@/components/content/DocumentPage'
import { FeatureCoverageTable } from '@/components/content/FeatureCoverageTable'
import Link from 'next/link'

export function AboutJa() {
  return (
    <DocumentPage
      eyebrow="04 / ABOUT"
      title="XIV Frameについて"
      description="XIV Frameの機能と、画像・設定の扱いについて確認できます。"
      updatedLabel="最終更新"
      updated="2026年8月22日"
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
                <li>最大16枚のスクリーンショットを追加して順番を変更できます。3×3・4×4グリッドはそれぞれ9枚・16枚を使います。</li>
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
              <p>公開運営識別子は<strong>ddthing / XIV Frame</strong>です。ソースコードと変更履歴は<a href="https://github.com/ddthing/XIV-Frame" target="_blank" rel="noopener noreferrer">XIV FrameのGitHubリポジトリ</a>で確認でき、バグ報告やフィードバックは<Link href="/ja/contact">お問い合わせページ</Link>からお送りください。</p>
              <p>ファイナルファンタジーXIVのゲームコンテンツおよび商標の権利は各権利者に帰属します。XIV Frameはスクウェア・エニックスと提携または公式承認されたサービスではありません。</p>
            </>
          ),
        },
        {
          id: 'how-guides-are-maintained',
          index: '05',
          title: 'ガイドの更新方針',
          children: (
            <>
              <p>ガイドは操作項目の羅列ではなく、エディターで1つの結果を作る順番と判断基準を説明するためのものです。レイアウト、合成、ファイル容量、公開前の確認など、目的の違う作業は別の記事に分け、同じ説明を繰り返さないようにしています。</p>
              <p>機能が変わった場合は本文と更新日を一緒に見直します。画面で確認できない機能を案内したり、検索語だけでページを増やしたりせず、失敗時の確認手順も説明します。すべての内容は<Link href="/ja/blog">ガイド一覧</Link>から確認できます。</p>
            </>
          ),
        },
        {
          id: 'supported-workflow',
          index: '06',
          title: '推奨する流れと制限',
          children: (
            <>
              <p>最初は画像を追加し、レイアウトを選び、合成・署名・保存の順に進めると安定します。モバイルで背景削除を使う場合は1枚ずつ処理し、大切な結果はPNGとして別に保存してください。</p>
              <p>XIV Frameは編集ツールであり、画像の所有権や公開許可を判断するサービスではありません。他の人のキャラクター、ロゴ、会話が含まれる画像は、利用者自身で権利と同意を確認してください。</p>
            </>
          ),
        },
        {
          id: 'feature-coverage',
          index: '07',
          title: '確認済みの機能範囲',
          children: (
            <FeatureCoverageTable
              intro="2026年8月22日に確認したレビュービルドを基準に、実際の編集画面で確認した機能と制限です。公開版の状態はリリース後に再確認します。処理時間はブラウザ、端末のメモリ、元ファイルによって変わります。"
              areaLabel="領域"
              supportLabel="対応機能"
              notesLabel="利用基準"
              rows={[
                { area: '入力画像', support: 'PNG · JPG · WebP', notes: '1ファイル50MB以下、写真は最大16枚。大きな画像はブラウザで最適化される場合があります。' },
                { area: 'レイアウト', support: '横分割 · 縦分割 · グリッド · 3×3 · 4×4', notes: '通常のグリッドは3～4枚、3×3・4×4はそれぞれ9枚・16枚を使い、自動・16:9・2:1の比率と間隔・枠・背景を調整します。' },
                { area: '合成', support: '背景削除 · 消去 · 復元 · 影', notes: 'ブラウザ内で処理し、素材のサイズを25～500%で調整できます。' },
                { area: '微調整', support: 'デスクトップ矢印キー · モバイル操作', notes: 'デスクトップは1px/10px、モバイルはボタンと長押しで移動します。' },
                { area: '保存・保管', support: 'PNGダウンロード', notes: 'スクリーンショットはサーバーに保存せず、設定はブラウザに残る場合があります。' },
              ]}
            />
          ),
        },
      ]}
    />
  )
}
