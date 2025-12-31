import { useEffect, useRef, useState } from 'react';

type Size = { width: number; height: number };

type Options = {
  enabled?: boolean;
  /** width/height state가 필요 없으면 false로 */
  measure?: boolean;
  /** exec resize 호출을 너무 자주 하지 않도록(기본 0~16ms 느낌) */
  debounceMs?: number;
  /** 변화 감지 임계값(px) */
  threshold?: number;
};

/**
 * - hostRef 요소 크기가 바뀌면 ApexCharts.exec(chartId,'resize')만 호출 (remount 없음)
 * - 필요하면 size도 반환해서 chart width/height 옵션에 넣을 수 있음
 * - window.resize 리스너 사용 안 함(깜빡임/중복 호출 원인 제거)
 */
export function useApexAutoResize(
  hostRef: React.RefObject<HTMLElement>,
  chartId: string,
  opt: Options = {},
) {
  const {
    enabled = true,
    measure = true,
    debounceMs = 0,
    threshold = 2,
  } = opt;

  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const lastRef = useRef<Size>({ width: 0, height: 0 });
  const rafRef = useRef<number>(0);
  const tRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = hostRef.current;
    if (!el) return;

    const fire = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      const lw = lastRef.current.width;
      const lh = lastRef.current.height;

      // 너무 작은 변화는 무시(리사이즈 드래그 중 잡음 제거)
      if (Math.abs(w - lw) < threshold && Math.abs(h - lh) < threshold) return;

      lastRef.current = { width: w, height: h };
      if (measure) setSize({ width: w, height: h });

      try {
        // @ts-ignore
        window.ApexCharts?.exec?.(chartId, 'resize');
      } catch {}
    };

    const schedule = () => {
      // debounce
      if (debounceMs > 0) {
        clearTimeout(tRef.current);
        tRef.current = setTimeout(() => {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(fire);
        }, debounceMs);
        return;
      }

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(fire);
    };

    const ro = new ResizeObserver(() => schedule());
    ro.observe(el);

    // 최초 1회
    schedule();

    return () => {
      clearTimeout(tRef.current);
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [enabled, chartId, hostRef, measure, debounceMs, threshold]);

  return size;
}