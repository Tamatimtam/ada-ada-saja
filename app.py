# app.py

from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def dashboard():
    # Create a dictionary to hold all our dynamic data.
    # In a real app, this would come from a database.
    dashboard_data = {
        'hero_section': {
            'title': 'Denyut Finansial Gen Z',
            'description': 'Memahami perilaku, pengetahuan, dan kesejahteraan finansial Generasi Z melalui data interaktif.',
            'anxiety_score': 3.2,
            'digital_time_spent': [
                {'name': '2-4h', 'value': 180},
                {'name': '4-6h', 'value': 250},
                {'name': '6-8h', 'value': 300},
                {'name': '8-10h', 'value': 220},
                {'name': '>10h', 'value': 150}
            ]
        },
        'knowledge_card': {
            'title': 'Pengetahuan & Literasi Keuangan',
            'score_literasi_finansial': 78,
            'score_literasi_digital': 82
        },
        'behavior_card': {
            'title': 'Perilaku & Pengambilan Keputusan Finansial',
            'score_pengelolaan': 85,
            'score_perilaku': 73,
            'score_disiplin': 68
        },
        'wellbeing_card': {
            'title': 'Kesejahteraan & Sikap Finansial',
            'score_kesejahteraan': 76,
            'score_investasi': 71
        }
    }
    
    # Pass the entire dictionary to the template under the variable name 'data'.
    return render_template('index.html', data=dashboard_data)

if __name__ == '__main__':
    app.run(debug=True)