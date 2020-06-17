<?php

$search = "%{$_POST['search']}%";

// echo $search;

if (isset($_POST['search'])) { // isset - проверка существования переменных

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

    //получение данных из БД
    $sql = "SELECT id, task_name, task_descr, DATE_FORMAT(task_date, '%d-%m-%Y'), task_time FROM tasks WHERE task_name LIKE ? OR task_descr LIKE ?";

    if($stmt = mysqli_prepare($conn, $sql)) {

        mysqli_set_charset($conn, "utf8");
        mysqli_stmt_bind_param($stmt, "ss", $search, $search);

        if(mysqli_stmt_execute($stmt)) {
            mysqli_stmt_bind_result($stmt, $id, $task_name, $task_descr, $task_date, $task_time);

            $arr_all = array();

            while (mysqli_stmt_fetch($stmt)) {
                $arr = array('id' => $id, 'task_name' => $task_name, 'task_descr' => $task_descr, 'task_date' => $task_date, 'task_time' => $task_time);
                
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