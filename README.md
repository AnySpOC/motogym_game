# Moto Gymkhana Game

リアル志向のモトジムカーナ・タイムアタックゲームを作るための開発リポジトリです。

## Folders

- `web-prototype/` - 現在のThree.jsプロトタイプ
- `docs/` - 仕様、ルール、移植メモ
- `unity/` - Unity版プロジェクト予定地
- `blender/` - Blenderモデル予定地

## Run Web Prototype

```powershell
cd web-prototype
node server.mjs
```

PCでは `http://127.0.0.1:4173/` を開きます。

iPhone検証では、PCとiPhoneを同じWi-Fiに接続し、PCのIPv4アドレスを使って `http://<PCのIPv4>:4173/` をSafariで開きます。

## Goal

Unityでリアル寄りのフリーゲーム化し、Blenderでネイキッドバイク、ライダー、パイロン、コースのアセットを作成します。
