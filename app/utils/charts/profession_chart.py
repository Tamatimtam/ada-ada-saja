import plotly.graph_objects as go


def create_profession_chart(profession_data):
    fig = go.Figure()
    categories = profession_data["categories"]
    colors = profession_data["colors"]

    for standing in ["Surplus", "Break-even", "Deficit"]:
        if standing in profession_data["data"]:
            values = profession_data["data"][standing]
            hover_text = []
            for i, cat in enumerate(categories):
                count = profession_data["total_counts"].get(cat, 0)
                pct = values[i]
                actual_count = int((pct / 100) * count)
                hover_text.append(
                    f"{cat}<br>{standing}: {pct:.1f}% ({actual_count} people)"
                )

            fig.add_trace(
                go.Bar(
                    name=standing,
                    x=categories,
                    y=values,
                    marker=dict(
                        color=colors.get(standing, "#95a5a6"),
                        line=dict(color="rgba(255,255,255,0.5)", width=1),
                    ),
                    hovertext=hover_text,
                    hoverinfo="text",
                    text=[f"{v:.0f}%" if v > 8 else "" for v in values],
                    textposition="inside",
                    textfont=dict(size=8, color="white"),
                )
            )

    fig.update_layout(
        title={
            "text": "💼<b>Employment vs<br>Financial Standing(%)</b>",  # force line break to avoid clipping
            "x": 0.5,
            "xanchor": "center",
            "y": 0.98,
            "yanchor": "top",
            "pad": {"t": 5},  # increased padding top
            "font": {"size": 12, "color": "#2c3e50", "family": "Stack Sans Notch, sans-serif"},
        },
        xaxis={
            "tickfont": {"size": 8, "color": "#34495e"},
            "showgrid": False,
            "tickangle": -45,
            "automargin": False,
        },
        yaxis={
            "tickfont": {"size": 8, "color": "#34495e"},
            "gridcolor": "rgba(189, 195, 199, 0.2)",
            "range": [0, 100],
        },
        barmode="stack",
        template="plotly_white",
        autosize=False,
        height=264,
        width=188,
        showlegend=False,
        legend={
            "orientation": "h",
            "x": 0.5,
            "xanchor": "center",
            "y": -0.1,
            "yanchor": "top",
            "font": {"size": 10},
            "bgcolor": "rgba(0,0,0,0)",
        },
        margin=dict(l=20, r=28, t=48, b=40),
        hoverlabel=dict(bgcolor="white", font_size=10),
    )

    return fig.to_html(
        include_plotlyjs=False,
        div_id="profession-chart",
        config={"displayModeBar": False},
    )
