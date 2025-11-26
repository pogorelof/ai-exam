import json
import os
import httpx
from openai import OpenAI
from src.ai.prompts import CREATE_TEST_QUESTIONS_PROMPT
from dotenv import load_dotenv


load_dotenv()

def client_(api_key: str):
    http_client = None
    proxies = None

    proxy_url = os.getenv("PROXY_URL")
    if proxy_url:
        # Для httpx Client прокси должны быть словарем с правильными ключами
        proxies = {
            "http://": proxy_url,
            "https://": proxy_url
        }
        transport = httpx.HTTPTransport(proxy=os.getenv("PROXY_URL"))
        http_client = httpx.Client(transport=transport, timeout=300)

    return OpenAI(api_key=api_key, http_client=http_client)

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