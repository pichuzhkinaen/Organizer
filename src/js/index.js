window.addEventListener('DOMContentLoaded', function() {
	'use strict';

    //календарь на главной странице
    $( function() {
        $( "#datepicker" ).datepicker({
            onSelect: function(date) {
                // console.log(date);
                clearTasksTable();
                createTasksTable();             
                getTasksMonth();
                getTasksDay();
            },
            onChangeMonthYear: function(year, month, inst) {
                
                clearTasksTable();
                // console.log(year, month, inst);
                // console.log(inst.selectedMonth);

                //при изменении месяца или года активным становится первое число месяца
                $( "#datepicker" ).datepicker( "setDate", "01." + month + "." + year);
                $( ".ui-state-active" ).trigger( "click" );

                getTasksMonth();
            },
        });

        //автоклик на текущей дате
        $( ".ui-state-highlight" ).trigger( "click" );

        getTasksMonth();
        createTasksTable();
        createTableSearchResult();
    });

    //календать в окне задачи
    $('#datepicker-task').datepicker({
        showButtonPanel: true
    });


    //смена языка на русский
    ( function( factory ) {
        if ( typeof define === "function" && define.amd ) {

            // AMD. Register as an anonymous module.
            define( [ "../widgets/datepicker" ], factory );
        } else {

            // Browser globals
            factory( jQuery.datepicker );
        }
    }( function( datepicker ) {
    
    datepicker.regional.ru = {
        closeText: "Закрыть",
        prevText: "&#x3C;Пред",
        nextText: "След&#x3E;",
        currentText: "Сегодня",
        monthNames: [ "Январь","Февраль","Март","Апрель","Май","Июнь",
        "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь" ],
        monthNamesShort: [ "Январь","Февраль","Март","Апрель","Май","Июнь",
        "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь" ],
        dayNames: [ "воскресенье","понедельник","вторник","среда","четверг","пятница","суббота" ],
        dayNamesShort: [ "вск","пнд","втр","срд","чтв","птн","сбт" ],
        dayNamesMin: [ "Вс","Пн","Вт","Ср","Чт","Пт","Сб" ],
        weekHeader: "Нед",
        dateFormat: "dd.mm.yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: "",
        changeMonth: true,
        changeYear: true };
        datepicker.setDefaults( datepicker.regional.ru );
        
        return datepicker.regional.ru;
    }));


    //кнопки для работы с модальными окнами
    let overlay = document.querySelector('.overlay'),
        overlayTask = document.querySelector('.overlay-task'),
        modalTask = document.querySelector('.modal-task_task-window'),
        modalRem = document.querySelector('.modal_remove'),
        modalSearch = document.getElementById('search'),
        close = document.querySelector('.close'),
        closeTask = document.querySelector('.close-task'),
        btnAdd = document.querySelector('.button_add'),
        btnSearch = document.querySelector('.search_btn'),
        btnCancel = document.querySelector('.buttons_cancel-task'),
        btnCancelRem = document.querySelector('.buttons_cancel-rem'),
        btnRemove = document.querySelector('.button_rem'),
        btnOk = document.querySelector('.buttons_ok'),
        btnSearchModal = document.querySelector('.modal_search_btn'),
        save = document.querySelector('.buttons_save'),
        input = document.querySelector('.name_task'),
        text = document.querySelector('.text-task');
        
    btnSearch.addEventListener('click', openModalSearch);
    btnAdd.addEventListener('click', openModalTask);
    btnSearchModal.addEventListener('click', searchTasksDatabase);
    btnRemove.addEventListener('click', openModalRemoveTasks);
    save.addEventListener('click', saveTask);

    //время по умолчанию
    $('.input_timepicker').timepicker().val ('12:00');
    
    
    //открытие модального окна для поиска
    function openModalSearch() {

        modalSearch.style.display = "block";
        overlay.style.display = "flex";
        
        close.addEventListener('click', function() {
            modalSearch.style.display = "none";
            overlay.style.display = "none";
        });

        clearSearchTable();
        createTableSearchResult();
    }


    //сохранение данных в БД после нажатия кнопки "Сохранить"
    function saveTask() {

        let idTask;

        idTask = save.parentNode.parentNode.id;
        // console.log(idTask);

        //дата в формате 11.06.2020
        let date = document.getElementById('datepicker-task').value,        
            name = document.querySelector('.name_task').value,
            time = document.querySelector('.input_timepicker').value,
            descr = document.querySelector('.text-task').value;

        //изменение формата даты на 2020-06-11 для корректной отправки в БД
        let arr = date.split('.'),
            arrRevers = arr.reverse(),
            dateRevers = arrRevers[0] + '-' + arrRevers[1] + '-' + arrRevers[2];
        
        // console.log('date = ' + dateRevers);
        // console.log('id = ' + idTask);
        // console.log('name = ' + name);
        // console.log('time = ' + time);
        // console.log('descr = ' + descr);

        //вызов файла php методом POST и отправка данных на сервер
        $.ajax({
            url: "/insert_data.php",
            type : "POST",
            data : {'id': idTask, 'name': name, 'time': time, 'descr': descr, 'date': dateRevers},
            success: function (responseText) {
                // console.log(responseText);

                modalTask.style.display = "none";
                overlayTask.style.display = "none";

                overlay.style.opacity='1';
                overlay.style.display = "none";
                
                getTasksDay();
            }
        });

        let input = document.querySelector('.name_task'),
            text = document.querySelector('.text-task');

        input.value = '';
        text.value = '';

        $( ".ui-state-active" ).trigger( "click" );
    }

    //открытие модального окна для записи и просмотра заданий
    function openModalTask(event, idTask) {

        if (idTask == undefined) {
            let input = document.querySelector('.name_task'),
                text = document.querySelector('.text-task'),
                inputDate = document.getElementById('datepicker-task'),
                dateSelect = $( "#datepicker" ).datepicker( "getDate" ),
                day = dateSelect.getDate(),
                month = dateSelect.getMonth(),
                year = dateSelect.getFullYear(),
                date;

                if (day < 10) {
                    day = "0" + day;
                    date = day + '.' + (month + 1) + '.' + year;
                }
                if (month < 10) {
                    month = "0" + (month + 1);
                    date = day + '.' + month + '.' + year;
                }
                date = day + '.' + month + '.' + year;                
                // console.log(date);

            idTask = '';
            text.value = '';
            input.value = '';
            inputDate.value = date;
            $('.input_timepicker').timepicker().val ('12:00');
        }

        let divModal = document.querySelector('.modal-task_task-window');
            divModal.id = idTask;
        // console.log('openModalTask : '+ idTask);

        $('.input_timepicker').timepicker({
            timeFormat: 'H:mm',
            interval: 60,
            minTime: '0',
            maxTime: '23:59',
            defaultTime: '12',
            startTime: '10:00',
            step: 10,
            dynamic: false,
            dropdown: true,
            scrollbar: true
        });

        modalTask.style.display = "block";
        overlayTask.style.display = "flex";
        
        closeTask.addEventListener('click', function() {
            input.value = '';
            text.value = '';
            
            overlayTask.style.display = "none";
            overlay.style.opacity='1';
            overlay.style.display = "none";
        });
        
        btnCancel.addEventListener('click', function() {
            input.value = '';
            text.value = '';
            
            overlayTask.style.display = "none";
            overlay.style.opacity='1';
            overlay.style.display = "none";
        });   
    }


    //открытие модального окна для удаления заданий
    function openModalRemoveTasks() {
        
        let table = document.getElementById('table'),
            string = table.querySelectorAll('.table_string');

        overlay.style.opacity='1';

        for (let i = 0; i < string.length; i++) {

            if (string[i].classList.contains('table_string_active')) {

                let cell = string[i].querySelectorAll('.table_cell');

                modalRem.style.display = "block";
                overlay.style.display = "flex";

                let idTask = cell[0].id;

                close.addEventListener('click', function() {
                    modalRem.style.display = "none";
                    overlay.style.display = "none";
                });
                
                btnCancelRem.addEventListener('click', function() {
                    modalRem.style.display = "none";
                    overlay.style.display = "none";
                }); 

                btnOk.addEventListener('click', removeTask.bind(event, idTask));

                break;
            }
        }
    }


    //удалить задачу
    function removeTask(taskId) {
        // console.log(taskId);

        $.ajax({
            url: "/remove_data.php",
            type : "POST",
            data : {'taskId': taskId},
            success: function (responseText) {
                // console.log(responseText);
                getTasksDay();
            }
        });

        modalRem.style.display = "none";
        overlay.style.display = "none";

        clearTasksTable();
        createTasksTable();
    }

    //отправка активной даты на сервер и получение из БД списка задач на эту дату
    function getTasksDay() {
        
        let dateSelect = $( "#datepicker" ).datepicker( "getDate" ),
            day = dateSelect.getDate(),
            month = dateSelect.getMonth(),
            year = dateSelect.getFullYear(),
            dateIso = year + '-' + (month + 1) + '-' + day;
        //console.log(dateIso);

        //отправка активной даты на сервер и получение записей за эту дату
        $.ajax({
            url: "/get_data.php",
            type : "POST",
            data : {'date': dateIso},
            success: function (responseText) {
                
                let result = JSON.parse(responseText, function(key, value) {
                    return value;
                });
                // console.log(result);
                
                recordingDataTable(result);              
            }
        });
    }


    //создание таблицы для записи заданий
    function createTasksTable() {

        let table = document.querySelector('.table'),
            stringCount = 100, //количество строк
            cellCount = 2; //количество ячеек;        

        for (let a = 0; a < stringCount; a++) {

            let string = document.createElement('tr');

            string.className = 'table_string';
            table.appendChild(string);

            for (let b = 0; b < cellCount; b++) {
                let cell = document.createElement('td');

                cell.className = 'table_cell';
                string.appendChild(cell);
            }
        }
    }


    //запись данных в таблицу
    function recordingDataTable(objData) {
        // console.log(objData);
        let table = document.getElementById('table'),
            string = table.querySelectorAll('.table_string');

        for (let a = 0; a < objData.length; a++) {
           
            let cell = string[a].querySelectorAll('.table_cell');

            let obj = objData[a],
                objValues = Object.values(obj);
                // console.log(objValues);

            for (let b = 1; b < objValues.length; b++) {

                cell[b - 1].innerHTML = objValues[b];
                //из БД время приходит в формате 10:00:00, substring оставляет часть с 0 по 5 символа и стирает все остальное
                objValues[2] = objValues[2].substring(0, 5);
                
                cell[b - 1].id = objValues[0];

                cell[b - 1].addEventListener('mouseover', hoverTask);
                cell[b - 1].addEventListener('click', activeTask);
                cell[b - 1].addEventListener('dblclick', openTask);
            }
        }
    }


    //добавление стиля при наведении на задание
    function hoverTask() {
        let string = document.querySelectorAll('.table_string');
        for (let c = 0; c < string.length; c++) {
            if (string[c].classList.contains('table_string_hover')) {

                string[c].classList.remove('table_string_hover');
            }
        }
        this.parentNode.classList.add('table_string_hover');
    }
    

    //удаление класса активности у строки с задачей
    function clearActiveStatus() {
        let string = document.querySelectorAll('.table_string');

        for (let c = 0; c < string.length; c++) {
            if (string[c].classList.contains('table_string_active')) {

                string[c].classList.remove('table_string_active');
            }
        } 
    }

    //добавление стиля при одинарном клике на задание
    function activeTask() {
        clearActiveStatus();

        this.parentNode.classList.add('table_string_active');
    }


    //получение заданий за месяц
    function getTasksMonth() {
        let dateSelect = $( "#datepicker" ).datepicker( "getDate" ),
            month = dateSelect.getMonth() + 1,
            year = dateSelect.getFullYear();
        // console.log(dateSelect);
        // console.log(month, year);
        
        $.ajax({
            url: "/distinct_data.php",
            type : "POST",
            data : {'month': month, 'year': year},
            success: function (responseText) {
                // console.log(responseText);
                let result = JSON.parse(responseText, function(key, value) {
                    return value;
                });
                // console.log(result);
                addClassDate(result);               
            }
        });
    }

    //выделение дат, где есть задания
    function addClassDate(arrDate) {
        // console.log(arrDate);

        let days = document.querySelectorAll('.ui-state-default');

        //выбор даты из массива, принятого из БД
        for (let j = 0; j < arrDate.length; j++) {

            let dateObj = arrDate[j],
                date = dateObj.task_date;
                // console.log(dateObj);
                // console.log(date);

            let arr = date.split('-'); //убран разделитель "-", получился массив из 3 элементов из которого нужен 3-тий элемент (2 индекс)
            // console.log(arr[2]);

            for (let i = 0; i < days.length; i++) {

                let day = days[i].innerHTML; 
                // console.log(day);
                if (day < 10) {
                    day = "0" + day; //односложное число от 1 до 9
                }

                if (arr[2] == day) {
                    days[i].classList.add("contains-task");
                }
            }
        }
    }


    //очистка таблицы с заданиями от записей
    function clearTasksTable() {
        let table = document.getElementById('table'),
            string = table.querySelectorAll('.table_string');
    
        for (let i = 0; i < string.length; i++) {
            string[i].remove();
        }
    }


    //открытие задачи после двойного клика
    function openTask() {

        let overlay = document.querySelector('.overlay'),
            input = document.querySelector('.modal_search_input');
        
        overlay.style.opacity='0';
        input.value = '';

        let idTask = this.id;

        openModalTask(event, idTask);

        $.ajax({
            url: "/task_data.php",
            type : "POST",
            data : {'id': idTask},
            success: function (responseText) {
                // console.log(responseText);
                let result = JSON.parse(responseText, function(key, value) {
                    return value;
                });
                // console.log(result);
                fillModalTasks(result);
            }
        });
    }

    //запись задачи в открывшееся модальное окно
    function fillModalTasks(searchTaskData) {
        let time = document.querySelector('.input_timepicker'),
            name = document.querySelector('.name_task'),
            descr = document.querySelector('.text-task');
        // console.log(searchTaskData);

        for (let i = 0; i < searchTaskData.length; i++) {

            let date = new Date(searchTaskData[i].task_date);

            $( "#datepicker-task" ).datepicker("setDate", date);

            time.value = searchTaskData[i].task_time.substring(0, 5);
            name.value = searchTaskData[i].task_name;
            descr.value = searchTaskData[i].task_descr;
        }
    }


    //создание таблицы для выведения результатов поиска
    function createTableSearchResult() {

        let table = document.getElementById('search-table'),
            stringCount = 20,
            cellCount = 2;  

        for (let a = 0; a < stringCount; a++) {

            let string = document.createElement('tr');

            string.classList = 'table_string';
            table.appendChild(string);

            for (let b = 0; b < cellCount; b++) {
                let cell = document.createElement('td');

                cell.classList.add('table_cell', 'table_cell_search');
                string.appendChild(cell);
            }
        }
    }


    //поиск в базе данных по клику на кнопку "Поиск"
    function searchTasksDatabase() {

        let search = document.querySelector('.modal_search_input').value;
        // console.log(search);

        $.ajax({
            url: "/search_data.php",
            type : "POST",
            data : {'search': search},
            success: function (responseText) {
                // console.log(responseText);
                let result = JSON.parse(responseText, function(key, value) {
                    return value;
                });
                // console.log(result);
                fillSearchData(result);             
            }
        });
    }


    //занесение найденных записей в таблицу поиска
    function fillSearchData(searchData) {
        // console.log(searchData);
        clearSearchTable();
        createTableSearchResult();
        
        let table = document.getElementById('search-table'),
            string = table.querySelectorAll('.table_string');

        for (let c = 0; c < string.length; c++) {
            if (string[c].classList.contains('table_string_hover')) {

                string[c].classList.remove('table_string_hover');
            }
        }

        for (let a = 0; a < searchData.length; a++) {

            let cell = string[a].querySelectorAll('.table_cell'),
                name = searchData[a].task_name,
                descr = searchData[a].task_descr,
                date = searchData[a].task_date,
                time = searchData[a].task_time,
                id = searchData[a].id,
                //из БД время приходит в формате 10:00:00, substring оставляет часть с 0 по 5 символа и стирает все остальное
                timeNewFormat = time.substring(0, 5);

            // console.log(name, descr, date, timeNewFormat, id);

            let nameSpan = document.createElement('span'),
                descrP = document.createElement('p');
            
            nameSpan.classList.add('table_cell_name');
            descrP.classList.add('table_cell_descr');
            // console.log(nameSpan, descrP);
            nameSpan.innerHTML = name;
            descrP.innerHTML = descr;

            cell[0].appendChild(nameSpan);
            cell[0].appendChild(descrP);
            cell[1].innerHTML = date + '<br>' + timeNewFormat;

            cell[0].addEventListener('mouseover', hoverTask);
            cell[0].addEventListener('click', activeTask);
            cell[0].addEventListener('dblclick', openTask);
            cell[1].addEventListener('click', activeTask);
            cell[1].addEventListener('dblclick', goDate.bind(event, date));

            for (let b = 0; b < cell.length; b++) {

                cell[b].id = id;
            }
        }
    }


    //переход на дату, в которой записано найденное задание
    function goDate(date) {
       
        clearSearchTable();
        clearActiveStatus();

        modalSearch.style.display = "none";
        overlay.style.display = "none";
        // console.log(date);

        let arr = date.split('-'),
            arrRevers = arr.reverse(),
            dateRevers = arrRevers[0] + '-' + arrRevers[1] + '-' + arrRevers[2];
        // console.log(dateRevers);

        let inputSearch = document.querySelector('.modal_search_input');
        inputSearch.value = '';

        let dateTask = new Date(dateRevers);
        // console.log(dateTask);

        $( "#datepicker" ).datepicker( "setDate", dateTask);
        //автоклик на дате с заданием
        $( ".ui-state-active" ).trigger( "click" );
    }
    
    
    //очистка таблицы поиска от записей
    function clearSearchTable() {
    
        let table = document.getElementById('search-table'),
            string = table.querySelectorAll('.table_string');
    
        for (let i = 0; i < string.length; i++) {
            string[i].remove();
        }
    }
});