<?php

$month = $_POST['month'];
$year =  $_POST['year'];

//echo "OK";

if (isset($_POST['month'], $_POST['year'])) { // isset - проверка существования переменных

    // соединение с БД
    $servername = "localhost";
    $database = "organizer";
    $username = "mysql";
    $password = "mysql";

    $conn = mysqli_connect($servername, $username, $password, $database);

    //проверка соединения с базой данных
    if (!$conn) {
        die("Connection failed: " . mysqli_connect_error());
    }

    //echo "Connected successfully\n";

    //получение уникальных дат из БД
    $sql = "SELECT DISTINCT task_date FROM tasks WHERE task_date BETWEEN '$year-$month-01' AND '$year-$month-31'";

    if($stmt = mysqli_prepare($conn, $sql)) {

        mysqli_set_charset($conn, "utf8");

        if(mysqli_stmt_execute($stmt)) {
            mysqli_stmt_bind_result($stmt, $task_date);

            $arr_all = array();

            while (mysqli_stmt_fetch($stmt)) {
                $arr = array('task_date' => $task_date);
                
                array_push($arr_all, $arr);
            }
            
            mysqli_stmt_close($stmt);

            $js_table = json_encode($arr_all, JSON_UNESCAPED_UNICODE);
            
            printf("%s\n", $js_table);
        }
        mysqli_close($conn);
    }
}
else {
    echo 'Error: Данные отсутствуют';
}
?>