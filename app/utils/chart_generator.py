"""
Chart Generator Module
Creates visualizations using Plotly
"""
import plotly.graph_objects as go
import json


class ChartGenerator:
    """Generates interactive Plotly charts"""
    
    @staticmethod
    def create_diverging_bar_chart(chart_data):
        """
        Create an enhanced Diverging Bar Chart for Income vs Expense comparison
        with interactive category filtering and visual label feedback
        
        Args:
            chart_data (dict): Dictionary containing chart data
        
        Returns:
            str: HTML div containing the Plotly chart with interactive filtering
        """
        categories = chart_data['categories']
        income_pct = chart_data['income_percentages']
        expense_pct = chart_data['expense_percentages']
        income_counts = chart_data['income_counts']
        expense_counts = chart_data['expense_counts']
        
        # Create figure
        fig = go.Figure()
        
        # Add Expense bars (negative values for left side) - Enhanced styling
        fig.add_trace(go.Bar(
            name='Expense',
            y=categories,
            x=[-pct for pct in expense_pct],
            orientation='h',
            marker=dict(
                color='#e74c3c',
                line=dict(color='#c0392b', width=1.5),
                opacity=0.9
            ),
            text=[f'{pct:.1f}%' for pct in expense_pct],
            textposition='inside',
            textfont=dict(size=11, color='white', family='Arial, sans-serif'),
            hovertemplate='<b>%{y}</b><br>Expense: %{text}<br>Count: %{customdata}<br><extra></extra>',
            customdata=expense_counts,
            meta=[f'expense_{cat}' for cat in categories]
        ))
        
        # Add Income bars (positive values for right side) - Enhanced styling
        fig.add_trace(go.Bar(
            name='Income',
            y=categories,
            x=income_pct,
            orientation='h',
            marker=dict(
                color='#3498db',
                line=dict(color='#2980b9', width=1.5),
                opacity=0.9
            ),
            text=[f'{pct:.1f}%' for pct in income_pct],
            textposition='inside',
            textfont=dict(size=11, color='white', family='Arial, sans-serif'),
            hovertemplate='<b>%{y}</b><br>Income: %{text}<br>Count: %{customdata}<br><extra></extra>',
            customdata=income_counts,
            meta=[f'income_{cat}' for cat in categories]
        ))
        
        # Enhanced layout with better spacing
        fig.update_layout(
            title={
                'text': '<b>⚖️ Income vs Expense Distribution</b><br><sub style="font-size:11px; color:#7f8c8d; font-weight:normal;">Click any bar to highlight category • Click again to deselect</sub>',
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 17, 'family': 'Arial, sans-serif', 'color': '#2c3e50'}
            },
            barmode='overlay',
            xaxis={
                'title': '<b>Percentage of Population</b>',
                'tickvals': [-40, -30, -20, -10, 0, 10, 20, 30, 40],
                'ticktext': ['40%', '30%', '20%', '10%', '0%', '10%', '20%', '30%', '40%'],
                'title_font': {'size': 13, 'color': '#34495e'},
                'tickfont': {'size': 11, 'color': '#34495e'},
                'gridcolor': 'rgba(189, 195, 199, 0.3)',
                'zeroline': True,
                'zerolinewidth': 2,
                'zerolinecolor': '#95a5a6'
            },
            yaxis={
                'title': '<b>Financial Category (IDR/month)</b>',
                'title_font': {'size': 13, 'color': '#34495e'},
                'tickfont': {'size': 11, 'color': '#34495e'},
                'gridcolor': 'rgba(189, 195, 199, 0.2)',
                'side': 'left'
            },
            template='plotly_white',
            height=480,
            autosize=True,
            showlegend=True,
            legend=dict(
                orientation='h',
                yanchor='bottom',
                y=1.05,
                xanchor='center',
                x=0.5,
                font={'size': 12, 'color': '#2c3e50'},
                bgcolor='rgba(255, 255, 255, 0.9)',
                bordercolor='#bdc3c7',
                borderwidth=1
            ),
            plot_bgcolor='rgba(250, 250, 250, 1)',
            paper_bgcolor='white',
            margin=dict(l=150, r=30, t=90, b=60),
            hoverlabel=dict(
                bgcolor='white',
                font_size=12,
                font_family='Arial, sans-serif'
            )
        )
        
        # Convert to HTML with custom div ID for JavaScript targeting
        chart_html = fig.to_html(
            # CRITICAL FIX: Set to False. The library is now loaded in base.html
            include_plotlyjs=False,
            div_id='diverging-bar-chart',
            config={
                'displayModeBar': True,
                'displaylogo': False,
                'responsive': True,
                'modeBarButtonsToRemove': ['pan2d', 'lasso2d', 'select2d'],
                'toImageButtonOptions': {
                    'format': 'png',
                    'filename': 'income_vs_expense_chart',
                    'height': 600,
                    'width': 1200,
                    'scale': 2
                }
            }
        )
        
        # Enhanced JavaScript with label styling
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
                const originalTickFont = { size: 11, color: '#34495e', family: 'Arial, sans-serif' };
                
                // Click handler for bar selection
                chartDiv.on('plotly_click', function(data) {
                    const point = data.points[0];
                    const category = point.y;
                    
                    console.log('Bar clicked:', category);
                    
                    // Toggle selection
                    if (selectedCategory === category) {
                        resetFilter();
                    } else {
                        applyFilter(category);
                    }
                });
                
                // Apply category filter with enhanced label styling
                function applyFilter(category) {
                    selectedCategory = category;
                    
                    console.log('Applying filter for:', category);
                    
                    // Store in data attribute
                    chartDiv.setAttribute('data-selected-category', category);
                    
                    // Dispatch event with delay to ensure listeners are ready
                    setTimeout(() => {
                        const event = new CustomEvent('categoryFiltered', {
                            detail: { category: category },
                            bubbles: true
                        });
                        document.dispatchEvent(event);
                        console.log('categoryFiltered event dispatched');
                    }, 10);
                    
                    // Get category index
                    const categoryIndex = chartDiv.data[0].y.indexOf(category);
                    
                    // Visual feedback: dim non-selected bars
                    const barUpdate = {
                        'marker.opacity': [],
                        'marker.line.width': []
                    };
                    
                    chartDiv.data.forEach((trace) => {
                        const opacities = [];
                        const lineWidths = [];
                        
                        trace.y.forEach((cat) => {
                            if (cat === category) {
                                opacities.push(1.0);
                                lineWidths.push(3);
                            } else {
                                opacities.push(0.25);
                                lineWidths.push(1);
                            }
                        });
                        
                        barUpdate['marker.opacity'].push(opacities);
                        barUpdate['marker.line.width'].push(lineWidths);
                    });
                    
                    Plotly.restyle(chartDiv, barUpdate);
                    
                    // Enhanced Y-axis label styling
                    const tickColors = chartDiv.data[0].y.map(cat => 
                        cat === category ? '#e67e22' : 'rgba(52, 73, 94, 0.4)'
                    );
                    const tickSizes = chartDiv.data[0].y.map(cat => 
                        cat === category ? 13 : 11
                    );
                    
                    const labelUpdate = {
                        'yaxis.tickfont.color': tickColors,
                        'yaxis.tickfont.size': tickSizes
                    };
                    
                    Plotly.relayout(chartDiv, labelUpdate);
                    
                    // Add visual highlight to selected label using CSS
                    setTimeout(() => {
                        const yaxisLabels = chartDiv.querySelectorAll('.ytick text');
                        yaxisLabels.forEach((label, idx) => {
                            if (idx === categoryIndex) {
                                label.style.fontWeight = 'bold';
                                label.style.fill = '#e67e22';
                                label.style.fontSize = '13px';
                                label.style.transition = 'all 0.3s ease';
                            } else {
                                label.style.fontWeight = 'normal';
                                label.style.fill = 'rgba(52, 73, 94, 0.4)';
                                label.style.fontSize = '11px';
                            }
                        });
                    }, 50);
                }
                
                // Reset filter
                function resetFilter() {
                    selectedCategory = null;
                    chartDiv.removeAttribute('data-selected-category');
                    
                    console.log('Resetting filter');
                    
                    // Dispatch event with delay
                    setTimeout(() => {
                        const event = new CustomEvent('categoryFilterReset', { bubbles: true });
                        document.dispatchEvent(event);
                        console.log('categoryFilterReset event dispatched');
                    }, 10);
                    
                    // Reset bars - dynamically calculate array length
                    const numCategories = chartDiv.data[0].y.length;
                    const fullOpacity = Array(numCategories).fill(0.9);
                    const standardWidth = Array(numCategories).fill(1.5);
                    
                    const barUpdate = {
                        'marker.opacity': [fullOpacity, fullOpacity],
                        'marker.line.width': [standardWidth, standardWidth]
                    };
                    Plotly.restyle(chartDiv, barUpdate);
                    
                    // Reset Y-axis labels
                    const labelUpdate = {
                        'yaxis.tickfont': originalTickFont
                    };
                    Plotly.relayout(chartDiv, labelUpdate);
                    
                    // Reset label styles via CSS
                    setTimeout(() => {
                        const yaxisLabels = chartDiv.querySelectorAll('.ytick text');
                        yaxisLabels.forEach(label => {
                            label.style.fontWeight = 'normal';
                            label.style.fill = '#34495e';
                            label.style.fontSize = '11px';
                        });
                    }, 50);
                }
                
                // Expose reset function globally
                window.chartResetFilter = resetFilter;
                
                // Listen for external reset calls
                document.addEventListener('categoryFilterReset', function() {
                    if (selectedCategory !== null) {
                        resetFilter();
                    }
                });
                
                console.log('Chart interactivity initialized with label feedback');
            }
            
            // Initialize after a short delay to ensure DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeChartInteractivity);
            } else {
                initializeChartInteractivity();
            }
        })();
        </script>
        """
        
        return chart_html + interactive_script
    
    @staticmethod
    def create_profession_chart(profession_data):
        """
        Create a stacked bar chart for Profession vs Financial Standing
        
        Args:
            profession_data (dict): Dictionary containing profession data with financial standing
        
        Returns:
            str: HTML div containing the Plotly chart
        """
        fig = go.Figure()
        
        categories = profession_data['categories']
        colors = profession_data['colors']
        
        # Add bars for each financial standing (stacked)
        for standing in ['Surplus', 'Break-even', 'Deficit']:
            if standing in profession_data['data']:
                values = profession_data['data'][standing]
                
                # Create hover text with actual counts
                hover_text = []
                for i, cat in enumerate(categories):
                    count = profession_data['total_counts'].get(cat, 0)
                    pct = values[i]
                    actual_count = int((pct / 100) * count)
                    hover_text.append(f"{cat}<br>{standing}: {pct:.1f}% ({actual_count} people)")
                
                fig.add_trace(go.Bar(
                    name=standing,
                    x=categories,
                    y=values,
                    marker=dict(
                        color=colors.get(standing, '#95a5a6'),
                        line=dict(color='rgba(255,255,255,0.5)', width=1)
                    ),
                    hovertext=hover_text,
                    hoverinfo='text',
                    text=[f'{v:.0f}%' if v > 8 else '' for v in values],
                    textposition='inside',
                    textfont=dict(size=9, color='white')
                ))
        
        fig.update_layout(
            title={
                'text': '<b>👔 Employment vs Financial Standing</b>',
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 14, 'color': '#2c3e50'}
            },
            xaxis={
                'tickfont': {'size': 8, 'color': '#34495e'},
                'showgrid': False,
                'tickangle': -45
            },
            yaxis={
                'title': '<b>%</b>',
                'title_font': {'size': 10, 'color': '#34495e'},
                'tickfont': {'size': 8, 'color': '#34495e'},
                'gridcolor': 'rgba(189, 195, 199, 0.2)',
                'range': [0, 100]
            },
            barmode='stack',
            template='plotly_white',
            height=480,
            autosize=True,
            showlegend=True,
            legend=dict(
                orientation='h',
                yanchor='bottom',
                y=-0.35,
                xanchor='center',
                x=0.5,
                font={'size': 9}
            ),
            plot_bgcolor='rgba(250, 250, 250, 1)',
            paper_bgcolor='white',
            margin=dict(l=35, r=15, t=60, b=110),
            hoverlabel=dict(bgcolor='white', font_size=10)
        )
        
        chart_html = fig.to_html(
            include_plotlyjs=False,
            div_id='profession-chart',
            config={'displayModeBar': False, 'responsive': True}
        )
        
        return chart_html
    
    @staticmethod
    def create_education_chart(education_data):
        """
        Create a stacked bar chart for Education Level vs Financial Standing
        
        Args:
            education_data (dict): Dictionary containing education data with financial standing
        
        Returns:
            str: HTML div containing the Plotly chart
        """
        fig = go.Figure()
        
        categories = education_data['categories']
        colors = education_data['colors']
        
        # Abbreviate long category names for better display
        abbreviated_cats = []
        for cat in categories:
            if len(cat) > 15:
                if 'Bachelor' in cat:
                    abbreviated_cats.append('Bachelor/D4')
                elif 'Diploma I' in cat:
                    abbreviated_cats.append('Diploma I-III')
                elif 'Senior High' in cat:
                    abbreviated_cats.append('High School')
                elif 'Junior High' in cat:
                    abbreviated_cats.append('Junior High')
                elif 'Elementary' in cat:
                    abbreviated_cats.append('Elementary')
                elif 'Postgraduate' in cat:
                    abbreviated_cats.append('Postgrad')
                else:
                    abbreviated_cats.append(cat[:15])
            else:
                abbreviated_cats.append(cat)
        
        # Add bars for each financial standing (stacked)
        for standing in ['Surplus', 'Break-even', 'Deficit']:
            if standing in education_data['data']:
                values = education_data['data'][standing]
                
                # Create hover text with actual counts
                hover_text = []
                for i, cat in enumerate(categories):
                    count = education_data['total_counts'].get(cat, 0)
                    pct = values[i]
                    actual_count = int((pct / 100) * count)
                    hover_text.append(f"{cat}<br>{standing}: {pct:.1f}% ({actual_count} people)")
                
                fig.add_trace(go.Bar(
                    name=standing,
                    x=abbreviated_cats,
                    y=values,
                    marker=dict(
                        color=colors.get(standing, '#95a5a6'),
                        line=dict(color='rgba(255,255,255,0.5)', width=1)
                    ),
                    hovertext=hover_text,
                    hoverinfo='text',
                    text=[f'{v:.0f}%' if v > 8 else '' for v in values],
                    textposition='inside',
                    textfont=dict(size=9, color='white')
                ))
        
        fig.update_layout(
            title={
                'text': '<b>🎓 Education vs Financial Standing</b>',
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 14, 'color': '#2c3e50'}
            },
            xaxis={
                'tickfont': {'size': 8, 'color': '#34495e'},
                'showgrid': False,
                'tickangle': -45
            },
            yaxis={
                'title': '<b>%</b>',
                'title_font': {'size': 10, 'color': '#34495e'},
                'tickfont': {'size': 8, 'color': '#34495e'},
                'gridcolor': 'rgba(189, 195, 199, 0.2)',
                'range': [0, 100]
            },
            barmode='stack',
            template='plotly_white',
            height=480,
            autosize=True,
            showlegend=True,
            legend=dict(
                orientation='h',
                yanchor='bottom',
                y=-0.35,
                xanchor='center',
                x=0.5,
                font={'size': 9}
            ),
            plot_bgcolor='rgba(250, 250, 250, 1)',
            paper_bgcolor='white',
            margin=dict(l=35, r=15, t=60, b=110),
            hoverlabel=dict(bgcolor='white', font_size=10)
        )
        
        chart_html = fig.to_html(
            include_plotlyjs=False,
            div_id='education-chart',
            config={'displayModeBar': False, 'responsive': True}
        )
        
        return chart_html
    
    @staticmethod
    def create_grouped_bar_chart(chart_data):
        """
        Create a Grouped Bar Chart for Income vs Expense comparison
        (Alternative visualization - for future extension)
        
        Args:
            chart_data (dict): Dictionary containing chart data
        
        Returns:
            str: HTML div containing the Plotly chart
        """
        categories = chart_data['categories']
        income_pct = chart_data['income_percentages']
        expense_pct = chart_data['expense_percentages']
        income_counts = chart_data['income_counts']
        expense_counts = chart_data['expense_counts']
        
        fig = go.Figure()
        
        # Add Income bars
        fig.add_trace(go.Bar(
            name='Income Distribution',
            x=categories,
            y=income_pct,
            text=[f'{pct:.1f}%' for pct in income_pct],
            textposition='outside',
            marker_color='#3498db',
            hovertemplate='<b>Income: %{x}</b><br>Percentage: %{y:.1f}%<br>Count: %{customdata}<extra></extra>',
            customdata=income_counts
        ))
        
        # Add Expense bars
        fig.add_trace(go.Bar(
            name='Expense Distribution',
            x=categories,
            y=expense_pct,
            text=[f'{pct:.1f}%' for pct in expense_pct],
            textposition='outside',
            marker_color='#e74c3c',
            hovertemplate='<b>Expense: %{x}</b><br>Percentage: %{y:.1f}%<br>Count: %{customdata}<extra></extra>',
            customdata=expense_counts
        ))
        
        fig.update_layout(
            title={
                'text': '💰 GenZ Income vs Expense Distribution by Category',
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 24}
            },
            xaxis={'title': 'Category (IDR per month)'},
            yaxis={'title': 'Percentage of Population (%)'},
            barmode='group',
            template='plotly_white',
            height=600,
            legend=dict(orientation='h', y=1.05, x=0.5, xanchor='center')
        )
        
        chart_html = fig.to_html(
            include_plotlyjs=False,
            div_id='grouped-bar-chart',
            config={'displayModeBar': True, 'displaylogo': False}
        )
        
        return chart_html