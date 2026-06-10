import {useState, useEffect} from "react"

function Home({setCurrentPage}){

    const[showModal, setShowModal] = useState(false)
    const[showConfirmPopup, setShowConfirmPopup] = useState(false)
    const[expenseToDelete, setExpenseToDelete] = useState(null)

    const[expenseData, setExpenseData] = useState({
        amount : "",
        category : "",
        date : ""
    })

    const [expenses, setExpenses] = useState(()=>{
        const savedExpenses = 
            localStorage.getItem("expenses")

        return savedExpenses
            ? JSON.parse(savedExpenses)
            : []
    })

    const currentDate = new Date();

    const currentMonth = currentDate.getMonth();

    const currentYear = currentDate.getFullYear();

    const currentMonthExpenses = expenses.filter((expenses) => {
        const expenseDate = new Date(expenses.date);

        return(
            expenseDate.getMonth() === currentMonth && 
            expenseDate.getFullYear() === currentYear
        );
    });

    const totalExpense = currentMonthExpenses.reduce(
        (total, expenses) => total + expenses.amount, 

        0
    );

    useEffect(()=>{
        localStorage.setItem(
            "expenses",
            JSON.stringify(expenses)
        )
    }, [expenses])

    function addExpense(e){
        e.preventDefault();
        setShowModal(false);

        const newExpense = { 
            id: Date.now(),
            amount : Number(expenseData.amount),
            category : expenseData.category,
            date : expenseData.date
        }

        setExpenses([
            newExpense,
            ...expenses
        ])

        setExpenseData({
            amount : "",
            category : "",
            date : ""
        })

    }

    function deleteExpanse(id){
        setExpenses(
            expenses.filter(
                expenses => expenses.id !== id
            )
        )
    }



    return(
        <div className="
        min-h-screen
        pb-24
        overflow-y-auto
        scrollbar-hide
        bg-slate-900
        text-white
        p-4
        text-center
        ">

            <h1 className="
            text-3xl
            font-bold">
                Home
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
                text-green-400
                mt-2
                ">
                    ₹{totalExpense}
                </p>

            </div>

            <div className="
            bg-slate-800
            mt-6
            p-5
            h-[370px]
            rounded-3xl
            overflow-y-auto
            scrollbar-hide
            shadow-3lg
            ">
               
                <h2 className="
                text-2xl
                font-semibold
                ">
                    Expenses       
                </h2>

                <div className="
                mt-5
                overflow-y-auto
                pr-2
                content-start
                scrollbar-hide
                ">
                    {

                        expenses.length === 0 ? ( 

                            <div className="
                            h-full
                            flex
                            text-center
                            items-center
                            justify-center
                            text-gray-400
                            text-lg
                            ">
                                No Expnses Added Yet.
                            </div>

                        ) : (

                            <div className="
                            grid
                            grid-cols-2
                            gap-4">


                                {
                                    expenses.map((expenses) =>(

                                    <div 
                                    key={expenses.id}
                                    className="
                                    bg-slate-700                   
                                    p-4
                                    rounded-2xl
                                    text-center
                                    h-[120px] 
                                    relative
                                    ">

                                        <button 
                                        onClick={()=>{
                                            deleteExpanse(expenses.id)
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
                                        flex
                                        item-center
                                        justify-center
                                        text-sm
                                        hover:bg-red-500/30
                                        active:scale-90
                                        transition
                                        ">
                                            ×
                                        </button>

                                        <h3 className="
                                        text-gray-300
                                        text-sm">
                                            {expenses.category}
                                        </h3>

                                        <p className="
                                        text-xl
                                        font-bold
                                        mt-2
                                        ">
                                            ₹{expenses.amount}
                                        </p>

                                        <p className="
                                        text-xs
                                        text-gray-400
                                        mt-2
                                        ">
                                            {expenses.date.split("-").reverse().join("-")}
                                        </p>

                                    </div>

                                )) 
                                }

                            </div>
                    )

                    }
                
                </div>

            </div>

            <button 
            onClick={()=>setShowModal(true)}
            className="
            w-full
            mt-5
            bg-sky-500
            py-3
            rounded-2xl
            text-lg
            font-semibold
            active:scale-95
            transition">
                Add Expanse
            </button>

            {
                showConfirmPopup && (
                    <div className="
                    fixed
                    inset-0
                    bg-black/40
                    backdrop-blur-sm
                    flex
                    justify-center
                    items-center
                    z-50
                    ">

                        <div className="
                        bg-slate-800
                        p-6
                        rounded-3xl
                        w-80
                        text-center
                        ">

                            <h2 className="
                            text-xl
                            font-semibold
                            ">
                                Delete Expanse?
                            </h2>

                            <p className="
                            text-gray-400
                            mt-2
                            ">
                                This expanse will be permanently removed.
                            </p>

                            <div className="
                            flex
                            gap-3
                            mt-6
                            ">
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
                                ">
                                    Cancle
                                </button>

                                <button 
                                onClick={() => {
                                    setShowConfirmPopup(false)
                                    setExpenseToDelete(null)
                                }}
                                className="
                                flex-1
                                bg-red-500
                                py-2
                                rounded-xl
                                hover:bg-red-400
                                active:scale-95
                                transition
                                ">
                                    Delete
                                </button>

                            </div>

                        </div>
                        
                    </div>
                )
            }

            {
                showModal && (

                    <div className="
                    fixed
                    inset-0
                    bg-black/40
                    backdrop-blur-sm
                    flex
                    justify-center
                    items-center
                    z-50
                    ">
                        <div className="
                        bg-slate-800
                        w-[90%]
                        max-w-md
                        p-6
                        rounded-3xl
                        ">

                            <h2 className="
                            text-2xl
                            font-bold
                            text-center
                            ">
                                Add Expanse
                            </h2>

                            <form onSubmit={addExpense}> 

                                <input 
                                type="number"
                                placeholder="Enter amount"
                                required
                                min="1"

                                value ={expenseData.amount}

                                onChange={(e)=>{
                                    setExpenseData({
                                        ...expenseData,
                                        amount:e.target.value
                                    })
                                }}

                                className="
                                w-[90%]
                                m-6
                                p-3
                                rounded-xl
                                bg-slate-700
                                outline-none
                                text-center
                                [appearance:textfield]
                                [&::-webkit-outer-spin-button]:appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none
                                "
                                />

                                <div className="mt-5">
                                    
                                    <p className="
                                    text-sm
                                    text-gray-300
                                    mb-3
                                    ">
                                        Select Category
                                    </p>

                                    <div className="
                                    grid
                                    m-6
                                    p-2
                                    grid-cols-2
                                    gap-3
                                    ">

                                        <label className="
                                        bg-slate-700
                                        p-3
                                        rounded-xl
                                        flex
                                        item-center
                                        gap-2
                                        cursor-pointer
                                        ">
                                            <input
                                            type="radio"
                                            name="category"
                                            required
                                            value="Food"

                                            checked={expenseData.category==="Food"}

                                            onChange={(e)=>
                                                setExpenseData({
                                                    ...expenseData,
                                                    category:e.target.value
                                                })
                                            }

                                            />

                                            Food

                                        </label>

                                        <label className="
                                        bg-slate-700
                                        p-3
                                        rounded-xl
                                        flex
                                        item-center
                                        gap-2
                                        cursor-pointer
                                        ">
                                            <input
                                            type="radio"
                                            name="category"
                                            required
                                            value="Travel"

                                            checked={expenseData.category==="Travel"}

                                            onChange={(e)=>
                                                setExpenseData({
                                                    ...expenseData,
                                                    category:e.target.value
                                                })
                                            }
                                            />

                                            Travel

                                        </label>

                                        <label className="
                                        bg-slate-700
                                        p-3
                                        rounded-xl
                                        flex
                                        item-center
                                        gap-2
                                        cursor-pointer
                                        ">
                                            <input
                                            type="radio"
                                            name="category"
                                            required
                                            value="Shopping"

                                            checked={expenseData.category==="Shopping"}

                                            onChange={(e)=>
                                                setExpenseData({
                                                    ...expenseData,
                                                    category:e.target.value
                                                })
                                            }
                                            />

                                            Shopping

                                        </label>

                                        <label className="
                                        bg-slate-700
                                        p-3
                                        rounded-xl
                                        flex
                                        item-center
                                        gap-2
                                        cursor-pointer
                                        ">
                                            <input
                                            type="radio"
                                            name="category"
                                            required
                                            value="Other"

                                            checked={expenseData.category==="Other"}

                                            onChange={(e)=>
                                                setExpenseData({
                                                    ...expenseData,
                                                    category:e.target.value
                                                })
                                            }
                                            />

                                            Other

                                        </label>

                                    </div>

                                </div>

                                <input
                                type="date"
                                required

                                value={expenseData.date}

                                onChange={(e)=>{
                                    setExpenseData({
                                        ...expenseData,
                                        date:e.target.value
                                    })
                                }}

                                className="
                                w-[90%]
                                mt-5
                                p-3
                                rounded-xl
                                bg-slate-700
                                outline:none
                                "
                                />

                                <div className="
                                flex
                                flex-col
                                gap-4
                                mt-6
                                items-center
                                ">
                                
                                <button
                                type="submit"
                                className="
                                border
                                w-[90%]
                                bg-sky-500
                                py-3
                                rounded-xl
                                font-semibold
                                active:scale-95
                                transition
                                ">
                                    Add Expanse
                                </button>

                                <button
                                    type="button"
                                    onClick={()=>setShowModal(false)}
                                    className="
                                    flex-1
                                    bg-red-500
                                    py-3
                                    w-[90%]
                                    rounded-xl
                                    font-semibold
                                    active:scale-95
                                    transition
                                    ">
                                        Close
                                </button>
                                
                                </div>

                            </form>

                        </div>
                    
                    </div>

                )
            }

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
            item-center
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
                text-sky-400">
                    
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
                text-gary-300
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
                text-gary-300
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

export default Home
