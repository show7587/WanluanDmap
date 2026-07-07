# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

WanluanDmap 顯示颱風期間屏東縣萬巒鄉的路況（淹水/崩塌/禁止通行）給一般民眾查看。這是一個刻意簡化過的專案：

- **正式環境是純靜態網站（GitHub Pages），沒有任何活的後端。** `backend/` 只在本機跑，是給資料維護人員用的小工具，不會被部署。
- **沒有資料庫。** 唯一的資料來源是 `frontend/public/data/roadHazards.json`——本機後端讀寫這份檔案，前端正式站也是直接讀打包後的同一份檔案。修改資料的流程是：本機跑後端 + `/manage` 頁編輯 → 檔案更新 → `git commit/push` → GitHub Actions 自動重新建置部署。
- **沒有登入機制**，因為正式站沒有後端可以驗證，加驗證也是擋假的。

架構是模仿 `D:\GitHub\GetMaterialSystem`（前台 Vue3+Vuetify3+Vuex+Vite，後台 ASP.NET Core 8）的技術棧，但拿掉了資料庫、驗證、IIS 部署等該案例有、這裡用不到的部分。

## Commands

### Backend (`backend/`, .NET 8, 僅本機使用)
```bash
cd backend
dotnet build
dotnet run          # http://localhost:5180，根路徑是 Swagger UI
```
沒有測試專案。

### Frontend (`frontend/`, Node + Vite)
```bash
cd frontend
npm install
npm run dev         # http://localhost:3455/WanluanDmap/，proxy /api 到本機後端 5180
npm run build       # 產出 dist/，模擬正式站建置（不含 /manage、不呼叫任何 API）
npm run preview     # 預覽 build 結果
npm run lint        # eslint --fix
```
沒有測試指令。

## VS Code 開發

推薦的開發流程：
- **偵錯後端**：按 F5 啟動 VS Code debugger，會執行 `.vscode/launch.json` 中的 `build backend` 預啟動工作，編譯並運行後端到 `http://localhost:5180`，Swagger UI 會自動在瀏覽器開啟。
- **運行前端**：在終端執行 `npm run dev`（或使用 `.vscode/tasks.json` 中的 `frontend: dev` 工作），啟動 Vite dev server 到 `http://localhost:3455/WanluanDmap/`，自動代理 `/api/*` 到本機後端 5180。
- **推薦擴展**：`.vscode/extensions.json` 列出了 C#、Vue、ESLint、EditorConfig 等擴展，第一次開啟時 VS Code 會建議安裝。

Google Maps API 密鑰設定：
- **本機開發**：真實金鑰放在 `frontend/.env.development`（被 `.gitignore` 忽略），前端啟動時會讀入 `VITE_GOOGLE_MAPS_API_KEY` 環境變數。
- **正式部署**：`frontend/.env.production` 故意留空，密鑰由 GitHub Actions 在建置時從 repository secret `GOOGLE_MAPS_API_KEY` 注入 `VITE_GOOGLE_MAPS_API_KEY`，見 `.github/workflows/deploy.yml`。

## 關鍵架構決策（讀這裡比讀個別檔案更快進入狀況）

### 資料如何流動
`RoadHazard`（地點/經緯度/類型/嚴重度/狀態/說明/時間）只存在一個地方：`frontend/public/data/roadHazards.json`。

- **本機維護**：`backend/Services/RoadHazardService.cs` 是一個 Singleton，啟動時把這份 JSON 讀進記憶體 `List<RoadHazard>`，每次增刪改都用同一個 `lock` 保護、配發 Id（現有最大值+1），然後整份重寫回檔案。`Controllers/RoadHazardController.cs` 提供 `/api/RoadHazard` 的標準 REST 五個動作，統一包成 `Common/ApiResult<T>`（`succ/code/message/dataTime/data`，ASP.NET Core 預設用 camelCase 序列化，前端解析時注意大小寫）。
- **正式站讀取**：`frontend/src/api/dataService.js` 的 `fetchHazards()` 在任何環境都是直接 `fetch` `${BASE_URL}data/roadHazards.json`（打包後就是 `dist/data/roadHazards.json`），**不呼叫任何 API**。`createHazard/updateHazard/removeHazard/uploadPhoto/fetchHazardsFromApi` 這幾個才會打本機後端，只有 `/manage` 頁（僅開發模式）會用到。
- **照片**：`RoadHazard.Photo` 只存檔名（可為 null），實體檔案放在 `frontend/public/pic/`（建置時原封複製到 `dist/pic/`），前端一律用 `${BASE_URL}pic/檔名` 組 URL。`/manage` 表單可透過 `POST /api/Photo`（`backend/Controllers/PhotoController.cs`）上傳，後端會把檔案寫進同一個資料夾並回傳實際存檔檔名；也可以手動把檔案放進 `pic/` 再填檔名。照片跟 JSON 一樣要 `git commit/push` 才會出現在正式站。

### `/manage` 只存在於開發模式
`frontend/src/router/index.js` 用 `if (import.meta.env.DEV)` 動態加入 `/manage` 路由，Vite 建置時這個分支會被當死碼排除，所以 `dist/` 裡完全沒有 `ManageView.vue` 的程式碼、也不會有人在正式站上看到一個打不通 API 的維護頁。改路由結構時要留意別把這個 dev-only 判斷拿掉。

### .NET SDK 版本解析的坑
`backend/global.json` 和根目錄的 `global.json` **兩份都要保留**，內容相同（釘住 8.0.422）。原因：`global.json` 的 SDK 版本解析是看「執行 `dotnet` 指令時的工作目錄」，不是看專案檔位置。如果只在 `backend/` 放一份，從 repo 根目錄執行 `dotnet run --project backend` 時會找不到它，掉到本機裝的其他 SDK（此機器上曾經是 .NET 10，會直接踩到一個 Roslyn/CET 編譯器崩潰的已知問題）。兩個資料夾都要同步更新 SDK 版本。

### JSON 裡的中文/全形標點不能被跳脫
`RoadHazardService.cs` 手動設定了 `JsonSerializerOptions.Encoder`（`UnicodeRanges.BasicLatin` + `CjkUnifiedIdeographs` + `CjkSymbolsandPunctuation` + `HalfwidthandFullwidthForms`），否則 .NET 預設的 `System.Text.Json` 會把中文字和全形標點（，。）都轉成 `\uXXXX` 逃逸序列寫進檔案，讓 `roadHazards.json` 在 git diff 裡完全不可讀。新增欄位如果又用到 `System.Text.Json` 手動序列化，記得沿用這個 encoder。

### GitHub Pages 部署的路徑前綴
`vite.config.mjs` 設了 `base: '/WanluanDmap/'`（GitHub Pages 專案頁的路徑），前端所有讀靜態資源的地方都要用 `import.meta.env.BASE_URL` 組路徑，不能寫死 `/data/...`。如果 repo 改名，這裡要同步改。`.github/workflows/deploy.yml` 會在 push 到 `main` 時建置並部署到 GitHub Pages，`VITE_GOOGLE_MAPS_API_KEY` 是從 repository secret `GOOGLE_MAPS_API_KEY` 注入建置環境變數（`frontend/.env.production` 裡故意留空，本機開發用的金鑰放在會被 gitignore 的 `frontend/.env.development`）。

### 前端路由用 hash history
`createWebHashHistory`（不是 `createWebHistory`），因為 GitHub Pages 靜態託管對 history 模式的 SPA 需要額外的 404 重導向技巧，而這個站只有一個真正的正式頁面，用 hash mode 最省事。
