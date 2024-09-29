export const verticalLinePlugin = {
    id: 'verticalLinePlugin',
    afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;

        if (chart.tooltip._active.length) {
            const { x } = chart.tooltip._active[0].element;
            const dataIndex = chart.data.datasets[0].data.findIndex((_, index) => {
                const dataX = xScale.getPixelForValue(chart.data.labels[index]);
                return Math.abs(dataX - x) < xScale.width / chart.data.labels.length;
            });

            if (dataIndex !== -1) {
                const dataPoint = chart.data.datasets[0].data[dataIndex];
                const dataLabel = chart.data.labels[dataIndex];
                const dataX = xScale.getPixelForValue(dataLabel);
                const dataY = yScale.getPixelForValue(dataPoint);

                ctx.save();
                
                // Draw vertical line
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; 
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]); // Optional: dashed line effect
                ctx.beginPath();
                ctx.moveTo(dataX, chartArea.top); 
                ctx.lineTo(dataX, chartArea.bottom); 
                ctx.stroke();

                // Draw the dot
                ctx.fillStyle = 'white'; 
                ctx.beginPath();
                ctx.arc(dataX, dataY, 5, 0, 2 * Math.PI); 
                ctx.fill();
                
                ctx.restore();
            }
        }
    }
};