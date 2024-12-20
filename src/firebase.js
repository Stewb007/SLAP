import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
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
export const createUser = async (
  name,
  email,
  password,
  student_number,
  year,
  program,
  isAdmin,
  isInstructor
) => {
  try {
    const userRef = await addDoc(collection(db, "users"), {
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
    console.error("Error creating user: ", error);
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
  const validFields = [
    "email",
    "password",
    "student_number",
    "year",
    "program",
    "enrolled",
    "resetPasswordTarget",
  ]; // Define valid fields
  const invalidFields = Object.keys(updates).filter(
    (field) => !validFields.includes(field)
  );
  if (invalidFields.length > 0) {
    return `Invalid fields: ${invalidFields.join(", ")}`;
  }
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);
    return "User updated successfully";
  } catch (error) {
    console.error("Error updating user: ", error);
    return "Error updating user";
  }
};

/**
 * Updates a course information in the Firestore database.
 *
 * @param {string} courseId - The ID of the course to be updated.
 * @param {Object} updates - An object containing the fields to be updated.
 */
export const updateCourse = async (courseId, updates) => {
  try {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, updates);
    return "Course updated successfully";
  } catch (error) {
    console.error("Error updating course: ", error);
    return "Error updating course";
  }
};

/**
 * Deletes a user from the Firestore database.
 *
 * @param {string} userId - The ID of the user to be deleted.
 * @returns {Promise<string>} A message indicating the result of the operation.
 */
export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
    return "User deleted successfully";
  } catch (error) {
    console.error("Error deleting user: ", error);
    return "Error deleting user";
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
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("User not found");
    }

    const userDoc = querySnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };
    const isMatch = password === user.password;

    if (!isMatch) {
      throw new Error("Invalid password");
    }
    localStorage.setItem("token", userDoc.id);
    return user;
  } catch (error) {
    console.error("Error authenticating user: ", error);
    throw error;
  }
};

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
 *
 */
export const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("isVerified");
    navigate("/auth");
  };

  return logout;
};

/**
 * Creates a new course in the Firestore database.
 *
 * @param {string} courseName - The name of the course.
 * @param {string} courseCode - The code for the course.
 * @param {string} description - A description of the course.
 * @param {number} capacity - The maximum number of students that can enroll in the course.
 * @returns {Promise<DocumentReference>} A reference to the newly created course document.
 */
export const createCourse = async (
  courseName,
  courseCode,
  description,
  capacity
) => {
  try {
    const courseRef = await addDoc(collection(db, "courses"), {
      name: courseName,
      code: courseCode,
      description,
      capacity,
      enrolled: 0,
      instructor: "",
      assignments: [],
      createdAt: serverTimestamp(),
    });
    return courseRef;
  } catch (error) {
    console.error("Error creating course: ", error);
  }
};

/**
 * Deletes a course from the Firestore database.
 *
 * @param {string} courseId - The ID of the course to be deleted.
 * @returns {Promise<string>} A message indicating the result of the operation.
 */
export const deleteCourse = async (courseId) => {
  try {
    const courseRef = doc(db, "courses", courseId);
    await deleteDoc(courseRef);
    return "Course deleted successfully";
  } catch (error) {
    console.error("Error deleting course: ", error);
    return "Error deleting course";
  }
};

/**
 * Retrieves a list of all users from the Firestore database.
 *
 * @returns {Promise<Array<Object>>} An array of user objects from the database.
 */
export const getUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return users;
  } catch (error) {
    console.error("Error getting users: ", error);
  }
};

/** Searches the database for a user with a certain email
 *
 * @param {string} email - The email of the user to search for.
 * @returns {Promise<Object>} The user object if found, or null if not found.
 */
export const searchUserByEmail = async (email) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error("Error searching for user: ", error);
  }
};

/**
 * Retrieves a list of all courses from the Firestore database.
 *
 * @returns {Promise<Array<Object>>} An array of course objects from the database.
 */
export const getCourses = async () => {
  try {
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    const courses = coursesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return courses;
  } catch (error) {
    console.error("Error getting courses: ", error);
  }
};
export { db };

/**
 * Enrolls a user into a course if the capacity allows it.
 * @param {string} userId - the ID of the user who wishes to enroll
 * @param {string} courseCode - the ID of the coruse the users wants to enroll it
 * @returns {Promise<void>} - Enroll the user in the capacity allows it.
 */
export const enrollUserInCourse = async (userId, courseCode) => {
  try {
    const coursesRef = collection(db, "courses");
    const coursesSnapshot = query(coursesRef, where("code", "==", courseCode));
    const queryResult = await getDocs(coursesSnapshot);

    if (queryResult.empty) {
      console.log("Course not found");
      return;
    }

    const course = queryResult.docs[0].data();
    const courseCapacity = course.capacity;
    const currentEnrollment = course.enrolled?.length || 0;

    // Check if user is already enrolled
    const userEnrollmentQuery = query(
      collection(db, "users"),
      where("enrolled", "array-contains", courseCode),
      where("id", "==", userId)
    );
    const userEnrollmentResult = await getDocs(userEnrollmentQuery);

    if (!userEnrollmentResult.empty) {
      throw new Error("User already enrolled in the course");
    }

    // Check if the course capacity has been reached
    if (currentEnrollment >= courseCapacity) {
      throw new Error("Cannot enroll: course capacity has been reached");
    }

    // if user.isInstrucor is true, then we should update the course.instructor field to the user's id
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      enrolled: arrayUnion(courseCode),
    });
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();
    if (userData.isInstructor) {
      const courseQuery = query(coursesRef, where("code", "==", courseCode));
      const courseQueryResult = await getDocs(courseQuery);
      const courseRef = doc(db, "courses", courseQueryResult.docs[0].id);
      const courseData = courseQueryResult.docs[0].data();
      await updateDoc(courseRef, {
        instructor: userData.name,
        capacity: courseData.capacity - 1,
        enrolled: courseData.enrolled + 1,
      });
    }
  } catch (error) {
    console.error("Error enrolling user in course: ", error);
    throw error;
  }
};

/**
 * Returns the list of users currently enrolled in a course
 *
 * @param {string} courseCode - the ID of the course to view the users
 * @returns {Promise<Array<Object>>} - Retrieves a list of all the users in the course.
 */
export const usersInCourse = async (courseCode) => {
  try {
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const courseUsers = users.filter((user) =>
      user.enrolled?.includes(courseCode)
    );
    return courseUsers;
  } catch (error) {
    console.error("Error retrieving course users: ", error);
    throw error;
  }
};

/**
 * Returns the list of courses that the user is currently enrolled in
 * @param {string} userId - the ID of the user who wishes to view their courses
 * @returns {Promise<Array<Object>>} - Retrieves a list of all the user's course details.
 */
export const viewUserCourses = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();
    const enrolledCourseCodes = userData.enrolled || [];
    const enrolledCourses = [];
    for (const courseCode of enrolledCourseCodes) {
      const courseQuery = query(
        collection(db, "courses"),
        where("code", "==", courseCode)
      );
      const courseQueryResult = await getDocs(courseQuery);
      const courseData = courseQueryResult.docs[0].data();
      enrolledCourses.push({ id: courseQueryResult.docs[0].id, ...courseData });
    }

    return enrolledCourses;
  } catch (error) {
    console.error("Error retrieving the user's courses: ", error);
    throw error;
  }
};

/**
 * Removes a user from a course.
 * @param {string} userId - the ID of the user who wishes to drop out of the class
 * @param {string} courseCode - the ID of the coruse the users wants to drop
 * @returns {Promise<void>} - remove the user
 */
export const removeUserCourse = async (userId, courseCode) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      enrolled: arrayRemove(courseCode),
    });
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();
    if (userData.isInstructor) {
      const courseQuery = query(
        collection(db, "courses"),
        where("code", "==", courseCode)
      );
      const courseQueryResult = await getDocs(courseQuery);
      const courseRef = doc(db, "courses", courseQueryResult.docs[0].id);
      const courseData = courseQueryResult.docs[0].data();
      await updateDoc(courseRef, {
        instructor: "",
        capacity: courseData.capacity + 1,
        enrolled: courseData.enrolled - 1,
      });
    }
  } catch (error) {
    console.error("Error retrieving the users courses: ", error);
    throw error;
  }
};

/**
 * Retrieves a list of active System SLAPS from the Firestore database.
 *
 * @returns {Promise<Array<Object>>} An array of active SLAP SYS objects from the database.
 */
export const getSystemSLAPS = async () => {
  try {
    const slapsSnapshot = await getDocs(collection(db, "slaps"));
    const slaps = slapsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return slaps.filter((slap) => slap.type === "SYS" && slap.isActive);
  } catch (error) {
    console.error("Error getting system slaps: ", error);
  }
};

/**
 * Retrieves a list of all SLAPS from the Firestore database.
 *
 * @returns {Promise<Array<Object>>} An array of SLAP objects from the database.
 */
export const getSLAPS = async () => {
  try {
    const slapsSnapshot = await getDocs(collection(db, "slaps"));
    const slaps = slapsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return slaps;
  } catch (error) {
    console.error("Error getting slaps: ", error);
  }
};

/**
 * Creates a new SLAP in the Firestore database.
 *
 * @param {string} content - The content of the SLAP.
 * @param {string} type - The type of the SLAP (SYS or USR).
 * @param {boolean} isActive - A boolean indicating whether the SLAP is active.
 * @returns {Promise<DocumentReference>} A reference to the newly created SLAP document.
 */
export const createSLAP = async (content, type, isActive) => {
  try {
    const slapRef = await addDoc(collection(db, "slaps"), {
      content,
      type,
      isActive,
      createdAt: serverTimestamp(),
    });
    return slapRef;
  } catch (error) {
    console.error("Error creating slap: ", error);
  }
};

/**
 * Updates a SLAP in the Firestore database.
 *
 * @param {string} slapId - The ID of the SLAP to be updated.
 * @param {Object} updates - An object containing the fields to be updated.
 * @returns {Promise<string>} A message indicating the result of the operation.
 */
export const updateSLAP = async (slapId, updates) => {
  const validFields = ["content", "type", "isActive"]; // Define valid fields
  const invalidFields = Object.keys(updates).filter(
    (field) => !validFields.includes(field)
  );
  if (invalidFields.length > 0) {
    return `Invalid fields: ${invalidFields.join(", ")}`;
  }
  try {
    console.log(slapId, updates);
    const slapRef = doc(db, "slaps", slapId);
    await updateDoc(slapRef, updates);
    return "SLAP updated successfully";
  } catch (error) {
    console.error("Error updating slap: ", error);
    return "Error updating slap";
  }
};

/**
 * Create an assignment for a course
 *
 * @param {string} courseCode - The code of the course the assignment belongs to.
 * @param {string} assignmentName - The name of the assignment.
 */
export const createAssignment = async (
  courseCode,
  assignmentName,
) => {
  try {
    const courseQuery = query(
      collection(db, "courses"),
      where("code", "==", courseCode)
    );
    const courseQueryResult = await getDocs(courseQuery);
    const courseRef = doc(db, "courses", courseQueryResult.docs[0].id);
    const courseData = courseQueryResult.docs[0].data();
    const assignments = courseData.assignments || [];

    const assignmentId = (assignments.length + 1).toString();

    const newAssignment = {
      assignmentId,
      assignmentName,
      description: "Add your description here by editing the project.",
      instructionFile: "No instruction file submitted yet",
      mappedGroups: {},
      studentsNotInGroup: [],
    };

    const usersQuery = query(collection(db, "users"));
    const usersQueryResult = await getDocs(usersQuery);

    usersQueryResult.forEach((userDoc) => {
      const userData = userDoc.data();
      const enrolledCourses = userData.enrolled || [];
      if (enrolledCourses.includes(courseCode) && userData.isAdmin === false && userData.isInstructor === false) {
        newAssignment.studentsNotInGroup.push(userData.student_number);
      }
    });

    assignments.push(newAssignment);
    await updateDoc(courseRef, { assignments });
  } catch (error) {
    console.error("Error creating assignment: ", error);
  }
};

export const getUserNameByStudentId = async (studentId) => {
  const q = query(
    collection(db, "users"),
    where("student_number", "==", studentId)
  );

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userName = userDoc.data().name;
      return userName || "";
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user data: ", error);
    return null;
  }
};

export const fetchAllStudentNames = async ({
  mappedGroups,
  studentsNotInGroup,
}) => {
  const studentIdNameMap = {};

  const fetchAndMapName = async (studentId) => {
    if (!(studentId in studentIdNameMap)) {
      const name = await getUserNameByStudentId(studentId);
      studentIdNameMap[studentId] = name || "Unknown";
    }
  };

  for (const groupMembers of Object.values(mappedGroups)) {
    for (const studentId of groupMembers) {
      await fetchAndMapName(studentId);
    }
  }

  for (const studentId of studentsNotInGroup) {
    await fetchAndMapName(studentId);
  }

  return studentIdNameMap;
};

export const fetchSubmissions = async ({
  assignmentId,
  courseCode,
  studentId,
}) => {

  console.log(assignmentId)
  console.log(courseCode,studentId)
  const q = query(
    collection(db, "submissions"),
    where("studentId", "==", studentId)
  );

  try {
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No submissions found for this student.");
      return null;
    }

    const studentDoc = snapshot.docs[0].data();
    const studentSubmissions = studentDoc.submissions;
    const submissionKey = `${courseCode}-${assignmentId}`;

    return studentSubmissions[submissionKey];
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return null;
  }
};

export const evaluateStudent = async ({
  studentId,
  assignmentId,
  courseCode,
  mark,
}) => {
  const q = query(
    collection(db, "submissions"),
    where("studentId", "==", studentId)
  );

  try {
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No submissions found for this student.");
      return null;
    }

    const studentDoc = snapshot.docs[0];
    const submissionRef = doc(db, "submissions", studentDoc.id); // Get the reference to the specific document

    const studentEvaluations = studentDoc.data().evaluations || {}; // Ensure evaluations exists
    const key = `${courseCode}-${assignmentId}`;

    studentEvaluations[key] = mark;

    await updateDoc(submissionRef, {
      evaluations: studentEvaluations,
    });

    console.log(
      `Successfully updated evaluation for student ${studentId} for ${key} with mark: ${mark}`
    );
  } catch (error) {
    console.error("Error fetching or updating submission:", error);
  }
};


/**
 * Adds a notification to the notifications array in a specific course document.
 *
 * @param {string} courseId - The ID of the course document.
 * @param {Object} notification - The notification object containing title and message.
 * @returns {Promise<void>} A promise that resolves when the notification is added.
 */
export const addCourseNotification = async (courseId, notification) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      notifications: arrayUnion({
        ...notification,
        createdAt: new Date(), // or use `serverTimestamp()` if desired
      }),
    });
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};


/**
 * Removes a specific notification from the notifications array in a course document.
 *
 * @param {string} courseId - The ID of the course document.
 * @param {Object} notification - The exact notification object to remove.
 * @returns {Promise<void>} A promise that resolves when the notification is removed.
 */
export const removeCourseNotification = async (courseId, notification) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      notifications: arrayRemove(notification),
    });
  } catch (error) {
    console.error('Error removing notification:', error);
    throw error;
  }
};

/**
 * Adds a new group to an assignment in the Firestore database.
 *
 * @param {string} courseId - The ID of the course.
 * @param {string} assignmentId - The ID of the assignment.
 * @param {Object} group - The group object containing name and members.
 * @returns {Promise<void>} A promise that resolves when the group is added.
 */
export const addGroupToAssignment = async (courseId, assignmentId, group) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseRef);
    if (!courseDoc.exists()) {
      throw new Error('Course not found');
    }

    const courseData = courseDoc.data();
    const assignments = courseData.assignments.map((assignment) => {
      if (assignment.assignmentId === assignmentId) {
        return {
          ...assignment,
          mappedGroups: [...assignment.mappedGroups, group.members],
          studentsNotInGroup: assignment.studentsNotInGroup.filter(
            (studentId) => !group.members.includes(studentId)
          ),
        };
      }
      return assignment;
    });

    await updateDoc(courseRef, { assignments });
  } catch (error) {
    console.error('Error adding group to assignment:', error);
    throw error;
  }
};

/**
 * Fetches the groups for a specific assignment from the Firestore database.
 *
 * @param {string} courseId - The ID of the course.
 * @param {string} assignmentId - The ID of the assignment.
 * @returns {Promise<Object>} A promise that resolves to the groups data.
 */
export const fetchGroupsForAssignment = async (courseId, assignmentId) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    const courseDoc = await getDoc(courseRef);
    if (!courseDoc.exists()) {
      throw new Error('Course not found');
    }

    const courseData = courseDoc.data();
    const assignment = courseData.assignments.find(
      (assignment) => assignment.assignmentId === assignmentId
    );

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    return {
      mappedGroups: assignment.mappedGroups,
      studentsNotInGroup: assignment.studentsNotInGroup,
    };
  } catch (error) {
    console.error('Error fetching groups for assignment:', error);
    throw error;
  }
};

/**
 * Fetches the grade of a user in the firebase
 *
 * @param {string} studentId - The ID of the student.
 * @param {string} courseId - The ID of the course.
 * @param {string} assignmentId - The ID of the assignment.
 * @returns {Promise<Object>} - the grade of the student
 */

export const fetchStudentGrade = async ({ assignmentId, courseCode, studentId }) => {
  const gradeRef = query(
    collection(db, "submissions"),
    where("studentId", "==", studentId)
  );

  try {
    const gradeSnapshot = await getDocs(gradeRef);

    if (gradeSnapshot.empty) {
      throw new Error('student grade not found');
    }
    const studentDoc = gradeSnapshot.docs[0];
    const studentEvaluations = studentDoc.data().evaluations || {};
    const key = `${courseCode}-${assignmentId}`;

    const grade = studentEvaluations[key];
    if (grade !== undefined) {
      return grade;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching grade:", error);
    throw error
  }
};

/** Gets the conversations for a specific user from the Firestore database.
 * 
 * @param {string} userId - The ID of the user. 
 * 
 */
export const getConversations = async (userId) => {
  try {
    const conversationsRef = collection(db, 'messages');
    const conversationsSnapshot = await getDocs(conversationsRef);
    const conversations = conversationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return conversations.filter((conversation) => conversation.members.includes(userId));
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
}

/** Gets the messages for a specific conversation from the Firestore database.
 *  
 * @param {string} conversationId - The ID of the conversation.
 */
export const getMessagesForConversation = async (conversationId) => {
  try {
    const conversationRef = doc(db, 'messages', conversationId);
    const conversationDoc = await getDoc(conversationRef);
    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }

    const conversationData = conversationDoc.data();
    return conversationData.messages || [];
  } catch (error) {
    console.error('Error getting messages for conversation:', error);
    throw error;
  }
}

/**
 *  Creates a new conversation in the Firestore database.
 *  
 *  @param {string} senderId - The ID of the sender.
 *  @param {string} receiverEmail - The email of the receiver.
 *  @param {string} initialMessage - The initial message.
 */
export const createConversation = async ({senderId, receiverId, initialMessage}) => {
  try {
    const receiver = await searchUserByEmail(receiverId);
    const senderRef = doc(db, 'users', senderId);
    const senderDoc = await getDoc(senderRef);
    const senderData = senderDoc.data();
    const conversationRef = await addDoc(collection(db, 'messages'), {
      members: [senderId, receiver.id],
      names: {sender: senderData.name, receiver: receiver.name},
      messages: [
        {
          sender: senderData.name,
          content: initialMessage,
          createdAt: new Date().toString(),
        },
      ],
    });
    return conversationRef;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 *  Adds a message to a conversation in the Firestore database.
 *  
 *  @param {string} conversationId - The ID of the conversation.
 *  @param {string} name - The name of the sender.
 *  @param {string} message - The message object containing the message content and sender.
 */
export const addMessageToConversation = async (conversationId, name, message) => {
  try {
    const conversationRef = doc(db, 'messages', conversationId);
    const conversationDoc = await getDoc(conversationRef);
    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }
    const conversationData = conversationDoc.data();
    const messages = conversationData.messages || [];
    messages.push(
      {
        sender: name,
        content: message,
        createdAt: new Date().toString(),
      }
    );

    await updateDoc(conversationRef, { messages });
  } catch (error) {
    console.error('Error adding message to conversation:', error);
    throw error;
  }
}
