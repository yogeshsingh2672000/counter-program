import React, { useEffect, useState } from "react";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, Provider } from "@project-serum/anchor";
import idl from "./idl.json";
import "./App.css";

// Constants
const programId = new PublicKey(idl.metadata.address);
const baseAccount = Keypair.generate(); // one KeyPair per address

const App = () => {
  const [counter, setCounter] = useState(null); // stores the counter data
  const [wallet, setWallet] = useState(null);

  const connectWallet = async () => {
    const response = await window.solana.connect(); // request user to connect there wallet and set wallet below
    setWallet(response.publicKey.toString());
  };
  const checkWalletIsConnected = async () => {
    if (window.solana.isPhantom) {
      console.log("Phantom wallet is present");
      connectWallet();
    } else {
      console.log("Please install Phantom wallet");
    }
  };

  const getProvider = () => {
    const network = "http://localhost:8899"; // local cluster network
    const connection = new Connection(network, "processed");

    const provider = new Provider(connection, window.solana, "processed"); // connection, payers wallet, when did you want to get confirmation
    return provider;
  };

  const createCounter = async () => {
    const provider = getProvider();
    if (!provider) {
      return "provider is Empty";
    }

    const program = new Program(idl, programId, provider); //making a bridge between onchain program and offchain code to interact with solana program
    try {
      // calling the initialize fucntion which is signed by the baseAccount keypair generate above and provide user wallet address whoz creating new account while calling this function, will be charged
      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey, // payer whoz paying for creating an account
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount], // sign using the newly account created
      });

      // fetching the updated value from onchain program
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      setCounter(account.count.toString());
    } catch (err) {
      console.log("Transaction Error: ", err);
    }
  };

  const incrementCounter = async () => {
    const provider = getProvider();
    if (!provider) {
      return "provider is Empty";
    }
    const program = new Program(idl, programId, provider);

    try {
      // calling increment function which is automatically singed by the baseAccount and sol will be charged from the that user who created the new account
      await program.rpc.increment({
        accounts: {
          baseAccount: baseAccount.publicKey,
        },
      });
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      setCounter(account.count.toString());
    } catch (err) {
      console.log("Transaction Error: ", err);
    }
  };

  const decrementCounter = async () => {
    const provider = getProvider();
    if (!provider) {
      return "provider is Empty";
    }
    const program = new Program(idl, programId, provider);

    try {
      // calling decrement function everything is same as calling increment function
      await program.rpc.decrement({
        accounts: {
          baseAccount: baseAccount.publicKey,
        },
      });
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      setCounter(account.count.toString());
    } catch (err) {
      console.log("Transaction Error: ", err);
    }
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <h1>Counter: {!counter ? <span>click below</span> : counter}</h1>
      <div>
        {!counter ? (
          ""
        ) : (
          <>
            <button
              style={{ height: "3rem", width: "10rem", cursor: "pointer" }}
              onClick={decrementCounter}
            >
              Decrement
            </button>
            <button
              style={{ height: "3rem", width: "10rem", cursor: "pointer" }}
              onClick={incrementCounter}
            >
              Increment
            </button>
          </>
        )}
        {!counter ? (
          <button
            style={{ height: "3rem", width: "10rem", cursor: "pointer" }}
            onClick={createCounter}
          >
            Create Counter
          </button>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default App;
