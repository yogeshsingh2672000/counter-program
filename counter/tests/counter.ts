import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { assert } from "chai";
import { Counter } from '../target/types/counter';

describe("counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const program = anchor.workspace.Counter as Program<Counter>;
  let baseAccount = anchor.web3.Keypair.generate();

  it("initialize the counter", async () => {
    await program.methods.initialize().accounts({
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([baseAccount]).rpc();

    const createdCounter = await program.account.baseAccount.fetch(baseAccount.publicKey);

    assert.strictEqual(createdCounter.count.toNumber(), 0)
  });

  it("increment the counter", async () => {
    await program.methods.increment().accounts({baseAccount: baseAccount.publicKey}).signers([]).rpc();
    const incrementedCounter = await program.account.baseAccount.fetch(baseAccount.publicKey);
    assert.strictEqual(incrementedCounter.count.toNumber(), 1);
  });

  it("decrement the counter", async () => {
    await program.methods.decrement().accounts({baseAccount: baseAccount.publicKey}).signers([]).rpc();
    const decrementedCounter = await program.account.baseAccount.fetch(baseAccount.publicKey);
    assert.strictEqual(decrementedCounter.count.toNumber(), 0);
  });
});
