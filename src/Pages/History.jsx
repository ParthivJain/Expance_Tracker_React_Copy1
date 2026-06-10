import {useState, useEffect} from "react"

function History({setCurrentPage}){

    const [showMonthDetail, setShowMonthDetail] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(null)
    const [showConfirmPopup, setShowConfirmPopup] = useState(false)
    const [expenseToDelete, setExpenseToDelete] = useState(null)
    
    const [monthlyData, setMonthlyData] = useState([])
    const [currentMonthTotal, setCurrentMonthTotal] = useState(0)
    const [expenses, setExpenses] = useState([])

    // Month names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Load expenses from localStorage
    useEffect(() => {
        const savedExpenses = localStorage.getItem("expenses")
        if (savedExpenses) {
            setExpenses(JSON.parse(savedExpenses))
        }
    }, [])

    // Group expenses by month whenever expenses change
    useEffect(() => {
        if (!expenses || expenses.length === 0) {
            setMonthlyData([])
            setCurrentMonthTotal(0)
            return
        }

        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()
        let currentTotal = 0

        const monthMap = new Map()

        expenses.forEach(expense => {
            if (!expense.date) return
            
            const date = new Date(expense.date)
            const month = date.getMonth()
            const year = date.getFullYear()
            const monthKey = `${year}-${month}`
            const monthName = `${monthNames[month]}-${year}`
            
            const amount = Number(expense.amount) || 0

            // Check if current month
            if (month === currentMonth && year === currentYear) {
                currentTotal += amount
            }

            // Group by month
            if (!monthMap.has(monthKey)) {
                monthMap.set(monthKey, {
                    monthKey: monthKey,
                    monthName: monthName,
                    total: 0,
                    food: 0,
                    travel: 0,
                    shopping: 0,
                    other: 0,
                    expenses: []
                })
            }

            const monthData = monthMap.get(monthKey)
            monthData.total += amount
            
            // Categorize expense
            const category = expense.category
            if (category === "Food") {
                monthData.food += amount
            } else if (category === "Travel") {
                monthData.travel += amount
            } else if (category === "Shopping") {
                monthData.shopping += amount
            } else {
                monthData.other += amount
            }

            // Store individual expense
            monthData.expenses.push({
                ...expense,
                category: category
            })
        })

        setCurrentMonthTotal(currentTotal)
        
        // Convert map to array and sort by date (newest first)
        const sortedMonths = Array.from(monthMap.values()).sort((a, b) => 
            b.monthKey.localeCompare(a.monthKey)
        )
        
        setMonthlyData(sortedMonths)
    }, [expenses])

    // Delete expense and update localStorage
    function deleteExpense(expenseId) {
        // Update expenses array
        const updatedExpenses = expenses.filter(exp => exp.id !== expenseId)
        setExpenses(updatedExpenses)
        localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
        
        // ALSO update the selectedMonth state immediately
        if (selectedMonth) {
            const updatedExpensesList = selectedMonth.expenses.filter(exp => exp.id !== expenseId)
            
            // Recalculate totals
            let newTotal = 0
            let newFood = 0
            let newTravel = 0
            let newShopping = 0
            let newOther = 0
            
            updatedExpensesList.forEach(exp => {
                newTotal += exp.amount
                if (exp.category === "Food") newFood += exp.amount
                else if (exp.category === "Travel") newTravel += exp.amount
                else if (exp.category === "Shopping") newShopping += exp.amount
                else newOther += exp.amount
            })
            
            // Update selected month with new data
            setSelectedMonth({
                ...selectedMonth,
                expenses: updatedExpensesList,
                total: newTotal,
                food: newFood,
                travel: newTravel,
                shopping: newShopping,
                other: newOther
            })
            
            // If no expenses left in this month, close modal
            if (updatedExpensesList.length === 0) {
                setShowMonthDetail(false)
                setSelectedMonth(null)
            }
        }
        
        // Close popup
        setShowConfirmPopup(false)
        setExpenseToDelete(null)
    }

    // Format date function
    function formatDate(dateString) {
        if (!dateString) return "";
        return dateString.split("-").reverse().join("-");
    }

    return(
        <div className="
        min-h-screen
        bg-slate-900
        text-white
        p-4
        text-center
        ">

            <h1 className="
            text-3xl
            font-bold
            ">
                History
            </h1>

            <div className="
            bg-slate-800
            mt-4
            p-5
            rounded-3xl
            shadow-lg
            text-center
            ">

                <h2 className="
                text-gray-400
                text-sm
                ">
                    Current Month Total
                </h2>

                <p className="
                text-2xl
                font-bold
                mt-2
                text-green-400">
                    ₹{currentMonthTotal}
                </p>

            </div>

            <div className="
            bg-slate-800
            mt-6
            p-5
            h-[370px]
            rounded-3xl
            shadow-3lg
            overflow-y-auto
            scrollbar-hide
            ">
                <h2 className="
                text-xl
                font-semibold
                mb-4
                ">
                    Previous Months
                </h2>

                {monthlyData.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        No expenses yet
                    </div>
                ) : (
                    <div className="
                    grid
                    grid-cols-2
                    gap-4
                    overflow-y-auto
                    scrollbar-hide
                    pr-2
                    ">

                        {monthlyData.map((month) => (
                            <div 
                                key={month.monthKey}
                                onClick={() => {
                                    setSelectedMonth(month)
                                    setShowMonthDetail(true)
                                }}
                                className="
                                bg-slate-700
                                p-4
                                rounded-2xl
                                cursor-pointer
                                hover:bg-slate-600
                                active:scale-[0.98]
                                transition
                                text-center
                                ">
                                    <h3 className="
                                    text-lg
                                    font-semibold
                                    ">
                                        {month.monthName}
                                    </h3>

                                    <div className="
                                    space-y-2
                                    text-gray-300
                                    mt-2
                                    ">
                                        <div className="
                                        flex
                                        justify-between
                                        ">
                                            <span>Food</span>
                                            <span>₹{month.food}</span>
                                        </div>

                                        <div className="
                                        flex
                                        justify-between
                                        ">
                                            <span>Travel</span>
                                            <span>₹{month.travel}</span>
                                        </div>

                                        <div className="
                                        flex
                                        justify-between">
                                            <span>Shopping</span>
                                            <span>₹{month.shopping}</span>
                                        </div>

                                        <div className="
                                        flex
                                        justify-between
                                        ">
                                            <span>Other</span>
                                            <span>₹{month.other}</span>
                                        </div>

                                    </div>

                                    <hr className="
                                    my-4
                                    border-slate-600
                                    "/>
                                    
                                    <div className="
                                    flex
                                    justify-between
                                    text-green-400
                                    font-bold
                                    text-lg
                                    ">
                                        <span>Total</span>
                                        <span>₹{month.total}</span>
                                    </div>

                            </div>
                        ))}

                    </div>
                )}
            </div>
            
            {/* Month Detail Modal */}
            {showMonthDetail && selectedMonth && (
                <div className="
                fixed
                inset-0
                bg-black/40
                backdrop-blur-sm
                flex
                flex-col
                justify-center
                items-center
                z-50
                ">
                    <div className="
                    bg-slate-700
                    w-[90%]
                    max-w-md
                    p-4
                    rounded-3xl
                    max-h-[90vh]
                    overflow-y-auto
                    scrollbar-hide
                    ">
                        <div className="
                        bg-slate-800
                        p-4
                        rounded-3xl
                        text-center
                        ">
                            <h1 className="
                            text-3xl
                            font-bold
                            ">
                                {selectedMonth.monthName}
                            </h1>
                            <p className="
                            text-2xl
                            text-green-400
                            mt-2
                            font-semibold
                            ">
                                ₹{selectedMonth.total}
                            </p>
                        </div>

                        {/* Category Summary */}
                        <div className="
                        bg-slate-800
                        mt-3
                        p-4
                        rounded-3xl
                        ">

                            <div className="flex justify-between py-1">
                                <span>Food</span>
                                <span className="text-green-400">₹{selectedMonth.food}</span>
                            </div>

                            <div className="flex justify-between py-1">
                                <span>Travel</span>
                                <span className="text-green-400">₹{selectedMonth.travel}</span>
                            </div>

                            <div className="flex justify-between py-1">
                                <span>Shopping</span>
                                <span className="text-green-400">₹{selectedMonth.shopping}</span>
                            </div>

                            <div className="flex justify-between py-1">
                                <span>Other</span>
                                <span className="text-green-400">₹{selectedMonth.other}</span>
                            </div>

                        </div>

                        {/* Individual Expenses List */}
                        <div className="
                        bg-slate-800
                        mt-3
                        p-4
                        rounded-3xl
                        min-h-[200px]
                        max-h-[300px]
                        overflow-y-auto
                        scrollbar-hide
                        ">
                            {selectedMonth.expenses.length === 0 ? (
                                <div className="text-center text-gray-400 py-8">
                                    No expenses this month
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedMonth.expenses.map((expense) => (
                                        <div 
                                            key={expense.id}
                                            className="
                                            bg-slate-700
                                            p-3
                                            rounded-2xl
                                            relative
                                            text-center
                                            ">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setExpenseToDelete(expense.id)
                                                        setShowConfirmPopup(true)
                                                    }}
                                                    className="
                                                    absolute
                                                    top-2
                                                    right-2
                                                    w-6
                                                    h-6
                                                    rounded-full
                                                    bg-red-500/20
                                                    text-red-400
                                                    hover:bg-red-500/40
                                                    active:scale-90
                                                    transition
                                                    flex
                                                    items-center
                                                    justify-center
                                                    text-sm
                                                    ">
                                                        ×
                                                </button>

                                                <h3 className="text-gray-300 text-sm">
                                                    {expense.category}
                                                </h3>

                                                <p className="text-xl font-bold mt-3">
                                                    ₹{expense.amount}
                                                </p>

                                                <p className="text-xs text-gray-400 mt-2">
                                                    {formatDate(expense.date)}
                                                </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="
                        flex
                        gap-3
                        mt-3
                        ">
                            
                            <button 
                                onClick={() => {
                                    setShowMonthDetail(false)
                                    setSelectedMonth(null)
                                }}
                                className="
                                flex-1
                                bg-sky-500
                                py-3
                                rounded-2xl
                                font-semibold
                                active:scale-95
                                hover:bg-sky-400
                                transition
                                cursor-pointer
                                ">
                                    ← Back
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* Delete Confirmation Popup */}
            {showConfirmPopup && (
                <div className="
                fixed
                inset-0
                bg-black/40
                backdrop-blur-sm
                flex
                justify-center
                items-center
                z-[100]
                ">

                    <div className="
                    bg-slate-800
                    p-6
                    rounded-3xl
                    w-80
                    text-center">
                        <h2 className="
                        text-xl
                        font-semibold
                        ">
                            Delete Expense?
                        </h2>

                        <p className="
                        text-gray-400
                        mt-2
                        ">
                            This expense will be permanently removed.
                        </p>

                        <div className="
                        flex
                        gap-3
                        mt-6">

                            <button 
                                onClick={() => {
                                    setShowConfirmPopup(false)
                                    setExpenseToDelete(null)
                                }}
                                className="
                                flex-1
                                bg-slate-600
                                py-2
                                rounded-xl
                                hover:bg-slate-500
                                active:scale-95
                                transition
                                cursor-pointer
                                ">
                                    Cancel
                            </button>

                            <button 
                                onClick={() => {
                                    if (expenseToDelete) {
                                        deleteExpense(expenseToDelete)
                                    }
                                }}
                                className="
                                flex-1
                                bg-red-500
                                py-2
                                rounded-xl
                                hover:bg-red-400
                                active:scale-95
                                transition
                                cursor-pointer
                                ">
                                    Delete
                            </button>

                        </div>

                    </div>
                    
                </div>
            )}
            
            {/* Bottom Navigation */}
            <div className="
            fixed
            bottom-0
            left-0
            w-full
            bg-slate-800
            px-4
            py-3
            flex
            justify-between
            items-center
            border-t
            border-slate-700
            ">
                
                <button 
                onClick={()=>setCurrentPage("home")}
                className="
                border
                border-slate-600
                px-5
                py-3
                rounded-xl
                bg-slate-700
                hover:bg-slate-600
                active:scale-95
                transition
                font-medium
                text-gray-300
                cursor-pointer
                ">
                    
                    <span className="text-lg">
                        🏠
                    </span>

                    <span className="text-sm">
                        Home
                    </span>

                </button>
            
                <button 
                onClick={()=>setCurrentPage("balance")}
                className="
                border
                border-slate-600
                px-5
                py-3
                rounded-xl
                bg-slate-700
                hover:bg-slate-600
                active:scale-95
                transition
                font-medium
                text-gray-300
                cursor-pointer
                ">
                    
                    <span className="text-lg">
                        👥
                    </span>

                    <span className="text-sm">
                        Balances
                    </span>

                </button>

                <button 
                onClick={()=>setCurrentPage("history")}
                className="
                border
                border-slate-600
                px-5
                py-3
                rounded-xl
                bg-slate-700
                hover:bg-slate-600
                active:scale-95
                transition
                font-medium
                text-sky-400
                cursor-pointer
                ">

                    <span className="text-lg">
                      📜
                    </span>

                    <span className="text-sm">
                        History    
                    </span>

                </button>
            
            </div>

        </div>
    )

}

export default History