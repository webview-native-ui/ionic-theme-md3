# Android 17 → Ionic コンポーネント対応表

2026-11-09。基準コード: `8a67646`（PR #63）。これは参照先の整理であり、一致確認の報告ではない。対応表作成後、Toggleのデモから状態アイコンの一括適用を外し、[最初の実測調整](android17-pixel-pass1-2026-11-09.md)を実施している。

## 正本と比較条件

- 正本は接続中の Pixel 8a の Android 17 設定画面。MD3ガイドラインは補助資料。
- ビルド: `google/akita/akita:17/CP2A.260705.006/15641320:user/release-keys`。
- 画面: 1080×2400 px、density 420、font_scale 1.0、日本語、ライトモード。換算は 2.625 physical px / dp。WebViewのDPR・表示領域・フォントは比較時に再取得する。
- 「実機確認」は参照部品の存在と表示を今回確認した意味。寸法一致、ダーク、押下、disabled、タブレットまで確認した意味ではない。
- Pixel Settings、System UI、旧来のframework部品を同じデザインとして混ぜない。Android全機種共通の外観とは扱わない。
- #63で確定したIonicの白い基本面とnamed colorの意味は維持する。今回の一致対象は、同じ用途・状態・内容における形状、配置、タイポグラフィ。アイコンの選択・字形はIonicの責務とし、テーマでの一致対象にしない。端末色を適用した面のRGB差と形状差は別に記録する。

## 今回開いて確認した参照画面

| ID | 画面と再現経路 | 確認できた部品 | ローカル証拠 |
| --- | --- | --- | --- |
| S1 | `android.settings.DISPLAY_SETTINGS` → ディスプレイとタップ | 戻るボタン、タイトル、セクション見出し、グループ行、説明文、ON/OFFスイッチ、遷移矢印、複合行の仕切り | `md3-native-display.png`（ローカル調査時のファイル名、同梱なし）、同名 `.xml` |
| S2 | S1 → 画面自動消灯 | 単一選択ラジオ行、選択/非選択、説明領域、スイッチ | `md3-native-timeout.png`（ローカル調査時のファイル名、同梱なし）、同名 `.xml` |
| S3 | `android.settings.SOUND_SETTINGS` → 音とバイブレーション | 連続スライダー、最小値/中間値、末尾アイコン、ラベル付き行 | `md3-native-sound.png`（ローカル調査時のファイル名、同梱なし）、同名 `.xml` |
| S4 | `android.settings.panel.action.INTERNET_CONNECTIVITY` | 中央の角丸パネル、標題、説明、filled/outlinedボタン、アイコンなしスイッチ、選択行、線形進捗表示 | `md3-native-internet.png`（ローカル調査時のファイル名、同梱なし）、同名 `.xml` |

設定値は変更していない。S4の通信先情報を含む画像はローカル証拠に留め、この文書に埋め込まない。今回の壁紙アプリの画面はSettingsとは別アプリなので基準から除外した。

## 画面構造・一覧

| Ionic | 対応するAndroidの部品／参照先 | 状態 | ピクセル比較する範囲・判断 |
| --- | --- | --- | --- |
| `ion-header`, `ion-toolbar`, `ion-title`, `ion-back-button`, `ion-buttons` | S1–S3の上部バー、円形戻るボタン | 実機確認 | 高さ、左右余白、円とタッチ領域、タイトルのbaseline。矢印はIonicの既定・個別指定を維持。大きい見出しは通常Toolbarと別扱い |
| `ion-content` | S1–S3のスクロール領域 | 実機確認 | コンテンツ開始位置、横余白、system bar/insetを分離。明示colorは維持 |
| `ion-list`, `ion-item`, `ion-item-group` | S1のグループ化された設定行 | 実機確認 | 外周radius、内側radius、行間、単行/説明付き/複数行、先頭/中間/末尾/単独行 |
| `ion-list-header`, `ion-label`, `ion-note`, `ion-text` | S1のセクション見出し、行タイトル/説明、S2の補足 | 実機確認 | 文字サイズ、weight、行高、baseline、見出し前後余白。日本語/Latinを別に比較 |
| `ion-item` + `ion-toggle` + 遷移操作 | S1の明るさ自動調節などの複合行 | 実機確認 | 矢印、仕切り、末尾余白、別々のタップ領域。単純toggle行に一律適用しない |
| `ion-card` とheader/title/subtitle/content | S1のグループ面は形状参考。独立した情報Cardは別途探索 | 部分対応 | 設定行の集合と情報Cardを同一視しない。default/filled/outlined/elevatedの参照を別に決める |
| `ion-accordion`, `ion-accordion-group` | Settings内の展開可能な詳細領域を探索 | 未確定 | 折りたたみ/展開時の見出し、矢印、radius、隣接行。普通の遷移行は代用しない |
| `ion-icon` | S1–S4の戻る/遷移/音量などのアイコン | 実機確認 | 配置と周囲の余白のみ確認。glyph形状・stroke・アイコン選択はIonicの責務とし、テーマ側での字形一致・同梱置換は対象外 |
| `ion-avatar`, `ion-thumbnail`, `ion-img` | アカウント/アプリ情報の画像枠を探索 | 候補 | 円形/角丸、crop、サイズ、行内余白。S1の面radiusから推定しない |
| `ion-badge` | Settings内の件数/状態表示を探索 | 未確定 | 文字、最小幅、内側余白、位置 |
| `ion-footer` | S4の末尾操作領域は局所的参考 | 部分対応 | ページ固定footerとdialog末尾を区別。safe areaを含め比較 |

## 入力・選択・操作

| Ionic | 対応するAndroidの部品／参照先 | 状態 | ピクセル比較する範囲・判断 |
| --- | --- | --- | --- |
| `ion-toggle` | S1/S2の設定スイッチ、S4のパネル内スイッチ | 採用: S4のアイコンなし | track/handle/枠/移動量。S1のチェック・×付きは用途限定のため標準には採用しない。公開済みの任意ヘルパーとIonicのenableOnOffLabelsは互換性のため維持 |
| `ion-radio`, `ion-radio-group` | S2の時間選択 | 実機確認 | 外円、内円、線幅、ラベル間隔、選択/非選択。行寸法とcontrol寸法を分ける |
| `ion-range` | S3の音量スライダー | 実機確認 | track厚、端radius、縦handle、gap、ラベルと末尾icon。dual-knob/pin/ticksは別の参照が必要 |
| `ion-button` | S4の「完了」と「Wi-Fiを共有」 | 実機確認・2種 | filled/outlinedの高さ、radius、padding、枠、文字。clear/size/expand/icon-onlyは別検証 |
| `ion-checkbox` | 複数選択できるSettings画面を探索 | 未確定 | 選択/非選択/indeterminate、角丸、チェック線。radioから推定しない |
| `ion-input`, `ion-textarea`, `ion-input-password-toggle` | デバイス名編集、ネットワーク入力画面を探索 | 候補 | field高さ、underline/outline、floating label、補足/エラー、IME、複数行。値は保存しない |
| `ion-searchbar` | Settings検索入口と検索中画面を探索 | 候補 | 非入力/入力/結果表示、icon、clear、文字、背景、フォーカス。Toolbar内とページ内を分ける |
| `ion-select`, `ion-select-option` | 単一選択はS2を参考。各表示interfaceの参照は別途探索 | 部分対応 | S2はページ型radio。alert/popover/action-sheet/modal各interfaceを勝手にページ型に変えない |
| `ion-segment`, `ion-segment-button` | Settings内の同一画面切り替え操作を探索 | 未確定 | selected indicator、均等幅/可変幅、scrollable、icon+label。下部ナビと混同しない |
| `ion-chip` | Settings内のフィルタ/選択チップを探索 | 未確定 | 単独/複数選択、leading/trailing icon、close、枠 |
| `ion-fab`, `ion-fab-button`, `ion-fab-list` | Settingsで確認できなければ標準アプリのFABを候補化 | 未確定 | 通常/小/extended、shadow、speed-dialは対応有無も確認。参照アプリを先に固定 |
| `ion-datetime`, `ion-datetime-button` | 日付と時刻設定のpickerを探索 | 候補 | calendar/time、選択/今日/無効日、ヘッダー、操作ボタン。自動時刻は変更しない |
| `ion-picker`, column/option | wheel式の標準画面があるか探索 | 未確定 | calendarやclockと同一ではない。該当しなければIonicのwheel構造を維持 |
| `ion-reorder`, `ion-reorder-group` | 並べ替え可能な標準画面を探索 | 未確定 | handle、行高、drag中の面/影、並べ替え操作。通常行だけでは検証できない |

## オーバーレイ・ナビゲーション

| Ionic | 対応するAndroidの部品／参照先 | 状態 | ピクセル比較する範囲・判断 |
| --- | --- | --- | --- |
| `ion-alert` | Settingsの確認dialogを探索。S4は外枠の補助参考 | 未確定 | 1/2/3action、折り返し、横/縦、input/radio/checkbox、scrim。大きなInternetパネルをAlert全体の正本にしない |
| `ion-action-sheet` | Settingsの操作一覧パネルを探索 | 未確定 | action行、破壊操作、cancel、preferredの階層。S4のfilledボタンを全actionに転用しない |
| `ion-modal` | S4はdialog型パネルの参考。full-screen/sheetは別探索 | 部分対応 | 外枠、scrim、内側余白。Ionicのbreakpoints、drag、dismiss、presentation APIは維持 |
| `ion-popover` | Settingsのanchor付きメニューを探索 | 未確定 | anchorとの位置、最小幅、radius、item高、shadow。中央dialogから推定しない |
| `ion-loading`, `ion-spinner`, `ion-progress-bar` | S4に線形進捗表示。円形/遮蔽型loadingは別探索 | 部分対応 | track、厚さ、長さ、motion。線形の一瞬のcaptureはアニメーション一致の証拠ではない |
| `ion-toast` | Settingsの一時通知を探索 | 未確定 | Android Toastとaction付きSnackbarを区別。Ionicのbuttons/positionを保持できる参照を選ぶ |
| `ion-tabs`, `ion-tab-bar`, `ion-tab-button` | Settingsに対応する下部ナビがあるか確認。なければ標準アプリ候補 | 未確定 | active pill、icon/label、bar高さ。OSのジェスチャーバーは対応物ではない |
| `ion-menu`, `ion-menu-button`, `ion-split-pane` | タブレットSettingsの二列ナビ、drawerがある標準画面を探索 | 未確定 | drawerと常設二列ナビを区別。今回のphone実機だけでは採用を決めない |
| `ion-breadcrumbs`, `ion-breadcrumb` | Settingsに直接対応する階層表示があるか探索 | 未確定 | 見つからなければIonic構造を維持し共通文字/iconだけ合わせる |
| `ion-refresher`, content / `ion-infinite-scroll`, content | Settings内の更新/追加ロードの有無を確認 | 未確定 | 表示indicatorとジェスチャー契約を分離。spinnerだけの確認を全体一致としない |
| `ion-skeleton-text` | 標準画面のloading placeholderを探索 | 未確定 | shape、radius、shimmer。参考がなければIonicを維持 |
| `ion-app`, router/nav系、`ion-grid`/row/col、ripple | 描画基盤・レイアウト・interaction | 直接の静止部品対応なし | 個別の画面構成/遷移/タップで検証。ピクセル一致のためにroutingやgrid APIを変えない |

## 実装へ進む順序と合格条件

1. S1–S3からToolbar/Back、List/Item、Toggle、Radio、Rangeの比較fixtureを作る。同じ文字列・値・幅・フォント条件で、nativeとWebを並べる。
2. 外形、文字baseline、描画box、タップ領域を実測して表に追記する。dp/CSS px/physical pxを区別し、UI hierarchyのboundsを描画境界と取り違えない。
3. 参照先未確定の部品は先に画面を見つける。見つからない場合は「直接対応なし」を明示してIonicの構造を維持する。別アプリを採用する場合はpackage/version/画面を記録する。
4. ライト/ダーク、ON/OFF/disabled/pressed、通常/長文/文字拡大、phone/tabletを分けて確認する。各行の実測値と差分画像が揃うまで「ピクセル一致」としない。
5. 同一条件のcropと重ね合わせで位置・radius・余白を比較する。文字のfont/rasterizer差は隠さず別記し、全面の差分率だけで合格にしない。
6. 既存Ionic markupで再現できるものを優先する。構造を追加する必要がある場合はios27と共通のspecial markupに対応するか確認し、任意適用にする。
7. default/color指定/ローカルCSS override/`md3-disabled`/iOS modeを維持する。スクリーンショット基準更新はCI経由で、生成画像を直接レビューする。

Toolbar/Back、List/Item、Toggle、Radio、Rangeの今回の実測結果は[検証報告](android17-pixel-pass1-2026-11-09.md)を参照。上の「未確定」をMD3の理論値で埋めて一致確認済みにしない。
