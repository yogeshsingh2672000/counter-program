import React, { useEffect, useState } from "react";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, Provider } from "@project-serum/anchor";
import idl from "./idl.json";
import "./App.css";

// Constants
const programId = new PublicKey(idl.metadata.address);
const baseAccount = Keypair.generate();

const App = () => {
  const [counter, setCounter] = useState(null);
  const [wallet, setWallet] = useState(null);

  const connectWallet = async () => {
    const response = await window.solana.connect();
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
    const network = "http://localhost:8899";
    const connection = new Connection(network, "processed");

    const provider = new Provider(connection, window.solana, "processed");
    return provider;
  };

  const createCounter = async () => {
    // const baseAccount = Keypair.generate();
    const provider = getProvider();
    if (!provider) {
      return "provider is Empty";
    }
    // if (counter) {
    //   return;
    // }
    const program = new Program(idl, programId, provider);
    try {
      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log("new account is created", baseAccount.publicKey.toString());
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      setCounter(account.count.toString());
    } catch (err) {
      console.log("Transaction Error: ", err);
    }
  };

  const incrementCounter = async () => {
    // const baseAccount = Keypair.generate();
    const provider = getProvider();
    if (!provider) {
      return "provider is Empty";
    }
    const program = new Program(idl, programId, provider);

    try {
      await program.rpc.increment({
        accounts: {
          baseAccount: baseAccount.publicKey,
        },
      });
      console.log("new account is created", baseAccount.publicKey.toString());
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      setCounter(account.count.toString());
    } catch (err) {
      console.log("Transaction Error: ", err);
    }
  };

  const decrementCounter = async () => {
    // const baseAccount = Keypair.generate();
    const provider = getProvider();
    if (!provider) {
      return "provider is Empty";
    }
    const program = new Program(idl, programId, provider);

    try {
      await program.rpc.decrement({
        accounts: {
          baseAccount: baseAccount.publicKey,
        },
      });
      console.log("new account is created", baseAccount.publicKey.toString());
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
      <h1>hello world</h1>
      <div>
        <button
          style={{ height: "3rem", width: "10rem", cursor: "pointer" }}
          onClick={decrementCounter}
        >
          Decerment Counter
        </button>
        <button
          style={{ height: "3rem", width: "10rem", cursor: "pointer" }}
          onClick={createCounter}
        >
          Create Counter
        </button>
        <button
          style={{ height: "3rem", width: "10rem", cursor: "pointer" }}
          onClick={incrementCounter}
        >
          Incerment Counter
        </button>
      </div>
      <span>Counter: {counter}</span>
    </div>
  );
};

export default App;
