'use client'

export const maskPhone = (phone: string) => {
  if (!phone) return "";

  phone = phone.replace(/\D/g,'');
  phone = phone.replace(/(\d{2})(\d)/,"($1) $2");
  phone = phone.replace(/(\d)(\d{4})$/,"$1-$2");

  return phone;
}

export const maskPrice = (price: number, hideZero: boolean = false) => {
  let newPrice = price.toFixed(2).replace('.',',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

  if (hideZero && newPrice.indexOf(',00') > -1){
      newPrice = newPrice.replace(',00','');
  }

  return 'R$ ' + newPrice;
}

export const maskDecimal = (number: number) => {
  return number.toFixed(1).replace('.',',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

export const unmaskPhone = (text: string) => {
  return text.replace(/[^\w\s]/gi, '').replace(/\s/g,'');
}