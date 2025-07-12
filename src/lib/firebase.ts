// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Chat } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firestore collections
const chatsCollection = collection(db, 'chats');

// Upload a chat file and create a document in Firestore
export const uploadChatFile = async (userId: string, file: File, title: string, messageCount: number): Promise<Chat> => {
    if (!userId) throw new Error("User is not authenticated.");

    // 1. Upload file to Firebase Storage
    const filePath = `chats/${userId}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadResult = await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(uploadResult.ref);

    // 2. Create a chat document in Firestore
    const chatDocData = {
        userId,
        title,
        fileUrl,
        fileName: file.name,
        storagePath: filePath,
        messageCount,
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(chatsCollection, chatDocData);

    // 3. Return a client-side representation of the chat object.
    // The server timestamp will be null on the client initially, so we create a client-side one.
    return {
      id: docRef.id,
      userId: chatDocData.userId,
      title: chatDocData.title,
      fileUrl: chatDocData.fileUrl,
      fileName: chatDocData.fileName,
      storagePath: chatDocData.storagePath,
      messageCount: chatDocData.messageCount,
      createdAt: new Timestamp(Math.floor(Date.now() / 1000), 0)
    };
};


// Get all chats for a user
export const getChatsForUser = async (userId: string): Promise<Chat[]> => {
    const q = query(chatsCollection, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Chat[];
}
