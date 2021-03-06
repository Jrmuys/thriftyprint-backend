function CartItem(
  model,
  price = '0.0',
  imgUrl,
  itemTotal = '0.0',
  printStatus = "NA",
  boundingVolume
) {
  console.log(`CART ITEM CONSTRUCTOR\nPrice = ${price} which is of type ${typeof price}\t will set with ${String(price)}\nitemTotal = ${itemTotal}`)
  this.model = model;
  this.price = price;
  this.imgUrl = imgUrl;
  this.itemTotal = itemTotal;
  this.printStatus = printStatus;
  this.boundingVolume = boundingVolume;
  console.log(`%cRESULT\nthis.price = ${this.price} which is of type ${typeof this.price}\nthis.itemTotal = ${this.itemTotal}`, 'background: #222; color: #bada55')
}

module.exports = CartItem;
