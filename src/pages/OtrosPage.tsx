


import React from 'react';
import { ExternalLinkIcon } from '../components/icons/Icons';

interface HipotelContact {
  hotel: string;
  telefono: string;
  email: string;
}

interface OtherContact {
  label: string;
  telefono: string;
}

interface WebLink {
  label: string;
  url: string;
}

const hipotelsPhones: HipotelContact[] = [
  { hotel: "Central Hipotels", telefono: "971 58 75 12", email: "info@hipotels.com" },
  { hotel: "Central Resevas / Call center", telefono: "971 58 76 52", email: "reservas@hipotels.com" },
  { hotel: "H. Hipocampo Palace *****", telefono: "971 58 70 02", email: "hipopalace@hipotels.com" },
  { hotel: "H. Flamenco ****", telefono: "971 58 53 12", email: "flamenco@hipotels.com" },
  { hotel: "H. Said ****", telefono: "971 58 54 63", email: "said@hipotels.com" },
  { hotel: "H. Hipocampo Playa ****", telefono: "971 58 52 62", email: "hipoplaya@hipotels.com" },
  { hotel: "H. Don Juan ***", telefono: "971 58 57 63", email: "donjuan@hipotels.com" },
  { hotel: "H. HIPOCAMPO ****", telefono: "971 58 51 11", email: "hipocampo@hipotels.com" }, // Corrected "nipocampo"
  { hotel: "Aptos. Bahia Grande ****", telefono: "971 58 64 11", email: "bahiag@hipotels.com" },
  { hotel: "Aptos. Dunas Cala Millor****", telefono: "971 58 50 02", email: "dunas@hipotels.com" },
  { hotel: "Aptos. Mercedes ***", telefono: "971 58 53 11", email: "mercedes@hipotels.com" },
  { hotel: "H. Eurotel****", telefono: "971 81 65 00", email: "reservas.eurotel@hipotels.com" },
  { hotel: "H. Marfil playa ****", telefono: "971 81 01 77", email: "marfil@hipotels.com" },
  { hotel: "Aptel. Coma Gran ***", telefono: "971 81 01 79", email: "comagran@hipotels.com" },
  { hotel: "H. Mediterraneo****", telefono: "971 81 01 05", email: "mediterraneoclub@hipotels.com" },
  { hotel: "Apto. Mediterraneo****", telefono: "971 81 00 71", email: "mediterraneoclub@hipotels.com" },
  { hotel: "Aptos. Sunwing**", telefono: "971 81 40 99", email: "" },
  { hotel: "H. Gran Playa de Palma****", telefono: "971 26 80 45", email: "granplayadepalma@hipotels.com" },
  { hotel: "H. Playa de Palma Palace*****", telefono: "971 26 05 28", email: "playadepalmapalace@hipotels.co" }
];

const otrosTelefonos: OtherContact[] = [
  { label: "Policía Sa Coma", telefono: "971 81 06 01" },
  { label: "Policia Cala Millor", telefono: "971 81 40 76" },
  { label: "Guardia Civil", telefono: "971 813 540" },
  { label: "Eulen Seguridad", telefono: "670 50 75 95" },
  { label: "Médico Policlínic", telefono: "971 58 58 65" },
  { label: "Autocares Levante", telefono: "971 81 80 76" },
  { label: "Autocares Transunión", telefono: "971 29 07 35" },
  { label: "Autocares Transunión Son Servera", telefono: "971 90 02 09" },
  { label: "Autocares Nadal", telefono: "971 57 08 04" },
  { label: "Autocares Comas", telefono: "902 02 64 24" },
  { label: "Autocares Tui", telefono: "971 49 40 52" },
  { label: "Taxi Son Servera", telefono: "971 58 69 69" },
  { label: "Taxi Sant Llorrenç", telefono: "971 56 25 56" },
];

const websTransfers: WebLink[] = [
  { label: "Alltours", url: "https://transfer-info-alltours.viajesallsun.com/" },
  { label: "Dertour", url: "https://www.dertour-reiseleitung.com/mallorca/abreise-und-transfers/" },
  { label: "Sidetour", url: "https://hotel-transfer.sidetours.com/" },
  { label: "Tui", url: "https://www.tuitransfer.com/" },
];

const hospederiasLink: WebLink = { label: "HOSPEDERIAS Guardia Civil", url: "https://hospederias.guardiacivil.es/hospederias/login.do" };

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2 border-gray-300">
    {children}
  </h2>
);

const formatTelLink = (phone: string) => `tel:${phone.replace(/\s+/g, '')}`;

const OtrosPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 space-y-8 bg-white min-h-full">
      <h1 className="text-3xl font-bold text-gray-800">Otros Recursos</h1>

      <section>
        <SectionTitle>Teléfonos Hipotels</SectionTitle>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hipotelsPhones.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.hotel}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <a href={formatTelLink(item.telefono)} className="text-indigo-600 hover:text-indigo-800">
                      {item.telefono}
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {item.email ? (
                      <a href={`mailto:${item.email}`} className="text-indigo-600 hover:text-indigo-800">
                        {item.email}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionTitle>Otros Teléfonos de Interés</SectionTitle>
        <ul className="space-y-2 bg-white shadow-md rounded-lg p-4">
          {otrosTelefonos.map((item, index) => (
            <li key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-700">{item.label}</span>
              <a href={formatTelLink(item.telefono)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                {item.telefono}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle>Webs Transfers</SectionTitle>
        <ul className="space-y-3">
          {websTransfers.map((item, index) => (
            <li key={index} className="p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm"
              >
                {item.label}
                <ExternalLinkIcon className="w-4 h-4 ml-2 flex-shrink-0" />
              </a>
            </li>
          ))}
        </ul>
      </section>
      
      <section>
        <SectionTitle>HOSPEDERIAS</SectionTitle>
         <div className="p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <a
            href={hospederiasLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm"
            >
            {hospederiasLink.label}
            <ExternalLinkIcon className="w-4 h-4 ml-2 flex-shrink-0" />
            </a>
        </div>
      </section>

    </div>
  );
};

export default OtrosPage;