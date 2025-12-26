import React, { useEffect, useMemo, useState } from "react";
import styles from "./p-common-SideBarHorizontal.module.css";
import { useMenuInfo } from "../../hooks/use-menu-info.tsx";

type Props = {
  strOpenUrl: any;
};

const COMPACT_MAX = 1366;

const SideBarHorizontal = ({ strOpenUrl }: Props) => {
  const { menuInfo, setMenuInfo } = useMenuInfo() as any;
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [overlayKey, setOverlayKey] = useState(0); // 오버레이 열릴 때 트리 remount용

  const [allMenus, setAllMenus] = useState<any[]>([]);
  const [activeLMenu, setActiveLMenu] = useState<string>(""); // 밑줄 표시용 (오버레이 열릴 때만)

  
  const [menuTree, setMenuTree] = useState<any[]>([]);
  const [openLMenu, setOpenLMenu] = useState<string>("");     // 패널에 표시할 대분류

  const [overlayMounted, setOverlayMounted] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);

  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const btnRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const [arrowLeft, setArrowLeft] = useState(0);
  
  const [panelLeft, setPanelLeft] = useState(0);


  const buildTree = (menuData: any[], menuId = "ROOT"): any[] =>
    menuData
      .filter(item => item.pmenuId === menuId)
      .map(item => ({
        ...item,
        childrens: buildTree(menuData, item.menuId),
      }));

  // menuList 로드
  useEffect(() => {
    const sessionStr = sessionStorage.getItem("menuList");
    if (!sessionStr) return;

    const parsed = JSON.parse(sessionStr);
    setAllMenus(parsed);

    // // 기존 SideBar처럼 id === '1'의 LMenuName을 기본 선택
    // const first = parsed.find((item: any) => item.id === "1");
    // if (first?.LMenuName) setSelectedLMenu(first.LMenuName);
  }, []);

// ✅ openLMenu 기준으로 menuTree 생성
useEffect(() => {
  if (!openLMenu) return;

  const filtered = allMenus.filter((m: any) => m.LMenuName === openLMenu);
  const tree = buildTree(filtered);
  setMenuTree(tree);
}, [openLMenu, allMenus]);


// ✅ 현재 메뉴(menuInfo)가 openLMenu 그룹에 속하면 부모들을 자동 펼침
useEffect(() => {
  if (!overlayMounted) return;
  if (!openLMenu) return;

  const filtered = allMenus.filter((m: any) => m.LMenuName === openLMenu);

  const parentMap = new Map<string, string>();
  const idSet = new Set<string>();

  filtered.forEach((m: any) => {
    if (m.menuId != null) idSet.add(String(m.menuId));
    if (m.menuId != null && m.pmenuId != null) parentMap.set(String(m.menuId), String(m.pmenuId));
  });

  const mi: any = menuInfo;
  const currentId =
    (mi?.menuId != null ? String(mi.menuId) : null) ??
    (mi?.id != null ? String(mi.id) : null);

  const next = new Set<string>();

  if (currentId && idSet.has(currentId)) {
    let p = parentMap.get(currentId);
    while (p && p !== "ROOT") {
      next.add(p);
      p = parentMap.get(p);
    }
  }

  setExpandedIds(next);
}, [overlayMounted, openLMenu, allMenus, menuInfo]);

const MenuNode = ({ node, depth }: { node: any; depth: number }) => {
    const hasChildren = node.childrens && node.childrens.length > 0;
    // ✅ 오버레이 열릴 때 expandedIds 기준으로 기본 펼침
    const [collapsed, setCollapsed] = useState<boolean>(() => {
      if (!hasChildren) return false;
      return expandedIds.has(String(node.menuId));
    });

    const onToggle = () => setCollapsed((v) => !v);

    const onClickLeaf = () => {
      const url = String(node.url ?? "").trim();
      if (!url) return;

      setMenuInfo(node);
      strOpenUrl("/" + url.replace(/^\//, ""));
      closeOverlay(); // 아래 C에서 만들 closeOverlay 사용
    };


    return (
        <div className={styles.nodeWrap} style={{ paddingLeft: `${depth * 10}px` }}>
        {hasChildren ? (
            <>
            <div className={styles.nodeHeader} onClick={onToggle}>
                <div className={styles.nodeTitle}>{node.menuName}</div>
                <div className={styles.nodeArrow}>{collapsed ? "▲" : "▼"}</div>
            </div>

            {collapsed && (
                <div className={styles.childrenWrap}>
                {node.childrens.map((c: any) => (
                    <MenuNode key={c.menuId} node={c} depth={depth + 1} />
                ))}
                </div>
            )}
            </>
        ) : (
            <div className={styles.leaf} onClick={onClickLeaf}>
            {node.menuName}
            </div>
        )}
        </div>
    );
  };

  
  // 대메뉴 목록 추출
  const lMenus = useMemo(() => {
    const set = new Set<string>();
    allMenus.forEach((m: any) => {
      if (m.LMenuName) set.add(m.LMenuName);
    });
    return Array.from(set);
  }, [allMenus]);



  // ESC 버튼으로 없애기
  useEffect(() => {
    if (!overlayMounted) return;

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeOverlay();
    };

    document.addEventListener("keydown", onKeyDown);

    // body scroll lock
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prevOverflow;
    };
  }, [overlayMounted]);

  const openOverlay = (lmenuName: string) => {
    setActiveLMenu(lmenuName);   // ✅ 밑줄 ON (오버레이 열려있는 동안만)
    setOpenLMenu(lmenuName);

    // ✅ 클릭한 버튼 기준으로 dropdown left 계산
    const btnEl = btnRefs.current[lmenuName];
    const wrapEl = wrapRef.current;

    if (btnEl && wrapEl) {
      const btnRect = btnEl.getBoundingClientRect();
      const wrapRect = wrapEl.getBoundingClientRect();

      // wrap 기준 x좌표(버튼 중앙)
      const centerX = btnRect.left - wrapRect.left + btnRect.width / 2;

      // panel 폭을 CSS에서 520px로 잡았으니 일단 동일 가정(또는 ref로 실제폭 측정 가능)
      const PANEL_WIDTH = 420;
      const padding = 10;

      let left = centerX - PANEL_WIDTH / 2;

      // 화면 밖으로 튀어나가지 않게 clamp
      const maxLeft = wrapRect.width - PANEL_WIDTH - padding;
      left = Math.max(padding, Math.min(left, maxLeft));

      setPanelLeft(left);
      // ✅ arrowLeft clamp (삼각형이 패널 안에서만 움직이게)
      const rawArrow = centerX - left; // panel 내부 기준
      const minArrow = 18;             // 패널 왼쪽 너무 붙지 않게
      const maxArrow = PANEL_WIDTH - 18;
      setArrowLeft(Math.max(minArrow, Math.min(rawArrow, maxArrow)));
    } else {
      setPanelLeft(10);
    }    
    
    setOverlayKey((k) => k + 1);      // ✅ 트리 remount 유도
    setOverlayMounted(true);
    
    requestAnimationFrame(() => {
        setOverlayActive(true);         // ✅ 애니메이션 시작
    });
  };

  const closeOverlay = () => {
    setOverlayActive(false);          // ✅ 닫힘 애니메이션 시작
    window.setTimeout(() => {
        setOverlayMounted(false);       // ✅ 애니메이션 끝난 뒤 DOM 제거
        setActiveLMenu("");     // ✅ 밑줄 OFF
        setOpenLMenu("");       // (선택) 패널 타이틀도 초기화하고 싶으면
    }, 160);
  };
  useEffect(() => {
    if (!overlayMounted) return;
  
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      const wrap = wrapRef.current;
      if (!wrap) return;
  
      // wrap 내부 클릭은 무시(버튼/패널 포함)
      if (wrap.contains(t)) return;
  
      closeOverlay();
    };
  
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [overlayMounted]);

  // compact에서만 보이게 할 거지만, 혹시 렌더되면 대비
  const isCompact = window.innerWidth <= COMPACT_MAX;

  if (!isCompact) return null;


  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.scroller} ref={scrollerRef}>
        {lMenus.map((name) => (
          <button
            ref={(el) => { btnRefs.current[name] = el; }}
            key={name}
            className={styles.btn}
            data-active={name === activeLMenu ? "true" : "false"}
            onClick={() => openOverlay(name)}
            type="button"
          >
            {name}
          </button>
        ))}
      </div>
  
      {/* ✅ backdrop 제거 / panel만 wrap 기준으로 absolute */}
      {overlayMounted && (
        <div
          className={`${styles.panel} ${overlayActive ? styles.panelOpen : ""}`}
          style={{
            left: panelLeft,
            ["--arrow-left" as any]: `${arrowLeft}px`,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>{openLMenu}</div>
            <button type="button" className={styles.closeBtn} onClick={closeOverlay}>
              닫기
            </button>
          </div>
  
          <div className={styles.panelBody}>
            {menuTree.map((node: any) => (
              <MenuNode key={`${overlayKey}-${node.menuId}`} node={node} depth={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBarHorizontal;