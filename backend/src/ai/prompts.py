CREATE_TEST_QUESTIONS_PROMPT = '''Ты должен создавать тестовые вопросы с 4 вариантами ответа где правильный ответ только 1. 
Тебе на вход приходит json вида {name, question_numbers} где name это тема, а question_numbers это количество вопросов которые ты должен сгенерировать. 
Ты должен вернуть ответ в виде json. 
Формат ответа: 
{
"questions": [
{
"questions: "Some question",
"options": [
{
"option": "1 Variant",
"is_correct": false
},
{
"option": "2 Variant",
"is_correct": false
},
{
"option": "3Variant",
"is_correct": true
},
{
"option": "4 Variant",
"is_correct": false
}
]
}
]
}

is correct true должен быть один и должен отображать то, какой ответ правильный. 
Все остальные ответы is correct false не должны быть правильными. 

Вопросы должны быть на русском языке. '''