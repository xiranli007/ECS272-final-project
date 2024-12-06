import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { useResizeObserver, useDebounceCallback } from "usehooks-ts";

interface DataPoint {
  country: string;
  percentage: number;
  region: string;
  population: number;
}

interface ComponentSize {
  width: number;
  height: number;
}

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export default function PercentageTileChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ComponentSize>({ width: 0, height: 0 });
  const margin: Margin = { top: 40, right: 20, bottom: 40, left: 20 };
  const tileSize = 50; // Adjust the size of each tile
  const padding = 20; // Space between tiles

  const onResize = useDebounceCallback((newSize: ComponentSize) => {
    if (newSize.width !== size.width || newSize.height !== size.height) {
      setSize(newSize);
    }
  }, 200);
  useResizeObserver({ ref: chartRef, onResize });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("../../data/processed.csv");
        const rawData = await response.text();
        const parsedData = d3.csvParse(rawData, d => ({
          country: d.Country,
          percentage: parseFloat(d.HealthExpenditurePercentage),
          region: d.Region,
          population: parseInt(d.Population, 10),
        }));
        setData(parsedData as DataPoint[]);
      } catch (error) {
        console.error("Error loading CSV data:", error);
      }
    };
    fetchData();
  }, []); // No unnecessary dependencies

  useEffect(() => {
    if (data.length === 0 || size.width === 0) return;

    const totalHeight = calculateTotalHeight();
    d3.select("#tile-svg").attr("height", totalHeight);
    d3.select("#tile-svg").selectAll("*").remove();
    drawChart();
  }, [data, size]); // Only redraw on data or size changes

  function calculateTotalHeight() {
    const groups = d3.group(data, d => d.region);
    let yOffset = margin.top;
    const groupTitleOffset = 30;

    groups.forEach(groupData => {
      const numRows = Math.ceil(groupData.length / Math.floor(size.width / (tileSize + padding)));
      yOffset += numRows * (tileSize + padding) + groupTitleOffset;
    });
    return yOffset + margin.bottom; // Add margin at the bottom
  }

  function drawChart() {
    const svg = d3.select("#tile-svg");
    const groups = d3.group(data, d => d.region);

    let yOffset = margin.top; // Start position for the groups
    const groupTitleOffset = 30;

    const colorScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.percentage) ?? 100]) // Percent range
      .range(["#f7e1d7", "#b55a30"]); // Light to dark color

    groups.forEach((groupData, groupName) => {
      // Add group title
      svg
        .append("text")
        .attr("x", margin.left)
        .attr("y", yOffset - 10)
        .attr("text-anchor", "start")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text(groupName);

      groupData.forEach((d, i) => {
        const tilesPerRow = Math.floor(size.width / (tileSize + padding));
        const row = Math.floor(i / tilesPerRow);
        const col = i % tilesPerRow;

        const x = margin.left + col * (tileSize + padding);
        const y = yOffset + row * (tileSize + padding);

        // Add the outer rectangle (tile)
        svg
          .append("rect")
          .attr("x", x)
          .attr("y", y + 12) // Offset down for the country label above
          .attr("width", tileSize)
          .attr("height", tileSize)
          .attr("fill", "#fff")
          .attr("stroke", "#000");

        // Add the inner rectangle to represent the percentage
        svg
          .append("rect")
          .attr("x", x + tileSize * 0.1) // Add padding for the inner box
          .attr("y", y + 12 + tileSize * 0.1) // Add padding for the inner box
          .attr("width", tileSize * 0.8) // Inner box width
          .attr("height", (tileSize * 0.8) * (d.percentage / 100)) // Scale height by percentage
          .attr("fill", colorScale(d.percentage));

        // Add the country name above the square
        svg
          .append("text")
          .attr("x", x + tileSize / 2)
          .attr("y", y) // Positioned above the square
          .text(d.country)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .attr("font-size", "10px")
          .attr("fill", "#000");

        // Add the percentage inside the square
        svg
          .append("text")
          .attr("x", x + tileSize / 2)
          .attr("y", y + 12 + tileSize / 2) // Centered inside the square
          .text(`${d.percentage.toFixed(1)}%`)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .attr("font-size", "10px")
          .attr("fill", "#000");
      });

      const numRows = Math.ceil(groupData.length / Math.floor(size.width / (tileSize + padding)));
      yOffset += numRows * (tileSize + padding) + groupTitleOffset;
    });
  }

  return (
    <div ref={chartRef} className="chart-container">
      <svg id="tile-svg" width="100%" height={size.height}></svg>
    </div>
  );
}