import { readFile } from "node:fs/promises";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
const env = await initializeTestEnvironment({
  projectId: "demo-webnora",
  firestore: { rules: await readFile("firestore.rules", "utf8") },
});
try {
  const customer = env.authenticatedContext("customer").firestore(),
    other = env.authenticatedContext("other").firestore(),
    admin = env.authenticatedContext("admin", { admin: true }).firestore(),
    guest = env.unauthenticatedContext().firestore();
  await assertSucceeds(
    setDoc(doc(admin, "projects", "sample"), {
      title: "Sample",
      owner: "customer",
    }),
  );
  await assertSucceeds(getDoc(doc(customer, "projects", "sample")));
  await assertFails(getDoc(doc(other, "projects", "sample")));
  await assertFails(getDoc(doc(guest, "projects", "sample")));
  await assertFails(
    updateDoc(doc(customer, "projects", "sample"), { status: "Completed" }),
  );
  await assertFails(
    setDoc(doc(customer, "content", "published"), { headline: "test" }),
  );
  function inquiry(id) {
    const b = writeBatch(customer);
    b.set(doc(customer, "submissions", "customer"), {
      at: serverTimestamp(),
      ref: id,
    });
    b.set(doc(customer, "inquiries", id), {
      owner: "customer",
      name: "Test",
      business: "Test",
      email: "example@example.org",
      phone: "",
      summary: "test",
      created: serverTimestamp(),
      status: "New",
    });
    return b.commit();
  }
  await assertSucceeds(inquiry("first"));
  await assertFails(inquiry("second"));
  await assertFails(getDoc(doc(other, "inquiries", "first")));
  console.log("Verified ownership, role enforcement and inquiry throttling.");
} finally {
  await env.cleanup();
}
