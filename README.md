# WanluanDmap 萬巒鄉颱風路況地圖

顯示颱風期間屏東縣萬巒鄉的路況（淹水、崩塌、禁止通行等）給一般民眾查看。

這是**階段性任務網站**：每次有颱風來就沿用同一個站，網站名稱換成當次的颱風名（例如「萬巒鄉薔琵颱風路況地圖」），路況資料從空的開始記錄；颱風過後資料留著當紀錄，下一個颱風再重來一次。換颱風的步驟見下方「[新颱風來了：切換網站](#-新颱風來了切換網站)」。

正式站是 GitHub Pages 純靜態網站，**唯一的資料來源是 [`frontend/public/data/roadHazards.json`](frontend/public/data/roadHazards.json)**——改這個檔案、push 到 `main`，GitHub Actions 會自動驗證資料、重新建置並部署，約兩分鐘後生效。

## 🌀 颱風天快速更新路況（手機就可以，不用電腦）

1. 用手機瀏覽器打開這個 repo 的 `frontend/public/data/roadHazards.json`。
2. 點右上角鉛筆圖示（Edit）進入編輯。
3. 複製下面的範本貼到陣列最後（記得前一筆結尾要加逗號），改好內容。
4. 寫個 commit 訊息（例如「新增 成德大橋 淹水」）直接 commit 到 `main`。
5. 到 repo 的 Actions 頁看到綠色勾勾就是部署成功。

**打錯字不用怕**：CI 會先驗證資料才部署，驗證不過就不會上線，正式站會維持上一版好的內容，GitHub 也會寄信通知你。在電腦上用 VS Code（或在 GitHub 頁面按 <kbd>.</kbd> 進入 github.dev）編輯時，編輯器會即時畫紅線提示錯誤、自動補全合法值。

## 🔄 新颱風來了：切換網站

颱風名稱寫死在下面幾個地方，換颱風時全部改成新名字（例如把「薔琵」換成新颱風名），一起 commit 到 `main`：

| 檔案 | 改什麼 | 會影響 |
| --- | --- | --- |
| [`frontend/index.html`](frontend/index.html) | `<title>` | 瀏覽器分頁標題 |
| [`frontend/src/plugins/i18n.js`](frontend/src/plugins/i18n.js) | `appTitle` | 網頁上方標題列 |
| [`backend/Program.cs`](backend/Program.cs) | Swagger 的 `Title` 與 endpoint 名稱 | 僅本機 Swagger UI（可順手改） |

接著清掉上一個颱風的路況：

1. 把 `frontend/public/data/roadHazards.json` 整份改成 `[]`（空陣列可以通過驗證，地圖會顯示沒有路況）。上一個颱風的資料在 git 歷史裡找得到，不用另外備份。
2. `frontend/public/pic/` 裡上一個颱風的照片可以刪掉（JSON 已經沒有引用它們）；要留著也不影響網站。
3. 新颱風的第一筆資料 `id` 從 `1` 開始。

建議 commit 訊息：`chore: 切換為 ○○颱風`。

### 新增一筆的範本

```json
{
  "id": 1,
  "location": "地點或路段名稱",
  "latitude": 22.5636,
  "longitude": 120.5786,
  "hazardType": "Flooding",
  "severity": "Moderate",
  "status": "Active",
  "description": "給民眾看的說明文字。",
  "photo": null,
  "reportedAt": "2026-07-10T14:30:00+08:00",
  "updatedAt": "2026-07-10T14:30:00+08:00"
}
```

| 欄位 | 填法 |
| --- | --- |
| `id` | 現有最大值 +1，不可重複 |
| `hazardType` | `Flooding` 淹水／`Landslide` 崩塌／`RoadClosed` 禁止通行／`FallenTree` 路樹倒塌／`Pothole` 道路坑洞／`SignalFailure` 號誌故障／`Other` 其他 |
| `severity` | `Light` 輕微／`Moderate` 中度／`Severe` 嚴重 |
| `status` | `Active` 生效中（顯示在地圖上）／`Resolved` 已排除（從地圖消失） |
| `photo` | 沒有照片填 `null`；有照片先把檔案放進 `frontend/public/pic/` 一起 commit，這裡填檔名 |
| 時間 | 格式 `2026-07-10T14:30:00+08:00`，`updatedAt` 每次修改都要更新 |

### 座標怎麼拿

- **手機 Google Maps**：長按災情地點 → 畫面會顯示「22.5652, 120.5762」→ 前面是 `latitude`、後面是 `longitude`。
- **電腦 Google Maps**：在地點上按右鍵 → 點第一行的座標就會複製。

災情排除時不用刪資料，把 `status` 改成 `"Resolved"`、更新 `updatedAt` 即可。

## 本機開發

詳細架構說明見 [CLAUDE.md](CLAUDE.md)。

```bash
# 後端（僅本機使用的資料維護工具，不會部署）
cd backend && dotnet run     # http://localhost:5180（Swagger UI）

# 前端
cd frontend && npm install
npm run dev                  # http://localhost:3455/WanluanDmap/
npm run validate:data        # 手動驗證資料檔（CI 部署前也會跑）
```

本機開發時可以用 `/manage` 頁（僅開發模式存在）以表單方式編輯資料，效果等同直接改 JSON。
