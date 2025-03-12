import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import './DonutChart.css';

const DonutChart = ({ data, width=300, height=300 }) => {
    const ref = useRef();
    const tooltipRef = useRef();

    const colors = [
        '#4CAF50',  // Present
        '#FFC107',  // Late
        '#F44336',  // Absent
        '#2196F3',  // Excused
        '#9E9E9E',  // Not marked yet
    ];

    useEffect(() => {  
        const svg = d3.select(ref.current);
        svg.selectAll('*').remove();

        const radius = Math.min(width, height) / 2;
        
        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);
        const g = svg
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const slices = g.selectAll('path').data(pie(data)).enter().append('path');
        slices
            .attr('d', arc) 
            .attr('fill', (d, i) => colors[i])
            .attr('stroke', '#fff')
            .style('transition', 'opacity 0.2s')
            .style('stroke-width', '2px')
            .style('cursor', 'pointer')
            .on('mouseover', (e, d) => {
                d3.select(tooltipRef.current)
                    .style('opacity', 1)
                    .text(d.data.value)
                    .style('left', `${e.pageX + 15}px`)
                    .style('top', `${e.pageY - 25}px`);

                slices.style('opacity', 0.45);
                d3.selectAll('.legend-item').style('opacity', 0.45)
                d3.select(e.currentTarget).style('opacity', 1);
                d3.select(`.legend-item[data-label='${d.data.label}']`).style('opacity', 1);

            })
            .on('mousemove',e => {
                d3.select(tooltipRef.current)
                    .style('left', `${e.pageX + 15}px`)
                    .style('top', `${e.pageY - 25}px`);
            })
            .on('mouseout', () => {
                d3.select(tooltipRef.current).style('opacity', 0);
                slices.style('opacity', 1);
                d3.selectAll('.legend-item').style('opacity', 1)
            });

    }, [data, width, height]);

    return (
        <div className="DonutChart">
            <svg ref={ref} width={width} height={height}></svg>

            <div className="tooltip" ref={tooltipRef}></div>

            <div className="legend-container">
                {data.map((d, i) => (
                    <div key={i} className="legend-item" data-label={d.label} >
                        <div className="legend-color" style={{ backgroundColor: colors[i] }}></div>
                        <span className="legend-label">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DonutChart;