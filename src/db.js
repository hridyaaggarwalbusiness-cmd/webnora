import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  connectFirestoreEmulator,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
let ready;
export async function backend() {
  if (!ready)
    ready = (async () => {
      const local =
        import.meta.env.DEV &&
        import.meta.env.VITE_USE_EMULATORS === "1" &&
        ["localhost", "127.0.0.1"].includes(location.hostname);
      let config;
      try {
        config = local
          ? {
              apiKey: "demo-key",
              projectId: "demo-webnora",
              authDomain: "localhost",
            }
          : JSON.parse(
              import.meta.env.VITE_FIREBASE_CONFIG ||
                (await (await fetch("/__/firebase/init.json")).text()),
            );
      } catch {
        throw Error(
          "Firebase connection unavailable. Open the site on its configured Hosting domain or configure the preview environment.",
        );
      }
      if ((!local && config.projectId !== "web-nora") || !config.apiKey)
        throw Error("Firebase web configuration is missing.");
      const app = initializeApp(config),
        auth = getAuth(app);
      const db = getFirestore(app);
      if (local) {
        connectAuthEmulator(auth, "http://localhost:9099");
        connectFirestoreEmulator(db, "localhost", 8080);
      }
      await auth.authStateReady();
      return { auth, db };
    })().catch((e) => {
      ready = null;
      throw e;
    });
  return ready;
}
export async function session() {
  return (await backend()).auth.currentUser;
}
export async function login() {
  const { auth } = await backend();
  return (await signInWithPopup(auth, new GoogleAuthProvider())).user;
}
export async function logout() {
  await signOut((await backend()).auth);
}
export async function admin(u) {
  if (!u) return false;
  return (await u.getIdTokenResult(true)).claims.admin === true;
}
export async function read(path, id) {
  const { db } = await backend();
  return (await getDoc(doc(db, path, id))).data();
}
export async function list(path, owner) {
  const { db } = await backend();
  let ref = collection(db, path);
  const snapshot = await getDocs(
    owner ? query(ref, where("owner", "==", owner)) : query(ref),
  );
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
}
export async function save(path, id, data) {
  const { db } = await backend();
  const ref = id ? doc(db, path, id) : doc(collection(db, path));
  await setDoc(ref, data, { merge: true });
  return ref.id;
}
export async function inquire(data) {
  const { auth, db } = await backend();
  const u = auth.currentUser || (await signInAnonymously(auth)).user;
  const ref = doc(collection(db, "inquiries")),
    batch = writeBatch(db);
  batch.set(ref, {
    ...data,
    owner: u.uid,
    status: "New",
    created: serverTimestamp(),
  });
  batch.set(doc(db, "submissions", u.uid), {
    at: serverTimestamp(),
    ref: ref.id,
  });
  await batch.commit();
  return ref.id;
}
