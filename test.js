function sayHi() {
  console.log(this.name);
}
sayHi.test = 5;
let bound = sayHi.bind({ name: "John" });

console.log(bound());
// function partial(func, ...argsBound) {
//   return function (...args) {
//     return func.call(this, ...argsBound, ...args);
//   };
// }
// let user = {
//   firstName: "John",
//   say(time, phrase) {
//     console.log(`[${time}] ${this.firstName}: ${phrase}`);
//   },
// };

// user.sayNow = partial(
//   user.say,
//   new Date().getHours() + ":" + new Date().getMinutes()
// );
// user.sayNow("hello");

// function mul(a, b) {
//   return a * b;
// }
// let double = mul.bind(null, 4);
// console.log(double(3));
// let user = {
//   firstName: "John",
//   hi(phrase) {
//     console.log(`${phrase}  ${this.firstName}`);
//   },
//   bye(phrase) {
//     console.log(`${phrase}  ${this.firstName}`);
//   },
// };

// for (let key in user) {
//   if (typeof user[key] === "function") {
//     user[key] = user[key].bind(user);
//   }
// }
// user.hi("hello");
// let user = {
//   firstName: "John",
// };
// function sayHi() {
//   console.log(this.firstName);
// }
// let func = sayHi.bind(user);
// setTimeout(func, 1000);
// user = {
//   sayHi() {
//     console.log("bbb");
//   },
// };
// user.sayHi();
// setTimeout(() => {
//   user.sayHi();
// }, 1000);
// const result = {
//   date: "2024-09-18",
//   eur: {
//     "1000sats": 3829.4922872,
//     "1inch": 4.65631859,
//     aave: 0.0079913615,
//     ada: 3.33289684,
//     aed: 4.08594635,
//     afn: 77.22731742,
//     agix: 1.91852983,
//     akt: 0.45613731,
//     algo: 9.02286915,
//     all: 99.27191515,
//     amd: 428.59454959,
//     amp: 302.60477707,
//     ang: 1.99448734,
//     aoa: 1041.76799657,
//     ape: 1.48100794,
//     apt: 0.18811292,
//     ar: 0.060702667,
//     arb: 2.14380992,
//     ars: 1069.5243187,
//     atom: 0.2668824,
//     ats: 13.7603,
//     aud: 1.64475723,
//     avax: 0.046907716,
//     awg: 1.9915164,
//     axs: 0.23909118,
//     azm: 9456.67442221,
//     azn: 1.89133488,
//     bake: 4.57272314,
//     bam: 1.95583,
//     bat: 6.36154023,
//     bbd: 2.22515798,
//   },
// };
// console.log(result.eur.axs);
// const obj = {};
// const arr = [1, 2, 3];
// for (let i = 0; i < 30; i += 2) {
//   obj[i] = arr;
// }
// console.log(obj);

// const objArray = [
//   { name: "aaa", age: 30, check: true },
//   { name: "bbb", age: 33, check: false },
//   { name: "ggg", age: 10, check: true },
//   { name: "ccc", age: 20, check: true },
//   { name: "ddd", age: 10, check: false },
//   { name: "eee", age: 10, check: true },
//   { name: "fff", age: 10, check: false },
// ];
// let total = [];
// let array = [];
// objArray.forEach((obj, index) => {
//   if (obj.check) {
//     array.push(index);
//   }
// });
// array = [...array, objArray.length];
// for (let i = 0; i < array.length; i++) {
//   let arr = new Array(0);
//   for (let j = array[i]; j < array[i + 1]; j++) {
//     arr.push(objArray[j]);
//   }
//   let obj = { i };
//   console.log(obj);
//   total.push(arr);
// }
// total.pop();
// console.log(total[4]);

// console.log(array);

// for (let i = 0; i < array.length; i++) {
//   for (let j = i; j <= array[i + 1]; j++) {
//     arr.push(array[j]);
//   }
// }
// console.log(arr);
// const oldobj = { name: "aaa", age: 30 };
// const newobj = { name: "eee", age: 50 };
// let idx = objArray.findIndex(
//   (array) => JSON.stringify(array) === JSON.stringify(oldobj)
// );
// objArray.splice(idx, 1, newobj);
// console.log(objArray);
// // const str = "h2o add-on rx (orange)";
// // const str = "bp tc1 add-on rx";
// const str = "dummy launcher";
// let lastIndex = str.search(/launcher/);
// let color = str.match(/(?<=\()\w+(?=\))/);
// console.log(lastIndex, color);
// if (lastIndex) {
//   let newname = str.substring(0, lastIndex);
//   console.log(newname + "add (" + color[0][0] + ")");
// }
//결과값이 0보다 크면
// console.log(/add/i.test(str));

// const objArr = [
//   { id: 1, name: "aaa", amount: 10, moq: 10, price: 10 },
//   { id: 2, name: "bbb", amount: 11, moq: 10, price: 9 },
//   { id: 3, name: "ccc", amount: 12, moq: 10, price: 8 },
//   { id: 4, name: "ddd", amount: 6, moq: 10, price: 9 },
// ];
// const newObjArr = [...objArr];
// newObjArr.forEach((obj) => {
//   if (obj.amount % obj.moq) {
//     if (obj.amount % obj.moq === obj.amount) {
//       if ((obj.amount / obj.moq) * 100 > 50) {
//       } else {
//         const idx = objArr.findIndex((newobj) => newobj.name === obj.name);

//         objArr.splice(idx, 1);
//         objArr.push({
//           id: obj.id,
//           name: obj.name,
//           amount: obj.amount % obj.moq,
//           moq: obj.moq,
//           price: obj.price,
//         });
//       }
//     } else {
//       const idx = objArr.findIndex((newobj) => newobj.name === obj.name);
//       const newObj = {
//         id: obj.id,
//         name: obj.name,
//         amount: obj.amount - (obj.amount % obj.moq),
//         moq: obj.moq,
//         price: obj.price,
//       };
//       objArr.splice(idx, 1, newObj);
//       objArr.push({
//         id: obj.id,
//         name: obj.name,
//         amount: obj.amount % obj.moq,
//         moq: obj.moq,
//         price: obj.price,
//       });
//     }
//   }
// });
// console.log(objArr);
// const sortRef = ["EDT", "NB", "DL"];
// const invoiceDate = { EDT: [], NB: [], DL: [] };
// const objArray = [
//   { category: "NB", itemName: "1125", price: 70 },
//   { category: "EDT", itemName: "H2O", price: 100 },
//   { category: "NB", itemName: "1145", price: 72 },
//   { category: "DL", itemName: "DUMMY LAUNCHER", price: 60 },
//   { category: "EDT", itemName: "SPR", price: 90 },
// ];
// const categories = objArray.reduce((acc, curr) => {
//   acc[curr.category].push({ name: curr.itemName, price: curr.price });
//   return acc;
// }, invoiceDate);
// // .sort((a, b) => {
// //   const next = sortRef.findIndex((sort) => sort === a);
// //   const prev = sortRef.findIndex((sort) => sort === b);
// //   return next - prev;
// // });
// // console.log(Object.entries(categories)[0]);

// const keys = Object.keys(categories);
// const result = keys.map((key, index) => Object.entries(categories)[index]);
// console.log(result);
// let rowCounts = result.length;
// // rowCounts += result.map((res) => res[1].length);
// console.log("rowCount", rowCounts);
// let row = 0;

// for (let i = 0; i < result.length; i++) {
//   const category = result[i][0];
//   const items = result[i][1];
//   row++;
//   console.log(row, category);

//   // eslint-disable-next-line no-loop-func
//   items.map((item) => {
//     row += 1;
//     return console.log(row, item.name, item.price);
//   });
// }

// const result = categories.map((category) => Object.keys(category));
// console.log(result);
// const sortRef = ["FEB", "SEP", "OCT", "JAN"];
// const Qmonths = ["JAN", "OCT"];
// Qmonths.sort((a, b) => {
//   let prev = sortRef.findIndex((month) => month === a);
//   let next = sortRef.findIndex((month) => month === b);

//   return prev - next;
// });
// console.log(Qmonths);
// const objArray = {
//   EDT: ["H2O", "IDT", "RAPT", "SPT"],
//   NB: ["1125", "1145", "190", "BBOSS"],
// };
// if (!objArray["EDT"].includes("SPR")) {
//   objArray["EDT"].push("SPR");
// }
// console.log(objArray);
