import { airdropIfRequired } from '@solana-developers/helpers'
import * as web3 from '@solana/web3.js'
import * as token from '@solana/spl-token'
import { getKeypairFromEnvironment } from '@solana-developers/helpers'
import 'dotenv/config'
const { createHash } = require('crypto')

import { Trade } from '../src/app/classes/Trade'

console.log('Starting script...')

// generate new keypair & pubkey for cli wallet
const rando = web3.Keypair.generate()
const randoKey = rando.publicKey.toBase58()

const wallet = getKeypairFromEnvironment('NEXT_PUBLIC_SECRET_KEY_ONLY_PHANTOM_ON_CLI')
const walletKey = wallet.publicKey.toBase58()

// connect to localhost
const connection = new web3.Connection('http://127.0.0.1:8899')
await airdropIfRequired(
  connection,
  rando.publicKey,
  100 * web3.LAMPORTS_PER_SOL,
  1 * web3.LAMPORTS_PER_SOL,
)

await airdropIfRequired(
  connection,
  wallet.publicKey,
  100 * web3.LAMPORTS_PER_SOL,
  1 * web3.LAMPORTS_PER_SOL,
)

console.log('Minting tokens...')

// Create mAtlas token mint
const mAtlasMint = await token.createMint(
  connection,
  rando,
  rando.publicKey,
  rando.publicKey,
  8,
)

console.log('mAtlas:', mAtlasMint)

// Create mAtlas ATAs for wallet and rando accounts
// Wallet
const mAtlasATAWallet = await token.createAssociatedTokenAccount(
  connection,
  wallet,
  mAtlasMint,
  wallet.publicKey,
)
console.log('ATA:', mAtlasATAWallet)

// Rando
const mAtlasATARando = await token.createAssociatedTokenAccount(
  connection,
  rando,
  mAtlasMint,
  rando.publicKey,
)

const mAtlasWalletTA = await token.createAccount(
  connection,
  wallet,
  mAtlasMint,
  wallet.publicKey,
  web3.Keypair.generate()
)
console.log('TA:', mAtlasWalletTA)

// Mint 1000 mAtlas into both ATA accounts
// Wallet
const txsigAtlasWallet = await token.mintTo(
  connection,
  wallet,
  mAtlasMint,
  mAtlasATAWallet,
  rando,
  100000000000,
)

// Rando
// const txsigAtlasRando = await token.mintTo(
//   connection,
//   rando,
//   mAtlasMint,
//   mAtlasATARando,
//   rando,
//   100000000000,
// )

// Transfer tokens from wallet ATA to wallet TA
const txSigProgramToWallet = await token.transfer(
  connection,
  wallet,
  mAtlasATAWallet,
  mAtlasWalletTA,
  wallet.publicKey,
  1000000000,
)

console.log((await connection.getTokenAccountBalance(mAtlasWalletTA)).value.uiAmount)

const programEscrowPDA = web3.PublicKey.createProgramAddressSync(
  [Buffer.from('tempescrowpda')],
  new web3.PublicKey(process.env.NEXT_PUBLIC_LOCALHOST_PROGRAM_ID),
)
console.log('PDA:', programEscrowPDA)

// Transfer ownership of temp TA
const txSigSetNewAuth = await token.setAuthority(
  connection,
  wallet,
  mAtlasWalletTA,
  wallet.publicKey,
  token.AuthorityType.AccountOwner,
  programEscrowPDA,
)

console.log((await connection.getTokenAccountBalance(mAtlasATAWallet)).value.uiAmount)
console.log((await connection.getTokenAccountBalance(mAtlasWalletTA)).value.uiAmount)
console.log((await connection.getTokenAccountBalance(mAtlasATARando)).value.uiAmount)

// // Create mPolis token mint
// const mPolisMint = await token.createMint(
//   connection,
//   rando,
//   rando.publicKey,
//   rando.publicKey,
//   8,
// )

// console.log('mPolis:', mPolisMint)

// // Create mPolis ATAs for wallet and rando accounts
// // Wallet
// const mPolisATAWallet = await token.createAssociatedTokenAccount(
//   connection,
//   wallet,
//   mPolisMint,
//   wallet.publicKey,
// )

// // Rando
// const mPolisAtaRando = await token.createAssociatedTokenAccount(
//   connection,
//   rando,
//   mPolisMint,
//   rando.publicKey,
// )

// // Mint 1000 mPolis into both ATA accounts
// // Wallet
// const txsigPolisWallet = await token.mintTo(
//   connection,
//   wallet,
//   mPolisMint,
//   mPolisATAWallet,
//   rando,
//   100000000000,
// )

// // Rando
// const txsigPolisRando = await token.mintTo(
//   connection,
//   rando,
//   mPolisMint,
//   mPolisAtaRando,
//   rando,
//   100000000000,
// )

// // Create mFood token mint
// const mFoodMint = await token.createMint(
//   connection,
//   rando,
//   rando.publicKey,
//   rando.publicKey,
//   8,
// )

// console.log('mFood:', mFoodMint)

// // Create mFood ATAs for wallet and rando accounts
// // Wallet
// const mFoodATAWallet = await token.createAssociatedTokenAccount(
//   connection,
//   wallet,
//   mFoodMint,
//   wallet.publicKey,
// )

// // Rando
// const mFoodAtaRando = await token.createAssociatedTokenAccount(
//   connection,
//   rando,
//   mFoodMint,
//   rando.publicKey,
// )

// // Mint 1000 mFood into both ATA accounts
// // Wallet
// const txsigFoodWallet = await token.mintTo(
//   connection,
//   wallet,
//   mFoodMint,
//   mFoodATAWallet,
//   rando,
//   100000000000,
// )

// // Rando
// const txsigFoodRando = await token.mintTo(
//   connection,
//   rando,
//   mFoodMint,
//   mFoodAtaRando,
//   rando,
//   100000000000,
// )

// // Create mFuel token mint
// const mFuelMint = await token.createMint(
//   connection,
//   rando,
//   rando.publicKey,
//   rando.publicKey,
//   8,
// )

// console.log('mFuel:', mFuelMint)

// // Create mFuel ATAs for wallet and rando accounts
// // Wallet
// const mFuelATAWallet = await token.createAssociatedTokenAccount(
//   connection,
//   wallet,
//   mFuelMint,
//   wallet.publicKey,
// )

// // Rando
// const mFuelAtaRando = await token.createAssociatedTokenAccount(
//   connection,
//   rando,
//   mFuelMint,
//   rando.publicKey,
// )

// // Mint 1000 mFuel into both ATA accounts
// // Wallet
// const txsigFuelWallet = await token.mintTo(
//   connection,
//   wallet,
//   mFuelMint,
//   mFuelATAWallet,
//   rando,
//   100000000000,
// )

// // Rando
// const txsigFuelRando = await token.mintTo(
//   connection,
//   rando,
//   mFuelMint,
//   mFuelAtaRando,
//   rando,
//   100000000000,
// )

console.log('Tokens minted.')
console.log('Creating trades...')

// submit new trades created by new key pair
// await createTrade(randoKey, mPolisMint.toString(), mPolisAtaRando, 1, walletKey, mFoodMint.toString(), 1, rando, 1,)
// await createTrade(randoKey, mPolisMint.toString(), mPolisAtaRando, 2, walletKey, mFuelMint.toString(), 2, rando, 2,)

// submit trades created by phantom address on solana cli
// await createTrade(walletKey, mAtlasMint.toString(), mAtlasATAWallet, 3, randoKey, mFoodMint.toString(), 3, wallet, 3,)
// await createTrade(walletKey, mAtlasMint.toString(), mAtlasATAWallet, 4, randoKey, mFuelMint.toString(), 4, wallet, 4,)

console.log('Trades created.')

console.log('Script finished!')

// function to create new trade
async function createTrade(user, userAsset, userAssetATA, userAssetAmount, partner, partnerAsset, partnerAssetAmount, signer, index,) {
  const trade = new Trade(
    user,
    userAsset,
    userAssetAmount,
    partner,
    partnerAsset,
    partnerAssetAmount,
  )
  const buffer = trade.serialize()

  const tx = new web3.Transaction()

  // Create PDA Accounts
  // User
  let hash = createHash('sha256').update(user + index).digest('hex')
  const [userPda] = await web3.PublicKey.findProgramAddressSync(
    [Buffer.from(hash.substring(0, 32))],
    new web3.PublicKey(process.env.NEXT_PUBLIC_LOCALHOST_PROGRAM_ID),
  )

  // Partner
  hash = createHash('sha256').update(partner + index).digest('hex')
  const [partnerPda] = await web3.PublicKey.findProgramAddressSync(
    [Buffer.from(hash.substring(0, 32))],
    new web3.PublicKey(process.env.NEXT_PUBLIC_LOCALHOST_PROGRAM_ID),
  )

  // Index
  const [indexPda] = await web3.PublicKey.findProgramAddressSync(
    [Buffer.from('tradeindex')],
    new web3.PublicKey(process.env.NEXT_PUBLIC_LOCALHOST_PROGRAM_ID),
  )

  // Create escrow

  // Create Create Trade Instruction
  const inst = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: signer.publicKey,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: userPda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: partnerPda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: indexPda,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: new web3.PublicKey(userAsset),
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: userAssetATA,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: new web3.PublicKey(partnerAsset),
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: new web3.PublicKey(process.env.NEXT_PUBLIC_LOCALHOST_PROGRAM_ID,),
    data: buffer,
  })

  tx.add(inst)

  // Create transfer instruction


  try {
    const txSig = await web3.sendAndConfirmTransaction(connection, tx, [signer],)
    console.log('trade created', txSig)
  } catch (e) {
    console.log(JSON.stringify(e))
  }
}
