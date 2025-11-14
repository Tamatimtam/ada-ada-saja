from flask import render_template, jsonify, abort, request
from app import app
from app.services import (
    get_main_metrics, get_anxiety_by_category, get_filtered_metrics,
    get_visual_analytics_data, get_filtered_loan_data, get_loan_purpose_data,
    get_digital_time_data, get_regional_data_from_file, get_financial_data_from_file, 
    get_profession_data, get_education_data, get_metrics_deep_dive,
    get_question_distribution_data, METRICS_CONFIG 
)
import re
from urllib.parse import unquote

@app.route("/")
def index():
    main_metrics = get_main_metrics()
    scores = main_metrics["scores"]
    viz_data = get_visual_analytics_data()
    metrics_deep_dive = get_metrics_deep_dive()

    page_data = {
        "hero_section": {
            "title": "Gen Z Financial Dashboard",
            "anxiety_score": main_metrics["average_anxiety_score"],
        },
        "knowledge_card": {
            "title": "Financial Knowledge",
            "score_literasi_finansial": scores.get("Literasi Finansial", 0),
            "score_literasi_digital": scores.get("Literasi Keuangan Digital", 0),
        },
        "behavior_card": {
            "title": "Financial Behavior",
            "score_pengelolaan": scores.get("Pengelolaan Keuangan", 0),
            "score_perilaku": scores.get("Sikap Finansial", 0),
            "score_disiplin": scores.get("Disiplin Finansial", 0),
        },
        "wellbeing_card": {
            "title": "Financial Wellbeing",
            "score_kesejahteraan": scores.get("Kesejahteraan Finansial", 0),
            "score_investasi": scores.get("Investasi Aset", 0),
        },
    }
    return render_template(
        'index.html', 
        data=page_data, 
        chart_html=viz_data['chart_html'], 
        profession_chart=viz_data['profession_chart'], 
        education_chart=viz_data['education_chart'],
        metrics_deep_dive=metrics_deep_dive
    )

@app.route('/api/question-distribution/<question_id>')
def question_distribution(question_id):
    question_text = None
    for metric in METRICS_CONFIG.values():
        for q in metric['questions']:
            safe_text = re.sub(r'[^a-zA-Z0-9\s]', '', q)
            current_id = safe_text.lower().replace(" ", "-")[:50]
            if current_id == question_id:
                question_text = q
                break
        if question_text:
            break
            
    if not question_text:
        abort(404, description="Question not found for the given ID")

    data = get_question_distribution_data(question_text)
    return jsonify(data)

@app.route('/data/anxiety_by/<filter_by>')
def anxiety_by_filter(filter_by):
    data = get_anxiety_by_category(filter_by)
    return jsonify(categories=data["categories"], scores=data["scores"])

@app.route("/api/filter_metrics/<filter_by>/<path:filter_value>")
def filtered_metrics(filter_by, filter_value):
    try:
        metrics = get_filtered_metrics(filter_by, filter_value)
        return jsonify(
            scores=metrics["scores"],
            average_anxiety_score=metrics["average_anxiety_score"],
        )
    except Exception as e:
        return jsonify(error=str(e)), 500

# --- REFACTORED ROUTES ---
# All routes below now use query parameters for filtering

@app.route("/api/loan-filtered")
def api_loan_filtered():
    filter_type = request.args.get('filter_type')
    filter_value = request.args.get('filter_value')
    data = get_filtered_loan_data(filter_type, filter_value)
    return jsonify(data)

@app.route("/api/loan-purpose")
def api_loan_purpose():
    filter_type = request.args.get('filter_type')
    filter_value = request.args.get('filter_value')
    data = get_loan_purpose_data(filter_type, filter_value)
    return jsonify(data)

@app.route("/api/digital-time")
def api_digital_time():
    filter_type = request.args.get('filter_type')
    filter_value = request.args.get('filter_value')
    data = get_digital_time_data(filter_type, filter_value)
    return jsonify(data)

@app.route("/api/profession-chart")
def api_profession_chart():
    filter_type = request.args.get('filter_type')
    filter_value = request.args.get('filter_value')
    data = get_profession_data(filter_type, filter_value)
    return jsonify(data)

@app.route("/api/education-chart")
def api_education_chart():
    filter_type = request.args.get('filter_type')
    filter_value = request.args.get('filter_value')
    data = get_education_data(filter_type, filter_value)
    return jsonify(data)

@app.route("/api/financial-profile")
def get_financial_data():
    """Endpoint for aggregated Gen Z financial profile data, now filterable."""
    filter_type = request.args.get('filter_type')
    filter_value = request.args.get('filter_value')
    data = get_financial_data_from_file(filter_type, filter_value)
    if "error" in data:
        return jsonify(data), 404
    return jsonify(data)

# --- UNCHANGED ROUTES ---
@app.route("/api/data")
def get_regional_data():
    data = get_regional_data_from_file()
    if "error" in data:
        return jsonify(data), 404
    return jsonify(data)