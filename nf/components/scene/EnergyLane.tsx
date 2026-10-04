"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

type EnergyLaneProps = {
  radius?: number;
  offset?: number;
  color?: string;
};

export default function EnergyLane({
  radius = 8,
  offset = 0,
  color = "#7FAF72",
}: EnergyLaneProps) {
  const lane = useMemo(() => {
    const points: THREE.Vector3[] = [];

    for (let i = 0; i <= 180; i++) {
      const a = (i / 180) * Math.PI * 2;

      points.push(
        new THREE.Vector3(
          Math.cos(a) * radius,
          Math.sin(a * 2 + offset) * 0.08,
          Math.sin(a) * radius
        )
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineDashedMaterial({
      color,
      transparent: true,
      opacity: 0.3,
      dashSize: 0.45,
      gapSize: 0.7,
    });

    const line = new THREE.Line(geometry, material);

    // IMPORTANT:
    // computeLineDistances() belongs to THREE.Line,
    // NOT THREE.BufferGeometry.
    line.computeLineDistances();

    return line;
  }, [radius, offset, color]);

  useEffect(() => {
    return () => {
      lane.geometry.dispose();

      if (Array.isArray(lane.material)) {
        lane.material.forEach((material) => material.dispose());
      } else {
        lane.material.dispose();
      }
    };
  }, [lane]);

  return <primitive object={lane} />;
}