const fs = require('fs')
const path = require('path')

const blogDir = path.join(__dirname, '..', 'src', 'content', 'blog')

const posts = [
  {
    slug: 'how-to-combine-ffxiv-screenshots',
    date: '2026-06-03',
    locales: {
      en: {
        title: 'How to Combine FFXIV Screenshots for Twitter/X',
        description: 'Learn how to perfectly combine and frame your FFXIV screenshots for social media like Twitter without using Photoshop.',
        content: `
Why post just one screenshot when you can post a beautiful collage? Twitter (X) and Instagram are great platforms to show off your FFXIV character, but combining multiple screenshots can be a hassle.

## Why Combine Screenshots?

When you have a great GPose session, you probably took photos of your character from multiple angles. A collage allows you to showcase the front, back, and details of your glamour in a single, cohesive image. This is highly effective on social media because it prevents timeline clutter while maximizing engagement.

## Popular FFXIV Screenshot Layouts

For Twitter, the most effective layout is usually a **16:9** or **2:1** horizontal layout, combining two or three vertical shots side by side. For Instagram, a **1:1** square crop is essential. 

## Using XIV Frame for Easy Collages

You don't need Photoshop to combine your screenshots. **XIV Frame** allows you to easily select a ratio (like 16:9), add multiple images, and position them exactly how you want.

1. Go to XIV Frame.
2. Select your desired Canvas Ratio.
3. Click **Add Photo** and drag your screenshots into the frame.
4. Adjust their position and zoom level.
5. Export!

It's completely browser-based and fast.`
      },
      ko: {
        title: '파판14 스크린샷 2장 합치기 및 트위터 업로드 최적화 방법',
        description: '포토샵 없이 브라우저에서 바로 파판14 스크린샷 여러 장을 예쁘게 합치고 비율을 조절하는 방법을 알아봅니다.',
        content: `
트위터(X)나 인스타그램에 스샷을 올릴 때, 여러 장을 예쁘게 합쳐서 올리면 타임라인에서 훨씬 눈에 잘 띄고 반응도 좋습니다.

## 왜 스크린샷을 합쳐야 할까요?

단체자세(GPose)로 열심히 찍은 내 캐릭터의 앞모습, 뒷모습, 전신샷을 한 번에 보여주기에 콜라주(스샷 합치기)만큼 좋은 방법은 없습니다. 특히 트위터에서는 2~4장의 사진을 올릴 때 크롭(잘림) 현상이 발생할 수 있는데, 미리 한 장으로 합쳐두면 원본 그대로 선명하게 보여줄 수 있습니다.

## 추천하는 파판14 스샷 비율

- **16:9 또는 2:1**: 트위터 업로드용으로 가장 추천하는 가로로 긴 비율입니다. 세로 스샷 2장이나 3장을 나란히 배치하기 좋습니다.
- **1:1 (정사각형)**: 인스타그램 피드 업로드에 최적화된 비율입니다.

## XIV Frame으로 초간단 스샷 합치기

포토샵을 켤 필요 없이 웹 브라우저에서 바로 스샷을 합칠 수 있습니다.

1. **XIV Frame**에 접속합니다.
2. 좌측 패널(또는 모바일 하단)에서 **레이아웃 비율**을 선택합니다.
3. **사진 추가** 버튼을 눌러 원하는 스크린샷들을 불러옵니다.
4. 마우스 드래그와 스크롤을 이용해 위치와 크기를 조절합니다.
5. **저장** 버튼을 누르면 고화질로 병합된 이미지가 다운로드됩니다!`
      },
      ja: {
        title: 'FF14スクリーンショットをTwitter用に綺麗に組み合わせる方法',
        description: 'Photoshopを使わずに、FF14のSSをブラウザ上で簡単に組み合わせ（コラージュ）して、SNSに最適な比率で保存する方法をご紹介します。',
        content: `
Twitter（X）やInstagramで自分のキャラクター（自機）を自慢する時、複数のSSを1枚の美しいコラージュにまとめるのが流行しています。

## なぜSSを組み合わせるの？

グルポ（グループポーズ）で撮影した前面、背面、顔のアップなどを1枚の画像にまとめることで、タイムラインをスッキリ保ちつつ、ミラプリの魅力を最大限に伝えることができます。

## おすすめのSSレイアウト比率

- **16:9 または 2:1**: Twitterに最適な横長の比率です。縦長のSSを2枚〜3枚並べるのに適しています。
- **1:1**: Instagramに最適な正方形の比率です。

## XIV Frameで簡単にSSを組み合わせる

Photoshopなどの重いソフトは不要です。**XIV Frame**を使えば、ブラウザ上で直感的にSSを配置できます。

1. **XIV Frame**を開きます。
2. 希望のキャンバス比率（Ratio）を選択します。
3. **写真を追加**をクリックし、SSを読み込みます。
4. ドラッグとスクロールで位置やズームを調整します。
5. **保存**をクリックして完成！`
      }
    }
  },
  {
    slug: 'ffxiv-screenshot-character-signature',
    date: '2026-06-03',
    locales: {
      en: {
        title: 'Adding Character Name & Server to FFXIV Screenshots',
        description: 'Protect your FFXIV screenshots and add a personal touch by adding your character name, server, and custom signatures.',
        content: `
Adding your character's name and server to your screenshots is a great way to build your personal brand in FFXIV and prevent others from stealing your aesthetic shots.

## The Importance of Watermarking
In a community as large as FFXIV, beautiful GPose screenshots often get shared widely. Adding a subtle signature ensures that you always get credited for your character's unique glamour and your photography skills.

## Adding Text without Photoshop
You don't need complex image editing software to add text. With **XIV Frame**, you can add stylish text directly to your images in your browser.

- Type your **Character Name** and **Server Name** (e.g., Chocobo).
- Choose from various beautiful, high-quality fonts.
- Adjust the letter spacing and text alignment.
- Position the text anywhere on your screenshot.

Give your screenshots a professional magazine-like finish today!`
      },
      ko: {
        title: '파판14 스샷에 내 캐릭터 이름과 서버명 남기기 (시그니처/워터마크)',
        description: '정성들여 찍은 파판14 스크린샷에 내 캐릭터 이름과 소속 서버명을 예쁜 폰트로 새겨넣어 불펌을 방지하고 개성을 뽐내보세요.',
        content: `
잘 찍은 단체자세(GPose) 스크린샷에 내 캐릭터 이름(닉네임)과 서버명을 새기는 것은 나만의 정체성을 표현하는 가장 좋은 방법입니다.

## 워터마크(시그니처)가 필요한 이유
파판14 커뮤니티나 트위터에서는 스크린샷이 활발하게 공유됩니다. 예쁜 룩덕 스샷이나 풍경 스샷이 불펌(무단 도용)되는 것을 방지하고, 내 캐릭터임을 증명하기 위해 구석에 작게 워터마크를 남기는 유저들이 많습니다.

## 포토샵 없이 폰트 적용하여 이름 넣기
**XIV Frame**의 시그니처 기능을 활용하면 폰트 설치나 포토샵 없이도 즉석에서 예쁜 텍스트를 넣을 수 있습니다.

1. 우측(모바일은 하단) **시그니처 설정** 탭으로 이동합니다.
2. **캐릭터 이름**과 **서버명**을 입력합니다.
3. 제공되는 **다양한 한글/영문 폰트**(마루미냐, 넥슨 메이플스토리 등) 중 마음에 드는 것을 선택합니다.
4. 자간과 텍스트 위치(좌하단, 우하단 등)를 조절하여 완성합니다!`
      },
      ja: {
        title: 'FF14のSSにキャラクター名とサーバー名を入れる方法（署名/透かし）',
        description: 'FF14のスクリーンショットに自キャラの名前やサーバー名をおしゃれなフォントで追加し、無断転載を防ぐ方法を紹介します。',
        content: `
グルポで撮影したお気に入りのSSに、自分のキャラクター名とサーバー名を「署名（シグネチャー）」として入れることで、写真にオリジナリティを出すことができます。

## ウォーターマーク（透かし）の重要性
TwitterなどのSNSではSSが拡散されやすいため、無断転載（自作発言）を防ぐ自衛手段としても、画面の隅に小さく名前を入れておくことが推奨されます。

## ブラウザで簡単におしゃれな文字を入れる
**XIV Frame**を使えば、PCやスマホにフォントをインストールしていなくても、ブラウザ上でおしゃれな文字を入れることができます。

- **キャラクター名** と **サーバー名** を入力します。
- メニューから好みのフォントを選択します。
- 文字間隔（レタースペーシング）や配置（右下、左下など）を調整します。

まるでファッション誌の表紙のような、クオリティの高いSSを完成させましょう！`
      }
    }
  },
  {
    slug: 'creating-ffxiv-glamour-showcase',
    date: '2026-06-03',
    locales: {
      en: {
        title: 'Creating the Ultimate FFXIV Glamour Showcase Image',
        description: 'The true endgame is glamour! Learn how to present your FFXIV outfits beautifully using multi-image collages.',
        content: `
Every FFXIV player knows that the true endgame is Glamour. But once you've put together the perfect outfit, how do you show it off to the world?

## Essential GPose Settings for Fashion
To properly showcase an outfit, you need good lighting. 
- Use the **3-point lighting** system in GPose.
- Ensure one light is directly on your character's face (Type 1 or 2).
- Add a rim light behind your character to make them pop from the background.

## Displaying Multiple Angles
A single screenshot doesn't do justice to a complex outfit. You need to show the front, the back, and perhaps a dynamic action pose or a close-up of the weapon.

Using **XIV Frame**, you can easily drop 3 to 4 images into a single layout. This allows viewers to see every detail of your glamour plate in one glance, making it perfect for Eorzea Collection or Reddit.`
      },
      ko: {
        title: '파판14 진최종 콘텐츠: 룩덕/투영 스크린샷 완벽하게 뽐내기',
        description: '단체자세 조명 세팅부터 여러 장의 사진을 엮어 완벽한 룩덕(투영) 포트폴리오 이미지를 만드는 비법을 소개합니다.',
        content: `
파이널판타지14의 진정한 엔드 콘텐츠는 바로 '투영(룩덕)'입니다. 열심히 장터게시판을 뒤져가며 맞춘 완벽한 코디를 자랑하려면 그에 걸맞은 스크린샷 편집이 필수적입니다.

## 룩덕을 위한 단체자세(GPose) 조명 팁
옷의 질감과 색감을 정확히 보여주려면 조명이 매우 중요합니다.
- 단체자세의 **조명 3개**를 모두 활용하세요.
- 캐릭터 정면 약간 위쪽에서 빛 1, 2단계를 비춰 얼굴에 그늘이 지지 않게 합니다.
- 캐릭터 뒤쪽에서 강한 빛(3단계)을 비추면 윤곽선이 살아나면서 배경과 분리되는 효과를 줍니다.

## 앞, 뒤, 전신을 한 장에 담기
의상의 디테일을 모두 보여주려면 앞모습, 뒷모습, 그리고 무기를 든 역동적인 샷을 함께 보여주는 것이 좋습니다.

**XIV Frame**에 접속하여 화면 비율을 설정하고 여러 장의 스크린샷을 마우스로 끌어다 놓기만 하면, 금세 잡지 화보 같은 룩덕 포트폴리오 이미지가 완성됩니다!`
      },
      ja: {
        title: 'FF14 ミラプリ紹介画像の作り方（フロント・バック・全身）',
        description: 'グルポの照明設定から、複数のスクリーンショットを組み合わせて完璧なミラプリ紹介画像を作成するコツを紹介します。',
        content: `
FF14のエンドコンテンツといえば「ミラプリ（ミラージュプリズム）」です。完璧なコーディネートが完成したら、それを美しくSNSで披露しましょう！

## ミラプリのためのグルポ照明術
服の質感や色を正確に伝えるためには、照明が非常に重要です。
- グルポの **3つのライト** をフル活用します。
- キャラクターの正面やや上からタイプ1または2の光を当て、顔に影が落ちないようにします。
- キャラの背後から強い光を当てることで、背景からキャラが浮き立つ立体感を出せます。

## 前・後・全身を1枚にまとめる
衣装のディテールをすべて伝えるには、前面、背面、そして武器を構えたアクションショットを並べるのが効果的です。

**XIV Frame**を使えば、複数のSSをドラッグ＆ドロップするだけで、雑誌の1ページのようなミラプリ紹介画像を瞬時に作成できます。`
      }
    }
  },
  {
    slug: 'edit-ffxiv-screenshots-without-photoshop',
    date: '2026-06-03',
    locales: {
      en: {
        title: 'How to Edit FFXIV Screenshots Without Photoshop',
        description: 'No Photoshop? No problem. Discover how to easily crop, align, and enhance your FFXIV GPose screenshots directly in your web browser.',
        content: `
Taking the perfect GPose screenshot is only half the battle. Often, your images need a bit of cropping, alignment, or text addition before they are ready for social media. However, software like Adobe Photoshop can be expensive and overly complicated for simple edits.

## The Browser-Based Solution
Enter **XIV Frame**, a free, lightweight, web-based editor designed specifically for FFXIV players. 

## What You Can Do in Seconds
- **Crop and Resize**: Choose standard aspect ratios (like 16:9 or 1:1) and instantly frame your image perfectly.
- **Collages**: Drag and drop multiple images into the canvas.
- **Custom Text**: Add your character's name with beautifully curated fonts.
- **Watermarks**: Easily upload your Free Company logo or any custom PNG and place it in the corner of your screenshot.

There's no installation required, and all image processing happens locally in your browser, meaning it's incredibly fast and completely private.`
      },
      ko: {
        title: '포토샵 없이 파판14 스크린샷 보정 및 편집하는 방법',
        description: '무겁고 비싼 포토샵 대신, 웹 브라우저에서 5초 만에 파판14 스크린샷의 비율을 맞추고 자르고 텍스트를 넣는 방법을 알려드립니다.',
        content: `
단체자세에서 아무리 멋지게 사진을 찍어도, SNS에 올리기 전에는 약간의 자르기나 텍스트 추가 같은 편집이 필요할 때가 많습니다. 하지만 간단한 작업을 위해 무겁고 비싼 포토샵을 켜는 것은 너무 번거롭습니다.

## 웹 브라우저만 있으면 충분합니다
파판14 유저들을 위해 만들어진 무료 웹 툴 **XIV Frame**을 사용하면 별도의 프로그램 설치 없이 스마트폰이나 PC 브라우저에서 즉시 스샷을 편집할 수 있습니다.

## 5초 만에 가능한 편집 기능들
- **비율 자르기(Crop)**: 인스타그램용 1:1, 트위터용 16:9 등 원하는 비율을 선택하고 이미지를 마우스로 드래그해 최적의 구도를 잡습니다.
- **사진 합치기(Collage)**: 여러 장의 사진을 한 번에 불러와 나란히 배치할 수 있습니다.
- **서명 추가(Signature)**: 폰트를 다운받지 않아도 제공되는 다양한 고품질 폰트로 내 캐릭터 이름을 멋지게 삽입할 수 있습니다.
- **로고 합성**: 자유부대(FC) 로고나 파판14 공식 로고 PNG 파일을 사진 위에 간단히 얹을 수 있습니다.`
      },
      ja: {
        title: 'Photoshop不要！FF14スクリーンショットの簡単編集・加工方法',
        description: '高価なソフトを使わずに、ブラウザ上でFF14のSSをトリミングしたり、文字を入れたり、ロゴを合成したりする方法を解説します。',
        content: `
グルポで完璧なスクリーンショットを撮影しても、SNSに投稿する前にはトリミングや文字の追加が必要になることがよくあります。しかし、ちょっとした編集のためにPhotoshopなどの重いソフトを立ち上げるのは面倒ですよね。

## ブラウザで完結するSS編集
FF14プレイヤー向けに作られた無料のウェブツール **XIV Frame** を使えば、ソフトのインストールなしで、PCやスマホから瞬時にSSを編集できます。

## 数秒でできる便利な加工機能
- **トリミングと比率調整**: Twitter用の16:9やInstagram用の1:1など、SNSに合わせた比率で自由に画像を切り取れます。
- **コラージュ（画像の組み合わせ）**: 複数のSSをドラッグ＆ドロップで簡単に並べることができます。
- **テキスト（署名）の追加**: 豊富なフォントを使って、自キャラの名前をおしゃれに入れることができます。
- **ロゴの合成**: FC（フリーカンパニー）のロゴや透明なPNG画像をSSの上に簡単に重ねることができます。`
      }
    }
  },
  {
    slug: 'adding-custom-logos-ffxiv-screenshots',
    date: '2026-06-03',
    locales: {
      en: {
        title: 'Adding Custom Logos to Your FFXIV Screenshots',
        description: 'Learn how to overlay Free Company logos, FFXIV title graphics, or custom PNG graphics onto your screenshots seamlessly.',
        content: `
A great way to brand your FFXIV screenshots or represent your Free Company (FC) is by adding a custom transparent logo over your images. 

## Finding Transparent Logos
First, you'll need a logo with a transparent background (a PNG file). This could be:
- The official Final Fantasy XIV title logo.
- Your Free Company's crest or custom artwork.
- A custom title for a static recruitment poster.

## How to Overlay Logos Easily
If you don't know how to use layer-based editing tools, **XIV Frame** makes this incredibly simple.

1. Open your screenshot in XIV Frame.
2. Go to the **Signature** settings.
3. Switch to the **Logo Upload** tab.
4. Upload your PNG file.
5. Use the position grid to automatically align your logo to any corner or the center of the image.

It takes just a few clicks to give your images a professional, branded look.`
      },
      ko: {
        title: '파판14 스크린샷에 자유부대(FC) 커스텀 로고 합성하기',
        description: '자유부대 로고, 파판14 타이틀 로고, 공대 홍보용 문구 등 배경이 투명한 PNG 로고를 스크린샷 위에 깔끔하게 합성하는 방법을 알아봅니다.',
        content: `
스크린샷에 파이널판타지14 공식 타이틀 로고를 넣거나, 소속된 자유부대(FC)의 마크를 합성하면 한결 더 멋지고 공식 화보 같은 느낌을 줄 수 있습니다.

## 투명한 PNG 로고 준비하기
로고를 합성하기 위해서는 배경이 투명한 PNG 이미지 파일이 필요합니다. 
- 구글 검색을 통해 파판14 공식 로고 PNG를 다운로드하거나
- 자유부대 홍보용 로고, 레이드 공대 아이콘 등을 준비합니다.

## 레이어 편집 프로그램 없이 로고 합성하기
포토샵에서 레이어를 겹치고 위치를 맞추는 과정이 어렵다면 **XIV Frame**을 사용해보세요.

1. 편집할 스크린샷을 XIV Frame 캔버스에 띄웁니다.
2. 우측(또는 하단) **시그니처 설정**에서 **로고 업로드** 탭을 선택합니다.
3. 준비한 투명 PNG 로고 파일을 업로드합니다.
4. 위치 버튼(좌상단, 우하단, 정중앙 등)을 클릭해 로고를 원하는 구석에 딱 맞게 정렬합니다.

단 3번의 클릭만으로 깔끔하게 로고가 합성된 사진을 저장할 수 있습니다!`
      },
      ja: {
        title: 'FF14のSSにFCロゴやカスタム透過ロゴを合成する方法',
        description: 'フリーカンパニーのロゴやFF14のタイトルロゴなど、背景が透明なPNG画像をスクリーンショットの上に簡単に合成する方法を解説します。',
        content: `
スクリーンショットにFF14の公式タイトルロゴを配置したり、所属するフリーカンパニー（FC）のエンブレムを合成したりすることで、公式のプロモーション画像のようなプロフェッショナルな仕上がりにすることができます。

## 透過PNGロゴの準備
ロゴを合成するには、背景が透明な画像（PNG形式）が必要です。
- FF14の公式タイトルロゴ（Google検索などで取得）
- FCのオリジナルロゴや、固定メンバー募集用のタイトル画像

## 画像編集ソフトなしでロゴを重ねる
レイヤーを使った編集が苦手な方でも、**XIV Frame**を使えば驚くほど簡単です。

1. XIV Frameにベースとなるスクリーンショットを読み込みます。
2. **署名設定** メニューの **ロゴアップロード** タブを開きます。
3. 準備した透過PNGファイルをアップロードします。
4. 位置調整ボタン（左上、右下、中央など）をクリックして、好みの場所にロゴを配置します。

たった数クリックで、見栄えの良いロゴ入りSSが完成します！`
      }
    }
  }
]

posts.forEach(post => {
  const postDir = path.join(blogDir, post.slug)
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true })
  }

  for (const [locale, data] of Object.entries(post.locales)) {
    const filePath = path.join(postDir, locale + '.md')
    const fileContent = '---\n' +
      'title: "' + data.title + '"\n' +
      'description: "' + data.description + '"\n' +
      'date: "' + post.date + '"\n' +
      'tags: ["ffxiv", "screenshot", "gpose"]\n' +
      '---\n\n' + data.content + '\n'
    fs.writeFileSync(filePath, fileContent)
  }
})

console.log('Successfully created 15 blog markdown files.')
