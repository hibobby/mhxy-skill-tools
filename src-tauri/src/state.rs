use rusqlite::{params, Connection};
use std::path::PathBuf;
use std::fs;

#[derive(Clone)]
pub struct DbState {
    conn: std::sync::Arc<std::sync::Mutex<Option<Connection>>>,
}

impl Default for DbState {
    fn default() -> Self {
        Self { conn: std::sync::Arc::new(std::sync::Mutex::new(None)) }
    }
}

#[derive(serde::Serialize)]
pub struct Account {
    pub id: i64,
    pub name: String,
    pub school: String,
    pub level: i32,
    pub experience: i64,
    pub gold: i64,
}

#[derive(serde::Serialize)]
pub struct Skill {
    pub id: i64,
    pub account_id: i64,
    pub skill_name: String,
    pub current_level: i32,
    pub target_level: i32,
}

#[derive(serde::Serialize)]
pub struct Cultivation {
    pub id: i64,
    pub account_id: i64,
    pub name: String,
    pub r#type: String,
    pub mode: String,
    pub current_exp: i32,
    pub current_level: i32,
    pub target_level: i32,
}

#[derive(serde::Serialize)]
pub struct SpendLog {
    pub id: i64,
    pub account_id: i64,
    pub amount: i64,
    pub date: String,
    pub note: Option<String>,
    pub created_at: String,
}

#[derive(serde::Serialize)]
pub struct SpendSummary {
    pub date: String,
    pub total: i64,
}

#[derive(serde::Serialize)]
pub struct ChangeLog {
    pub id: i64,
    pub account_id: i64,
    pub category: String,
    pub name: String,
    pub from_level: Option<i32>,
    pub to_level: Option<i32>,
    pub from_exp: Option<i32>,
    pub to_exp: Option<i32>,
    pub consumed_exp: i64,
    pub consumed_money: i64,
    pub consumed_gang: i64,
    pub consumed_cultivation_exp: i64,
    pub date: String,
    pub created_at: String,
}

impl DbState {
    fn db_path_at_project_root() -> Result<PathBuf, String> {
        // 调试环境：写到项目根目录，便于开发
        if cfg!(debug_assertions) {
            let cur = std::env::current_dir().map_err(|e| e.to_string())?;
            let root = cur.parent().map(|p| p.to_path_buf()).unwrap_or(cur);
            let db_path = root.join("mhxy.db");
            if let Some(parent) = db_path.parent() { let _ = fs::create_dir_all(parent); }
            return Ok(db_path);
        }

        // Release 环境：写到用户数据目录（按平台约定）
        #[cfg(target_os = "windows")]
        {
            use std::env;
            let appdata = env::var("APPDATA").map_err(|e| e.to_string())?; // C:\Users\<User>\AppData\Roaming
            let path = PathBuf::from(appdata).join("mhxy").join("mhxy.db");
            if let Some(parent) = path.parent() { let _ = fs::create_dir_all(parent); }
            return Ok(path);
        }

        #[cfg(target_os = "macos")]
        {
            use std::env;
            let home = env::var("HOME").map_err(|e| e.to_string())?;
            let path = PathBuf::from(home).join("Library").join("Application Support").join("mhxy").join("mhxy.db");
            if let Some(parent) = path.parent() { let _ = fs::create_dir_all(parent); }
            return Ok(path);
        }

        // Linux / 其他：~/.local/share/mhxy/mhxy.db
        #[cfg(not(any(target_os = "windows", target_os = "macos")))]
        {
            use std::env;
            let home = env::var("HOME").map_err(|e| e.to_string())?;
            let path = PathBuf::from(home).join(".local").join("share").join("mhxy").join("mhxy.db");
            if let Some(parent) = path.parent() { let _ = fs::create_dir_all(parent); }
            return Ok(path);
        }
    }
    pub fn init(&self) -> Result<(), String> {
        let mut guard = self.conn.lock().map_err(|e| e.to_string())?;
        if guard.is_some() { return Ok(()); }

        let db_path = Self::db_path_at_project_root()?;
        let conn = Connection::open(db_path).map_err(|e| format!("打开数据库失败: {}", e))?;

        conn.execute_batch(
            r#"
            PRAGMA foreign_keys = ON;
            CREATE TABLE IF NOT EXISTS accounts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              school TEXT NOT NULL,
              level INTEGER NOT NULL DEFAULT 0,
              experience INTEGER NOT NULL DEFAULT 0,
              gold INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS master_skills (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              account_id INTEGER NOT NULL,
              skill_name TEXT NOT NULL,
              current_level INTEGER NOT NULL DEFAULT 0,
              target_level INTEGER NOT NULL DEFAULT 0,
              FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE,
              UNIQUE(account_id, skill_name)
            );
            CREATE TABLE IF NOT EXISTS assist_skills (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              account_id INTEGER NOT NULL,
              skill_name TEXT NOT NULL,
              current_level INTEGER NOT NULL DEFAULT 0,
              target_level INTEGER NOT NULL DEFAULT 0,
              FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE,
              UNIQUE(account_id, skill_name)
            );
            CREATE TABLE IF NOT EXISTS cultivations (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              account_id INTEGER NOT NULL,
              name TEXT NOT NULL DEFAULT '',
              type TEXT NOT NULL,
              mode TEXT NOT NULL DEFAULT '2w',
              current_exp INTEGER NOT NULL DEFAULT 0,
              current_level INTEGER NOT NULL DEFAULT 0,
              target_level INTEGER NOT NULL DEFAULT 0,
              FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS spend_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              account_id INTEGER NOT NULL,
              amount INTEGER NOT NULL,
              date TEXT NOT NULL,
              note TEXT,
              created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
              FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS change_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              account_id INTEGER NOT NULL,
              category TEXT NOT NULL, -- master/assist/cultivation
              name TEXT NOT NULL,
              from_level INTEGER,
              to_level INTEGER,
              from_exp INTEGER,
              to_exp INTEGER,
              consumed_exp INTEGER NOT NULL DEFAULT 0,
              consumed_money INTEGER NOT NULL DEFAULT 0,
              consumed_gang INTEGER NOT NULL DEFAULT 0,
              consumed_cultivation_exp INTEGER NOT NULL DEFAULT 0,
              date TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
              FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
            );
            "#
        ).map_err(|e| format!("初始化表失败: {}", e))?;

        // 迁移: 尝试添加新列（若已存在则忽略错误）
        let _ = conn.execute("ALTER TABLE cultivations ADD COLUMN mode TEXT NOT NULL DEFAULT '2w'", []);
        let _ = conn.execute("ALTER TABLE cultivations ADD COLUMN current_exp INTEGER NOT NULL DEFAULT 0", []);
        let _ = conn.execute("ALTER TABLE cultivations ADD COLUMN name TEXT NOT NULL DEFAULT ''", []);
        let _ = conn.execute("ALTER TABLE accounts ADD COLUMN gold INTEGER NOT NULL DEFAULT 0", []);
        // 回填旧数据的修炼名称，保证前端可直接显示 name
        let _ = conn.execute(
            "UPDATE cultivations SET name = CASE WHEN mode='2w' THEN '防御修炼' ELSE '攻击修炼' END WHERE name IS NULL OR name=''",
            []
        );

        // 迁移: 去除旧的 UNIQUE(account_id, type) 约束（需要重建表）
        // 检测并重建（幂等处理，若已迁移会失败则忽略）
        let _ = conn.execute_batch(
            r#"
            BEGIN TRANSACTION;
            CREATE TABLE IF NOT EXISTS cultivations_v2 (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              account_id INTEGER NOT NULL,
              name TEXT NOT NULL DEFAULT '',
              type TEXT NOT NULL,
              mode TEXT NOT NULL DEFAULT '2w',
              current_exp INTEGER NOT NULL DEFAULT 0,
              current_level INTEGER NOT NULL DEFAULT 0,
              target_level INTEGER NOT NULL DEFAULT 0,
              FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
            );
            INSERT INTO cultivations_v2 (id, account_id, name, type, mode, current_exp, current_level, target_level)
              SELECT id, account_id, '' as name, type, mode, current_exp, current_level, target_level FROM cultivations;
            DROP TABLE cultivations;
            ALTER TABLE cultivations_v2 RENAME TO cultivations;
            COMMIT;
            "#
        );

        *guard = Some(conn);
        Ok(())
    }

    fn conn(&self) -> Result<Connection, String> {
        let db_path = Self::db_path_at_project_root()?;
        Connection::open(db_path).map_err(|e| e.to_string())
    }

    // Accounts
    pub fn add_account(&self, name: String, school: String, level: i32, experience: i64) -> Result<i64, String> {
        let conn = self.conn()?;
        conn.execute(
            "INSERT INTO accounts (name, school, level, experience) VALUES (?1, ?2, ?3, ?4)",
            params![name, school, level, experience]
        ).map_err(|e| e.to_string())?;
        Ok(conn.last_insert_rowid())
    }

    pub fn update_account(&self, id: i64, name: String, school: String, level: i32, experience: i64) -> Result<(), String> {
        let conn = self.conn()?;
        conn.execute(
            "UPDATE accounts SET name = ?1, school = ?2, level = ?3, experience = ?4 WHERE id = ?5",
            params![name, school, level, experience, id]
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn delete_account(&self, id: i64) -> Result<(), String> {
        let conn = self.conn()?;
        conn.execute("DELETE FROM accounts WHERE id = ?1", params![id]).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_all_accounts(&self) -> Result<Vec<Account>, String> {
        let conn = self.conn()?;
        let mut stmt = conn.prepare("SELECT id, name, school, level, experience, gold FROM accounts ORDER BY id").map_err(|e| e.to_string())?;
        let rows = stmt.query_map([], |row| {
            Ok(Account{
                id: row.get(0)?,
                name: row.get(1)?,
                school: row.get(2)?,
                level: row.get(3)?,
                experience: row.get(4)?,
                gold: row.get(5)?,
            })
        }).map_err(|e| e.to_string())?;
        let mut v = Vec::new();
        for r in rows { v.push(r.map_err(|e| e.to_string())?); }
        Ok(v)
    }


    pub fn add_change_log(&self,
        account_id: i64,
        category: String,
        name: String,
        from_level: Option<i32>,
        to_level: Option<i32>,
        from_exp: Option<i32>,
        to_exp: Option<i32>,
        consumed_exp: i64,
        consumed_money: i64,
        consumed_gang: i64,
        consumed_cultivation_exp: i64,
        date: String,
    ) -> Result<i64, String> {
        let conn = self.conn()?;
        conn.execute(
            "INSERT INTO change_logs (account_id, category, name, from_level, to_level, from_exp, to_exp, consumed_exp, consumed_money, consumed_gang, consumed_cultivation_exp, date) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            params![account_id, category, name, from_level, to_level, from_exp, to_exp, consumed_exp, consumed_money, consumed_gang, consumed_cultivation_exp, date]
        ).map_err(|e| e.to_string())?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get_change_logs(&self, account_id: i64) -> Result<Vec<ChangeLog>, String> {
        let conn = self.conn()?;
        let mut stmt = conn.prepare("SELECT id, account_id, category, name, from_level, to_level, from_exp, to_exp, consumed_exp, consumed_money, consumed_gang, consumed_cultivation_exp, date, created_at FROM change_logs WHERE account_id = ?1 ORDER BY id DESC").map_err(|e| e.to_string())?;
        let rows = stmt.query_map(params![account_id], |row| {
            Ok(ChangeLog{
                id: row.get(0)?, account_id: row.get(1)?, category: row.get(2)?, name: row.get(3)?,
                from_level: row.get(4)?, to_level: row.get(5)?, from_exp: row.get(6)?, to_exp: row.get(7)?,
                consumed_exp: row.get(8)?, consumed_money: row.get(9)?, consumed_gang: row.get(10)?, consumed_cultivation_exp: row.get(11)?,
                date: row.get(12)?, created_at: row.get(13)?,
            })
        }).map_err(|e| e.to_string())?;
        let mut v = Vec::new(); for r in rows { v.push(r.map_err(|e| e.to_string())?); } Ok(v)
    }

    // Spend logs and gold updates
    pub fn add_spend_log(&self, account_id: i64, amount: i64, date: String, note: Option<String>) -> Result<i64, String> {
        let mut conn = self.conn()?;
        let tx = conn.transaction().map_err(|e| e.to_string())?;
        tx.execute(
            "INSERT INTO spend_logs (account_id, amount, date, note) VALUES (?1, ?2, ?3, ?4)",
            params![account_id, amount, date, note]
        ).map_err(|e| e.to_string())?;
        tx.execute(
            "UPDATE accounts SET gold = gold - ?1 WHERE id = ?2",
            params![amount, account_id]
        ).map_err(|e| e.to_string())?;
        let id = tx.last_insert_rowid();
        tx.commit().map_err(|e| e.to_string())?;
        Ok(id)
    }

    pub fn get_spend_logs(&self, account_id: Option<i64>, start: Option<String>, end: Option<String>) -> Result<Vec<SpendLog>, String> {
        let conn = self.conn()?;
        let mut query = String::from("SELECT id, account_id, amount, date, note, created_at FROM spend_logs WHERE 1=1");
        let mut binds: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
        if let Some(aid) = account_id { query.push_str(" AND account_id = ?"); binds.push(Box::new(aid)); }
        if let Some(s) = start { query.push_str(" AND date >= ?"); binds.push(Box::new(s)); }
        if let Some(e) = end { query.push_str(" AND date <= ?"); binds.push(Box::new(e)); }
        query.push_str(" ORDER BY date DESC, id DESC");
        let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
        let params_vec: Vec<&dyn rusqlite::ToSql> = binds.iter().map(|b| &**b as &dyn rusqlite::ToSql).collect();
        let rows = stmt.query_map(rusqlite::params_from_iter(params_vec), |row| {
            Ok(SpendLog{ id: row.get(0)?, account_id: row.get(1)?, amount: row.get(2)?, date: row.get(3)?, note: row.get(4)?, created_at: row.get(5)? })
        }).map_err(|e| e.to_string())?;
        let mut v = Vec::new();
        for r in rows { v.push(r.map_err(|e| e.to_string())?); }
        Ok(v)
    }

    pub fn get_spend_summary_daily(&self, start: String, end: String) -> Result<Vec<SpendSummary>, String> {
        let conn = self.conn()?;
        let mut stmt = conn.prepare("SELECT date, SUM(amount) as total FROM spend_logs WHERE date BETWEEN ?1 AND ?2 GROUP BY date ORDER BY date").map_err(|e| e.to_string())?;
        let rows = stmt.query_map(params![start, end], |row| { Ok(SpendSummary{ date: row.get(0)?, total: row.get(1)? }) }).map_err(|e| e.to_string())?;
        let mut v = Vec::new(); for r in rows { v.push(r.map_err(|e| e.to_string())?); } Ok(v)
    }

    pub fn get_spend_summary_monthly(&self, year: i32) -> Result<Vec<SpendSummary>, String> {
        let conn = self.conn()?;
        let mut stmt = conn.prepare("SELECT substr(date,1,7) as ym, SUM(amount) as total FROM spend_logs WHERE substr(date,1,4)=?1 GROUP BY ym ORDER BY ym").map_err(|e| e.to_string())?;
        let rows = stmt.query_map(params![year], |row| { Ok(SpendSummary{ date: row.get(0)?, total: row.get(1)? }) }).map_err(|e| e.to_string())?;
        let mut v = Vec::new(); for r in rows { v.push(r.map_err(|e| e.to_string())?); } Ok(v)
    }

    // Master skills
    pub fn add_master_skill(&self, account_id: i64, skill_name: String, current_level: i32, target_level: i32) -> Result<i64, String> {
        let conn = self.conn()?;
        conn.execute(
            "INSERT INTO master_skills (account_id, skill_name, current_level, target_level) VALUES (?1, ?2, ?3, ?4)",
            params![account_id, skill_name, current_level, target_level]
        ).map_err(|e| e.to_string())?;
        Ok(conn.last_insert_rowid())
    }

    pub fn update_master_skill(&self, id: i64, current_level: i32, target_level: i32) -> Result<(), String> {
        let conn = self.conn()?;
        conn.execute(
            "UPDATE master_skills SET current_level = ?1, target_level = ?2 WHERE id = ?3",
            params![current_level, target_level, id]
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn delete_master_skill(&self, id: i64) -> Result<(), String> {
        let conn = self.conn()?;
        conn.execute("DELETE FROM master_skills WHERE id = ?1", params![id]).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_master_skills(&self, account_id: i64) -> Result<Vec<Skill>, String> {
        let conn = self.conn()?;
        let mut stmt = conn.prepare("SELECT id, account_id, skill_name, current_level, target_level FROM master_skills WHERE account_id = ?1 ORDER BY id").map_err(|e| e.to_string())?;
        let rows = stmt.query_map(params![account_id], |row| {
            Ok(Skill{
                id: row.get(0)?,
                account_id: row.get(1)?,
                skill_name: row.get(2)?,
                current_level: row.get(3)?,
                target_level: row.get(4)?,
            })
        }).map_err(|e| e.to_string())?;
        let mut v = Vec::new();
        for r in rows { v.push(r.map_err(|e| e.to_string())?); }
        Ok(v)
    }

    // Assist skills
    pub fn add_assist_skill(&self, account_id: i64, skill_name: String, current_level: i32, target_level: i32) -> Result<i64, String> {
        let conn = self.conn()?;
        conn.execute(
            "INSERT INTO assist_skills (account_id, skill_name, current_level, target_level) VALUES (?1, ?2, ?3, ?4)",
            params![account_id, skill_name, current_level, target_level]
        ).map_err(|e| e.to_string())?;
        Ok(conn.last_insert_rowid())
    }

    pub fn update_assist_skill(&self, id: i64, current_level: i32, target_level: i32) -> Result<(), String> {
        let conn = self.conn()?;
        conn.execute(
            "UPDATE assist_skills SET current_level = ?1, target_level = ?2 WHERE id = ?3",
            params![current_level, target_level, id]
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn delete_assist_skill(&self, id: i64) -> Result<(), String> {
        let conn = self.conn()?;
        conn.execute("DELETE FROM assist_skills WHERE id = ?1", params![id]).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_assist_skills(&self, account_id: i64) -> Result<Vec<Skill>, String> {
        let conn = self.conn()?;
        let mut stmt = conn.prepare("SELECT id, account_id, skill_name, current_level, target_level FROM assist_skills WHERE account_id = ?1 ORDER BY id").map_err(|e| e.to_string())?;
        let rows = stmt.query_map(params![account_id], |row| {
            Ok(Skill{
                id: row.get(0)?,
                account_id: row.get(1)?,
                skill_name: row.get(2)?,
                current_level: row.get(3)?,
                target_level: row.get(4)?,
            })
        }).map_err(|e| e.to_string())?;
        let mut v = Vec::new();
        for r in rows { v.push(r.map_err(|e| e.to_string())?); }
        Ok(v)
    }

    // Cultivations
    pub fn add_cultivation(&self, account_id: i64, name: String, r#type: String, mode: String, current_exp: i32, current_level: i32, target_level: i32) -> Result<i64, String> {
        let conn = self.conn()?;
        conn.execute(
            "INSERT INTO cultivations (account_id, name, type, mode, current_exp, current_level, target_level) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![account_id, name, r#type, mode, current_exp, current_level, target_level]
        ).map_err(|e| e.to_string())?;
        Ok(conn.last_insert_rowid())
    }

    pub fn update_cultivation(&self, id: i64, name: Option<String>, mode: String, current_exp: i32, current_level: i32, target_level: i32) -> Result<(), String> {
        let conn = self.conn()?;
        if let Some(nm) = name {
            conn.execute(
                "UPDATE cultivations SET name = ?1, mode = ?2, current_exp = ?3, current_level = ?4, target_level = ?5 WHERE id = ?6",
                params![nm, mode, current_exp, current_level, target_level, id]
            ).map_err(|e| e.to_string())?;
        } else {
            conn.execute(
                "UPDATE cultivations SET mode = ?1, current_exp = ?2, current_level = ?3, target_level = ?4 WHERE id = ?5",
                params![mode, current_exp, current_level, target_level, id]
            ).map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn delete_cultivation(&self, id: i64) -> Result<(), String> {
        let conn = self.conn()?;
        conn.execute("DELETE FROM cultivations WHERE id = ?1", params![id]).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_cultivations(&self, account_id: i64) -> Result<Vec<Cultivation>, String> {
        let conn = self.conn()?;
        // Try query including name column first; fallback if column doesn't exist
        let query_new = "SELECT id, account_id, name, type, mode, current_exp, current_level, target_level FROM cultivations WHERE account_id = ?1 ORDER BY id";
        let mut stmt = match conn.prepare(query_new) {
            Ok(s) => s,
            Err(_) => conn.prepare("SELECT id, account_id, type, mode, current_exp, current_level, target_level FROM cultivations WHERE account_id = ?1 ORDER BY id").map_err(|e| e.to_string())?,
        };
        let has_name = stmt.column_count() == 8; // with name it is 8 columns
        let rows = stmt.query_map(params![account_id], move |row| {
            if has_name {
                Ok(Cultivation{
                    id: row.get(0)?,
                    account_id: row.get(1)?,
                    name: row.get(2)?,
                    r#type: row.get(3)?,
                    mode: row.get(4)?,
                    current_exp: row.get(5)?,
                    current_level: row.get(6)?,
                    target_level: row.get(7)?,
                })
            } else {
                Ok(Cultivation{
                    id: row.get(0)?,
                    account_id: row.get(1)?,
                    name: String::from(""),
                    r#type: row.get(2)?,
                    mode: row.get(3)?,
                    current_exp: row.get(4)?,
                    current_level: row.get(5)?,
                    target_level: row.get(6)?,
                })
            }
        }).map_err(|e| e.to_string())?;
        let mut v = Vec::new();
        for r in rows { v.push(r.map_err(|e| e.to_string())?); }
        Ok(v)
    }
}


