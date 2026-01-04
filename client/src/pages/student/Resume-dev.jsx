import { motion } from 'framer-motion';
import { FileText, Upload, Download, Edit, Eye, CheckCircle } from 'lucide-react';

export default function StudentResume() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Resume Builder</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-secondary-900">Resume Upload</h3>
              </div>
              <div className="card-body">
                <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-600 mb-2">Upload your resume</p>
                  <p className="text-sm text-secondary-500 mb-4">PDF, DOC, DOCX (Max 5MB)</p>
                  <button className="btn btn-primary btn-sm">Choose File</button>
                </div>
                
                <div className="mt-4 p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-2 text-success-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Resume uploaded successfully</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Resume Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">Resume Preview</h3>
                <div className="flex items-center gap-2">
                  <button className="btn btn-outline btn-sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button className="btn btn-outline btn-sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="bg-secondary-50 rounded-lg p-6 min-h-[600px]">
                  <div className="space-y-4">
                    {/* Header Section */}
                    <div className="text-center border-b border-secondary-200 pb-4">
                      <h2 className="text-2xl font-bold text-secondary-900">Demo User</h2>
                      <p className="text-secondary-600">Computer Science Student</p>
                      <p className="text-sm text-secondary-500">demo@example.com | +1 234 567 8900 | San Francisco, CA</p>
                    </div>

                    {/* Education Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-2">Education</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">University of California, Berkeley</p>
                          <p className="text-secondary-600">Bachelor of Science in Computer Science</p>
                          <p className="text-sm text-secondary-500">2020 - 2024 | GPA: 3.8/4.0</p>
                        </div>
                      </div>
                    </div>

                    {/* Experience Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-2">Experience</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">Software Engineering Intern</p>
                          <p className="text-secondary-600">Tech Company | Summer 2023</p>
                          <ul className="text-sm text-secondary-600 mt-1 list-disc list-inside">
                            <li>Developed features for main product using React and Node.js</li>
                            <li>Improved application performance by 25%</li>
                            <li>Collaborated with cross-functional team</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'].map((skill) => (
                          <span key={skill} className="badge badge-secondary">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Analysis Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-secondary-900">AI Resume Analysis</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600 mb-1">85%</div>
                  <p className="text-sm text-secondary-600">Profile Completion</p>
                </div>
                <div className="text-center p-4 bg-success-50 rounded-lg">
                  <div className="text-2xl font-bold text-success-600 mb-1">12</div>
                  <p className="text-sm text-secondary-600">Skills Detected</p>
                </div>
                <div className="text-center p-4 bg-warning-50 rounded-lg">
                  <div className="text-2xl font-bold text-warning-600 mb-1">3</div>
                  <p className="text-sm text-secondary-600">Suggestions</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-warning-50 rounded-lg">
                <h4 className="font-medium text-warning-800 mb-2">AI Suggestions:</h4>
                <ul className="text-sm text-warning-700 space-y-1">
                  <li>• Add more quantifiable achievements to your experience section</li>
                  <li>• Include relevant coursework and projects</li>
                  <li>• Consider adding a summary section at the top</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
