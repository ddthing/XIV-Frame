import { DocumentPage } from '@/components/content/DocumentPage'
import Link from 'next/link'

export function PrivacyJa() {
  return (
    <DocumentPage
      eyebrow="06 / PRIVACY"
      title="プライバシーポリシー"
      description="編集画像、ブラウザ設定、技術的なリクエスト、広告に関する情報の扱いを説明します。"
      updatedLabel="施行日"
      updated="2026年8月13日"
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
              <p>サイトではフォント、アイコン、広告などの外部リソースを読み込む場合があります。外部提供者はリクエストに必要な情報をそれぞれのポリシーに従って処理します。</p>
            </>
          ),
        },
        {
          id: 'ads-and-cookies',
          index: '04',
          title: 'CookieとGoogle広告',
          children: (
            <>
              <p>サイトではGoogle AdSenseまたはGoogleの広告タグを使用する場合があります。広告リクエストが行われると、Googleおよび認定された第三者広告提供者が、広告の配信・測定のためにCookie、ウェブビーコン、IPアドレスなどを利用する場合があります。</p>
              <p>広告Cookieについては<a href="https://support.google.com/adsense/answer/1348695" target="_blank" rel="noopener noreferrer">AdSenseの必須コンテンツに関する案内</a>を確認できます。パーソナライズド広告は<a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google広告設定</a>で管理でき、一部の第三者広告Cookieは<a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">About Adsの選択ページ</a>から拒否できます。</p>
              <p>必要な地域では、適用法令とGoogleの同意要件に従って同意管理画面を使用する場合があります。広告のクリックを促したり、広告をナビゲーションやダウンロードボタンに見せたりすることはありません。</p>
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
              <p>サービス、広告の設定、または適用される要件が変わった場合、本ポリシーを更新することがあります。改定時はこのページの施行日を更新します。</p>
              <p>最終更新：2026年8月13日</p>
            </>
          ),
        },
      ]}
    />
  )
}
