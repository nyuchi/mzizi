"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import type { HelixModel, HelixNode, HelixStrand } from "@/lib/db/types"
import { paletteColor } from "@/lib/tokens"

// ──────────────────────────────────────────────────────────────────────
// The Mzizi DNA double helix
//
//   Two backbones wind around the vertical axis, 180° out of phase:
//     · engineering backbone — carries the eight build NODES (N1–N8),
//       rendered as beads coloured by their strand class.
//     · meaning backbone     — the doctrine backbone (genetic-code,
//       transcription).
//   Cross-cutting RUNGS (N9 fundi, N10 documentation, N11 discovery)
//   are gold base pairs bridging both backbones — bound to no strand.
//
// Click a bead (node or rung) or a strand chip to read its covenant,
// description, and rules in the panel. There are no axes and no outliers.
//
// Raw hex is used for the WebGL materials — the §7.4 exception. Bead and
// bridge colours come from the DB mineral snapshot via paletteColor() so
// the picture stays brand-correct without hardcoding values.
// ──────────────────────────────────────────────────────────────────────

const R = 1.6 // backbone radius
const H = 6.2 // total height
const TURNS = 2 // full turns top-to-bottom
const T_MARGIN = 0.07 // keep beads off the very tips

function mineral(name: string): string {
  try {
    return paletteColor(name) // vivid dark-mode hex
  } catch {
    return "#8a8a8a"
  }
}

// Strand → mineral. Node beads inherit their strand's colour; the six
// strand chips use the same map. Rungs are gold (they sit on no strand).
const STRAND_COLOR: Record<string, string> = {
  "core-guarantee": mineral("cobalt"),
  shipped: mineral("tanzanite"),
  swappable: mineral("malachite"),
  spine: mineral("copper"),
  "genetic-code": mineral("terracotta"),
  transcription: mineral("sodalite"),
}
const RUNG_COLOR = mineral("gold")
const BACKBONE_COLOR = "#6b6a66" // neutral — beads carry the palette

function strandColor(strand: string | null | undefined): string {
  return (strand && STRAND_COLOR[strand]) || "#8a8a8a"
}

// A point on a backbone at parameter t ∈ [0,1] and phase offset.
function helixPoint(t: number, phase: number): THREE.Vector3 {
  const y = (t - 0.5) * H
  const theta = t * TURNS * Math.PI * 2 + phase
  return new THREE.Vector3(Math.cos(theta) * R, y, Math.sin(theta) * R)
}

// Evenly space n beads across the usable span of the helix.
function tForIndex(i: number, n: number): number {
  if (n <= 1) return 0.5
  return T_MARGIN + (i * (1 - 2 * T_MARGIN)) / (n - 1)
}

function Backbone({ phase, color }: { phase: number; color: string }) {
  const curve = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const SAMPLES = 120
    for (let i = 0; i <= SAMPLES; i++) pts.push(helixPoint(i / SAMPLES, phase))
    return new THREE.CatmullRomCurve3(pts)
  }, [phase])

  return (
    <mesh>
      <tubeGeometry args={[curve, 160, 0.05, 10, false]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.15}
        roughness={0.6}
      />
    </mesh>
  )
}

// A rung: a gold bar bridging the two backbones at height t, with a
// clickable bead at its midpoint (on the central axis).
function Rung({ t, isActive, onClick }: { t: number; isActive: boolean; onClick: () => void }) {
  const { mid, rotation, length } = useMemo(() => {
    const a = helixPoint(t, 0)
    const b = helixPoint(t, Math.PI)
    const dir = b.clone().sub(a)
    const len = dir.length()
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    )
    const e = new THREE.Euler().setFromQuaternion(q)
    return {
      mid: a.clone().add(b).multiplyScalar(0.5),
      rotation: [e.x, e.y, e.z] as [number, number, number],
      length: len,
    }
  }, [t])
  const [hovered, setHovered] = useState(false)
  const scale = isActive ? 1.45 : hovered ? 1.2 : 1

  return (
    <group>
      <mesh position={mid} rotation={rotation}>
        <cylinderGeometry args={[0.025, 0.025, length, 12]} />
        <meshStandardMaterial
          color={RUNG_COLOR}
          emissive={RUNG_COLOR}
          emissiveIntensity={isActive ? 0.6 : 0.3}
        />
      </mesh>
      <group
        position={mid}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = ""
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <mesh scale={scale}>
          <octahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial
            color={RUNG_COLOR}
            emissive={RUNG_COLOR}
            emissiveIntensity={isActive ? 0.75 : hovered ? 0.5 : 0.28}
            metalness={0.35}
            roughness={0.35}
          />
        </mesh>
      </group>
    </group>
  )
}

// A node bead on the engineering backbone.
function NodeBead({
  position,
  color,
  isActive,
  onClick,
}: {
  position: THREE.Vector3
  color: string
  isActive: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const scale = isActive ? 1.5 : hovered ? 1.22 : 1
  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = ""
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <mesh scale={scale}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.7 : hovered ? 0.45 : 0.22}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}

type Selection =
  | { kind: "node"; node: HelixNode }
  | { kind: "rung"; rung: HelixNode }
  | { kind: "strand"; strand: HelixStrand }
  | null

export function ArchitectureCanvas({ model }: { model: HelixModel }) {
  const [selection, setSelection] = useState<Selection>(null)

  // Engineering nodes carry the beads (all eight are engineering strand),
  // ordered by node number and spaced along the backbone.
  const nodes = useMemo(
    () => [...model.nodes].sort((a, b) => a.node_number - b.node_number),
    [model.nodes]
  )
  const rungs = useMemo(
    () => [...model.rungs].sort((a, b) => a.node_number - b.node_number),
    [model.rungs]
  )
  const strandsByBackbone = useMemo(() => {
    const eng = model.strands.filter((s) => s.backbone === "engineering")
    const mean = model.strands.filter((s) => s.backbone === "meaning")
    return { eng, mean }
  }, [model.strands])

  const nodePositions = useMemo(
    () => nodes.map((_, i) => helixPoint(tForIndex(i, nodes.length), 0)),
    [nodes]
  )
  // Rungs spaced across the mid band of the helix (they bridge, they
  // don't sequence — even spacing reads as "cross-cutting").
  const rungT = useMemo(() => {
    const n = rungs.length
    const LO = 0.2
    const SPAN = 0.6
    return rungs.map((_, i) => (n <= 1 ? 0.5 : LO + (i * SPAN) / (n - 1)))
  }, [rungs])

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="relative h-[340px] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background to-muted/30 sm:h-[440px]">
        <Canvas camera={{ position: [5.5, 2.5, 6.5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[6, 8, 4]} intensity={0.9} />

          {/* Two backbones, 180° out of phase */}
          <Backbone phase={0} color={BACKBONE_COLOR} />
          <Backbone phase={Math.PI} color={BACKBONE_COLOR} />

          {/* Cross-cutting rungs — gold base pairs */}
          {rungs.map((rung, i) => (
            <Rung
              key={rung.node_number}
              t={rungT[i]}
              isActive={
                selection?.kind === "rung" && selection.rung.node_number === rung.node_number
              }
              onClick={() => setSelection({ kind: "rung", rung })}
            />
          ))}

          {/* Node beads on the engineering backbone */}
          {nodes.map((node, i) => (
            <NodeBead
              key={node.node_number}
              position={nodePositions[i]}
              color={strandColor(node.strand)}
              isActive={
                selection?.kind === "node" && selection.node.node_number === node.node_number
              }
              onClick={() => setSelection({ kind: "node", node })}
            />
          ))}

          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={5}
            maxDistance={15}
            autoRotate={!selection}
            autoRotateSpeed={0.6}
          />
        </Canvas>

        {/* Strand chips — the six strands, grouped by backbone */}
        <div className="pointer-events-auto absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5">
          {model.strands.map((strand) => (
            <button
              key={strand.name}
              onClick={() => setSelection({ kind: "strand", strand })}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
              aria-pressed={selection?.kind === "strand" && selection.strand.name === strand.name}
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ background: STRAND_COLOR[strand.name] ?? "#8a8a8a" }}
              />
              {strand.title}
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel — populated from the selected node / rung / strand */}
      <aside
        aria-live="polite"
        className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 sm:p-6"
      >
        {!selection && (
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              Two backbones wind around the axis: the{" "}
              <span className="text-foreground">engineering</span> backbone carries the eight build
              nodes (beads, coloured by strand); the{" "}
              <span className="text-foreground">meaning</span> backbone carries the doctrine
              strands. The gold bars are cross-cutting{" "}
              <span className="text-foreground">rungs</span> — fundi, documentation, discovery —
              bridging both.
            </p>
            <p>
              Click a bead or a strand chip to read it. Drag to rotate; scroll to zoom. The model is
              live from Supabase <code className="font-mono text-xs">component_documents</code> —{" "}
              <code className="font-mono text-xs">
                documentation-architecture-&#123;nodes,strands&#125;
              </code>{" "}
              — the same source the MCP serves.
            </p>
            <p className="text-xs">
              {nodes.length} nodes · {rungs.length} rungs · {model.strands.length} strands ·{" "}
              {strandsByBackbone.eng.length} engineering / {strandsByBackbone.mean.length} meaning
            </p>
          </div>
        )}

        {selection?.kind === "node" && (
          <>
            <header className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">
                  {selection.node.sub_label} · {selection.node.strand} strand
                </p>
                <h3 className="font-serif text-lg font-semibold">{selection.node.title}</h3>
              </div>
              <span
                aria-hidden="true"
                className="size-3 rounded-full"
                style={{ background: strandColor(selection.node.strand) }}
              />
            </header>
            <p className="text-sm leading-relaxed text-foreground">{selection.node.description}</p>
            <div className="rounded-xl bg-muted/60 px-3 py-2 text-xs leading-relaxed text-foreground italic">
              “{selection.node.covenant}”
            </div>
            <p className="text-xs text-muted-foreground">
              On the <span className="text-foreground">{selection.node.backbone}</span> backbone ·
              stakeholder: <span className="text-foreground">{selection.node.stakeholder}</span> ·{" "}
              {selection.node.component_count}{" "}
              {selection.node.component_count === 1 ? "component" : "components"}
            </p>
            {selection.node.implementation_rules.length > 0 && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {selection.node.implementation_rules.map((rule, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true">→</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {selection?.kind === "rung" && (
          <>
            <header className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">
                  {selection.rung.sub_label} · RUNG
                </p>
                <h3 className="font-serif text-lg font-semibold">{selection.rung.title}</h3>
              </div>
              <span
                aria-hidden="true"
                className="size-3 rounded-full"
                style={{ background: RUNG_COLOR }}
              />
            </header>
            <p className="text-sm leading-relaxed text-foreground">{selection.rung.description}</p>
            <div className="rounded-xl bg-muted/60 px-3 py-2 text-xs leading-relaxed text-foreground italic">
              “{selection.rung.covenant}”
            </div>
            <p className="text-xs text-muted-foreground">
              A cross-cutting rung — bridges both backbones, bound to no strand · stakeholder:{" "}
              <span className="text-foreground">{selection.rung.stakeholder}</span>
            </p>
            {selection.rung.implementation_rules.length > 0 && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {selection.rung.implementation_rules.map((rule, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true">→</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {selection?.kind === "strand" && (
          <>
            <header className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">
                  STRAND · {selection.strand.backbone} backbone
                </p>
                <h3 className="font-serif text-lg font-semibold">{selection.strand.title}</h3>
              </div>
              <span
                aria-hidden="true"
                className="size-3 rounded-full"
                style={{ background: STRAND_COLOR[selection.strand.name] ?? "#8a8a8a" }}
              />
            </header>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {selection.strand.description}
            </p>
            {selection.strand.covenant && (
              <div className="rounded-xl bg-muted/60 px-3 py-2 text-xs leading-relaxed text-foreground italic">
                “{selection.strand.covenant}”
              </div>
            )}
          </>
        )}

        {selection && (
          <button
            onClick={() => setSelection(null)}
            className="mt-2 self-start text-xs text-muted-foreground underline hover:text-foreground"
          >
            Clear selection
          </button>
        )}
      </aside>
    </div>
  )
}
