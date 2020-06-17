<?php

$date =  $_POST['date'];

if (isset($_POST['date'])) { // isset - проверка существования переменных

    // соединение с БД
    $servername = "localhost";
    $database = "organizer";
    $username = "mysql";
    $password = "mysql";

    $conn = mysqli_connect($servername, $username, $password, $database);
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }
    
    //echo "Connected successfully\n";

    $sql = "SELECT id, task_name, task_time FROM tasks WHERE task_date = '$date'";

    if($stmt = mysqli_prepare($conn, $sql)) {

        mysqli_set_charset($conn, "utf8");

        if(mysqli_stmt_execute($stmt)) {
            mysqli_stmt_bind_result($stmt, $id, $task_name, $task_time);

            $arr_all = array();

            while (mysqli_stmt_fetch($stmt)) {
                $arr = array('id' => $id, 'task_name' => $task_name, 'task_time' => $task_time);
                
                array_push($arr_all, $arr);
            }
            
            mysqli_stmt_close($stmt);

            $js_table = json_encode($arr_all, JSON_UNESCAPED_UNICODE);
            
            printf("%s\n", $js_table);
        }
        mysqli_close($conn);
    }
}
// если переменные не существуют, то выполняем следующее
else {
    echo 'Error: Данные отсутствуют';
}
?>