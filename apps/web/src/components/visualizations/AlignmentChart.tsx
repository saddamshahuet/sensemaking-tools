'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface CommentAlignment {
  id: string;
  text: string;
  agrees: number;
  disagrees: number;
  alignmentScore: number;
}

interface AlignmentChartProps {
  comments: CommentAlignment[];
  width?: number;
  height?: number;
}

export function AlignmentChart({
  comments,
  width = 600,
  height = 400,
}: AlignmentChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || comments.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([-1, 1])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(comments, (d) => d.agrees + d.disagrees) || 100])
      .range([innerHeight, 0]);

    // Add gridlines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Add center line (neutral)
    g.append('line')
      .attr('x1', xScale(0))
      .attr('x2', xScale(0))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#999')
      .attr('stroke-dasharray', '5,5');

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    // Draw circles
    g.selectAll('circle')
      .data(comments)
      .join('circle')
      .attr('cx', (d) => xScale(d.alignmentScore))
      .attr('cy', (d) => yScale(d.agrees + d.disagrees))
      .attr('r', 6)
      .attr('fill', (d) => {
        if (d.alignmentScore > 0.3) return '#4CAF50';
        if (d.alignmentScore < -0.3) return '#F44336';
        return '#9E9E9E';
      })
      .attr('opacity', 0.7)
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .on('mouseenter', (event, d) => {
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>Comment #${d.id}</strong><br/>
            ${d.text.slice(0, 100)}...<br/>
            <span style="color: green">Agrees: ${d.agrees}</span><br/>
            <span style="color: red">Disagrees: ${d.disagrees}</span><br/>
            Alignment: ${(d.alignmentScore * 100).toFixed(1)}%
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', 0);
      });

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => `${(+d * 100).toFixed(0)}%`));

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Add axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Alignment Score');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text('Total Votes');

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 120}, 0)`);

    const legendItems = [
      { label: 'Consensus', color: '#4CAF50' },
      { label: 'Neutral', color: '#9E9E9E' },
      { label: 'Divisive', color: '#F44336' },
    ];

    legendItems.forEach((item, i) => {
      legend.append('circle')
        .attr('cx', 0)
        .attr('cy', i * 20)
        .attr('r', 5)
        .attr('fill', item.color);

      legend.append('text')
        .attr('x', 12)
        .attr('y', i * 20 + 4)
        .attr('font-size', '10px')
        .text(item.label);
    });

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [comments, width, height]);

  if (comments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No alignment data available
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
