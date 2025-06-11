
document.addEventListener('DOMContentLoaded', function() {
    const employeeInputs = document.getElementById('employeeInputs');
    const addEmployeeBtn = document.getElementById('addEmployee');
    const removeEmployeeBtn = document.getElementById('removeEmployee');
    const generateScheduleBtn = document.getElementById('generateSchedule');
    const scheduleBody = document.getElementById('scheduleBody');
    
    // Названия дней недели (начинаем с понедельника)
    const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    
    // Функция для сохранения сотрудников в localStorage
    function saveEmployees() {
        const employees = [];
        const inputs = employeeInputs.querySelectorAll('.employee-input');
        inputs.forEach(input => {
            employees.push(input.value.trim());
        });
        localStorage.setItem('workSchedule_employees', JSON.stringify(employees));
    }
    
    // Функция для загрузки сотрудников из localStorage
    function loadEmployees() {
        const savedEmployees = localStorage.getItem('workSchedule_employees');
        if (savedEmployees) {
            const employees = JSON.parse(savedEmployees);
            employeeInputs.innerHTML = ''; // Очищаем существующие поля
            employees.forEach(employee => {
                addEmployeeInput(employee);
            });
        } else {
            // Если нет сохраненных данных, создаем 4 сотрудника по умолчанию
            ['Дима', 'Петя', 'Антон', 'Юра'].forEach(name => {
                addEmployeeInput(name);
            });
            saveEmployees(); // Сохраняем значения по умолчанию
        }
    }
    
    // Добавление нового сотрудника (с сохранением)
    function addEmployeeInput(value = '') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'employee-input';
        input.placeholder = 'Имя сотрудника';
        input.value = value;
        employeeInputs.appendChild(input);
        
        // Сохраняем при изменении имени
        input.addEventListener('input', saveEmployees);
        
        // Сохраняем после добавления
        saveEmployees();
    }
    
    // Удаление последнего сотрудника (с сохранением)
    function removeEmployee() {
        const inputs = employeeInputs.querySelectorAll('.employee-input');
        if (inputs.length > 1) {
            employeeInputs.removeChild(inputs[inputs.length - 1]);
            saveEmployees();
        } else {
            alert('Должен остаться хотя бы один сотрудник!');
        }
    }
    
    // Назначаем обработчики событий
    addEmployeeBtn.addEventListener('click', function() {
        addEmployeeInput();
    });
    
    removeEmployeeBtn.addEventListener('click', removeEmployee);
    
    // Генерация графика (без изменений)
    generateScheduleBtn.addEventListener('click', function() {
        // Получаем список сотрудников
        const employees = [];
        const inputs = employeeInputs.querySelectorAll('.employee-input');
        inputs.forEach(input => {
            if (input.value.trim() !== '') {
                employees.push(input.value.trim());
            }
        });
        
        if (employees.length === 0) {
            alert('Добавьте хотя бы одного сотрудника!');
            return;
        }
        
        // Получаем исключенные дни
        const excludedDays = [];
        if (document.getElementById('excludeMon').checked) excludedDays.push(0);
        if (document.getElementById('excludeTue').checked) excludedDays.push(1);
        if (document.getElementById('excludeWed').checked) excludedDays.push(2);
        if (document.getElementById('excludeThu').checked) excludedDays.push(3);
        if (document.getElementById('excludeFri').checked) excludedDays.push(4);
        if (document.getElementById('excludeSat').checked) excludedDays.push(5);
        if (document.getElementById('excludeSun').checked) excludedDays.push(6);
        
        // Очищаем таблицу
        scheduleBody.innerHTML = '';
        
        // Текущая дата
        const today = new Date();
        const startDate = new Date(today);
        
        // Начинаем с ближайшего понедельника
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate.setDate(today.getDate() + diff);
        startDate.setHours(0, 0, 0, 0);
        
        // Генерируем график на 4 недели
        let employeeIndex = 0;
        for (let i = 0; i < 28; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayOfWeek = currentDate.getDay();
            const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const isExcluded = excludedDays.includes(adjustedDayOfWeek);
            
            const row = document.createElement('tr');
            
            // Проверяем, является ли день текущим
            const isToday = currentDate.toDateString() === today.toDateString();
            if (isToday) {
                row.classList.add('current-day');
            }
            if (isExcluded) {
                row.classList.add('non-working');
            }
            
            // Дата
            const dateCell = document.createElement('td');
            dateCell.textContent = currentDate.toLocaleDateString('ru-RU');
            row.appendChild(dateCell);
            
            // День недели
            const dayCell = document.createElement('td');
            dayCell.textContent = daysOfWeek[adjustedDayOfWeek];
            row.appendChild(dayCell);
            
            // Сотрудник
            const employeeCell = document.createElement('td');
            if (!isExcluded) {
                employeeCell.textContent = employees[employeeIndex % employees.length];
                employeeIndex++;
            } else {
                employeeCell.textContent = 'Выходной';
            }
            row.appendChild(employeeCell);
            
            scheduleBody.appendChild(row);
        }
    });
    
    // Загружаем сотрудников при старте
    loadEmployees();
    
    // Генерируем график при загрузке
    generateScheduleBtn.click();
});

