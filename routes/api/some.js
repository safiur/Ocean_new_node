// ... Existing imports ...

router.post("/database", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");

    if(req.body.dbType === 'postgres') {
        const pool = new Pool({
            host: req.body.connectivity.name,
            port: req.body.connectivity.port,
            user: req.body.connectivity.user,
            password: req.body.connectivity.password,
            database: req.body.connectivity.database
        });

        pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", (error, results) => {
            if (error) {
                throw error;
            }
            res.status(200).json(results.rows);
        });
    } else { 
        var connection = mysql.createConnection({
            // ... same as before ...
        });

        connection.query(`SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema ='${req.body.databaseName}' ;`, function (err, rows) {
            res.status(200).json(rows);
        });
    }
});

router.post("/databaseTable", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");

    if(req.body.dbType === 'postgres') {
        const pool = new Pool({
            // ... same as before ...
        });

        pool.query(`SELECT * FROM ${req.body.databaseName}.${req.body.databaseTableName}`, (error, results) => {
            if (error) {
                throw error;
            }
            res.status(200).json(results.rows);
        });
    } else {
        var connection = mysql.createConnection({
            // ... same as before ...
        });

        connection.query(`SELECT * FROM ${req.body.databaseName}.${req.body.databaseTableName}`, function (err, rows) {
            res.status(200).json(rows);
        });
    }
});

// ... Rest of the routes ...
var connection = mysql.createConnection({
    host: req.body.connectivity.name,
    port: req.body.connectivity.port,
    user: req.body.connectivity.user,
    password: req.body.connectivity.password,
    database: req.body.connectivity.database,
  });
  connection.query(
    `SELECT * FROM ${req.body.databaseName}.${req.body.databaseTableName}`,
    function (err, rows) {
      res.status(200).json(rows);
    }
  );