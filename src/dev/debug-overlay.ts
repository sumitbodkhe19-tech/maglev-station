import { Vector3, World } from '@iwsdk/core';
import { getAreaName } from '../config/areas.js';

export class DebugOverlay {
  private element: HTMLDivElement | null = null;
  private fpsSpan: HTMLElement | null = null;
  private posSpan: HTMLElement | null = null;
  private areaSpan: HTMLElement | null = null;

  private frameCount = 0;
  private lastFpsUpdate = performance.now();
  private currentFps = 60;
  private tempVec = new Vector3();
  private animId: number | null = null;

  constructor(private world: World) {
    this.createDom();
    this.startLoop();
  }

  private createDom(): void {
    const overlay = document.createElement('div');
    overlay.id = 'dev-debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 14px;
      left: 14px;
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(148, 163, 184, 0.25);
      border-radius: 8px;
      color: #f8fafc;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      line-height: 1.5;
      padding: 10px 14px;
      z-index: 999999;
      pointer-events: none;
      user-select: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    `;

    overlay.innerHTML = `
      <div style="font-weight: 700; color: #38bdf8; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e;"></span>
        MAGLEV STATION [DEV DEBUG]
      </div>
      <div>FPS: <span id="debug-fps" style="color: #4ade80; font-weight: 600;">60</span></div>
      <div>Pos: <span id="debug-pos" style="color: #fbbf24; font-weight: 600;">0.00, 0.00, 0.00</span></div>
      <div>Area: <span id="debug-area" style="color: #a78bfa; font-weight: 600;">Street Plaza</span></div>
      <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid rgba(148, 163, 184, 0.2); font-size: 11px; color: #94a3b8;">
        Teleport: <span style="color:#e2e8f0;">[1]</span> Street <span style="color:#e2e8f0;">[2]</span> Stairs <span style="color:#e2e8f0;">[3]</span> Landing<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#e2e8f0;">[4]</span> Concourse <span style="color:#e2e8f0;">[5]</span> UG2 <span style="color:#e2e8f0;">[6]</span> Train
      </div>
    `;

    document.body.appendChild(overlay);
    this.element = overlay;
    this.fpsSpan = overlay.querySelector('#debug-fps');
    this.posSpan = overlay.querySelector('#debug-pos');
    this.areaSpan = overlay.querySelector('#debug-area');
  }

  private startLoop = (): void => {
    const update = (now: number): void => {
      // Calculate FPS
      this.frameCount++;
      const elapsed = now - this.lastFpsUpdate;
      if (elapsed >= 300) {
        this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
        this.frameCount = 0;
        this.lastFpsUpdate = now;
        if (this.fpsSpan) {
          this.fpsSpan.textContent = String(this.currentFps);
        }
      }

      // Read player position
      if (this.world.player) {
        this.world.player.getWorldPosition(this.tempVec);
        const x = this.tempVec.x;
        const y = this.tempVec.y;
        const z = this.tempVec.z;

        if (this.posSpan) {
          this.posSpan.textContent = `${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`;
        }
        if (this.areaSpan) {
          this.areaSpan.textContent = getAreaName(this.tempVec);
        }
      }

      this.animId = requestAnimationFrame(update);
    };

    this.animId = requestAnimationFrame(update);
  };

  public destroy(): void {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.element && this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
      this.element = null;
    }
  }
}
