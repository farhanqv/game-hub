import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import projects from '../data/projects';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import skills from '../data/skills';
import ScribbleCat from '../components/ScribbleCat/ScribbleCat';


export default function Home() {
  const [activeProject, setActiveProject] = useState(null);

  return (
    <div className="bg-gray-50 min-h-screen overflow-x-hidden w-full relative">
      {/* Grid Pattern Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Navbar - Dark and Sticky */}
      <nav className="bg-gray-800 shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-end gap-8 py-4 pr-8">
          <a href="#projects" className="text-gray-200 font-medium hover:text-white transition-colors">
            Projects
          </a>
          <a href="#skills" className="text-gray-200 font-medium hover:text-white transition-colors">
            Skills
          </a>
          <a href="#contact" className="text-gray-200 font-medium hover:text-white transition-colors">
            Contact
          </a>
        </div>
      </nav>

      {/* Main Content - Add top padding to account for fixed navbar */}
      <main className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 py-12 pt-24 relative z-10">
        
        {/* Greeting */}
<section className="mt-20 mb-20 text-left">
  <h1 className="text-2xl text-gray mb-2 text-gray-500">
    Hello, I'm
  </h1>
  <h1 className="text-6xl font-bold mb-4 text-gray-800">
    Muhammad Farhan
  </h1>

  <p className="text-3xl font-semibold text-gray-800 mb-8">
    Software Engineer
  </p>

  <p className="text-xl text-gray-600 leading-tight">
    A full-stack generalist.
    <br />
    Specializing in React, Node.js, JavaScript.
    <br />
    Always improving and learning new tools.
  </p>
</section>



        {/* Projects */}
        <section id="projects" className="scroll-mt-20 mb-20">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Projects</h2>
<div className="h-px bg-gray-200 my-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={setActiveProject}
              />
            ))}
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="scroll-mt-20 mb-20">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Skills</h2>
<div className="h-px bg-gray-200 my-6"></div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {skills.map(skill => (
              <div
                key={skill.name}
                className="bg-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center p-4"
              >
                <img
                  src={skill.logo}
                  alt={skill.name}
                  className="w-12 h-12 mb-3"
                />
                <span className="text-gray-700 font-medium text-sm text-center">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </section>


        {/* Contact */}
        <section id="contact" className="scroll-mt-20 mb-20">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Contact</h2>
         <div className="h-px bg-gray-200 my-6"></div>
 
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Email - Spans 2 rows on the left */}
            <a 
              href="mailto:farhan.efgh@gmail.com" 
              className="row-span-2 bg-blue-500 text-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all no-underline flex flex-col items-center justify-center p-8"
            >
              <svg className="w-12 h-12 mb-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-xl font-semibold">Email</span>
            </a>

            {/* GitHub - Top right */}
            <a 
              href="https://github.com/farhanqv" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-gray-800 text-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all no-underline flex flex-col items-center justify-center p-6"
            >
              <svg className="w-10 h-10 mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="text-lg font-semibold">GitHub</span>
            </a>

            {/* LinkedIn - Bottom right */}
            <a 
              href="https://www.linkedin.com/in/muhammad-farhan-/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all no-underline flex flex-col items-center justify-center p-6"
            >
              <svg className="w-10 h-10 mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-lg font-semibold">LinkedIn</span>
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 border-t border-gray-200 mt-12 relative z-10">
        <p>© 2025 Farhan</p>
      </footer>

      {activeProject && (
        <ProjectModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      )}

      <ScribbleCat />
    </div>
  );
}