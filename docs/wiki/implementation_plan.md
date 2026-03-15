# Implementation Plan: PYTravel (Mobile-First Trip Planner)

這是一個專為「國外旅遊行程規劃」與「分帳」設計的行動優先 Web App。

## User Review Required

> [!IMPORTANT]
> **行程支線 (Itinerary Branches)**：我們將設計一個「群組標籤」系統，允許同一時間點出現多個活動，並標註哪些旅伴參與，解決「分頭行動」的需求。
>
> **Google Maps 整合**：初期採用 Deep Linking (直接開啟 Google Maps App) 與 Embed API，平衡開發成本與使用者體驗。
>
> **自動化改進**：
> 1. **文檔同步**：建立 `sync-docs.mjs` 自動同步 Wiki。
> 2. **截圖優化**：透過 CSS 注入消除 Playwright 截圖中的藍色 focus 框。

## Proposed Changes

### System Architecture
- **Frontend**: Vite + React + TailwindCSS (Mobile-first)
- **Backend**: Supabase (Real-time sync for group editing)
- **Maps**: Google Maps Places API (Search) & Deep Linking

### Data Schema Update
- `trips`: 旅程基礎資訊。
- `itinerary_items`: 行程項目，支援 `parent_id` 或 `group_tag` 來實現「支線」。
- `expenses`: 支援 `split_type` (equal/percentage/absolute) 以達成不對等分帳。
- `participants`: 旅伴資料與權限。

### Developer Experience [NEW]
- `DeveloperDashboard`: 內置於 App 的隱藏頁面或 Debug 模式，顯示資料同步狀態與文檔路徑。

## Verification Plan

### Automated Tests
- Playwright 無框截圖。
- 分帳邏輯邊界測試（不對等分帳的總和驗證）。

### Manual Verification
- 多裝置即時同步測試。
- 行程支線的 UI 切換流暢度。
