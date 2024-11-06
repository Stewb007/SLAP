import React from 'react';
import './styles/SubmissionsPage.css'; 

function SubmissionsPage({ user }) {

    if (!user){
        return <p>Loading user data...</p>
    }
    const firstName = user.name.split(' ')[0];
    const lastName = user.name.split(' ')[1];
    const fullName = `${firstName}${lastName}`; 

    const assignments = [1, 2, 3];
    const pdfLinks = assignments.map((assignment) => (
        <div key={assignment}>
            <h3>Assignment {assignment}</h3>
            <ul>
                <li>
                    <a href={`/path/to/pdfs/Assignment${assignment}_${fullName}.pdf`} download>
                        Assignment{assignment}_{fullName}.pdf
                    </a>
                </li>
            </ul>
        </div>
    ));

    return (
        <div className="submissions-page">
            <div className="banner">
                <h1>Submission History</h1>
            </div>
            <div className="assignments">
                {pdfLinks}
            </div>
        </div>
    );
}

export default SubmissionsPage;
