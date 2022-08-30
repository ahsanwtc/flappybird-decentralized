const sqlite3 = require('sqlite3').verbose();

const CreateRawDB = () => {
  let newDB = new sqlite3.Database('../flappybird.db', error => {
    if (error) {
      console.log('Can not create database', error);
      return;
    }

    console.log('Database created successfully');
  });

  try {
    DatabaseInit(newDB);
  } catch (error) {
    console.log(error);
  }
};

const DatabaseInit = db => {
  db.serialize(() => {
    const tbl_player_vault_ddl = `CREATE TABLE IF NOT EXISTS tbl_player_vault (
      wallet_id TEXT PRIMARY KEY,
      balance REAL DEFAULT 0,
      created_date INTEGER,
      update_date INTEGER,
      status INTEGER DEFAULT 1
    );`;

    const tbl_vault_transaction = `CREATE TABLE IF NOT EXISTS tbl_vault_transaction (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_id TEXT,
      transaction_type integer,
      amount REAL DEFAULT 0,
      transaction_date INTEGER,
      status INTEGER DEFAULT 1,
      transaction_id TEXT
    );`;

    const tbl_player_match = `CREATE TABLE IF NOT EXISTS tbl_player_match (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_id TEXT,
      start_time INTEGER,
      end_time INTEGER,
      play_data TEXT,
      player_point INTEGER DEFAULT 0,
      status INTEGER
    );`;
    
    db.run(tbl_player_vault_ddl);
    db.run(tbl_vault_transaction);
    db.run(tbl_player_match);

  });
};

CreateRawDB();