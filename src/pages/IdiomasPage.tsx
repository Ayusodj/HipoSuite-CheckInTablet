


import React from 'react';
import { ExternalLinkIcon, FileDownloadIcon } from '../components/icons/Icons';

interface LanguageResource {
  name: string;
  url: string;
  description: string;
}

interface DownloadableDocument {
  name: string;
  path: string;
  description: string;
}

interface LanguageSectionData {
  id: string; // e.g., 'aleman', 'ingles'
  buttonLabel: string; // e.g., 'Alemán'
  sectionTitle: string; // e.g., 'Recursos de Alemán'
  onlineResources: LanguageResource[];
  downloadableDocuments: DownloadableDocument[];
}

const languageSectionsData: LanguageSectionData[] = [
  {
    id: 'aleman',
    buttonLabel: 'Alemán',
    sectionTitle: 'Recursos de Alemán',
    onlineResources: [
      { name: "VHS LernPortal", url: "https://www.vhs-lernportal.de", description: "Portal de aprendizaje de VHS." },
      { name: "Deutsche Welle", url: "https://learngerman.dw.com/de", description: "Aprende alemán con DW." },
      { name: "Goethe-Institut", url: "https://www.goethe.de/de/spr/ueb.html", description: "Ejercicios de alemán del Goethe-Institut." },
      { name: "Aula Fácil - Alemán", url: "https://www.aulafacil.com/cursos/aleman", description: "Cursos de alemán gratuitos." },
      { name: "Alemán Sencillo", url: "https://www.alemansencillo.com/", description: "Recursos para aprender alemán." },
      { name: "Edutin Academy - Alemán", url: "https://edutin.com/curso-de-Aleman", description: "Curso de Alemán online." },
      { name: "AprenderGratis - Idiomas", url: "https://aprendergratis.es/cursos-online/idiomas/", description: "Cursos de idiomas online." },
      { name: "LyricsTraining - Alemán", url: "https://es.lyricstraining.com/de", description: "Aprende alemán con canciones." }
    ],
    downloadableDocuments: [
      { name: "Libro de Aleman.pdf", path: "public/assets/documents/idiomas/Libro de Aleman.pdf", description: "Material de estudio para alemán." }
    ],
  },
  {
    id: 'ingles',
    buttonLabel: 'Inglés',
    sectionTitle: 'Recursos de Inglés',
    onlineResources: [
        // Example: Add English resources here
        // { name: "BBC Learning English", url: "https://www.bbc.co.uk/learningenglish", description: "Learn English with the BBC." },
        // { name: "Duolingo English", url: "https://www.duolingo.com/course/en/es/Learn-English", description: "Free English courses." },
    ],
    downloadableDocuments: [
        // Example: Add English documents here
        // { name: "English Grammar Guide.pdf", path: "/assets/documents/idiomas/english_grammar.pdf", description: "Comprehensive English grammar guide." }
    ],
  },
  {
    id: 'frances',
    buttonLabel: 'Francés',
    sectionTitle: 'Recursos de Francés',
    onlineResources: [
        // Example: Add French resources here
        // { name: "TV5Monde - Langue Française", url: "https://langue-francaise.tv5monde.com/", description: "Learn French with TV5Monde." },
        // { name: "Le Point du FLE", url: "https://www.lepointdufle.net/", description: "Resources for learning French." },
    ],
    downloadableDocuments: [
         // Example: Add French documents here
        // { name: "French Verb Conjugations.pdf", path: "/assets/documents/idiomas/french_verbs.pdf", description: "Guide to French verb conjugations." }
    ],
  },
];

const IdiomasPage: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8 bg-white min-h-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Idiomas</h1>
        <div className="flex space-x-2">
          {languageSectionsData.map(section => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id + '-section')}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors
                         bg-indigo-500 hover:bg-indigo-600 text-white"
              aria-label={`Ir a la sección ${section.buttonLabel}`}
            >
              {section.buttonLabel}
            </button>
          ))}
        </div>
      </div>

      {languageSectionsData.map(section => (
        <section key={section.id} id={`${section.id}-section`} className="pt-4"> {/* Added pt-4 for spacing from top after scroll */}
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-2 border-gray-300 text-center">
            {section.sectionTitle}
          </h2>
          
          {section.onlineResources.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-600 mb-3">Recursos Online</h3>
              <ul className="space-y-3">
                {section.onlineResources.map(resource => (
                  <li key={resource.name} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {resource.name}
                      <ExternalLinkIcon className="w-4 h-4 ml-2" />
                    </a>
                    <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.downloadableDocuments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-600 mb-3">Documentos de Descarga</h3>
              <ul className="space-y-3">
                {section.downloadableDocuments.map(doc => (
                  <li key={doc.name} className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <a
                      href={doc.path}
                      download
                      className="flex items-center text-green-600 hover:text-green-800 font-medium no-theme-button"
                    >
                      <FileDownloadIcon className="w-5 h-5 mr-2" />
                      {doc.name}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.onlineResources.length === 0 && section.downloadableDocuments.length === 0 && (
             <p className="text-gray-500 text-center py-4">
                No hay recursos disponibles para {section.buttonLabel} en este momento.
             </p>
          )}
        </section>
      ))}
    </div>
  );
};

export default IdiomasPage;