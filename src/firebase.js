import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, doc, query, where, serverTimestamp } from 'firebase/firestore'
import { useState, useEffect } from 'react';

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

/**
 * This hook retrieves the current user's session data from the 
 * authentication service and manages the loading state. It 
 * initializes with `user` as `null` and `loading` as `true`. 
 * Once the user session is fetched, it updates the state 
 * accordingly.
 *
 * @returns {Object} An object containing:
 *   - {Object|null} user - The current user session object, or null if not logged in.
 *   - {boolean} loading - A boolean indicating whether the session is being loaded.
 *
 * Usage:
 * const { user, loading } = useUserSession();
 *
 * Example:
 * const MyComponent = () => {
 *   const { user, loading } = useUserSession();
 *
 *   if (loading) return <LoadingSpinner />;
 *   return user ? <WelcomeMessage user={user} /> : <LoginPrompt />;
 * };
 */
export const useUserSession = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
      const userSession = await retrieveSession();
      setUser(userSession);
      setLoading(false); // Set loading to false after fetching user session
  };

  useEffect(() => {
      fetchUser();
  }, []);

  return { user, loading };
};

/**
 * Creates a new user in the Firestore database.
 * 
 * @param {string} email - The email of the user.
 * @param {string} password - The password for the user account.
 * @param {number} student_number - The student's identification number.
 * @param {number} year - The year of study for the student.
 * @param {string} program - The program the student is enrolled in.
 * @returns {Promise<DocumentReference>} A reference to the newly created user document.
*/
export const createUser = async (name, email, password, student_number, year, program, isAdmin, isInstructor) => {
  
  try {
    const userRef = await addDoc(collection(db, 'users'), {
      name: name,
      email: email,
      password: password,
      student_number: student_number,
      year: year,
      program: program,
      enrolled: [],
      isAdmin: isAdmin,
      isInstructor: isInstructor,
      createdAt: serverTimestamp(),
    });
    return userRef;
  } catch (error) {
    console.error('Error creating user: ', error);
  }
};

/**
 * Updates user information in the Firestore database.
 * 
 * @param {string} userId - The ID of the user to be updated.
 * @param {Object} updates - An object containing the fields to be updated.
 * @returns {Promise<string>} A message indicating the result of the operation.
 */
export const updateUser = async (userId, updates) => {
  const validFields = ['email', 'password', 'student_number', 'year', 'program', 'enrolled']; // Define valid fields
  const invalidFields = Object.keys(updates).filter(field => !validFields.includes(field));

  if (invalidFields.length > 0) {
    return `Invalid fields: ${invalidFields.join(', ')}`;
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
    return 'User updated successfully';
  } catch (error) {
    console.error('Error updating user: ', error);
    return 'Error updating user';
  }
};

/**
 * Authenticates a user by checking their email and password.
 * 
 * @param {string} email - The email of the user trying to authenticate.
 * @param {string} password - The password provided for authentication.
 * @returns {Promise<Object>} The authenticated user data if successful, or null if authentication fails.
*/
export const authenticateUser = async (email, password) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }
  
      const userDoc = querySnapshot.docs[0];
      const user = userDoc.data();
      const isMatch = password === user.password;
  
      if (!isMatch) {
        throw new Error('Invalid password');
      }
      localStorage.setItem("token", userDoc.id)
      return user;
    } catch (error) {
      console.error('Error authenticating user: ', error);
      throw(error);
    };
}

/**
 * Retrieves the session information for the currently authenticated user.
 * 
 * @returns {Promise<Object|null>} The user data if a valid session exists, or null if no session is found.
*/
export const retrieveSession = async () => {
  try {
    const userId = localStorage.getItem("token");
    if (!userId) {
      return null;
    }

    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
      throw new Error("User not found.");
    }
    return { id: userSnapshot.id, ...userSnapshot.data() };
  } catch (error) {
    console.error("Error retrieving user from local storage: ", error);
    return null;
  }
};

/**
 * Clears the current session
 */
export const logout = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("isVerified");
  window.location.reload()
}

/**
 * Creates a new course in the Firestore database.
 * 
 * @param {string} courseName - The name of the course.
 * @param {string} courseCode - The code for the course.
 * @param {string} description - A description of the course.
 * @param {number} capacity - The maximum number of students that can enroll in the course.
 * @returns {Promise<DocumentReference>} A reference to the newly created course document.
*/
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
  
/**
 * Retrieves a list of all users from the Firestore database.
 * 
 * @returns {Promise<Array<Object>>} An array of user objects from the database.
*/
export const getUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return users;
  } catch (error) {
    console.error('Error getting users: ', error);
  }
};

/**
 * Retrieves a list of all courses from the Firestore database.
 * 
 * @returns {Promise<Array<Object>>} An array of course objects from the database.
*/
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