var pg = require('pg');

pg.connect(process.env.DATABASE_URL, function(err, client) {
  if (err) throw err;
  var query = client.query(
    'create table IF NOT EXISTS testdata (id serial primary key, test_id varchar(15), date timestamp default current_timestamp, battery varchar(12), userAgent varchar(1000), connection varchar(5))'
  );
  query.on('error', function() {
    console.log('Error trying to create database!');
  });
  query.on('end', function(result) {
    process.exit();
  });
});
