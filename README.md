# AI Exam App

Это веб-приложение для проведения экзаменов и тестирования с использованием искусственного интеллекта. Приложение позволяет пользователям регистрироваться (как студенты или преподаватели), создавать классы, генерировать вопросы через ИИ и проходить тесты.

## Установка и запуск Frontend

1. Перейдите в папку `frontend`:
   ```bash
   cd frontend
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Запустите приложение в режиме разработки:
   ```bash
   npm run dev
   ```

Приложение будет доступно по адресу: [http://localhost:5173](http://localhost:5173)

## Установка и запуск Backend

1. Перейдите в папку `backend`:
   ```bash
   cd backend
   ```

2. (Опционально) Создайте и активируйте виртуальное окружение:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```

3. Установите зависимости:
   ```bash
   pip install -r requirements.txt
   ```

4. Запустите сервер:
   ```bash
   uvicorn src.main:app --reload
   ```

Сервер будет доступен по адресу: [http://localhost:8000](http://localhost:8000)

Документация API (Swagger) доступна по адресу: [http://localhost:8000/docs](http://localhost:8000/docs)

## Установка Прокси при необходимости
1. Создать файл ```.env``` в папке ```backend```
2. Указать ```PROXY_URL``` в виде 
```
PROXY_URL=http://host:port
```
или
```
PROXY_URL=http://user:pass@host:port
```