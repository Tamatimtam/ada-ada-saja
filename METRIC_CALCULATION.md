# Financial Health Metric Calculation Logic

## Overview

This document explains how the raw survey data from `dataset/Sheet2.csv` is processed to calculate the seven financial health metrics displayed on the dashboard. The raw score for each question is on a **1 to 4 scale**. The process involves three key steps:

1.  **Categorization**: Each relevant question from the survey is mapped to one of the seven core financial metrics.
2.  **Polarity Reversal**: Certain questions are phrased negatively, where a high score indicates a poor outcome. These questions have their scores reversed.
3.  **Normalization**: The final average score for each metric is converted to a percentage (0-100) for display on the dashboard.

## 1. Metric Categorization

The following table shows which questions from `Sheet2.csv` are averaged to calculate each of the seven metrics.

### Knowledge Card

| Metric | Questions from `Sheet2.csv` |
| :--- | :--- |
| **Literasi Finansial** | `I am able to identify risks and discrepancies and view numbers in a complex way` <br> `I am able to understand what is behind the numbers` <br> `I am able to understand numbers and financial metrics` <br> `I am able to understand what drives cash flow and profits` <br> `I am able to understand the company's financial statements and some core performance measures` <br> `I pay attention to news about the economy as it may affect my family` |
| **Literasi Keuangan Digital** | `Awareness about the potential of financial risk in using digital financial provider or fintech, such as the legality of the fintech provider, interest rate and transaction fee` <br> `Having experience in using the product and service of fintech for digital payment` <br> `Having a good understanding of digital payment products such as E-Debit, E-Credit, E-Money, Mobile/Internet banking, E -wallet` <br> `Having a good understanding of digital alternatives` <br> `Having a good understanding of digital insurance` <br> `Having a good understanding of customer rights and protection as well as the procedure to complain about the service from digital  financial providers` |

### Behavior Card

| Metric | Questions from `Sheet2.csv` |
| :--- | :--- |
| **Pengelolaan Keuangan** | `I am able to and divide it accordingly across an allotted period to the right concerned areas` <br> `I am able to project the amount of cash that will be available to me in the future` <br> `I take part in domestic expense planning` <br> `I suggest at home that we keep money aside for emergencies` <br> `I am able to search for economic options during financial decision making` <br> `I am able to foresee the long term and short-term consequences of the financial decisions I undertake` |
| **Sikap Finansial** | `I usually have a critical view of the way my friends deal with money` <br> `I like to participate in family decision making when we buy something expensive for home` <br> `I advise others on money matters` <br> `I often do things without giving them much thought` <br> `I am impulsive` <br> `I say things before I have thought them through` <br> `I am able to quickly change my financial decisions as per the changes in circumstance` <br> `Appraise of personal risk helps me in better financial decision making` <br> `I make sound financial decision by comparing results over the time` <br> `I make sound financial decisions by comparing results over expenses involved` <br> `Previously used decision strategies help me in better financial decision making` |
| **Disiplin Finansial** | `I am able to plan ahead to avoid impulse spending` <br> `I always try to save some money to do things I really like` <br> `I always like to negotiate prices when I buy` <br> `I keep an eye on promotions and discounts` <br> `I like to think thoroughly before deciding to buy something` <br> `I like to research prices whenever I buy something` |

### Wellbeing Card

| Metric | Questions from `Sheet2.csv` |
| :--- | :--- |
| **Kesejahteraan Finansial** | `I am becoming financially secure` <br> `I am securing my financial future` <br> `I will achieve the financial goals that I have set for myself` <br> `I have saved (or will be able to save) enough money to last me to the end of my life` <br> `Because of my money situation, I feel I will never have the things I want in life` <br> `I am behind with my finances` <br> `My finances control my life` <br> `Whenever I feel in control of my finances, something happens that sets me back` <br> `I am unable to enjoy life because I obsess too much about money` |
| **Investasi Aset** | `I am able to recognize a good financial investment` <br> `Experience in using the product and service of fintech for financing (loan) and investment` <br> `Experience in using the product and service of fintech for asset management` <br> `Having a good understanding of product digital asset management` |

---

## 2. Negative Polarity Questions

For standard questions, a higher score is better. However, for negative polarity questions, a higher score indicates a negative behavior or feeling. For example, strongly agreeing with "I am impulsive" is not a positive financial indicator.

To correct for this, we reverse the scores for these questions using the following formula:

`new_score = 5 - original_score`

The following questions are treated as having negative polarity:

- `I often do things without giving them much thought`
- `I am impulsive`
- `I say things before I have thought them through`
- `Because of my money situation, I feel I will never have the things I want in life`
- `I am behind with my finances`
- `My finances control my life`
- `Whenever I feel in control of my finances, something happens that sets me back`
- `I am unable to enjoy life because I obsess too much about money`
