import plotly.graph_objects as go


def create_diverging_bar_chart(chart_data):
    categories = chart_data["categories"]
    income_pct = chart_data["income_percentages"]
    expense_pct = chart_data["expense_percentages"]
    income_counts = chart_data["income_counts"]
    expense_counts = chart_data["expense_counts"]

    fig = go.Figure()

    fig.add_trace(
        go.Bar(
            name="Expense",
            y=categories,
            x=[-pct for pct in expense_pct],
            orientation="h",
            marker=dict(
                color="#e74c3c", line=dict(color="#c0392b", width=0.5), opacity=0.9
            ),
            text=[f"{pct:.1f}%" for pct in expense_pct],
            textposition="inside",
            textfont=dict(size=10, color="white", family="Arial, sans-serif"),
            hovertemplate="<b>%{y}</b><br>Expense: %{text}<br>Count: %{customdata}<br><extra></extra>",
            customdata=expense_counts,
            meta=[f"expense_{cat}" for cat in categories],
        )
    )

    fig.add_trace(
        go.Bar(
            name="Income",
            y=categories,
            x=income_pct,
            orientation="h",
            marker=dict(
                color="#3498db", line=dict(color="#2980b9", width=0.5), opacity=0.9
            ),
            text=[f"{pct:.1f}%" for pct in income_pct],
            textposition="inside",
            textfont=dict(size=10, color="white", family="Arial, sans-serif"),
            hovertemplate="<b>%{y}</b><br>Income: %{text}<br>Count: %{customdata}<br><extra></extra>",
            customdata=income_counts,
            meta=[f"income_{cat}" for cat in categories],
        )
    )

    fig.update_layout(
        title={
            "text": '<b>⚖️ Income vs Expense Distribution</b><br><sub style="font-size:10px; color:#7f8c8d; font-weight:normal;">Click any bar to highlight category • Click again to deselect</sub>',
            "x": 0.5,
            "xanchor": "center",
            "font": {"size": 14, "family": "Stack Sans Notch, sans-serif", "color": "#2c3e50"},
        },
        barmode="overlay",
        xaxis={
            "title": "<b>Percentage of Population</b>",
            "tickvals": [-40, -30, -20, -10, 0, 10, 20, 30, 40],
            "ticktext": ["40%", "30%", "20%", "10%", "0%", "10%", "20%", "30%", "40%"],
            "title_font": {"size": 10, "color": "#34495e"},
            "tickfont": {"size": 8, "color": "#34495e"},
            "gridcolor": "rgba(189, 195, 199, 0.3)",
            "zeroline": True,
            "zerolinewidth": 2,
            "zerolinecolor": "#95a5a6",
        },
        yaxis={
            "title": "<b>Financial Category (IDR/month)</b>",
            "title_font": {"size": 10, "color": "#34495e"},
            "tickfont": {"size": 8, "color": "#34495e"},
            "gridcolor": "rgba(189, 195, 199, 0.2)",
            "side": "left",
        },
        template="plotly_white",
        autosize=False,
        height=274,
        width=368,
        showlegend=True,
        legend=dict(
            orientation="v",
            yanchor="top",
            y=1.0,
            xanchor="right",
            x=1.05,
            font={"size": 8, "color": "#2c3e50"},
            bgcolor="rgba(255, 255, 255, 0.9)",
            bordercolor="#bdc3c7",
            borderwidth=1,
        ),
        plot_bgcolor="rgba(250, 250, 250, 1)",
        paper_bgcolor="white",
        margin=dict(l=8, r=2, t=80, b=4),
        hoverlabel=dict(bgcolor="white", font_size=10, font_family="Arial, sans-serif"),
    )

    chart_html = fig.to_html(
        include_plotlyjs=False,
        div_id="diverging-bar-chart",
        config={
            "displayModeBar": True,
            "displaylogo": False,
            "responsive": True,
            "modeBarButtonsToRemove": ["pan2d", "lasso2d", "select2d"],
            "toImageButtonOptions": {
                "format": "png",
                "filename": "income_vs_expense_chart",
                "height": 576,
                "width": 1152,
                "scale": 2,
            },
        },
    )

    interactive_script = """
    <script>
    (function() {
        function initializeChartInteractivity() {
            const chartDiv = document.getElementById('diverging-bar-chart');
            if (!chartDiv || typeof Plotly === 'undefined' || !chartDiv.data) {
                setTimeout(initializeChartInteractivity, 100);
                return;
            }
            
            let selectedCategory = null;
            const originalTickFont = { size: 10, color: '#34495e', family: 'Arial, sans-serif' };
            
            chartDiv.on('plotly_click', function(data) {
                const point = data.points[0];
                const category = point.y;
                
                if (selectedCategory === category) {
                    resetFilter();
                } else {
                    applyFilter(category);
                }
            });
            
            function applyFilter(category) {
                selectedCategory = category;
                chartDiv.setAttribute('data-selected-category', category);
                setTimeout(() => {
                    const event = new CustomEvent('categoryFiltered', { detail: { category: category }, bubbles: true });
                    document.dispatchEvent(event);
                }, 10);
                
                const categoryIndex = chartDiv.data[0].y.indexOf(category);
                const barUpdate = { 'marker.opacity': [], 'marker.line.width': [] };
                
                chartDiv.data.forEach((trace) => {
                    const opacities = [];
                    const lineWidths = [];
                    trace.y.forEach((cat) => {
                        if (cat === category) { opacities.push(1.0); lineWidths.push(3); } else { opacities.push(0.25); lineWidths.push(1); }
                    });
                    barUpdate['marker.opacity'].push(opacities);
                    barUpdate['marker.line.width'].push(lineWidths);
                });
                
                Plotly.restyle(chartDiv, barUpdate);
                
                const tickColors = chartDiv.data[0].y.map(cat => cat === category ? '#e67e22' : 'rgba(52, 73, 94, 0.4)');
                const tickSizes = chartDiv.data[0].y.map(cat => cat === category ? 12 : 10);
                const labelUpdate = { 'yaxis.tickfont.color': tickColors, 'yaxis.tickfont.size': tickSizes };
                Plotly.relayout(chartDiv, labelUpdate);
                
                setTimeout(() => {
                    const yaxisLabels = chartDiv.querySelectorAll('.ytick text');
                    yaxisLabels.forEach((label, idx) => {
                        if (idx === categoryIndex) { label.style.fontWeight = 'bold'; label.style.fill = '#e67e22'; label.style.fontSize = '12px'; label.style.transition = 'all 0.3s ease'; }
                        else { label.style.fontWeight = 'normal'; label.style.fill = 'rgba(52, 73, 94, 0.4)'; label.style.fontSize = '10px'; }
                    });
                }, 50);
            }
            
            function resetFilter() {
                selectedCategory = null;
                chartDiv.removeAttribute('data-selected-category');
                setTimeout(() => {
                    const event = new CustomEvent('categoryFilterReset', { bubbles: true });
                    document.dispatchEvent(event);
                }, 10);
                
                const numCategories = chartDiv.data[0].y.length;
                const fullOpacity = Array(numCategories).fill(0.9);
                const standardWidth = Array(numCategories).fill(1.5);
                const barUpdate = { 'marker.opacity': [fullOpacity, fullOpacity], 'marker.line.width': [standardWidth, standardWidth] };
                Plotly.restyle(chartDiv, barUpdate);
                
                const originalTickFont = { size: 10, color: '#34495e', family: 'Arial, sans-serif' };
                const labelUpdate = { 'yaxis.tickfont': originalTickFont };
                Plotly.relayout(chartDiv, labelUpdate);
                
                setTimeout(() => {
                    const yaxisLabels = chartDiv.querySelectorAll('.ytick text');
                    yaxisLabels.forEach(label => { label.style.fontWeight = 'normal'; label.style.fill = '#34495e'; label.style.fontSize = '10px'; });
                }, 50);
            }
            
            window.chartResetFilter = resetFilter;
            document.addEventListener('categoryFilterReset', function() { if (selectedCategory !== null) resetFilter(); });
        }
        
        if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializeChartInteractivity); } else { initializeChartInteractivity(); }
    })();
    </script>
    """

    return chart_html + interactive_script
