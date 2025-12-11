// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod state;

use tauri::State;
use state::DbState;

#[tauri::command]
fn db_init(state: State<DbState>) -> Result<(), String> {
    state.init()
}

// Accounts
#[tauri::command]
fn add_account(state: State<DbState>, name: String, school: String, level: i32, experience: i64) -> Result<i64, String> {
    state.add_account(name, school, level, experience)
}

#[tauri::command]
fn update_account(state: State<DbState>, id: i64, name: String, school: String, level: i32, experience: i64) -> Result<(), String> {
    state.update_account(id, name, school, level, experience)
}

#[tauri::command]
fn delete_account(state: State<DbState>, id: i64) -> Result<(), String> {
    state.delete_account(id)
}

#[tauri::command]
fn get_all_accounts(state: State<DbState>) -> Result<Vec<state::Account>, String> {
    state.get_all_accounts()
}

// Spend logs & gold
#[tauri::command]
fn add_spend_log(
    state: State<DbState>,
    account_id: Option<i64>,
    #[allow(non_snake_case)] accountId: Option<i64>,
    amount: i64,
    date: String,
    note: Option<String>,
) -> Result<i64, String> {
    let aid = account_id.or(accountId).ok_or_else(|| "missing account_id".to_string())?;
    state.add_spend_log(aid, amount, date, note)
}

#[tauri::command]
fn get_spend_logs(
    state: State<DbState>,
    account_id: Option<i64>,
    #[allow(non_snake_case)] accountId: Option<i64>,
    start: Option<String>,
    end: Option<String>,
) -> Result<Vec<state::SpendLog>, String> {
    let aid = account_id.or(accountId);
    state.get_spend_logs(aid, start, end)
}

#[tauri::command]
fn get_spend_summary_daily(state: State<DbState>, start: String, end: String) -> Result<Vec<state::SpendSummary>, String> {
    state.get_spend_summary_daily(start, end)
}

#[tauri::command]
fn get_spend_summary_monthly(state: State<DbState>, year: i32) -> Result<Vec<state::SpendSummary>, String> {
    state.get_spend_summary_monthly(year)
}

// Change logs
#[tauri::command]
fn add_change_log(
    state: State<DbState>,
    account_id: Option<i64>,
    #[allow(non_snake_case)] accountId: Option<i64>,
    category: String,
    name: String,
    from_level: Option<i32>,
    #[allow(non_snake_case)] fromLevel: Option<i32>,
    to_level: Option<i32>,
    #[allow(non_snake_case)] toLevel: Option<i32>,
    from_exp: Option<i32>,
    #[allow(non_snake_case)] fromExp: Option<i32>,
    to_exp: Option<i32>,
    #[allow(non_snake_case)] toExp: Option<i32>,
    consumed_exp: Option<i64>,
    #[allow(non_snake_case)] consumedExp: Option<i64>,
    consumed_money: Option<i64>,
    #[allow(non_snake_case)] consumedMoney: Option<i64>,
    consumed_gang: Option<i64>,
    #[allow(non_snake_case)] consumedGang: Option<i64>,
    consumed_cultivation_exp: Option<i64>,
    #[allow(non_snake_case)] consumedCultivationExp: Option<i64>,
    date: String,
) -> Result<i64, String> {
    let aid = account_id.or(accountId).ok_or_else(|| "missing account_id".to_string())?;
    let fl = from_level.or(fromLevel);
    let tl = to_level.or(toLevel);
    let fe = from_exp.or(fromExp);
    let te = to_exp.or(toExp);
    let cexp = consumed_exp.or(consumedExp).unwrap_or(0);
    let cmoney = consumed_money.or(consumedMoney).unwrap_or(0);
    let cgang = consumed_gang.or(consumedGang).unwrap_or(0);
    let ccexp = consumed_cultivation_exp.or(consumedCultivationExp).unwrap_or(0);
    state.add_change_log(aid, category, name, fl, tl, fe, te, cexp, cmoney, cgang, ccexp, date)
}

#[tauri::command]
fn get_change_logs(
    state: State<DbState>,
    account_id: Option<i64>,
    #[allow(non_snake_case)] accountId: Option<i64>,
) -> Result<Vec<state::ChangeLog>, String> {
    let aid = account_id.or(accountId).ok_or_else(|| "missing account_id".to_string())?;
    state.get_change_logs(aid)
}

// Master skills
#[tauri::command]
fn add_master_skill(state: State<DbState>, account_id: i64, skill_name: String, current_level: i32, target_level: i32) -> Result<i64, String> {
    state.add_master_skill(account_id, skill_name, current_level, target_level)
}

#[tauri::command]
fn update_master_skill(state: State<DbState>, id: i64, current_level: i32, target_level: i32) -> Result<(), String> {
    state.update_master_skill(id, current_level, target_level)
}

#[tauri::command]
fn delete_master_skill(state: State<DbState>, id: i64) -> Result<(), String> {
    state.delete_master_skill(id)
}

#[tauri::command]
fn get_master_skills(state: State<DbState>, account_id: i64) -> Result<Vec<state::Skill>, String> {
    state.get_master_skills(account_id)
}

// Assist skills
#[tauri::command]
fn add_assist_skill(state: State<DbState>, account_id: i64, skill_name: String, current_level: i32, target_level: i32) -> Result<i64, String> {
    state.add_assist_skill(account_id, skill_name, current_level, target_level)
}

#[tauri::command]
fn update_assist_skill(state: State<DbState>, id: i64, current_level: i32, target_level: i32) -> Result<(), String> {
    state.update_assist_skill(id, current_level, target_level)
}

#[tauri::command]
fn delete_assist_skill(state: State<DbState>, id: i64) -> Result<(), String> {
    state.delete_assist_skill(id)
}

#[tauri::command]
fn get_assist_skills(state: State<DbState>, account_id: i64) -> Result<Vec<state::Skill>, String> {
    state.get_assist_skills(account_id)
}

// Cultivations
#[tauri::command]
fn add_cultivation(
    state: State<DbState>,
    account_id: Option<i64>,
    #[allow(non_snake_case)] accountId: Option<i64>,
    name: Option<String>,
    r#type: String,
    mode: String,
    current_exp: Option<i32>,
    #[allow(non_snake_case)] currentExp: Option<i32>,
    current_level: Option<i32>,
    #[allow(non_snake_case)] currentLevel: Option<i32>,
    target_level: Option<i32>,
    #[allow(non_snake_case)] targetLevel: Option<i32>,
) -> Result<i64, String> {
    let aid = account_id.or(accountId).ok_or_else(|| "missing account_id".to_string())?;
    let cur_exp = current_exp.or(currentExp).unwrap_or(0);
    let cur_lvl = current_level.or(currentLevel).unwrap_or(0);
    let tgt_lvl = target_level.or(targetLevel).unwrap_or(0);
    let nm = name.unwrap_or_else(|| "".to_string());
    state.add_cultivation(aid, nm, r#type, mode, cur_exp, cur_lvl, tgt_lvl)
}

#[tauri::command]
fn update_cultivation(
    state: State<DbState>,
    id: i64,
    name: Option<String>,
    mode: String,
    current_exp: Option<i32>,
    #[allow(non_snake_case)] currentExp: Option<i32>,
    current_level: Option<i32>,
    #[allow(non_snake_case)] currentLevel: Option<i32>,
    target_level: Option<i32>,
    #[allow(non_snake_case)] targetLevel: Option<i32>,
) -> Result<(), String> {
    let cur_exp = current_exp.or(currentExp).unwrap_or(0);
    let cur_lvl = current_level.or(currentLevel).unwrap_or(0);
    let tgt_lvl = target_level.or(targetLevel).unwrap_or(0);
    state.update_cultivation(id, name, mode, cur_exp, cur_lvl, tgt_lvl)
}

#[tauri::command]
fn delete_cultivation(state: State<DbState>, id: i64) -> Result<(), String> {
    state.delete_cultivation(id)
}

#[tauri::command]
fn get_cultivations(
    state: State<DbState>,
    account_id: Option<i64>,
    #[allow(non_snake_case)] accountId: Option<i64>,
) -> Result<Vec<state::Cultivation>, String> {
    let aid = account_id.or(accountId).ok_or_else(|| "missing account_id".to_string())?;
    state.get_cultivations(aid)
}

fn main() {
    tauri::Builder::default()
        .manage(DbState::default())
        .invoke_handler(tauri::generate_handler![
            db_init,
            add_account, update_account, delete_account, get_all_accounts,
            add_master_skill, update_master_skill, delete_master_skill, get_master_skills,
            add_assist_skill, update_assist_skill, delete_assist_skill, get_assist_skills,
            add_cultivation, update_cultivation, delete_cultivation, get_cultivations,
            add_spend_log, get_spend_logs, get_spend_summary_daily, get_spend_summary_monthly
            ,add_change_log, get_change_logs
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

