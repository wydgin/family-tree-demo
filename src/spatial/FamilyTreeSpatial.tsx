import { useCallback, useEffect, useMemo, useRef } from 'react';
import ForceGraph3D, {
  type ForceGraphMethods,
} from 'react-force-graph-3d';
import * as THREE from 'three';

import { useAppColorMode } from '../theme/ColorModeProvider';
import { flowTheme } from '../theme/flowTheme';
import {
  buildSpatialGraphData,
  type SpatialLink,
  type SpatialNode,
} from './buildSpatialGraph';

const spriteCache = new Map<string, THREE.Sprite>();

export function clearSpatialSpriteCache() {
  spriteCache.forEach((sprite) => {
    sprite.material.map?.dispose();
    sprite.material.dispose();
  });
  spriteCache.clear();
}

function drawPersonSprite(
  node: SpatialNode,
  mode: 'light' | 'dark',
): THREE.Sprite {
  const key = `${mode}-${node.id}-${node.label}-${node.highlighted}`;
  const cached = spriteCache.get(key);
  if (cached) return cached;

  const t = flowTheme[mode];
  const width = 280;
  const height = 120;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const padX = 14;
  const padY = 12;
  const radius = 14;
  const boxW = width - padX * 2;
  const boxH = height - padY * 2;
  const x = padX;
  const y = padY;

  ctx.beginPath();
  ctx.roundRect(x, y, boxW, boxH, radius);
  ctx.fillStyle = node.highlighted ? t.spatialPersonHighlightFill : t.spatialPersonFill;
  ctx.fill();
  ctx.strokeStyle = node.highlighted
    ? t.spatialPersonHighlightStroke
    : node.gender === 'male'
      ? t.genderMaleBorder
      : node.gender === 'female'
        ? t.genderFemaleBorder
        : t.spatialPersonStroke;
  ctx.lineWidth = node.highlighted ? 3 : 2.5;
  ctx.stroke();

  const lines = (node.label || node.id).split('\n');
  const lineHeight = 22;
  const startY = y + boxH / 2 - ((lines.length - 1) * lineHeight) / 2 + 6;
  ctx.fillStyle = t.spatialIconStroke;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 18px Figtree, system-ui, sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + i * lineHeight);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  const scale = 7.5 + Math.sqrt(node.val) * 1.1;
  sprite.scale.set(scale * (width / height), scale, 1);

  spriteCache.set(key, sprite);
  return sprite;
}

function drawConnectorMesh(node: SpatialNode, branchColor: string): THREE.Mesh {
  const geometry = new THREE.TorusGeometry(1.2, 0.22, 10, 24);
  const material = new THREE.MeshBasicMaterial({
    color: branchColor,
    transparent: true,
    opacity: 0.85,
  });
  const mesh = new THREE.Mesh(geometry, material);
  const scale = 0.65 + Math.sqrt(node.val) * 0.15;
  mesh.scale.set(scale, scale, scale);
  return mesh;
}

export type FamilyTreeSpatialProps = {
  selectedPersonId?: string | null;
  onSelectPerson?: (personId: string | null) => void;
};

export function FamilyTreeSpatial({
  selectedPersonId,
  onSelectPerson,
}: FamilyTreeSpatialProps) {
  const { mode } = useAppColorMode();
  const graphRef = useRef<
    ForceGraphMethods<SpatialNode, SpatialLink> | undefined
  >(undefined);

  const graphData = useMemo(() => buildSpatialGraphData(), []);
  const tokens = flowTheme[mode];

  useEffect(() => {
    clearSpatialSpriteCache();
  }, [mode, selectedPersonId]);

  const nodeThreeObject = useCallback(
    (node: SpatialNode) => {
      if (node.kind === 'connector') return drawConnectorMesh(node, tokens.branchStroke);
      const highlighted = node.id === selectedPersonId;
      return drawPersonSprite({ ...node, highlighted }, mode);
    },
    [mode, selectedPersonId, tokens.branchStroke],
  );

  const onNodeClick = useCallback(
    (node: SpatialNode) => {
      if (node.kind !== 'person' || !onSelectPerson) return;
      onSelectPerson(selectedPersonId === node.id ? null : node.id);
    },
    [onSelectPerson, selectedPersonId],
  );

  const onBackgroundClick = useCallback(() => {
    onSelectPerson?.(null);
  }, [onSelectPerson]);

  return (
    <ForceGraph3D
      key={mode}
      ref={graphRef}
      graphData={graphData}
      backgroundColor={tokens.spatialBg}
      showNavInfo={false}
      enableNodeDrag={false}
      enableNavigationControls
      controlType="orbit"
      nodeLabel={(node) => (node.label || ' ').replace(/\n/g, ' · ')}
      linkColor={(link) =>
        link.faint ? tokens.linkFaint : link.branch ? tokens.branchStroke : tokens.linkDefault
      }
      linkWidth={0.35}
      linkOpacity={0.85}
      d3AlphaDecay={0.02}
      d3VelocityDecay={0.35}
      warmupTicks={100}
      cooldownTicks={150}
      onEngineStop={() => graphRef.current?.zoomToFit(400, 28)}
      nodeThreeObject={nodeThreeObject}
      nodeThreeObjectExtend={false}
      onNodeClick={onNodeClick}
      onBackgroundClick={onBackgroundClick}
    />
  );
}
