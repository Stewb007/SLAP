import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export const createUser = async (email, password, student_number, year, program) => {
  try {
    const userRef = await addDoc(collection(db, 'users'), {
      email: email,
      password: password,
      student_number: student_number,
      year: year,
      program: program,
      enrolled: [],
      createdAt: serverTimestamp(),
    });
    return userRef;
  } catch (error) {
    console.error('Error creating user: ', error);
  }
};

export const authenticateUser = async (email, password) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }
  
      const user = querySnapshot.docs[0].data();
      const isMatch = password === user.password;
  
      if (!isMatch) {
        throw new Error('Invalid password');
      }
  
      return user;
    } catch (error) {
      console.error('Error authenticating user: ', error);
    };
}

export const createCourse = async (courseName, courseCode, description, capacity) => {
    try {
      const courseRef = await addDoc(collection(db, 'courses'), {
        courseName,
        courseCode,
        description,
        capacity,
        createdAt: serverTimestamp(),
      });
      return courseRef;
    } catch (error) {
      console.error('Error creating course: ', error);
    }
};
  

export const getUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return users;
  } catch (error) {
    console.error('Error getting users: ', error);
  }
};

export const getCourses = async () => {
    try {
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return courses;
    } catch (error) {
      console.error('Error getting courses: ', error);
    }
};  
export { db };