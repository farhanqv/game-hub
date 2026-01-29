export default function ProjectCard({ project, onClick }) {
  return (
    <div
      onClick={() => onClick(project)}
      className="cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden"
    >
      <img
        src={project.image}
        alt={project.title}
        className="w-full h-64 object-cover"
      />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-800">
            {project.title}
          </h3>

          {/* Tools */}
          <div className="flex flex-wrap gap-2">
            {project.tools.map(tool => (
              <span
                key={tool}
                className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-md whitespace-nowrap"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-3 text-gray-600 leading-relaxed">
          {project.shortdesc}
        </p>
      </div>
    </div>
  );
}
