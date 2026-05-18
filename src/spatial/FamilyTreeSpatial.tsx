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
  const key = `${mode}-${node.id}-${node.gender ?? 'x'}-${node.highlighted}`;
  const cached = spriteCache.get(key);
  if (cached) return cached;

  const t = flowTheme[mode];
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
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

  const icon = radius * 0.42;
  ctx.strokeStyle = t.spatialIconStroke;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(cx - icon, cy - icon, icon * 2, icon * 2);
  ctx.beginPath();
  ctx.moveTo(cx - icon, cy + icon);
  ctx.lineTo(cx + icon, cy - icon);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  const scale = 5 + Math.sqrt(node.val) * 1.1;
  sprite.scale.set(scale, scale, 1);

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

export function FamilyTreeSpatial() {
  const { mode } = useAppColorMode();
  const graphRef = useRef<
    ForceGraphMethods<SpatialNode, SpatialLink> | undefined
  >(undefined);

  const graphData = useMemo(() => buildSpatialGraphData(), []);
  const tokens = flowTheme[mode];

  useEffect(() => {
    clearSpatialSpriteCache();
  }, [mode]);

  const nodeThreeObject = useCallback(
    (node: SpatialNode) => {
      if (node.kind === 'connector') return drawConnectorMesh(node, tokens.branchStroke);
      return drawPersonSprite(node, mode);
    },
    [mode, tokens.branchStroke],
  );

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
      nodeLabel={(node) => node.label || ' '}
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
    />
  );
}
