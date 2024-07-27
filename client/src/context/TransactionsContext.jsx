import React, { useEffect, useState } from 'react';
import { ethers} from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;
// console.log('Window Ethereum:', window.ethereum); // should not be undefined
// console.log('Ethers:', ethers); // should not be undefined


const createEthereumContract = () => {
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;
}


export const TransactionsProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [formData,setFormData] = useState({
        addressTo:"",
        amount:"",
        keyword:"",
        message:""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));

    const handleChange = (e, name) =>{
        setFormData((prevState)=>({ ...prevState, [name]: e.target.value}));
    }

    const getAllTransactions = async () =>{
        try {
            if(!ethereum) return alert('Please install metamsk');
            const transactionContract = createEthereumContract();

            const availableTransactions = await transactionContract.getAllTransactions();
            
            const structuredTransactions = availableTransactions.map((transaction)=>({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber * 1000).toString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) * ( 10 ** 18 )
            }))
            console.log(availableTransactions)
        } catch (error) {
            console.log(error);
        }
    }


    const checkIfWalletIsConnected = async () =>{
        try {
            if(!ethereum) return alert('Please install metamsk');

            const accounts = await ethereum.request({method:"eth_accounts"});

            if(accounts.length){
                setCurrentAccount(accounts[0]);
                // console.log(currentAccount);

            getAllTransactions();
            }
            else{
                console.log("no Accounts Found!!!");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const checkIfTransactionsExist = async ()=>{
        try {
            const transactionContract = createEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem('transaction count',transactionCount);
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object.")
        }
    }
    const connectWallet = async () =>{
        try {
            if(!ethereum) return alert('Please install metamask');

            const accounts = await ethereum.request({method:"eth_requestAccounts",});
            // console.log(accounts);

            setCurrentAccount(accounts[0]);
            // return alert(`account connected : ${currentAccount}`);
            // setCurrentAccount('0x8e71f65cB8512c70caa005FD3F487CCe99e04Ce2');
            
        } catch (error) {
            console.log(error)

            throw new Error("No ethereum object.")
        }
    }

    const sendTransaction = async () =>{
        try {
            if(!ethereum) return alert('Please install metamask');

            console.log('into send Transaction');
            const { addressTo, amount, keyword, message} = formData;
            const transactionContract = createEthereumContract();
            const parsedAmount = ethers.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params:[{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value: parsedAmount._hex,
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo,parsedAmount,message,keyword);

            setIsLoading(true);
            console.log(`Loading- ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success- ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object.")
        }
    }

    useEffect(()=>{
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    },[])

    return (
        <TransactionContext.Provider value={{connectWallet, currentAccount, formData,handleChange ,sendTransaction}}>
            {children}
        </TransactionContext.Provider>
    )
}