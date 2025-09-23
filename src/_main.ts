import * as fabric from 'fabric';

// --- 準備作業 ---

// 1. 初期化 Fabric Canvas
// TypeScriptでは、まずHTML要素を取得し、型アサーションを行うのが最善です
const canvasEl = document.getElementById('canvas') as HTMLCanvasElement;
const canvas = new fabric.Canvas(canvasEl);

// 2. 状態管理：変数に型注釈を追加
let currentTool: string = 'select'; // 現在のツール
let isDrawing: boolean = false;    // 描画中かどうかを示すフラグ
let startX: number, startY: number; // マウスダウンの開始点を記録
let rect: fabric.Rect | undefined; // 現在描画中の矩形オブジェクトへの参照、存在しない可能性あり

// --- UIインタラクションのシミュレーション：矩形ツールに切り替えるボタンを作成 ---
// document.getElementByIdはnullを返す可能性があるので、チェックが必要です
const rectToolButton: HTMLElement | null = document.getElementById('rect-tool');
if (rectToolButton) {
    rectToolButton.addEventListener('click', () => {
        currentTool = 'rectangle';
        // 描画モードに入るときは、衝突を避けるためにオブジェクト選択を無効にするのが最善です
        canvas.selection = false;
        console.log('矩形描画モードに切り替えました');
    });
}

// 選択モードに戻すボタン
const selectToolButton: HTMLElement | null = document.getElementById('select-tool');
if (selectToolButton) {
    selectToolButton.addEventListener('click', () => {
        currentTool = 'select';
        // 描画モードを終了するときは、オブジェクト選択を再度有効にします
        canvas.selection = true;
        console.log('選択モードに切り替えました');
    });
}


// --- 中核となる描画ロジック ---

// 1. 'mouse:down' イベントをリッスンし、TypeScriptに型を推論させる
canvas.on('mouse:down', (options) => {
    // 矩形ツールであるかチェック
    if (currentTool !== 'rectangle' || !options.e) {
        return;
    }

    isDrawing = true;
    // キャンバス上の正確なマウスポインタ座標を取得
    const pointer = canvas.getPointer(options.e);
    startX = pointer.x;
    startY = pointer.y;

    // 幅と高さが0の矩形オブジェクトを作成
    rect = new fabric.Rect({
        left: startX,
        top: startY,
        originX: 'left',
        originY: 'top',
        width: 0,
        height: 0,
        fill: 'transparent', // 透明塗りつぶし
        stroke: 'black',     // 黒い枠線
        strokeWidth: 2,
    });

    // 矩形をキャンバスに追加
    canvas.add(rect);
});

// 2. 'mouse:move' イベントをリッスンし、TypeScriptに型を推論させる
canvas.on('mouse:move', (options) => {
    // 描画中でない、または矩形オブジェクトが存在しない場合は何もしない
    if (!isDrawing || !rect || !options.e) {
        return;
    }

    const pointer = canvas.getPointer(options.e);
    const currentX = pointer.x;
    const currentY = pointer.y;

    // 矩形の幅と高さを計算
    const width = currentX - startX;
    const height = currentY - startY;

    // 矩形のプロパティを更新
    rect.set({
        width: Math.abs(width),
        height: Math.abs(height)
    });

    // 逆方向にドラッグした場合、矩形の原点を調整
    rect.set({ originX: width < 0 ? 'right' : 'left' });
    rect.set({ originY: height < 0 ? 'bottom' : 'top' });

    // ドラッグ効果を表示するためにキャンバスをリアルタイムで再描画
    canvas.renderAll();
});

// 3. 'mouse:up' イベントをリッスン
canvas.on('mouse:up', () => {
    if (!isDrawing) {
        return;
    }

    // 描画終了
    isDrawing = false;

    // オプション：最終的な矩形に最終スタイルを設定
    if(rect) {
        rect.set({
            fill: 'rgba(255, 0, 0, 0.3)' // 例えば、半透明の赤い塗りつぶし
        });
        canvas.renderAll();
    }
});

