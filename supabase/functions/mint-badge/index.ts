// Supabase Edge Function: mint-badge
// Issues a payment of a custom asset (TITABADGE) on Stellar Testnet from issuing account to receiver
// Requires secrets: STELLAR_ISSUING_SECRET, STELLAR_ISSUING_PUBLIC_KEY
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import StellarSdk from "npm:stellar-sdk";

const ISSUING_SECRET = Deno.env.get("STELLAR_ISSUING_SECRET")!;
const ISSUING_PUBLIC = Deno.env.get("STELLAR_ISSUING_PUBLIC_KEY")!;

serve(async (req) => {
  try {
    const { receiverPublicKey, userId } = await req.json();
    if (!receiverPublicKey) return new Response(JSON.stringify({ error: "receiverPublicKey required" }), { status: 400 });

    const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
    const issuingKeypair = StellarSdk.Keypair.fromSecret(ISSUING_SECRET);
    if (issuingKeypair.publicKey() !== ISSUING_PUBLIC) {
      return new Response(JSON.stringify({ error: "Issuing pub/secret mismatch" }), { status: 500 });
    }

    const asset = new StellarSdk.Asset("TITABADGE", ISSUING_PUBLIC);
    const account = await server.loadAccount(issuingKeypair.publicKey());

    const memoText = `TITA Badge | ${userId ?? "anon"} | ${new Date().toISOString()}`.slice(0, 28);

    const tx = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: receiverPublicKey,
        asset,
        amount: "1",
      }))
      .addMemo(StellarSdk.Memo.text(memoText))
      .setTimeout(60)
      .build();

    tx.sign(issuingKeypair);
    const result = await server.submitTransaction(tx);

    return new Response(JSON.stringify({ hash: result.hash }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
