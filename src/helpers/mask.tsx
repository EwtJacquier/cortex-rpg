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

export const maskDate = (date: Date, time = false) => {
  const yyyy = date.getFullYear();

  let mm: string | number = date.getMonth() + 1
  let dd: string | number = date.getDate()
  let hh: string | number = date.getHours()
  let ii: string | number = date.getMinutes()

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  if (hh < 10) hh = '0' + hh;
  if (ii < 10) ii = '0' + ii;

  return `${dd}/${mm}/${yyyy}` + (time ? ` \às ${hh}:${ii}` : '')
}