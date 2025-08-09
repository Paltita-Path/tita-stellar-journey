// Pequeño wrapper para emitir el TITA Builder Badge en testnet desde el cliente (solo pruebas)
// IMPORTANTE: No uses secretos en el frontend en producción. Usa una función de borde con Supabase Secrets.

export async function issueBadge({ issuingSecret, receiverPublicKey }: { issuingSecret: string; receiverPublicKey: string; }) {
  const Stellar = (await import('stellar-sdk')) as any;
  const server = new Stellar.Server('https://horizon-testnet.stellar.org');
  const issuingKeypair = Stellar.Keypair.fromSecret(issuingSecret);

  const assetCode = 'TITABADGE';
  const asset = new Stellar.Asset(assetCode, issuingKeypair.publicKey());

  const account = await server.loadAccount(issuingKeypair.publicKey());
  const tx = new Stellar.TransactionBuilder(account, {
    fee: Stellar.BASE_FEE,
    networkPassphrase: Stellar.Networks.TESTNET,
  })
    .addOperation(Stellar.Operation.payment({
      destination: receiverPublicKey,
      asset,
      amount: '1',
    }))
    .setTimeout(60)
    .build();

  tx.sign(issuingKeypair);
  const result = await server.submitTransaction(tx);
  return result; // { hash, ... }
}
