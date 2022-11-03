import React, { useEffect, useState } from "react";
import { Connection, Keypair, SystemProgram } from "@solana/web3.js";
import { Program, Provider } from "@project-serum/anchor";
import idl from "./idl.json";
import "./App.css";

// Constants
const baseAccount = Keypair.generate();
const programId = idl.metadata.address;
const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  // const [wallet, setWallet] = useState(null);

  const connectWallet = async () => {
    const response = await window.solana.connect();
    setWalletAddress(response.publicKey.toString());
    // setWallet(response.wallet);
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

    const provider = new Provider(connection, walletAddress, {
      preflightCommitment: "processed",
    });
    return provider;
  };

  const fetchCounter = async () => {
    const provider = getProvider();
    if (!provider) {
      return "provider is Empty";
    }
    const program = new Program(idl, programId, provider);
    console.log(provider);
    console.log("hello");
    try {
      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );
      console.log("account: ", account);
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
      <button onClick={fetchCounter}>asdfasdfasdfasdfasdfasd</button>
    </div>
  );
};

export default App;
