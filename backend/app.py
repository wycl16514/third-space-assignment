from flask import Flask, jsonify, request
from flask_cors import CORS
import openai
from openai import OpenAI

app = Flask(__name__)
CORS(app)

# In-memory storage for demonstration
tasks = []
currency_count = 0
CURRENCY_PER_TASK = 20
CURRENCY_TO_UNLOCK_STORY = 30  # Amount of currency needed to unlock a story

# OpenAI API key (replace with your actual key)
client = OpenAI(
    api_key="sk-xhV1614b76a07f9dbcc56a1bf9810b8cc67d1ae100cj7Znx",# 您在 2233 创建的 key
    base_url="https://api.gptsapi.net/v1"  # 我们提供的 url
)

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
def create_task():
    new_task = {
        'id': len(tasks) + 1,
        'title': request.json['title'],
        'schedule': request.json['schedule'],
        'completed': False
    }
    tasks.append(new_task)
    return jsonify(new_task), 201

@app.route('/tasks/<int:task_id>/complete', methods=['PUT'])
def complete_task(task_id):
    global currency_count
    task = next((t for t in tasks if t['id'] == task_id), None)
    if task:
        task['completed'] = True
        currency_count += CURRENCY_PER_TASK
        return jsonify(task)
    return jsonify({'error': 'Task not found'}), 404

@app.route('/currency', methods=['GET'])
def get_currency():
    return jsonify({'currency': currency_count})

@app.route('/unlock-story', methods=['POST'])
def unlock_story():
    global currency_count
    if currency_count < CURRENCY_TO_UNLOCK_STORY:
        return jsonify({'error': 'Not enough currency'}), 400

    # Deduct currency for unlocking the story
    currency_count -= CURRENCY_TO_UNLOCK_STORY

    # Generate a situation using OpenAI
    prompt = "Create an interactive storytelling situation with 3 choices for the user to pick from."
    response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {
            "role": "user",
            "content": f"{prompt}"
        }
    ]
    )
    situation = response.choices[0].message.content

    return jsonify({'situation': situation})

@app.route('/respond-to-choice', methods=['POST'])
def respond_to_choice():
    user_choice = request.json['choice']

    # Generate a response from the AI character
    prompt = f"The user chose: {user_choice}. Respond naturally as an AI character."
    response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {
            "role": "user",
            "content": f"{prompt}"
        }
    ]
)
    ai_response = response.choices[0].message.content

    return jsonify({'response': ai_response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)