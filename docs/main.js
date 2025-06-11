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
    
    // Стандартные сотрудники
    const DEFAULT_EMPLOYEES = ['Дима', 'Петя', 'Антон', 'Юра'];
    
    // Инициализация при загрузке
    function initialize() {
        // Очищаем все поля ввода перед загрузкой
        employeeInputs.innerHTML = '';
        
        loadEmployees();
        loadExcludedDays();
        setupEventListeners();
        generateScheduleBtn.click();
    }
    
    // Загрузка сотрудников
    function loadEmployees() {
        const savedEmployees = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
        
        if (savedEmployees && JSON.parse(savedEmployees).length > 0) {
            // Загружаем сохраненных сотрудников
            const employees = JSON.parse(savedEmployees);
            employees.forEach(employee => {
                addEmployeeInput(employee, false);
            });
        } else {
            // Загружаем стандартных сотрудников
            DEFAULT_EMPLOYEES.forEach(name => {
                addEmployeeInput(name, false);
            });
            // Сохраняем стандартных сотрудников
            saveEmployees();
        }
    }
    
    // Загрузка исключенных дней
    function loadExcludedDays() {
        const savedExcludedDays = localStorage.getItem(STORAGE_KEYS.EXCLUDED_DAYS);
        if (savedExcludedDays) {
            const excludedDays = JSON.parse(savedExcludedDays);
            // Сбрасываем все чекбоксы
            document.querySelectorAll('.days-container input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            // Устанавливаем сохраненные
            excludedDays.forEach(dayIndex => {
                const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex];
                const checkbox = document.getElementById(`exclude${dayName}`);
                if (checkbox) checkbox.checked = true;
            });
        } else {
            // По умолчанию исключаем выходные
            document.getElementById('excludeSat').checked = true;
            document.getElementById('excludeSun').checked = true;
            saveExcludedDays();
        }
    }
    
    // Настройка обработчиков событий
    function setupEventListeners() {
        // Добавление сотрудника
        addEmployeeBtn.addEventListener('click', function() {
            addEmployeeInput('', true);
        });
        
        // Удаление сотрудника
        removeEmployeeBtn.addEventListener('click', function() {
            const inputs = employeeInputs.querySelectorAll('.employee-input');
            if (inputs.length > 1) {
                employeeInputs.removeChild(inputs[inputs.length - 1]);
                saveEmployees();
            } else {
                alert('Должен остаться хотя бы один сотрудник!');
            }
        });
        
        // Изменение исключенных дней
        document.querySelectorAll('.days-container input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', saveExcludedDays);
        });
        
        // Генерация графика
        generateScheduleBtn.addEventListener('click', generateSchedule);
        
        // Сохранение при изменении имен сотрудников
        employeeInputs.addEventListener('input', function(e) {
            if (e.target.classList.contains('employee-input')) {
                saveEmployees();
            }
        });
    }
    
    // Добавление поля для сотрудника
    function addEmployeeInput(value = '', shouldSave = true) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'employee-input';
        input.placeholder = 'Имя сотрудника';
        input.value = value;
        employeeInputs.appendChild(input);
        if (shouldSave) saveEmployees();
    }
    
    // Сохранение списка сотрудников
    function saveEmployees() {
        const employees = [];
        const inputs = employeeInputs.querySelectorAll('.employee-input');
        inputs.forEach(input => {
            if (input.value.trim() !== '') {
                employees.push(input.value.trim());
            }
        });
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    }
    
    // Сохранение исключенных дней
    function saveExcludedDays() {
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
    
    // Генерация графика
    function generateSchedule() {
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
    }
    
    // Запуск приложения
    initialize();
});
