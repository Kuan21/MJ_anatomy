# 器官詳細模式共用模板（內部設計文件）

檔案：`app/organ/organ-detail-layout.tsx`（樣式沿用 `app/organ/organ.css`，class 名稱 `organ-*` 不變）。
使用者：腦（`app/organ/brain.tsx`）、眼（`app/organ/eye.tsx`，路由 `#/organ/eye`）。之後耳、胃肝腎等內臟詳細模式都用同一個模板，版面一致。

## 版面（所有詳細模式相同）

- 頂部：返回圖譜、MJ Anatomy、「XX 詳細模式」標題、右上角該器官專屬功能掣（腦：CSF 流向）。不出現主頁的區域分頁。
- 左欄：全部開啟／全部關閉、（器官專屬切換）、搜尋、結構清單（分組樹，有數目、有開關）。
- 中間：3D 舞台，右上視角掣（前、後、左側、右側、上面、下面、重設）、載入進度、底部操作提示。
- 右欄：已選構造資訊卡、切面、逐層剝離、模型範圍與來源說明。

## 模板負責什麼、器官自己提供什麼

| 項目 | 模板（共用） | 器官自己提供 |
| --- | --- | --- |
| 外框與頂部 | `OrganDetailLayout`：標題、返回、三欄、`inert` 覆蓋頁 | 標題字串、`headerActions`、全頁覆蓋頁（如 CSF） |
| 左欄上方 | `OrganLeftColumn`：全部開／關、搜尋框、「載入中」 | 兩個回呼、`extras`（器官專屬切換）、`query` 狀態 |
| 清單 | `OrganGroupNode`、`OrganPartRow`、`OrganAllToggle`、`OrganSegmented` | 分組資料、樹的組裝、開關邏輯、搜尋比對、搜尋結果內容 |
| 舞台 | `OrganStage`：視角掣、重設、載入進度、忙碌提示、錯誤、提示文字 | 3D viewer（`canvas` slot，一個 `<div className="organ-canvas" ref=…/>`）、視角命令 |
| 資訊卡 | `OrganPanel` 的 `info` 外框（`organ-block organ-info`，`aria-live`） | 卡片內容（標題、欄位、Focus／Isolate／Hide／Clear 掣） |
| 切面 | `OrganSectionBlock`：方向掣、滑桿、切除另一側 | 軸定義 `axes`、狀態、`onAxis`、`onChange`、說明 `note`；viewer 端實作切割 |
| 逐層剝離 | `OrganLayersBlock`：回上一層／再剝一層 | `peel`、`max`、`onPeel`、次序說明 `note`；viewer 端實作各層隱藏 |
| 模型範圍 | `OrganPanel` 的 `scope` 區塊 | 範圍說明文字與來源說明（自己的話，不寫筆記來源） |

## 介面

```tsx
<OrganDetailLayout
  title="腦部詳細模式"
  labels={{left: '腦部構造清單', stage: '腦部 3D 模型', panel: '腦部控制與說明'}}
  headerActions={<button className="csf-toggle" …>CSF 流向</button>}   // 可省略
  overlay={open && <CsfPage …/>} overlayOpen={open}                    // 可省略；開啟時三欄 inert
  left={<OrganLeftColumn onAllOn onAllOff extras query onQuery ready>{清單或搜尋結果}</OrganLeftColumn>}
  stage={<OrganStage canvas={<Scene/>} views onView onReset ready error percent loadingName busy hint>{額外覆蓋物}</OrganStage>}
  panel={<OrganPanel info={…} section={…} layers={…} scope={{text, source}} extraBlocks={…}/>}
/>
```

- `OrganStage.views` 預設為 `ORGAN_VIEWS`（前、後、左側、右側、上面、下面）；`onView(id)` 收到 `'front' | 'back' | …`。器官可傳自己的陣列增減視角。
- `OrganPanel.section`、`layers` 省略時該區段整個不出現（沒有切面或剝離的器官）。
- `OrganSectionProps.axes`：`{sagittal|coronal|horizontal: {en, zh, cut}}`，順序用 `order`；`value` 是 `{axis, offset(0–1), flip}`。
- `OrganLayersProps`：`peel` 為已剝層數，`max` 為最大層數。
- `OrganGroupNode`、`OrganPartRow` 只負責外觀；展開狀態、顯示狀態由器官保管。

## 接上新器官的步驟（眼、耳、胃肝腎）

1. 建 `app/organ/<organ>.tsx`，預設匯出元件；在 `app/` 的路由（`#/organ/<id>`）註冊（參考腦的註冊方式）。
2. 自己寫 viewer（建議模仿 `brain-viewer.ts`：`create…Viewer(host, callbacks)`，回傳 `update(state)`、`dispose()`），用 `useRef` + `useEffect` 包成 `<div className="organ-canvas" ref={host}/>`。視角、選取、顯示狀態都放在一個 `ViewState`，由 React 管理，viewer 只依 state 繪製。
3. 分組資料（類似 `BRAIN_GROUPS`、`buildBrainTree`）與資訊卡內容由器官提供；卡片文字用自己的話寫，依教科書／圖譜，不放筆記頁碼或出處。
4. 以模板組出三欄。沒有切面就不傳 `section`；沒有剝離就不傳 `layers`。
5. 點選結構只選取，不移動鏡頭、不自動 Focus／Isolate／Hide（見 `scripts/test-select-no-camera.mjs`）；需要時才由資訊卡的 Focus 掣移動。
6. 若有不在視野的選取，資訊卡顯示「不在目前視野，按 Focus 查看」。

## 器官專屬功能放哪裡

- 一個整頁的功能（腦的 CSF 流向）：頂部 `headerActions` 放入口按鈕，內容用 `overlay`，三欄在開啟期間 `inert`，viewer 保持掛載，關閉後回到原狀態。
- 左欄的切換（玻璃皮質、神經顯示範圍）：放 `OrganLeftColumn.extras`，用 `OrganSegmented` 排版。
- 右欄的可收合說明或控制：放 `OrganPanel.extraBlocks`（沿用 `organ-block` 區塊樣式），在「模型範圍」之前。
- 舞台上的疊加物（標籤、浮動提示）：放 `OrganStage` 的 children。
- 不要另起版面或自己的標題列。

## 腦的驗證（逐像素）

`scripts/browser/organ-layout-shots.cjs` 對正式 build 截圖（桌面 1500×950、手機 390×844；初始、展開分組、搜尋、選取、矢狀面、剝離 2 層、CSF），
`scripts/browser/organ-layout-diff.py` 比對兩組截圖：3D 畫布區域以外必須 0 差異；畫布內的差異需與「修改前兩次截圖」之間的隨機差異相當（軟體 GL 渲染有不確定性）。接上新器官時，若改動共用模板，要重跑這組比對。

## 注意

- 保持 class 名稱與 DOM 結構：`organ.css` 與既有測試（`scripts/test-select-no-camera.mjs`、`scripts/test-brain-smooth.mjs`）依賴它們；邏輯字串（如 `focusOn(selected.id)`）留在器官檔案內，不要搬進模板。
- 心臟（`heart.tsx`）與耳（`micro-atlas.tsx`）目前不使用模板，之後各自的 PR 再接。
- 眼：`eye.tsx`（頁面與狀態）、`eye-viewer.ts`（viewer）、`eye-catalogue.ts`（狀態型別與剝離次序）、`eye.css`（眼專屬區塊樣式）。眼球動作與眼眶孔管裂放在右欄 `extraBlocks`（可收合），頂部兩個功能掣會展開並捲到該區塊；分離滑桿也在 `extraBlocks`。眼的剝離次序由外而內寫在 `EYE_PEEL`。

## 部位名詞（使用者 2026-11-21）

依名詞的種類，分四種做法：

| 種類 | 例子 | 做法 |
| --- | --- | --- |
| 邊緣類 | 胃大彎、胃小彎、胃角切跡、賁門切跡、韌帶附著線 | 不做獨立網格，也不做有寬度的帶；在器官本身的表面沿平滑邊緣切出約 1.5 mm 寬的細線。定義加 `term: true`：平時不顯示，在清單或搜尋中選取、或 Quiz 問到時才顯示。所有器官的細線都用同一個淺薰衣草紫（`ORGAN_EDGE_LINE`，#b39ddb，使用者 2026-11-22），不用黑色或深色；分區顏色不可用接近的紫色。 |
| 面 | 脾的膈面、胃面、腎面、結腸面；肝的膈面、臟面 | 用器官表面著色一塊區域。若器官的分區通道已用於分部（例如肝葉），就把「葉 × 面」編成分區值，面加 `term: true`，選取時才整塊著色。 |
| 彎曲 | 結腸左右彎曲、十二指腸空腸彎曲 | 標示腸管轉彎的那一段（在轉彎處兩側各約 12 mm 處橫切腸管），不是一條線。 |
| 分部 | 十二指腸四部、胰頭頸體尾、胃底、胃體、肝葉 | 照舊用表面分區著色。 |

- `term` 標示比一般標示更往前畫，所以選取時蓋在分部顏色之上；點器官表面時仍選到分部，不會選到隱藏中的 `term`（`organ-viewer.ts`）。
- 邊緣類的資訊卡寫明它是器官的邊緣或角，並寫出附著在上面的結構（例如大彎：大網膜、胃網膜動靜脈；小彎：小網膜、左右胃動靜脈）。
