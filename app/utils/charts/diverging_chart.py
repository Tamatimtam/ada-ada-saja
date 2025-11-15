import plotly.graph_objects as go


def create_diverging_bar_chart(chart_data):
    categories = chart_data["categories"]
    income_pct = chart_data["income_percentages"]
    expense_pct = chart_data["expense_percentages"]
    income_counts = chart_data["income_counts"]
    expense_counts = chart_data["expense_counts"]

    fig = go.Figure()

    # TRACE 0: Expense (Negative values)
    fig.add_trace(
        go.Bar(
            name="Pengeluaran",
            y=categories,
            x=[-pct for pct in expense_pct],
            orientation="h",
            marker=dict(
                color="#e74c3c",
                line=dict(color="#c0392b", width=0.5),
                opacity=0.9,
                cornerradius=5,
            ),
            text=[f"{pct:.1f}%" for pct in expense_pct],
            textposition="inside",
            textfont=dict(size=10, color="white", family="Arial, sans-serif"),
            hovertemplate="<b>%{y}</b><br>Pengeluaran: %{text}<br>Jumlah: %{customdata} responden<br><extra></extra>",
            customdata=expense_counts,
            meta=[f"expense_{cat}" for cat in categories],
        )
    )
    
    # TRACE 1: Income (Positive values)
    fig.add_trace(
        go.Bar(
            name="Pendapatan",
            y=categories,
            x=income_pct,
            orientation="h",
            marker=dict(
                color="#1abc9c",
                line=dict(color="#16a085", width=0.5),
                opacity=0.9,
                cornerradius=5,
            ),
            text=[f"{pct:.1f}%" for pct in income_pct],
            textposition="inside",
            textfont=dict(size=10, color="white", family="Arial, sans-serif"),
            hovertemplate="<b>%{y}</b><br>Pendapatan: %{text}<br>Jumlah: %{customdata} responden<br><extra></extra>",
            customdata=income_counts,
            meta=[f"income_{cat}" for cat in categories],
        )
    )

    fig.update_layout(
        title={
            "text": '📊 <b>Distribusi Pendapatan vs Pengeluaran</b><br><sub style="font-size:10px; color:#7f8c8d; font-weight:normal;">Klik bar untuk memfilter seluruh dasbor</sub>',
            "x": 0.5,
            "xanchor": "center",
            "font": {"size": 14, "family": "Stack Sans Notch, sans-serif", "color": "#2c3e50"},
        },
        barmode="overlay",
        xaxis={
            "title": "<b>Persentase Responden</b>",
            "tickvals": [-40, -20, 0, 20, 40],
            "ticktext": ["40%", "20%", "0%", "20%", "40%"],
            "title_font": {"size": 10, "color": "#34495e"},
            "tickfont": {"size": 8, "color": "#34495e"},
            "gridcolor": "rgba(0, 0, 0, 0)",
            "zeroline": True,
            "zerolinewidth": 2,
            "zerolinecolor": "#95a5a6",
        },
        yaxis={
            "title": "<b>Kategori Finansial (Rp/bulan)</b>",
            "title_font": {"size": 10, "color": "#34495e"},
            "tickfont": {"size": 8, "color": "#34495e"},
            "gridcolor": "rgba(0, 0, 0, 0)",
            "side": "left",
        },
        template="plotly_white",
        autosize=False,
        height=274,
        width=368,
        showlegend=True,
        legend=dict(
            orientation="h", yanchor="top", y=1.15, xanchor="center", x=0.5,
            font={"size": 8, "color": "#2c3e50"}, bgcolor="rgba(255, 255, 255, 0)",
            bordercolor="rgba(0,0,0,0)", borderwidth=0,
        ),
        plot_bgcolor="rgba(255, 255, 255, 1)",
        paper_bgcolor="white",
        margin=dict(l=8, r=2, t=80, b=4),
        hoverlabel=dict(bgcolor="white", font_size=10, font_family="Arial, sans-serif"),
    )

    chart_html = fig.to_html(
        include_plotlyjs=False,
        div_id="diverging-bar-chart",
        config={
            "displayModeBar": 'hover', "displaylogo": False, "responsive": True,
            "modeBarButtonsToRemove": ["pan2d", "lasso2d", "select2d"],
            "toImageButtonOptions": {
                "format": "png", "filename": "income_vs_expense_chart",
                "height": 576, "width": 1152, "scale": 2,
            },
        },
    )

    # --- PHASE 2: UPDATED INTERACTIVE SCRIPT ---
    interactive_script = """
    <script>
    (function() {
        function initializeChartInteractivity() {
            const chartDiv = document.getElementById('diverging-bar-chart');
            if (!chartDiv || typeof Plotly === 'undefined' || !chartDiv.data) {
                setTimeout(initializeChartInteractivity, 100);
                return;
            }
            
            let activeFilter = null; // Stores { type, value }
            
            chartDiv.on('plotly_click', function(data) {
                const point = data.points[0];
                const traceIndex = point.curveNumber; // 0 for Expense, 1 for Income
                const filterValue = point.y;
                const filterType = traceIndex === 0 ? 'expense' : 'income';

                // Check if the same bar is clicked again to reset
                if (activeFilter && activeFilter.type === filterType && activeFilter.value === filterValue) {
                    resetFilter();
                } else {
                    applyFilter(filterType, filterValue);
                }
            });
            
            function applyFilter(filterType, filterValue) {
                activeFilter = { type: filterType, value: filterValue };
                
                // Dispatch a global event that other components can listen to
                const event = new CustomEvent('applyDashboardFilter', { 
                    detail: { filterType, filterValue }, 
                    bubbles: true 
                });
                document.dispatchEvent(event);
                
                // --- Visual Feedback Logic ---
                const selectedTrace = filterType === 'expense' ? 0 : 1;
                
                // Update opacity for all bars
                Plotly.restyle(chartDiv, 'marker.opacity', chartDiv.data.map((trace, i) => {
                    const opacities = Array(trace.y.length).fill(0.25);
                    const categoryIndex = trace.y.indexOf(filterValue);
                    if (i === selectedTrace && categoryIndex !== -1) {
                        opacities[categoryIndex] = 1.0;
                    }
                    return opacities;
                }));
                
                // Update y-axis label styles
                const tickColors = chartDiv.data[0].y.map(cat => cat === filterValue ? '#e67e22' : 'rgba(52, 73, 94, 0.4)');
                const tickSizes = chartDiv.data[0].y.map(cat => cat === filterValue ? 12 : 10);
                const tickWeights = chartDiv.data[0].y.map(cat => cat === filterValue ? 'bold' : 'normal');
                Plotly.relayout(chartDiv, { 'yaxis.tickfont.color': tickColors, 'yaxis.tickfont.size': tickSizes, 'yaxis.tickfont.weight': tickWeights });
            }
            
            function resetFilter() {
                if (!activeFilter) return;
                activeFilter = null;
                
                // Dispatch a global reset event
                const event = new CustomEvent('resetDashboardFilter', { bubbles: true });
                document.dispatchEvent(event);
                
                // --- Visual Reset Logic ---
                Plotly.restyle(chartDiv, 'marker.opacity', [Array(chartDiv.data[0].y.length).fill(0.9), Array(chartDiv.data[1].y.length).fill(0.9)]);
                Plotly.relayout(chartDiv, { 'yaxis.tickfont': { size: 8, color: '#34495e', weight: 'normal' } });
            }
            
            // Allow other components to trigger a reset externally if needed
            document.addEventListener('resetDashboardFilter', () => { if (activeFilter) resetFilter(); });
        }
        
        if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializeChartInteractivity); } else { initializeChartInteractivity(); }
    })();
    </script>
    """

    return chart_html + interactive_script