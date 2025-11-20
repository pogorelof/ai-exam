# AI Exam

## API Endpoints
More detail endpoints on Swagger: ```/docs```
- POST ```/auth/register```: from form { username, first_name, second_name, email, password, role(student, teacher) } → code 200 or 400(if login or email already exists)
- POST ```/auth/login```: from form { username, password } → { access_token, token_type }
- POST ```/class/create```: {title} -> {id, teacher_id, title}
- DEL ```/class/delete/{class_id}```:  None -> {message}
- PUT ```/class/update/{class_id}```: {title} -> {id, teacher_id, title}
- GET ```/class```: None -> list of classes
- GET ```/class/request/show/{class_id}```: None -> {type, class_obj, students}
- POST ```/class/request/{'accept' or 'reject'}/{class_id}/{student_id}```: None -> {student, class_obj, status}
- POST ```/class/request/{class_id}```: None -> {status, class_obj, students}