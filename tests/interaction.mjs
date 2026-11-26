import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { mount as inquiry } from "../src/inquiry.js";
import { mount as lab } from "../src/lab.js";
const w = new Window({ url: "https://example.org/start?plan=1" });
for (const key of ["document", "location", "sessionStorage", "FormData"])
  Object.defineProperty(globalThis, key, { value: w[key], configurable: true });
const main = document.body;
inquiry(main, {}, "start");
let form = () => main.querySelector("form");
assert.equal(form().querySelector("select").value, "Application");
async function next() {
  await form().onsubmit({ preventDefault() {} });
}
await next();
await next();
form().querySelector("input").checked = true;
await next();
await next();
assert.match(main.textContent, /11,999/);
await next();
assert.ok(form().querySelector("[name=email]"));
assert.ok(form().querySelector("[name=attachment]"));
main.innerHTML = "";
lab(main);
main.querySelector("#business").value = "Test Studio";
main.querySelector("#business").oninput();
assert.match(main.querySelector("#demo").textContent, /Test Studio/);
assert.match(sessionStorage.design, /Test Studio/);
main.querySelector("[data-tab=software]").click();
assert.equal(main.querySelectorAll("tbody tr").length, 2);
main.querySelector("[data-del]").click();
assert.equal(main.querySelectorAll("tbody tr").length, 1);
console.log(
  "Plan carryover, estimate, contact fields, design customizer and demo deletion passed.",
);
await w.happyDOM.close();
