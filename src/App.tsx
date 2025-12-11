import { useState, useEffect } from 'react'
import AccountList from './components/AccountList'
import AccountForm from './components/AccountForm'
import { getAllAccounts, initDb, Account } from './services/accountService'
import { ToastHost } from './components/ui/toast'
import Button from './components/ui/button'
 

function App() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [dbError, setDbError] = useState<string | null>(null)

  const loadAccounts = async () => {
    try {
      const result = await getAllAccounts()
      setAccounts(result)
      setDbError(null)
    } catch (error) {
      console.error('加载账号失败:', error)
      if (error instanceof Error) {
        setDbError(error.message)
      }
    }
  }

  useEffect(() => {
    const setup = async () => {
      try {
        await initDb()
        await loadAccounts()
        setDbError(null)
      } catch (error) {
        console.error('初始化失败:', error)
        if (error instanceof Error) {
          setDbError(error.message)
        } else {
          setDbError('数据库初始化失败')
        }
      }
    }
    setup()
  }, [])

  const handleAddAccount = () => {
    setEditingAccount(null)
    setShowForm(true)
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setShowForm(true)
  }

  const handleSaveAccount = async () => {
    await loadAccounts()
    setShowForm(false)
    setEditingAccount(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingAccount(null)
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <ToastHost />
      <header className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-[1200px] px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold">梦幻西游账号管理</h1>
          <Button size="sm" onClick={handleAddAccount} disabled={!!dbError}>+ 添加账号</Button>
        </div>
      </header>
      <main className="px-4 py-6">
        <div className="mx-auto max-w-[1200px]">
          

          {dbError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">数据库连接失败</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{dbError}</p>
                    <p className="mt-2 text-xs text-gray-600">
                      请查看控制台获取详细错误信息
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!dbError && (
            <>
              {showForm ? (
                <AccountForm
                  account={editingAccount}
                  onSave={handleSaveAccount}
                  onCancel={handleCancel}
                />
              ) : (
                <AccountList
                  accounts={accounts}
                  onEdit={handleEditAccount}
                  onRefresh={loadAccounts}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App

