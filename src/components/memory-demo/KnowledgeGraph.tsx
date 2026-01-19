import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData } from './types';

interface KnowledgeGraphProps {
  data: GraphData;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll("*").remove();

    // --- Background Grid Pattern ---
    const defs = svg.append("defs");
    
    // Grid Pattern
    const pattern = defs.append("pattern")
      .attr("id", "grid")
      .attr("width", 40)
      .attr("height", 40)
      .attr("patternUnits", "userSpaceOnUse");
      
    pattern.append("path")
      .attr("d", "M 40 0 L 0 0 0 40")
      .attr("fill", "none")
      .attr("stroke", "#C0C0C0") // Silver - ink-muted
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.15);

    // Glow Filter
    const filter = defs.append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Background Rect
    svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#grid)");

    // Empty state handling
    if (data.nodes.length === 0) {
      // Optional: Add a subtle center marker for empty state
      return; 
    }

    const g = svg.append("g");

    // --- Simulation Setup ---
    // Initialize nodes
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));
    
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => d.val + 10).strength(0.8));

    // --- Links ---
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#C0C0C0") // Silver - ink-muted
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.4);

    // --- Nodes ---
    // Using a group for each node to handle circles + labels better if needed, 
    // but keeping it simple for stability: Circle then Text.
    const node = g.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => d.val / 2)
      .attr("fill", (d) => d.isHighlighted ? "#fff" : d.color)
      .attr("stroke", (d) => d.isHighlighted ? "#3da6a6" : "#0c183d") // Teal or Deep Blue
      .attr("stroke-width", (d) => d.isHighlighted ? 4 : 2)
      .style("filter", (d) => d.isHighlighted ? "url(#glow)" : "none")
      .style("cursor", "pointer")
      .call(drag(simulation) as any);

    // Pulse Animation for Highlighted Nodes
    node.filter((d) => !!d.isHighlighted)
      .append("animate")
      .attr("attributeName", "r")
      .attr("values", (d) => `${d.val/2};${d.val/2 + 5};${d.val/2}`)
      .attr("dur", "1.5s")
      .attr("repeatCount", "indefinite");

    // --- Labels ---
    const label = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d) => d.label)
      .attr("font-size", "11px")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-weight", "500")
      .attr("fill", "#e4e4e7")
      .attr("dx", 14)
      .attr("dy", 4)
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 4px rgba(0,0,0,0.8)"); // Make text readable

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
      
      label
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    // Drag utility
    function drag(simulation: d3.Simulation<any, undefined>) {
        function dragstarted(event: any, d: any) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }
        
        function dragged(event: any, d: any) {
          d.fx = event.x;
          d.fy = event.y;
        }
        
        function dragended(event: any, d: any) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }
        
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div ref={wrapperRef} className="w-full h-full bg-[rgb(var(--deep-blue))] relative overflow-hidden">
      {data.nodes.length === 0 && (
         <div className="absolute inset-0 flex flex-col items-center justify-center text-[rgb(var(--ink-muted))]/30 gap-3 z-10 pointer-events-none">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[rgb(var(--ink-muted))]/30 animate-[spin_10s_linear_infinite] flex items-center justify-center">
                 <div className="w-8 h-8 rounded-full bg-[rgb(var(--deep-blue))]/50 backdrop-blur-sm"></div>
            </div>
            <p className="text-xs font-mono uppercase tracking-widest">ContextOS Neural Grid</p>
         </div>
      )}
      <svg ref={svgRef} className="w-full h-full block cursor-grab active:cursor-grabbing"></svg>
    </div>
  );
};

