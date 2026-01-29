export default function ProjectModal({ project, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-2xl mx-4 p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>

        <img
          src={project.image}
          alt={project.title}
          className="w-full h-56 object-cover rounded-md mb-4"
        />

        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          {project.title}
        </h3>

        {/* Tools */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tools.map(tool => (
            <span
              key={tool}
              className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-md"
            >
              {tool}
            </span>
          ))}
        </div>

        <p className="text-gray-600 leading-relaxed mb-6">
          {project.description}
        </p>

        <a
          href={project.url}
          className="inline-block bg-gray-800 text-white px-5 py-2 rounded-md hover:bg-gray-900 transition"
        >
          Visit Site →
        </a>
      </div>
    </div>
  );
}
