import level from 'level'
import { nanoid } from 'nanoid'

const db = level('sales-db', { valueEncoding: 'json' })
const products = ['book', 'game', 'app', 'song', 'movie']

async function populate () {
  const batch = db.batch()

  for (let i = 0; i < 100000; i++) {
    batch.put(nanoid(), {
      amount: Math.ceil(Math.random() * 100),
      product: products[Math.floor(Math.random() * 5)]
    })
  }

  await batch.write()

  console.log('DB populated')
}

db.clear(() => {
  populate()
})
