from flask import render_template, jsonify
from app import app
from app.services import get_main_metrics, get_anxiety_by_category, get_filtered_metrics

@app.route('/')
def index():
    main_metrics = get_main_metrics()
    scores = main_metrics['scores']

    page_data = {
        "hero_section": {
            "title": "Gen Z Financial Health Dashboard",
            "anxiety_score": main_metrics['average_anxiety_score']
        },
        "knowledge_card": {
            "title": "Financial Knowledge",
            "score_literasi_finansial": scores.get('Literasi Finansial', 0),
            "score_literasi_digital": scores.get('Literasi Keuangan Digital', 0)
        },
        "behavior_card": {
            "title": "Financial Behavior",
            "score_pengelolaan": scores.get('Pengelolaan Keuangan', 0),
            "score_perilaku": scores.get('Sikap Finansial', 0),
            "score_disiplin": scores.get('Disiplin Finansial', 0)
        },
        "wellbeing_card": {
            "title": "Financial Wellbeing",
            "score_kesejahteraan": scores.get('Kesejahteraan Finansial', 0),
            "score_investasi": scores.get('Investasi Aset', 0)
        }
    }
    return render_template('index.html', data=page_data)

@app.route('/data/anxiety_by/<filter_by>')
def anxiety_by_filter(filter_by):
    data = get_anxiety_by_category(filter_by)
    return jsonify(categories=data['categories'], scores=data['scores'])

@app.route('/api/filter_metrics/<filter_by>/<path:filter_value>')
def filtered_metrics(filter_by, filter_value):
    try:
        metrics = get_filtered_metrics(filter_by, filter_value)
        return jsonify(scores=metrics['scores'], average_anxiety_score=metrics['average_anxiety_score'])
    except Exception as e:
        return jsonify(error=str(e)), 500

