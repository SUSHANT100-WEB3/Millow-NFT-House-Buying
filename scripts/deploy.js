const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Get the signers directly from the hardhat network
  const [buyer, seller, inspector, lender] = await hre.ethers.getSigners()

  const RealEstate = await hre.ethers.getContractFactory('RealEstate')
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()

  console.log(`Deployed Real Estate Contract at: ${realEstate.address}`)
  console.log(`Minting 3 properties...\n`)

  for (let i = 0; i < 3; i++) {
    const transaction = await realEstate.connect(seller).mint(`https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`)
    await transaction.wait()
  }

  const Escrow = await hre.ethers.getContractFactory('Escrow')
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  )
  await escrow.deployed()

  console.log(`Deployed Escrow Contract at: ${escrow.address}`)
  console.log(`Listing 3 properties...\n`)

  for (let i = 0; i < 3; i++) {
    let transaction = await realEstate.connect(seller).approve(escrow.address, i + 1)
    await transaction.wait()
  }

  transaction = await escrow.connect(seller).list(1, buyer.address, tokens(20).toString(), tokens(10).toString())
  await transaction.wait()

  transaction = await escrow.connect(seller).list(2, buyer.address, tokens(15).toString(), tokens(5).toString())
  await transaction.wait()

  transaction = await escrow.connect(seller).list(3, buyer.address, tokens(10).toString(), tokens(5).toString())
  await transaction.wait()

  console.log(`Finished.`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});