const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const fs = require('fs')
const express = require('express')
const app = express()
const config = JSON.parse(fs.readFileSync('config.json'))

// connect to Infura node
const web3 = new Web3(new Web3.providers.HttpProvider(config.infuraurl))
const random = new web3.eth.Contract(config.abi, config.smaddr)

function sendSigned(txData, cb) {
  const privateKey = Buffer.from(config.privkey, 'hex')
  const transaction = new Tx(txData)
  transaction.sign(privateKey)
  const serializedTx = transaction.serialize().toString('hex')
  web3.eth.sendSignedTransaction('0x' + serializedTx, cb)
}

app.get('/run/:id', function (req, res) {
  const id=req.params.id
  random.methods.genNumber(id).call().then(number => {
    console.log(number)
    return web3.eth.getTransactionCount(config.addr)
  }).then(txCount => {
    if (txCount) {
      var num = web3.utils.toHex(id)
      num = num.split('0x')[1]
      var prefix = "0x6ab101f1"
      var numlength = num.length
      var prefixlength = prefix.length
      var l = 74-numlength-prefixlength
      for (i = 0; i < l; i++) { 
            prefix+='0'
      }
      prefix+=num
      const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(config.gasLimit),
        gasPrice: web3.utils.toHex(config.gasPrice),
        to: config.smaddr,
        from: config.addr,
        data: prefix,
        value: web3.utils.toHex(0)
      }

      sendSigned(txData, function (err, result) {
        if (err) return res.status(200).send('error'+ err)
        console.log('sent - tx: ', result)
        res.status(200).send('sent - tx: '+result);
      })
    }
  }).catch(function (e) {
    res.status(200).send(e);
  })
}); 

app.listen(3000, () => console.log('App listening on port 3000!'))
//0x6ab101f1000000000000000000000000000000000000000000000000000000000000b26e
//0x6ab101f1000000000000000000000000000000000000000000000000000000000000b26e
//0x6ab101f100000000000000000000000000000000000000000000000000000000000012d687