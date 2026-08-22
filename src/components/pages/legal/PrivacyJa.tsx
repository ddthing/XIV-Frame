import { DocumentPage } from '@/components/content/DocumentPage'
import Link from 'next/link'

export function PrivacyJa() {
  return (
    <DocumentPage
      eyebrow="06 / PRIVACY"
      title="プライバシーポリシー"
      description="編集画像、ブラウザ設定、外部リソース、現在広告を提供していない状態について説明します。"
      updatedLabel="施行日"
      updated="2026年8月22日"
      asideLabel="目次"
      sections={[
        {
          id: 'scope',
          index: '01',
          title: '適用範囲',
          children: (
            <>
              <p>本ポリシーはXIV Frameのウェブサイトとブラウザベースのエディターに適用されます。現在、アカウント登録、ログイン、有料決済機能は提供していません。</p>
              <p>X、GitHub、Ko-fi、外部のお問い合わせサービスへ移動した場合は、それぞれのサービスのプライバシーポリシーが適用されます。</p>
            </>
          ),
        },
        {
          id: 'images-and-editor',
          index: '02',
          title: '画像とエディターデータ',
          children: (
            <>
              <p>スクリーンショットはブラウザで読み込み、キャンバス上で合成します。現在、XIV Frameはスクリーンショットをアカウントや画像サーバーへアップロード・保存する機能を提供していません。ページ更新後は再度画像を選択してください。</p>
              <p>レイアウト、キャンバス比率、署名テキスト、位置などの設定は、利便性のためブラウザのローカルストレージに保存される場合があります。アップロードしたロゴはブラウザで縮小し、ローカルデータとして保存される場合があります。XIV Frameのサーバーからこのローカルデータを取得することはできません。</p>
            </>
          ),
        },
        {
          id: 'technical-requests',
          index: '03',
          title: '技術的なリクエストと外部リソース',
          children: (
            <>
              <p>ウェブサイトを配信・保護するホスティングまたはCDNは、リクエスト処理とセキュリティのため、IPアドレス、ブラウザ情報、リクエスト時刻、アクセスしたパスなどを記録する場合があります。XIV Frameは編集画像の内容と結び付けたプロファイルを作成しません。</p>
              <p>サイトではフォントやアイコンなどの外部リソースを読み込む場合があります。公開ページでは現在、Google広告タグを読み込んでいません。外部提供者はリクエストに必要な情報をそれぞれのポリシーに従って処理します。</p>
            </>
          ),
        },
        {
          id: 'ads-and-cookies',
          index: '04',
          title: 'CookieとGoogle広告',
          children: (
            <>
              <p>現在、XIV Frameは広告スロットとGoogle広告タグを提供していません。このバージョンではGoogle広告Cookieのための情報収集を行いません。</p>
              <p>将来広告を導入する場合は、広告配信前にGoogleの同意要件と適用法令を確認し、必要な同意管理画面、提供者の開示、Cookieに関する説明を先に適用します。広告をナビゲーションやダウンロードボタンのように見せることはありません。</p>
              <p>広告を再開するバージョンを公開する前に、このページの広告提供状況と施行日を更新します。</p>
            </>
          ),
        },
        {
          id: 'your-controls',
          index: '05',
          title: '利用者ができること',
          children: (
            <>
              <p>ブラウザの設定からローカルストレージやCookieを削除・ブロックできます。ローカルストレージを削除すると、保存されたレイアウト、署名、ロゴ設定が初期化される場合があります。</p>
              <p>プライバシーやサービスについての質問は<Link href="/ja/contact">お問い合わせページ</Link>をご利用ください。外部提供者が直接扱う情報については、その提供者へお問い合わせください。</p>
            </>
          ),
        },
        {
          id: 'changes-and-contact',
          index: '06',
          title: '変更とお問い合わせ',
          children: (
            <>
              <p>公開運営識別子は<strong>ddthing / XIV Frame</strong>です。ソースコードと変更履歴は<a href="https://github.com/ddthing/XIV-Frame" target="_blank" rel="noopener noreferrer">GitHubリポジトリ</a>で確認できます。プライバシーに関する質問は<Link href="/ja/contact">お問い合わせページ</Link>からお送りください。</p>
              <p>サービス、広告の設定、または適用される要件が変わった場合、本ポリシーを更新することがあります。改定時はこのページの施行日を更新します。</p>
              <p>最終更新：2026年8月22日</p>
            </>
          ),
        },
      ]}
    />
  )
}
