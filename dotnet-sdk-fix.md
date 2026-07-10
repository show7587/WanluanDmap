# 修復 C# Dev Kit 找不到 .NET SDK 的問題

## 問題描述

VS Code 開啟專案時出現以下錯誤：

```
MSBuildProjectTools.LanguageServer.Utilities.DotnetDiscoveryException:
Failed to determine current .NET version for directory '...' (145).
```

以及 C# Dev Kit 輸出：

```
A compatible .NET SDK was not found.
Requested SDK version: 8.0.422
Installed SDKs: (empty)
```

## 根本原因

macOS 上同時存在兩個 .NET 安裝路徑：

| 路徑 | 版本 | SDK |
|------|------|-----|
| `/opt/homebrew/Cellar/dotnet@8/8.0.128/libexec/dotnet` | Homebrew 安裝 | **無 SDK（只有 runtime）** |
| `/Users/<你的帳號>/.dotnet/dotnet` | 官方安裝器 | 有 SDK 8.0.422 ✅ |

VS Code 的 C# Dev Kit 透過「.NET Install Tool」擴充功能找 dotnet，它優先找到 Homebrew 的版本，但 Homebrew 的 `dotnet@8` 預設只裝 runtime，沒有 SDK，導致找不到 `global.json` 要求的 `8.0.422`。

## 解決方法

### 步驟 1：清除 MSBuild 快取

```bash
rm -rf ~/Library/Caches/omnisharp
rm -rf ~/.cache/omnisharp
```

### 步驟 2：將 8.0.422 SDK 安裝到 Homebrew 的 dotnet 目錄

> 把版本號 `8.0.128` 換成你機器上實際的 Homebrew dotnet 版本。

```bash
# 先確認 Homebrew dotnet 的實際版本
ls /opt/homebrew/Cellar/dotnet@8/

# 安裝 SDK 到 Homebrew 的 dotnet 目錄（讓兩個版本共存）
curl -fsSL https://dot.net/v1/dotnet-install.sh | bash -s -- \
  --version 8.0.422 \
  --install-dir /opt/homebrew/Cellar/dotnet@8/8.0.128/libexec
```

### 步驟 3：驗證安裝成功

```bash
/opt/homebrew/Cellar/dotnet@8/8.0.128/libexec/dotnet --list-sdks
# 應該看到兩個 SDK：
# 8.0.128 [/opt/homebrew/Cellar/dotnet@8/8.0.128/libexec/sdk]
# 8.0.422 [/opt/homebrew/Cellar/dotnet@8/8.0.128/libexec/sdk]
```

### 步驟 4：重新載入 VS Code

按 `Cmd+Shift+P` → `Developer: Reload Window`

---

## 注意事項

- **不需要**修改 `global.json`，版本釘住 `8.0.422` 是正確的
- **不需要**在 `.vscode/settings.json` 加任何 `dotnetAcquisitionExtension` 設定
- 如果日後 Homebrew 升級 `dotnet@8`（例如升到 `8.0.200`），`--install-dir` 路徑要對應更新，或重跑一次上述指令
- 如果 `global.json` 的 SDK 版本有更新，也要重跑一次指令安裝新版 SDK

## 相關檔案

- `global.json` — 根目錄與 `backend/` 各一份，兩份都釘住 `8.0.422`（理由詳見 `CLAUDE.md`）
