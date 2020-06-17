<?php

$id = $_POST['taskId'];

//echo "OK";

if (isset($_POST['taskId'])) { // isset - проверка существования переменных

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
            $sql = "DELETE FROM tasks WHERE id = ?";

            if($stmt = mysqli_prepare($conn, $sql)){
                  // Привязка переменных к подготовленному выражению в качестве параметров
                  mysqli_stmt_bind_param($stmt, "i", $id);
                  
                  // Установка значения параметров и выполннение заявления снова, чтобы вставить другую строку
                  $id = $id;

                  mysqli_stmt_execute($stmt);
                  // echo $stmt;
            }
      }
      
      //echo "Connected successfully\n";
}
// если переменные не существуют, то выполняем следующее
else {
      echo 'Error: Данные отсутствуют';
}
?>