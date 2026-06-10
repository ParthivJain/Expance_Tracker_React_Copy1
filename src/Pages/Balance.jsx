import {useState, useEffect} from "react"

function Balance({setCurrentPage}){

    const [showFriendModal, setShowFriendModal] = useState(false)
    const [selectedFriend, setSelectedFriend] = useState(null)
    const [selectedAddMore, setSelectedAddMore] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [showConfirmPopup, setShowConfirmPopup] = useState(false)
    const [showDeleteTransactionPopup, setShowDeleteTransactionPopup] = useState(false)
    const [confirmData, setConfirmData] = useState({
        title : "",
        message : ""
    })
    const [confirmAction, setConfirmAction] = useState(null)
    const [transactionToDelete, setTransactionToDelete] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")

    const [friends,setFriends] = useState(()=>{
        const saved = localStorage.getItem("friends")
        return saved ? JSON.parse(saved) : []
    })
    const [friendName, setFriendName] = useState("")

    const [transactionData, setTransactionData] = useState({
        amount : "",
        reason : "",
        date : "",
        type : ""
    })

    function calculateFriendBalance(friend) {
        if (!friend.transactions || friend.transactions.length === 0) return 0;
        let balance = 0;
        friend.transactions.forEach(transaction => {
            if (transaction.type === "given") {
                balance += transaction.amount;
            } else if (transaction.type === "taken") {
                balance -= transaction.amount;
            }
        });
        return balance;
    }

    function calculateTotalBalance() {
        let total = 0;
        friends.forEach(friend => {
            total += calculateFriendBalance(friend);
        });
        return total;
    }

    useEffect(() => {
        localStorage.setItem("friends", JSON.stringify(friends))
    }, [friends])

    function addFriend(e){
        e.preventDefault();
        if(!friendName.trim()) return;

        const newFriend = {
            id : Date.now(),
            name : friendName,
            transactions : []
        }

        setFriends([newFriend, ...friends])
        setFriendName("")
        setShowFriendModal(false)
    }

    function addTransaction(e){
        e.preventDefault();
        if (!transactionData.amount || !transactionData.reason || !transactionData.date || !transactionData.type) return;

        const newTransaction = {
            id : Date.now(),
            amount : Number(transactionData.amount),
            reason : transactionData.reason,
            date : transactionData.date,
            type : transactionData.type
        }

        setSelectedAddMore(false)

        setFriends(friends.map((friend)=> friend.id === selectedFriend.id ? {
            ...friend,
            transactions: [...(friend.transactions || []), newTransaction]
        } : friend))

        setSelectedFriend({
            ...selectedFriend,
            transactions: [...(selectedFriend.transactions || []), newTransaction]
        })

        setTransactionData({amount : "", reason : "", date : "", type : ""})
    }

    function deleteTransaction(friendId, transactionId) {
        setFriends(friends.map((friend) => friend.id === friendId ? {
            ...friend,
            transactions: friend.transactions.filter((transaction) => transaction.id !== transactionId)
        } : friend));
        
        if (selectedFriend && selectedFriend.id === friendId) {
            setSelectedFriend({
                ...selectedFriend,
                transactions: selectedFriend.transactions.filter((transaction) => transaction.id !== transactionId)
            });
        }
        setShowDeleteTransactionPopup(false)
        setTransactionToDelete(null)
    }

    function clearFriendHistory(friendId) {
        setFriends(friends.map((friend) => friend.id === friendId ? {...friend, transactions: []} : friend));
        if (selectedFriend && selectedFriend.id === friendId) {
            setSelectedFriend({...selectedFriend, transactions: []});
        }
    }

    function deleteFriend(friendId) {
        setFriends(friends.filter((friend) => friend.id !== friendId));
        if (selectedFriend?.id === friendId) setSelectedFriend(null);
    }

    const totalBalance = calculateTotalBalance();
    const totalBalanceColor = totalBalance >= 0 ? "text-green-400" : "text-red-400";
    const totalBalancePrefix = totalBalance >= 0 ? "₹" : "-₹";
    const totalBalanceDisplay = totalBalancePrefix + Math.abs(totalBalance);

    const allTransactions = selectedFriend?.transactions ? [...selectedFriend.transactions] : [];

    // Format date function
    function formatDate(dateString) {
        if (!dateString) return "";
        return dateString.split("-").reverse().join("-");
    }

    return(
        <div className="min-h-screen bg-slate-900 text-white p-4 pb-24 text-center">
            <h1 className="text-3xl font-bold">Balances</h1>

            <div className="bg-slate-800 mt-4 p-5 rounded-3xl text-center shadow-lg">
                <h2 className="text-gray-400 text-sm">Total Balance</h2>
                <p className={`text-2xl font-bold mt-2 ${totalBalanceColor}`}>{totalBalanceDisplay}</p>
            </div>

            <div className="bg-slate-800 mt-6 p-5 h-[370px] rounded-3xl">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Friend"
                    className="w-[90%] p-3 rounded-3xl bg-slate-700 outline-none text-center"
                />
                
                <div className="mt-5 flex flex-col gap-4 overflow-y-auto scrollbar-hide pr-2 items-center h-[280px]">
                    {friends.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            <p className="text-lg">No friends added yet</p>
                        </div>
                    ) : (
                        friends.filter((friend) => friend.name.toLowerCase().includes(searchTerm.toLowerCase())).map((friend) => {
                            const friendBalance = calculateFriendBalance(friend);
                            const balanceColor = friendBalance >= 0 ? "text-green-400" : "text-red-400";
                            const balancePrefix = friendBalance >= 0 ? "₹" : "-₹";
                            const balanceDisplay = balancePrefix + Math.abs(friendBalance);
                            return (
                                <div key={friend.id} onClick={() => setSelectedFriend(friend)} className="bg-slate-700 p-4 rounded-3xl flex justify-between items-center w-[90%] hover:bg-slate-600 cursor-pointer">
                                    <h2 className="text-lg font-semibold">{friend.name}</h2>
                                    <div className="flex items-center gap-4">
                                        <p className={`text-lg font-bold ${balanceColor}`}>{balanceDisplay}</p>
                                        <button onClick={(e)=>{ e.stopPropagation(); setSelectedFriend(friend); setShowMenu(true); }} className="text-gray-400 text-2xl bg-gray-600 rounded-full w-8 h-8 hover:bg-gray-500 flex items-center justify-center">⋮</button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <button onClick={() => setShowFriendModal(true)} className="w-full mt-5 bg-sky-500 py-3 rounded-2xl text-lg font-semibold active:scale-95 transition cursor-pointer">Add Friend</button>

            {/* Add Friend Modal */}
            {showFriendModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-slate-800 w-[90%] max-w-md p-6 rounded-3xl">
                        <h2 className="text-2xl font-bold text-center">Add Friend</h2>
                        <form onSubmit={addFriend}>
                            <input type="text" value={friendName} onChange={(e) => setFriendName(e.target.value)} placeholder="Enter Friend Name" required className="w-[90%] mt-6 p-3 rounded-xl bg-slate-700 outline-none text-center"/>
                            <div className="flex flex-col items-center gap-4 mt-6">
                                <button type="submit" className="w-[90%] bg-sky-500 py-3 rounded-xl font-semibold active:scale-95 transition cursor-pointer">Add Friend</button>
                                <button type="button" onClick={() => setShowFriendModal(false)} className="w-[90%] bg-red-500 py-3 rounded-xl font-semibold active:scale-95 transition cursor-pointer">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Friend Detail Modal */}
            {selectedFriend && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm overflow-y-auto scrollbar-hide p-4 z-50 flex justify-center items-center">
                    <div className="w-full max-w-md bg-slate-800 rounded-3xl p-4">
                        <div className="bg-slate-800/50 p-5 rounded-3xl text-center">
                            {(() => {
                                const friendBalance = calculateFriendBalance(selectedFriend);
                                const balanceColor = friendBalance >= 0 ? "text-green-400" : "text-red-400";
                                const balancePrefix = friendBalance >= 0 ? "₹" : "-₹";
                                const balanceDisplay = balancePrefix + Math.abs(friendBalance);
                                return (
                                    <p className={`text-xl font-bold mt-1 bg-slate-900/50 p-4 rounded-2xl text-gray-200`}>
                                        {selectedFriend.name} and You Total : <span className={`${balanceColor}`}>{balanceDisplay}</span>
                                    </p>
                                );
                            })()}
                        </div>

                        {/* Chat Style Transactions */}
                        <div className="bg-slate-800/50 p-4 rounded-3xl">
                            {allTransactions.length === 0 ? (
                                <div className="text-center bg-slate-900/50 rounded-3xl min-h-[300px] max-h-[400px] text-gray-400 py-8 overflow-y-auto scrollbar-hide">No transactions yet</div>
                            ) : (
                                <div className="flex flex-col gap-3 bg-slate-900/50 rounded-3xl min-h-[300px] max-h-[350px] overflow-y-auto scrollbar-hide">
                                    {allTransactions.map((transaction) => (
                                        transaction.type === "given" ? (
                                            // Given - Right Side (Green)
                                            <div key={transaction.id} className="flex justify-end ">
                                                <div className="relative w-40 bg-slate-700/20 rounded-2xl p-3 m-3 transition-all active:scale-95">
                                                    <button onClick={() => { setTransactionToDelete({ friendId: selectedFriend.id, transactionId: transaction.id }); setConfirmData({ title: "Delete Transaction?", message: `Delete "${transaction.reason}" of ₹${transaction.amount}?` }); setShowDeleteTransactionPopup(true); }} className="absolute top-1 right-2 w-6 h-6 rounded-full bg-red-500/40 hover:bg-red-500/60 text-white text-xs flex items-center justify-center hover:scale-98">✕</button>
                                                    <div>
                                                        <h3 className="text-white font-semibold text-sm mb-1">{transaction.reason}</h3>
                                                        <p className="text-green-400 font-bold text-lg">+ ₹{transaction.amount}</p>
                                                        <p className="text-xs text-gray-400 mt-1 text-center">{formatDate(transaction.date)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // Taken - Left Side (Red)
                                            <div key={transaction.id} className="flex justify-start">
                                                <div className="relative w-40 bg-slate-700/20 rounded-2xl p-3 m-3 transition-all active:scale-95">
                                                    <button onClick={() => { setTransactionToDelete({ friendId: selectedFriend.id, transactionId: transaction.id }); setConfirmData({ title: "Delete Transaction?", message: `Delete "${transaction.reason}" of ₹${transaction.amount}?` }); setShowDeleteTransactionPopup(true); }} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/40 hover:bg-red-500/60 text-white text-xs flex items-center justify-center hover:scale-98">✕</button>
                                                    <div>
                                                        <h3 className="text-white font-semibold text-sm mb-1">{transaction.reason}</h3>
                                                        <p className="text-red-400 font-bold text-lg">- ₹{transaction.amount}</p>
                                                        <p className="text-xs text-gray-400 mt-1 text-center">{formatDate(transaction.date)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-2">
                            <button onClick={()=>setSelectedAddMore(true)} className="py-3 bg-green-500 hover:bg-green-400 rounded-2xl font-semibold active:scale-95 transition cursor-pointer">➕ Add</button>
                            <button onClick={()=>{ setConfirmData({ title: "Clear History?", message: "All transactions with this friend will be removed." }); setConfirmAction(()=>()=>clearFriendHistory(selectedFriend.id)); setShowConfirmPopup(true); }} className="py-3 bg-red-500 hover:bg-red-400 rounded-2xl font-semibold active:scale-95 transition cursor-pointer">🗑 Clear</button>
                            <button onClick={()=>setSelectedFriend(null)} className="py-3 bg-slate-600 hover:bg-slate-500 rounded-2xl font-semibold active:scale-95 transition cursor-pointer">← Back</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Transaction Popup */}
            {showDeleteTransactionPopup && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[200]">
                    <div className="bg-slate-800 p-6 rounded-3xl w-80 text-center">
                        <h2 className="text-xl font-semibold text-red-400">{confirmData.title}</h2>
                        <p className="text-gray-300 mt-2">{confirmData.message}</p>
                        <div className="flex gap-3 mt-6">
                            <button onClick={()=>{ setShowDeleteTransactionPopup(false); setTransactionToDelete(null); }} className="flex-1 bg-slate-600 py-2 rounded-xl active:scale-95 transition cursor-pointer">Cancel</button>
                            <button onClick={()=>{ if(transactionToDelete) deleteTransaction(transactionToDelete.friendId, transactionToDelete.transactionId); }} className="flex-1 bg-red-500 py-2 rounded-xl active:scale-95 transition cursor-pointer">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* General Confirm Popup */}
            {showConfirmPopup && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[200]">
                    <div className="bg-slate-800 p-6 rounded-3xl w-80 text-center">
                        <h2 className="text-xl font-semibold">{confirmData.title}</h2>
                        <p className="text-gray-400 mt-2">{confirmData.message}</p>
                        <div className="flex gap-3 mt-6">
                            <button onClick={()=> setShowConfirmPopup(false)} className="flex-1 bg-slate-600 py-2 rounded-xl active:scale-95 transition cursor-pointer">Cancel</button>
                            <button onClick={()=>{ if(confirmAction) confirmAction(); setShowConfirmPopup(false); setShowMenu(false); }} className="flex-1 bg-red-500 py-2 rounded-xl active:scale-95 transition cursor-pointer">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Transaction Modal */}
            {selectedAddMore && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[100]">
                    <div className="bg-slate-800 w-[90%] max-w-md p-6 rounded-3xl">
                        <h2 className="text-2xl font-bold text-center">Add Record</h2>
                        <form onSubmit={addTransaction}>
                            <input type="number" placeholder="Enter Amount" required value={transactionData.amount} onChange={(e)=> setTransactionData({...transactionData, amount: e.target.value})} className="w-[90%] mt-6 p-3 rounded-xl bg-slate-700 outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <label className="bg-slate-700 p-3 rounded-xl flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="transactionType" required value="given" checked={transactionData.type === "given"} onChange={(e)=> setTransactionData({...transactionData, type: e.target.value})}/> Given
                                </label>
                                <label className="bg-slate-700 p-3 rounded-xl flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="transactionType" required value="taken" checked={transactionData.type === "taken"} onChange={(e)=> setTransactionData({...transactionData, type: e.target.value})}/> Taken
                                </label>
                            </div>
                            <input type="text" placeholder="Enter Reason" required value={transactionData.reason} onChange={(e)=> setTransactionData({...transactionData, reason: e.target.value})} className="w-[90%] mt-4 p-3 rounded-xl bg-slate-700 outline-none text-center"/>
                            <input type="date" required value={transactionData.date} onChange={(e)=> setTransactionData({...transactionData, date: e.target.value})} className="w-[90%] mt-4 p-3 rounded-xl bg-slate-700 outline-none"/>
                            <div className="flex gap-4 mt-6">
                                <button type="submit" className="flex-1 bg-green-500 py-3 rounded-xl font-semibold active:scale-95 transition cursor-pointer">Add Record</button>
                                <button type="button" onClick={() => setSelectedAddMore(false)} className="flex-1 bg-red-500 py-3 rounded-xl font-semibold active:scale-95 transition cursor-pointer">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Menu Popup */}
            {showMenu && selectedFriend && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-slate-800 w-[90%] max-w-md p-6 rounded-3xl flex flex-col items-center gap-3">
                        <button onClick={()=>{ setConfirmData({ title:"Delete Friend?", message:"All transactions and friend will be removed." }); setConfirmAction(()=>()=> deleteFriend(selectedFriend.id)); setShowConfirmPopup(true); setShowMenu(false); }} className="w-[80%] bg-red-500 py-3 rounded-xl hover:bg-red-400 active:scale-95 transition cursor-pointer">Delete Friend</button>
                        <button onClick={()=>{ setConfirmData({ title:"Clear History?", message:"All transactions with this friend will be removed." }); setConfirmAction(()=>()=> clearFriendHistory(selectedFriend.id)); setShowConfirmPopup(true); setShowMenu(false); }} className="w-[80%] bg-sky-500 py-3 rounded-xl hover:bg-sky-400 active:scale-95 transition cursor-pointer">Clear History</button>
                        <button onClick={()=>setShowMenu(false)} className="w-[80%] bg-gray-500 py-3 rounded-xl hover:bg-gray-400 active:scale-95 transition cursor-pointer">Close</button>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 w-full bg-slate-800 px-4 py-3 flex justify-between items-center border-t border-slate-700">
                <button onClick={()=>setCurrentPage("home")} className="border border-slate-600 px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition font-medium text-gray-300 cursor-pointer">
                    <span className="text-lg">🏠</span>
                    <span className="text-sm">Home</span>
                </button>
                <button onClick={()=>setCurrentPage("balance")} className="border border-slate-600 px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition font-medium text-sky-400 cursor-pointer">
                    <span className="text-lg">👥</span>
                    <span className="text-sm">Balances</span>
                </button>
                <button onClick={()=>setCurrentPage("history")} className="border border-slate-600 px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition font-medium text-gray-300 cursor-pointer">
                    <span className="text-lg">📜</span>
                    <span className="text-sm">History</span>
                </button>
            </div>

        </div>
    )
}

export default Balance