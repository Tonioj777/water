document.addEventListener('DOMContentLoaded', function() {
            const employeeInputs = document.getElementById('employeeInputs');
            const addEmployeeBtn = document.getElementById('addEmployee');
            const removeEmployeeBtn = document.getElementById('removeEmployee');
            const generateScheduleBtn = document.getElementById('generateSchedule');
            const scheduleBody = document.getElementById('scheduleBody');
            
            // Названия дней недели (начинаем с понедельника)
            const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
            
            // Ключи для localStorage
            const STORAGE_KEYS = {
                EMPLOYEES: 'workSchedule_employees',
                EXCLUDED_DAYS: 'workSchedule_excludedDays'
            };
            
            // Загрузка данных из localStorage
            function loadFromStorage() {
                // Загружаем сотрудников
                const savedEmployees = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
                if (savedEmployees) {
                    const employees = JSON.parse(savedEmployees);
                    employees.forEach(employee => {
                        addEmployeeInput(employee);
                    });
                } else {
                    // Значения по умолчанию
                    ['Дима', 'Петя', 'Антон', 'Юра'].forEach(addEmployeeInput);
                }
                
                // Загружаем исключенные дни
                const savedExcludedDays = localStorage.getItem(STORAGE_KEYS.EXCLUDED_DAYS);
                if (savedExcludedDays) {
                    const excludedDays = JSON.parse(savedExcludedDays);
                    excludedDays.forEach(dayIndex => {
                        const checkbox = document.getElementById(`exclude${getDayName(dayIndex)}`);
                        if (checkbox) checkbox.checked = true;
                    });
                } else {
                    // По умолчанию исключаем выходные
                    document.getElementById('excludeSat').checked = true;
                    document.getElementById('excludeSun').checked = true;
                }
            }
            
            // Сохранение данных в localStorage
            function saveToStorage() {
                // Сохраняем сотрудников
                const employees = [];
                const inputs = employeeInputs.querySelectorAll('.employee-input');
                inputs.forEach(input => {
                    if (input.value.trim() !== '') {
                        employees.push(input.value.trim());
                    }
                });
                localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
                
                // Сохраняем исключенные дни
                const excludedDays = [];
                if (document.getElementById('excludeMon').checked) excludedDays.push(0);
                if (document.getElementById('excludeTue').checked) excludedDays.push(1);
                if (document.getElementById('excludeWed').checked) excludedDays.push(2);
                if (document.getElementById('excludeThu').checked) excludedDays.push(3);
                if (document.getElementById('excludeFri').checked) excludedDays.push(4);
                if (document.getElementById('excludeSat').checked) excludedDays.push(5);
                if (document.getElementById('excludeSun').checked) excludedDays.push(6);
                localStorage.setItem(STORAGE_KEYS.EXCLUDED_DAYS, JSON.stringify(excludedDays));
            }
            
            // Вспомогательная функция для получения имени дня
            function getDayName(dayIndex) {
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                return days[dayIndex];
            }
            
            // Добавление поля для сотрудника
            function addEmployeeInput(value = '') {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'employee-input';
                input.placeholder = 'Имя сотрудника';
                input.value = value;
                employeeInputs.appendChild(input);
                saveToStorage();
            }
            
            // Добавление нового сотрудника
            addEmployeeBtn.addEventListener('click', function() {
                addEmployeeInput();
            });
            
            // Удаление последнего сотрудника
            removeEmployeeBtn.addEventListener('click', function() {
                const inputs = employeeInputs.querySelectorAll('.employee-input');
                if (inputs.length > 1) {
                    employeeInputs.removeChild(inputs[inputs.length - 1]);
                    saveToStorage();
                } else {
                    alert('Должен остаться хотя бы один сотрудник!');
                }
            });
            
            // Обработка изменений в исключенных днях
            document.querySelectorAll('.days-container input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', saveToStorage);
            });
            
            // Генерация графика
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
                const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // adjust for Sunday
                startDate.setDate(today.getDate() + diff);
                startDate.setHours(0, 0, 0, 0);
                
                // Генерируем график на 4 недели
                let employeeIndex = 0;
                for (let i = 0; i < 28; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    
                    const dayOfWeek = currentDate.getDay();
                    // Корректировка для нашего порядка дней (0=Пн, 1=Вт, ... 6=Вс)
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
            
            // Загрузка данных при старте
            loadFromStorage();
            
            // Генерация графика при загрузке
            generateScheduleBtn.click();
            
            // Сохранение при изменении имен сотрудников
            employeeInputs.addEventListener('input', function(e) {
                if (e.target.classList.contains('employee-input')) {
                    saveToStorage();
                }
            });
        });
