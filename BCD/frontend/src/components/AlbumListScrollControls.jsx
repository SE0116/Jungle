import * as THREE from 'three';
import React, { createContext, useContext, useMemo, useEffect, useRef } from 'react';
import { useFrame, useThree, context as fiberContext } from '@react-three/fiber';
import { createRoot } from 'react-dom/client'; // React 18에서 createRoot 임포트
import mergeRefs from 'react-merge-refs';

const ScrollControlsContext = createContext(null);

export function useScroll() {
  return useContext(ScrollControlsContext);
}

export function ScrollControls({
  eps = 0.00001,
  enabled = true,
  infinite = false,
  horizontal = false,
  pages = 1,
  distance = 1,
  damping = 4,
  children,
}) {
  const { gl, invalidate } = useThree();
  const el = useRef(document.createElement('div'));
  const fill = useRef(document.createElement('div'));
  const fixed = useRef(document.createElement('div'));
  const target = gl.domElement.parentNode;
  const scroll = useRef(0);

  const state = useMemo(() => ({
    el: el.current,
    eps,
    fill: fill.current,
    fixed: fixed.current,
    horizontal,
    damping,
    offset: 0,
    delta: 0,
    scroll,
    pages,
    range(from, distance, margin = 0) {
      const start = from - margin;
      const end = start + distance + margin * 2;
      return this.offset < start ? 0 : this.offset > end ? 1 : (this.offset - start) / (end - start);
    },
    curve(from, distance, margin = 0) {
      return Math.sin(this.range(from, distance, margin) * Math.PI);
    },
    visible(from, distance, margin = 0) {
      const start = from - margin;
      const end = start + distance + margin * 2;
      return this.offset >= start && this.offset <= end;
    },
  }), [eps, damping, horizontal, pages]);

  useEffect(() => {
    target.appendChild(el.current);
    el.current.style.position = 'absolute';
    el.current.style.top = 0;
    el.current.style.left = 0;
    el.current.style.width = '100%';
    el.current.style.height = '100%';
    el.current.style.overflow = horizontal ? 'auto' : 'scroll';
    el.current.appendChild(fill.current);
    el.current.appendChild(fixed.current);

    fill.current.style.width = horizontal ? `${pages * 100}%` : '100%';
    fill.current.style.height = horizontal ? '100%' : `${pages * 100}%`;
    fill.current.style.pointerEvents = 'none';

    fixed.current.style.position = 'sticky';
    fixed.current.style.top = 0;
    fixed.current.style.left = 0;
    fixed.current.style.width = '100%';
    fixed.current.style.height = '100%';
    fixed.current.style.overflow = 'hidden';

    const onScroll = () => {
      const scrollMax = el.current.scrollWidth - el.current.clientWidth;
      scroll.current = el.current.scrollLeft / scrollMax;
    };

    el.current.addEventListener('scroll', onScroll);

    return () => {
      el.current.removeEventListener('scroll', onScroll);
      if (target.contains(el.current)) {
        target.removeChild(el.current);
      }
    };
  }, [target, horizontal, pages, distance]);

  useFrame(() => {
    const lerp = THREE.MathUtils.damp(state.offset, scroll.current, damping, 0.1);
    state.offset = lerp;
  });

  return (
    <ScrollControlsContext.Provider value={state}>
      {children}
    </ScrollControlsContext.Provider>
  );
}

const ScrollCanvas = React.forwardRef(({ children }, ref) => {
  const group = useRef();
  const state = useScroll();
  const { width, height } = useThree((state) => state.viewport);
  useFrame(() => {
    group.current.position.x = state.horizontal ? -width * (state.pages - 1) * state.offset : 0;
    group.current.position.y = state.horizontal ? 0 : height * (state.pages - 1) * state.offset;
  });

  return <group ref={group}>{children}</group>;
});

const ScrollHtml = React.forwardRef(({ children, style, ...props }, ref) => {
  const state = useScroll();
  const group = useRef();
  const { width, height } = useThree((state) => state.size);
  const fiberState = useContext(fiberContext);

  useFrame(() => {
    if (state.delta > state.eps) {
      group.current.style.transform = `translate3d(${state.horizontal ? -width * (state.pages - 1) * state.offset : 0}px, ${
        state.horizontal ? 0 : height * (state.pages - 1) * -state.offset
      }px, 0)`;
    }
  });

  useEffect(() => {
    const root = createRoot(state.fixed); // state.fixed에 대한 root 생성
    root.render(
      <div
        ref={mergeRefs([ref, group])}
        style={{ ...style, position: 'absolute', top: 0, left: 0, willChange: 'transform' }}
        {...props}
      >
        <ScrollControlsContext.Provider value={state}>
          <fiberContext.Provider value={fiberState}>{children}</fiberContext.Provider>
        </ScrollControlsContext.Provider>
      </div>
    );
    return () => root.unmount(); // 컴포넌트 unmount 시 cleanup
  }, [children, style, props, ref, group, state, fiberState]); // 의존성 배열에 사용된 모든 변수 포함

  return null;
});

export const Scroll = React.forwardRef(({ html, ...props }, ref) => {
  const ScrollComponent = html ? ScrollHtml : ScrollCanvas;
  return <ScrollComponent ref={ref} {...props} />;
});
