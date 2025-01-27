import React, { useState } from "react";
import SubmissionForm from "./components/submissionForm";
import AdminDashboard from "./components/AdminDashboard";


const App = () => {
  const [currentTab, setCurrentTab] = useState("submit");

  const handleNewSubmission = () => {
    setCurrentTab("admin");
  };

  return (
    
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex border-b">
              <button
                className={`flex-1 py-2 text-center ${
                  currentTab === "submit"
                    ? "border-b-2 border-blue-500 text-blue-500 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
                onClick={() => setCurrentTab("submit")}
              >
                Submit
              </button>
              <button
                className={`flex-1 py-2 text-center ${
                  currentTab === "admin"
                    ? "border-b-2 border-blue-500 text-blue-500 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
                onClick={() => setCurrentTab("admin")}
              >
                Admin Dashboard
              </button>
            </div>
           
          </div>

          <div className="mt-4">
            {currentTab === "submit" && <SubmissionForm onSubmit={handleNewSubmission} />}
            {currentTab === "admin" && <AdminDashboard />}
          </div>
        </div>
      </div>
 
  );
};

export default App;
