import json
from openai import OpenAI
from src.ai.prompts import CREATE_TEST_QUESTIONS_PROMPT

def create_test_questions(client: OpenAI, name: str, number_questions: int):
    data_for_ai = {
        "name": name,
        "number_questions": number_questions
    }
    response = client.chat.completions.create(
        model="gpt-4.1-nano",
        messages=[
            {"role": "system", "content": CREATE_TEST_QUESTIONS_PROMPT},
            {"role": "user", "content": str(data_for_ai)}
        ]
    )
    return json.loads(response.choices[0].message.content)