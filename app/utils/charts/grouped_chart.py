import plotly.graph_objects as go


def create_grouped_bar_chart(chart_data):
    categories = chart_data["categories"]
    income_pct = chart_data["income_percentages"]
    expense_pct = chart_data["expense_percentages"]
    income_counts = chart_data["income_counts"]
    expense_counts = chart_data["expense_counts"]

    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            name="Income Distribution",
            x=categories,
            y=income_pct,
            text=[f"{pct:.1f}%" for pct in income_pct],
            textposition="outside",
            marker_color="#3498db",
            hovertemplate="<b>Income: %{x}</b><br>Percentage: %{y:.1f}%<br>Count: %{customdata}<extra></extra>",
            customdata=income_counts,
        )
    )
    fig.add_trace(
        go.Bar(
            name="Expense Distribution",
            x=categories,
            y=expense_pct,
            text=[f"{pct:.1f}%" for pct in expense_pct],
            textposition="outside",
            marker_color="#e74c3c",
            hovertemplate="<b>Expense: %{x}</b><br>Percentage: %{y:.1f}%<br>Count: %{customdata}<extra></extra>",
            customdata=expense_counts,
        )
    )

    fig.update_layout(
        title={
            "text": "💰 GenZ Income vs Expense Distribution by Category",
            "x": 0.5,
            "xanchor": "center",
            "font": {"size": 11},
        },
        xaxis={"title": "Category (IDR per month)"},
        yaxis={"title": "Percentage of Population (%)"},
        barmode="group",
        template="plotly_white",
        height=288,
        legend=dict(orientation="h", y=1.05, x=0.5, xanchor="center"),
    )

    return fig.to_html(
        include_plotlyjs=False,
        div_id="grouped-bar-chart",
        config={"displayModeBar": True, "displaylogo": False},
    )
