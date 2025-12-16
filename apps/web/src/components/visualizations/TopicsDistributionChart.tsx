'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Topic {
  name: string;
  count: number;
  subtopics?: { name: string; count: number }[];
}

interface TopicsDistributionChartProps {
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

export function TopicsDistributionChart({
  topics,
  width = 600,
  height = 400,
  colors = DEFAULT_COLORS,
}: TopicsDistributionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || topics.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 120, bottom: 40, left: 200 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data
    const data = topics.map((t, i) => ({
      name: t.name,
      count: t.count,
      color: colors[i % colors.length],
    }));

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) || 0])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerHeight])
      .padding(0.2);

    // Draw bars
    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('y', (d) => yScale(d.name) || 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => d.color)
      .attr('rx', 4)
      .attr('width', 0)
      .transition()
      .duration(800)
      .attr('width', (d) => xScale(d.count));

    // Add labels
    g.selectAll('.bar-label')
      .data(data)
      .join('text')
      .attr('class', 'bar-label')
      .attr('y', (d) => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr('x', (d) => xScale(d.count) + 8)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text((d) => d.count);

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .selectAll('text')
      .style('font-size', '12px');

    // Remove axis line
    g.select('.domain').remove();

  }, [topics, width, height, colors]);

  if (topics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No topics data available
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="overflow-visible"
    />
  );
}
