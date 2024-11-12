import React, { useState } from "react";
import { getFirestore, doc, updateDoc, arrayUnion, setDoc, getDocs, where, query, collection } from "firebase/firestore";

const FileUploader = ({ assignmentName, courseCode, studentId, assignmentId }) => {
  const [fileContent, setFileContent] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const db = getFirestore();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          setFileContent(text);
        };
        reader.readAsText(file);
        }
    }
    console.log(assignmentId)
  };
  const addNewSubmission = async () => {
    setIsSubmitting(true);
    try {
        const submissionsRef = collection(db, "submissions");
    
        const submissionQuery = query(submissionsRef, where("studentId", "==", studentId));
        const submissionQuerySnapshot = await getDocs(submissionQuery);
    
        let docRef;
    
        if (!submissionQuerySnapshot.empty) {
            const docSnap = submissionQuerySnapshot.docs[0];
            docRef = doc(db, "submissions", docSnap.id); 
        } else {
            docRef = doc(submissionsRef); 
            await setDoc(docRef, {
            studentId: studentId,
            submissions: {},
            });
        }
        const newSubmission = {
            submissionDate: new Date(),
            submissionFile: fileContent,
        };
    
        await updateDoc(docRef, {
            [`submissions.${courseCode}-${assignmentId}`]: arrayUnion(newSubmission),
        });
    
        setSubmissionMessage("File submitted successfully!");
        } catch (error) {
        console.error("Error adding new submission:", error);
        setSubmissionMessage("Failed to submit file. Please try again.");
        } finally {
        setIsSubmitting(false);
        }
  };

  return (
    <div>
      <h1>Please Select a file to upload for {assignmentName}</h1>
      <input type="file" accept=".txt" onChange={handleFileChange} />
      {fileContent && (
        <div>
          <h3>Submission Preview:</h3>
          <textarea
            value={fileContent}
            readOnly
            rows="10"
            cols="104"
            style={{ marginTop: "10px", marginBottom: "10px" }}
          />
          <div>
            <button onClick={addNewSubmission} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Assignment"}
            </button>
          </div>
          {submissionMessage && <p>{submissionMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
