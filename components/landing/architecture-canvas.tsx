"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import type { ArchitectureFrontendAxisRow, ArchitectureFrontendLayerRow } from "@/lib/db/types"
import { paletteColor } from "@/lib/tokens"

// ──────────────────────────────────────────────────────────────────────
// Geometry — coordinate convention
//
//   X-axis (horizontal composition)  → world +X
//   Y-axis (vertical infrastructure) → world +Y
//   Z-axis (depth observation)       → world +Z
//   Outside (fundi)                  → off-cube, +X +Y +Z corner
//   Documentation                    → off-cube, -X +Y -Z corner
//
// Each layer is a small cube placed along its axis. Click a cube → set
// the active layer; the HTML overlay below the canvas shows the row's
// description, covenant, and rules. Mineral palette for the axis colours
// keeps the picture brand-correct.
// ──────────────────────────────────────────────────────────────────────

// Mineral palette for the axis colours — sourced from the DB token snapshot
// so the picture stays brand-correct without hardcoding hex.
const AXIS_COLOR: Record<string, string> = {
  "X-axis": paletteColor("cobalt", "light"),
  "Y-axis": paletteColor("malachite"),
  "Z-axis": paletteColor("tanzanite"),
  Outside: paletteColor("terracotta"),
  Documentation: paletteColor("gold"),
}

// X-axis layers (2, 3, 6, 7) get spaced along +X.
// Y-axis layers (1, 4, 5) get spaced along +Y.
// Z-axis layer (8) sits along +Z.
// Outside (9) sits at the far +X +Y +Z corner.
// Documentation (10) sits at the far -X +Y -Z corner.
function positionFor(layer: ArchitectureFrontendLayerRow): [number, number, number] {
  // Tier order along each axis; index inside the tier determines spacing.
  const X_LAYERS = [2, 3, 6, 7]
  const Y_LAYERS = [1, 4, 5]
  const Z_LAYERS = [8]
  const span = (i: number, n: number, length = 4) =>
    n === 1 ? 0 : -length / 2 + (i * length) / (n - 1)

  if (layer.axis_name === "X-axis") {
    const i = X_LAYERS.indexOf(layer.layer_number)
    return [span(i, X_LAYERS.length, 4.5), 0, 0]
  }
  if (layer.axis_name === "Y-axis") {
    const i = Y_LAYERS.indexOf(layer.layer_number)
    return [0, span(i, Y_LAYERS.length, 3.5), 0]
  }
  if (layer.axis_name === "Z-axis") {
    const i = Z_LAYERS.indexOf(layer.layer_number)
    return [0, 0, span(i, Z_LAYERS.length, 3.5) + 1.5]
  }
  if (layer.axis_name === "Outside") {
    return [3, 2.2, 2.5] // off-cube, far +X +Y +Z
  }
  if (layer.axis_name === "Documentation") {
    return [-3, 2.2, -2.5] // off-cube, far -X +Y -Z
  }
  return [0, 0, 0]
}

interface AxisLineProps {
  from: [number, number, number]
  to: [number, number, number]
  color: string
}

function AxisLine({ from, to, color }: AxisLineProps) {
  // Render a thin cylinder between two points so it picks up scene
  // lighting (lines from the deprecated <line> primitive don't shade).
  const start = useMemo(() => from, [from])
  const end = useMemo(() => to, [to])
  const dir: [number, number, number] = [end[0] - start[0], end[1] - start[1], end[2] - start[2]]
  const length = Math.sqrt(dir[0] ** 2 + dir[1] ** 2 + dir[2] ** 2)
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ]
  // Cylinder is built along Y by default; rotate to match dir.
  // For the three primary axes the rotation is exact; for the outliers
  // we just point from origin to the offset position.
  const rotationFor = (): [number, number, number] => {
    if (Math.abs(dir[0]) > 0 && dir[1] === 0 && dir[2] === 0) return [0, 0, Math.PI / 2]
    if (dir[0] === 0 && dir[1] === 0 && Math.abs(dir[2]) > 0) return [Math.PI / 2, 0, 0]
    if (dir[0] === 0 && Math.abs(dir[1]) > 0 && dir[2] === 0) return [0, 0, 0]
    // Generic: rotate Y axis to point at end-from.
    const yx = Math.atan2(dir[2], dir[0])
    const yz = Math.atan2(Math.sqrt(dir[0] ** 2 + dir[2] ** 2), dir[1])
    return [0, -yx, yz]
  }

  return (
    <mesh position={mid} rotation={rotationFor()}>
      <cylinderGeometry args={[0.02, 0.02, length, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
    </mesh>
  )
}

interface LayerNodeProps {
  layer: ArchitectureFrontendLayerRow
  color: string
  isActive: boolean
  onClick: () => void
}

function LayerNode({ layer, color, isActive, onClick }: LayerNodeProps) {
  const [hovered, setHovered] = useState(false)
  const position = useMemo(() => positionFor(layer), [layer])
  const scale = isActive ? 1.4 : hovered ? 1.18 : 1

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
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.7 : hovered ? 0.45 : 0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}

interface ArchitectureCanvasProps {
  axes: ArchitectureFrontendAxisRow[]
  layers: ArchitectureFrontendLayerRow[]
}

type Selection =
  | { kind: "layer"; layer: ArchitectureFrontendLayerRow }
  | { kind: "axis"; axis: ArchitectureFrontendAxisRow }
  | null

export function ArchitectureCanvas({ axes, layers }: ArchitectureCanvasProps) {
  const [selection, setSelection] = useState<Selection>(null)
  const axesByName = useMemo(() => Object.fromEntries(axes.map((a) => [a.name, a])), [axes])

  const PRIMARY_AXES: Array<{
    name: string
    from: [number, number, number]
    to: [number, number, number]
  }> = [
    { name: "X-axis", from: [-2.6, 0, 0], to: [2.6, 0, 0] },
    { name: "Y-axis", from: [0, -2, 0], to: [0, 2, 0] },
    { name: "Z-axis", from: [0, 0, -1.2], to: [0, 0, 3.6] },
  ]
  const OUTLIER_AXES: Array<{
    name: string
    from: [number, number, number]
    to: [number, number, number]
  }> = [
    { name: "Outside", from: [0, 0, 0], to: [3, 2.2, 2.5] },
    { name: "Documentation", from: [0, 0, 0], to: [-3, 2.2, -2.5] },
  ]

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="relative h-[320px] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background to-muted/30 sm:h-[420px]">
        <Canvas camera={{ position: [5, 4, 6], fov: 45 }}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[6, 8, 4]} intensity={0.9} />

          {/* Origin marker */}
          <mesh>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#888" />
          </mesh>

          {/* Primary axis beams (X, Y, Z) */}
          {PRIMARY_AXES.map((a) => (
            <AxisLine key={a.name} from={a.from} to={a.to} color={AXIS_COLOR[a.name]} />
          ))}

          {/* Outlier rays (Outside, Documentation) */}
          {OUTLIER_AXES.map((a) => (
            <AxisLine key={a.name} from={a.from} to={a.to} color={AXIS_COLOR[a.name]} />
          ))}

          {/* Layer nodes — clickable */}
          {layers.map((layer) => (
            <LayerNode
              key={layer.layer_number}
              layer={layer}
              color={AXIS_COLOR[layer.axis_name] ?? "#888"}
              isActive={selection?.kind === "layer" && selection.layer.id === layer.id}
              onClick={() => setSelection({ kind: "layer", layer })}
            />
          ))}

          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={5}
            maxDistance={14}
            autoRotate={!selection}
            autoRotateSpeed={0.6}
          />
        </Canvas>

        {/* Axis legend overlaid on the canvas */}
        <div className="pointer-events-auto absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {axes.map((axis) => (
            <button
              key={axis.id}
              onClick={() => setSelection({ kind: "axis", axis })}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
              aria-pressed={selection?.kind === "axis" && selection.axis.id === axis.id}
            >
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ background: AXIS_COLOR[axis.name] ?? "#888" }}
              />
              {axis.name}
            </button>
          ))}
        </div>
      </div>

      {/* HTML overlay panel — populated from the selected layer/axis */}
      <aside
        aria-live="polite"
        className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 sm:p-6"
      >
        {!selection && (
          <div className="text-sm text-muted-foreground">
            Click a node or an axis chip to read what it does. Drag to rotate; scroll to zoom. Data
            is live from the Supabase{" "}
            <code className="font-mono text-xs">architecture_frontend_*</code> tables — edit a row,
            refresh the page, the model updates.
          </div>
        )}

        {selection?.kind === "axis" && (
          <>
            <header className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">
                  AXIS · {selection.axis.geometry}
                </p>
                <h3 className="font-serif text-lg font-semibold">
                  {selection.axis.name} — {selection.axis.title}
                </h3>
              </div>
              <span
                aria-hidden="true"
                className="size-3 rounded-full"
                style={{ background: AXIS_COLOR[selection.axis.name] ?? "#888" }}
              />
            </header>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {selection.axis.description}
            </p>
            {selection.axis.metaphor && (
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                {selection.axis.metaphor}
              </p>
            )}
          </>
        )}

        {selection?.kind === "layer" && (
          <>
            <header className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">
                  L{selection.layer.layer_number} · {selection.layer.axis_name}
                </p>
                <h3 className="font-serif text-lg font-semibold">{selection.layer.title}</h3>
              </div>
              <span
                aria-hidden="true"
                className="size-3 rounded-full"
                style={{
                  background: AXIS_COLOR[selection.layer.axis_name] ?? "#888",
                }}
              />
            </header>
            <p className="text-sm leading-relaxed text-foreground">{selection.layer.description}</p>
            <div className="rounded-xl bg-muted/60 px-3 py-2 text-xs leading-relaxed text-foreground italic">
              “{selection.layer.covenant}”
            </div>
            {axesByName[selection.layer.axis_name]?.title && (
              <p className="text-xs text-muted-foreground">
                Lives on the{" "}
                <span className="text-foreground">
                  {axesByName[selection.layer.axis_name].title}
                </span>{" "}
                axis · stakeholder:{" "}
                <span className="text-foreground">{selection.layer.stakeholder}</span>
              </p>
            )}
            {selection.layer.implementation_rules?.length > 0 && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {selection.layer.implementation_rules.map((rule, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true">→</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
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
