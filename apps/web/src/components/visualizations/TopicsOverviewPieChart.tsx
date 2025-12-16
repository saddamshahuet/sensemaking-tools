'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Topic {
  name: string;
  count: number;
  subtopics?: { name: string; count: number }[];
}

interface TopicsOverviewPieChartProps {
  topics: Topic[];
  width?: number;
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#AFB42B',
  '#129EAF',
  '#F4511E',
  '#3949AB',
  '#5F8F35',
  '#9334E6',
  '#E52592',
  '#00897B',
  '#E8710A',
  '#1A73E8',
];

export function TopicsOverviewPieChart({
  topics,
  width = 400,
  height = 400,
  colors = DEFAULT_COLORS,
}: TopicsOverviewPieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || topics.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2 - 40;

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Prepare data
    const data = topics.map((t, i) => ({
      name: t.name,
      count: t.count,
      color: colors[i % colors.length],
    }));

    // Create pie generator
    const pie = d3
      .pie<{ name: string; count: number; color: string }>()
      .value((d) => d.count)
      .sort(null);

    // Create arc generator
    const arc = d3
      .arc<d3.PieArcDatum<{ name: string; count: number; color: string }>>()
      .innerRadius(radius * 0.4)
      .outerRadius(radius);

    // Create arcs
    const arcs = g
      .selectAll('arc')
      .data(pie(data))
      .join('g')
      .attr('class', 'arc');

    // Draw pie slices
    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1);

    // Add labels
    const labelArc = d3
      .arc<d3.PieArcDatum<{ name: string; count: number; color: string }>>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    arcs
      .append('text')
      .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .text((d) => {
        const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
        return percent > 5 ? `${Math.round(percent)}%` : '';
      });

    // Add center total
    const total = d3.sum(data, (d) => d.count);
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .text(total);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text('Comments');

  }, [topics, width, height, colors]);

  if (topics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No topics data available
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
      />
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {topics.map((topic, i) => (
          <div key={topic.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-sm">{topic.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
