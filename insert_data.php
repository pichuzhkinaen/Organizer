<?php

$id = $_POST['id'];
$name = $_POST['name'];
$time =  $_POST['time'];
$descr = $_POST['descr'];
$date =  $_POST['date'];

// echo "php ";
if (isset($_POST['id'], $_POST['name'], $_POST['time'], $_POST['descr'], $_POST['date'])) { // isset - проверка существования переменных
      
      // соединение с БД
      $servername = "localhost";
      $database = "organizer";
      $username = "mysql";
      $password = "mysql";

      $conn = mysqli_connect($servername, $username, $password, $database);

      //проверка соединения с базой данных
      if (!$conn) {
            die("Connection failed: " . mysqli_connect_error());
      } else {
            //добавление данных в таблицу
            if ($id == '') {
                  //echo 'id ' + $id;
                  $sql = "INSERT INTO tasks (task_name, task_date, task_time, task_descr) VALUES (?, ?, ?, ?)";

                  if($stmt = mysqli_prepare($conn, $sql)){
                        // Привязка переменных к подготовленному выражению в качестве параметров
                        mysqli_stmt_bind_param($stmt, "ssss", $task_name, $task_date, $task_time, $task_descr);
                        
                        // Установка значения параметров и выполннение заявления снова, чтобы вставить другую строку
                        $id = $id;
                        $task_name = $name;
                        $task_date = $date;
                        $task_time = $time;
                        $task_descr = $descr;
                        mysqli_stmt_execute($stmt);
                        // echo $stmt;
                  }
            } else {
                  $sql = "UPDATE tasks SET task_name = ?, task_date = ?, task_time = ?, task_descr = ? WHERE id = ?";
                  // printf ('sql = %s', $sql);

                  if($stmt = mysqli_prepare($conn, $sql)){
                        // Привязка переменных к подготовленному выражению в качестве параметров
                        mysqli_stmt_bind_param($stmt, "ssssi", $task_name, $task_date, $task_time, $task_descr, $id);
                        
                        // Установка значения параметров и выполннение заявления снова, чтобы вставить другую строку
                        $task_name = $name;
                        $task_date = $date;
                        $task_time = $time;
                        $task_descr = $descr;
                        mysqli_stmt_execute($stmt);
                        // echo $stmt;
                  }
            }            
      }
      
      //echo "Connected successfully\n";
}
// если переменные не существуют, то выполняем следующее
else {
      echo 'Error: Данные отсутствуют';
}
?>